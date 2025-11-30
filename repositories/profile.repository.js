const mongoose = require('mongoose');
const User = require("../models/User");
const Skill = require("../models/Skill");

// Find user by ID
const findUserById = (id) => User.findById(id).select('skillsNeeded').lean();

// Search profiles with pagination
const searchProfiles = async ({ userId, query, skills, page = 1, limit = 9 }) => {
    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build search criteria
    const searchCriteria = {};
    
    // Exclude current user if authenticated
    if (userId) {
        searchCriteria._id = { $ne: new mongoose.Types.ObjectId(userId) };
    }
    
    // Text search across multiple fields
    if (query) {
        searchCriteria.$or = [
            { fullName: { $regex: query, $options: 'i' } },
            { bio: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
        ];
    }
    
    // Convert skill IDs to ObjectIds if they are strings
    let skillObjectIds = [];
    if (skills && skills.length > 0) {
        skillObjectIds = skills.map(skillId => 
            typeof skillId === 'string' ? new mongoose.Types.ObjectId(skillId) : skillId
        );
        
        // If we already have search criteria, add to them
        if (searchCriteria.$or) {
            searchCriteria.$or.push(
                { skillsOffered: { $in: skillObjectIds } },
                { skillsNeeded: { $in: skillObjectIds } }
            );
        } else {
            // Otherwise create new criteria
            searchCriteria.$or = [
                { skillsOffered: { $in: skillObjectIds } },
                { skillsNeeded: { $in: skillObjectIds } }
            ];
        }
    }

    const basePipeline = [
        // Apply search criteria
        { $match: searchCriteria },
        
        // Add computed fields
        {
            $addFields: {
                // Count accepted requests (handle undefined arrays)
                acceptedRequestsCount: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ["$requestsReceived", []] },
                            as: "request",
                            cond: { $eq: ["$$request.status.status", "accepted"] }
                        }
                    }
                },
                // Count reviews (handle undefined arrays)
                reviewCount: {
                    $size: { $ifNull: ["$review", []] }
                },
                // Priority for skill matching: skills offered first, then skills needed
                skillPriority: {
                    $cond: {
                        if: { 
                            $and: [
                                { $gt: [{ $size: { $ifNull: ["$skillsOffered", []] } }, 0] },
                                { $gt: [skillObjectIds.length || 0, 0] }
                            ]
                        },
                        then: {
                            $cond: {
                                if: {
                                    $gt: [{
                                        $size: {
                                            $setIntersection: [
                                                { $ifNull: ["$skillsOffered", []] },
                                                skillObjectIds
                                            ]
                                        }
                                    }, 0]
                                },
                                then: 1, // Skills offered match
                                else: {
                                    $cond: {
                                        if: {
                                            $gt: [{
                                                $size: {
                                                    $setIntersection: [
                                                        { $ifNull: ["$skillsNeeded", []] },
                                                        skillObjectIds
                                                    ]
                                                }
                                            }, 0]
                                        },
                                        then: 2, // Skills needed match
                                        else: 3  // No skill match
                                    }
                                }
                            }
                        },
                        else: 3 // No skill filtering or no skills offered
                    }
                }
            }
        },
        
        // Sort by priority: 
        // 1. Skill priority (skills offered first, then skills needed)
        // 2. Rating (high to low)
        // 3. Accepted requests count (high to low)
        // 4. Review count (high to low)
        // 5. Creation date (most recent first)
        {
            $sort: {
                skillPriority: 1,         // Skills offered first (1), then skills needed (2)
                rating: -1,               // Highest rating first
                acceptedRequestsCount: -1, // Most accepted requests first
                reviewCount: -1,          // Most reviews first
                createdAt: -1             // Most recent first (tie-breaker)
            }
        }
    ];

    // Get total count (before pagination)
    const countPipeline = [...basePipeline, { $count: "total" }];

    // Get paginated results
    const resultsPipeline = [
        ...basePipeline,
        { $skip: skip },
        { $limit: limit },

        // Populate skills
        {
            $lookup: {
                from: 'skills',
                localField: 'skillsOffered',
                foreignField: '_id',
                as: 'skillsOffered'
            }
        },
        {
            $lookup: {
                from: 'skills',
                localField: 'skillsNeeded',
                foreignField: '_id',
                as: 'skillsNeeded'
            }
        }
    ];

    // Execute both pipelines in parallel
    const [countResult, profiles] = await Promise.all([
        User.aggregate(countPipeline),
        User.aggregate(resultsPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return {
        profiles,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Get skills with pagination
const getSkills = async ({ userId, userSkillsNeeded = [], userSkillsOffered = [], page = 1, limit = 10 }) => {
    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Skill.countDocuments();

    let skills;

    // If user is authenticated, use intelligent sorting
    if (userId && (userSkillsNeeded.length > 0 || userSkillsOffered.length > 0)) {
        // Convert to ObjectIds if needed
        const skillsNeededIds = userSkillsNeeded.map(id =>
            typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
        );
        const skillsOfferedIds = userSkillsOffered.map(id =>
            typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
        );

        // Use aggregation for intelligent sorting
        skills = await Skill.aggregate([
            {
                $addFields: {
                    // Priority 1: Skills user needs (highest priority)
                    isNeeded: {
                        $cond: {
                            if: { $in: ['$_id', skillsNeededIds] },
                            then: 1,
                            else: 0
                        }
                    },
                    // Priority 2: Skills user already has (lowest priority)
                    isOffered: {
                        $cond: {
                            if: { $in: ['$_id', skillsOfferedIds] },
                            then: 1,
                            else: 0
                        }
                    }
                }
            },
            {
                $sort: {
                    isNeeded: -1,      // Skills user needs first
                    isOffered: 1,      // Skills user doesn't have before skills they have
                    _id: 1             // Deterministic tie-breaker
                }
            },
            {
                $project: {
                    isNeeded: 0,       // Remove computed fields from output
                    isOffered: 0
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);
    } else {
        // For guest users, natural database order (no sorting)
        skills = await Skill.find()
            .skip(skip)
            .limit(limit)
            .lean();
    }

    return {
        skills,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit)
        }
    };
};

// Get profiles with intelligent sorting and pagination
const getProfiles = async ({ userId, skillsNeeded = [], page = 1, limit = 9 }) => {
    // Convert skillsNeeded to ObjectId if they're strings
    const skillIds = skillsNeeded.map(id =>
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    );

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    const basePipeline = [
        // Exclude current user if authenticated
        ...(userId ? [{ $match: { _id: { $ne: new mongoose.Types.ObjectId(userId) } } }] : []),

        // Add computed fields
        {
            $addFields: {
                // Count accepted requests (handle undefined arrays)
                acceptedRequestsCount: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ["$requestsReceived", []] },
                            as: "request",
                            cond: { $eq: ["$$request.status.status", "accepted"] }
                        }
                    }
                },
                // Count reviews (handle undefined arrays)
                reviewCount: {
                    $size: { $ifNull: ["$review", []] }
                },
                // Calculate skill match count (for authenticated users)
                skillMatchCount: {
                    $cond: {
                        if: { $gt: [skillIds.length, 0] },
                        then: {
                            $size: {
                                $setIntersection: [
                                    { $ifNull: ["$skillsOffered", []] },
                                    skillIds
                                ]
                            }
                        },
                        else: 0
                    }
                }
            }
        },

        // Sort by priority
        {
            $sort: {
                skillMatchCount: -1,  // Highest skill matches first (0 for guests)
                reviewCount: -1,      // Most reviews
                rating: -1,           // Highest rating
                acceptedRequestsCount: -1  // Most accepted requests
            }
        }
    ];

    // Get total count (before pagination)
    const countPipeline = [...basePipeline, { $count: "total" }];

    // Get paginated results
    const resultsPipeline = [
        ...basePipeline,
        { $skip: skip },
        { $limit: limit },

        // Populate skills
        {
            $lookup: {
                from: 'skills',
                localField: 'skillsOffered',
                foreignField: '_id',
                as: 'skillsOffered'
            }
        },
        {
            $lookup: {
                from: 'skills',
                localField: 'skillsNeeded',
                foreignField: '_id',
                as: 'skillsNeeded'
            }
        }
    ];

    // Execute both pipelines in parallel
    const [countResult, profiles] = await Promise.all([
        User.aggregate(countPipeline),
        User.aggregate(resultsPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    return {
        profiles,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = { getProfiles, findUserById, getSkills, searchProfiles };