const mongoose = require('mongoose');
const User = require("../models/User");
const Skill = require("../models/Skill");


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

module.exports = { getProfiles };