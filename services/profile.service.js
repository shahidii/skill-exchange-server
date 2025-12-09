const profileRepository = require("../repositories/profile.repository");
const { setJsonWithTtl, getJson } = require("../utils/cache");
const { formatProfiles } = require("../utils/formatUser");

// Search profiles with pagination
exports.searchProfiles = async ({ userId, query, skills, page = 1, limit = 9 }) => {
    try {
        const result = await profileRepository.searchProfiles({
            userId,
            query,
            skills,
            page,
            limit
        });

        // Format profiles (exclude password and sensitive data)
        const formattedProfiles = formatProfiles(result.profiles);

        return {
            profiles: formattedProfiles,
            pagination: result.pagination
        };
    } catch (error) {
        throw error;
    }
};

// Get profiles (up to 9 recommended profiles with pagination)
exports.getProfiles = async (userId, page = 1, limit = 9) => {
    try {
        // Cache key for guest users only
        const cacheKey = userId ? null : `profiles:guest:page${page}:limit${limit}`;

        // Check cache for guest users
        if (cacheKey) {
            const cached = await getJson(cacheKey);
            if (cached) {
                return cached; // Return cached data
            }
        }

        let skillsNeeded = [];

        // If authenticated, fetch user's skillsNeeded for skill matching
        if (userId) {
            const user = await profileRepository.findUserById(userId);
            if (user && user.skillsNeeded) {
                // Extract skill IDs for matching
                skillsNeeded = user.skillsNeeded.map(skill => skill._id);
            }
        }

        // Fetch profiles with intelligent sorting and pagination
        const result = await profileRepository.getProfiles({
            userId,
            skillsNeeded,
            page,
            limit
        });

        // Format profiles (exclude password and sensitive data)
        const formattedProfiles = formatProfiles(result.profiles);

        const response = {
            profiles: formattedProfiles,
            pagination: result.pagination
        };

        // Cache for guest users (5 minutes = 300 seconds)
        if (cacheKey) {
            await setJsonWithTtl(cacheKey, response, 300);
        }

        return response;
    } catch (error) {
        throw error;
    }
};

// Get skills with pagination
exports.getSkills = async (userId, page = 1, limit = 10) => {
    let userSkillsNeeded = [];
    let userSkillsOffered = [];

    // If authenticated, fetch user's skills for personalized sorting
    if (userId) {
        const user = await profileRepository.findUserById(userId);
        if (user && user.skillsNeeded) {
            // Extract skill IDs for prioritization
            userSkillsNeeded = user.skillsNeeded.map(skill => skill._id || skill);
        }
        // Also get skills the user already has to show them lower priority
        if (user && user.skillsOffered) {
            userSkillsOffered = user.skillsOffered.map(skill => skill._id || skill);
        }
    }

    const result = await profileRepository.getSkills({
        userId,
        userSkillsNeeded,
        userSkillsOffered,
        page,
        limit
    });

    return {
        skills: result.skills,
        pagination: result.pagination
    };
};

// Add a review
exports.addReview = async (profileId, userId, { rating, comment }) => {
    try {
        const user = await profileRepository.findUserById(profileId);
        if (!user) {
            const error = new Error('Profile not found');
            error.statusCode = 404;
            throw error;
        }

        if (profileId === userId) {
            const error = new Error('You cannot review your own profile');
            error.statusCode = 400;
            throw error;
        }

        // Check if user already reviewed
        // Convert to strings for reliable comparison whether populated or not
        const alreadyReviewed = user.review?.find(
            (r) => {
                if (!r.user) return false; // Skip invalid reviews
                const reviewUserId = r.user._id ? r.user._id.toString() : r.user.toString();
                // console.log(`[DEBUG] Comparing ${reviewUserId} with ${userId.toString()}`);
                return reviewUserId === userId.toString();
            }
        );

        if (alreadyReviewed) {
            const error = new Error('Review already exists, please delete first');
            error.statusCode = 400;
            throw error;
        }

        const review = {
            user: userId,
            rating: Number(rating),
            comment,
            createdAt: Date.now()
        };

        // Use atomic update to push review
        const User = require("../models/User"); // Import model directly for atomic update if repo doesn't support it
        // Or better, add update method to repo. usage here suggests service interacting with model is pattern used properly via repo?
        // existing repo has findUserById but not updateUser.
        // I will use mongoose model directly here for simplicity or add to repo.
        // Let's use direct model update since repo is limited.

        await User.findByIdAndUpdate(profileId, {
            $push: { review: review }
        });

        // Recalculate average rating
        // Fetch fresh user data with reviews
        const updatedUser = await User.findById(profileId);
        if (updatedUser.review.length > 0) {
            updatedUser.rating =
                updatedUser.review.reduce((acc, item) => item.rating + acc, 0) /
                updatedUser.review.length;
        } else {
            updatedUser.rating = 0;
        }
        await updatedUser.save();

        return true;
    } catch (error) {
        throw error;
    }
};

// Delete a review
exports.deleteReview = async (profileId, userId) => {
    try {
        const User = require("../models/User");

        const user = await User.findById(profileId);
        if (!user) {
            const error = new Error('Profile not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if review exists
        const reviewExists = user.review?.find(
            (r) => r.user.toString() === userId.toString() || (r.user._id && r.user._id.toString() === userId.toString())
        );

        if (!reviewExists) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }

        // Pull the review
        await User.findByIdAndUpdate(profileId, {
            $pull: { review: { user: userId } }
        });

        // Recalculate average rating
        const updatedUser = await User.findById(profileId);
        if (updatedUser.review && updatedUser.review.length > 0) {
            updatedUser.rating =
                updatedUser.review.reduce((acc, item) => item.rating + acc, 0) /
                updatedUser.review.length;
        } else {
            updatedUser.rating = 0;
        }
        await updatedUser.save();

        return true;
    } catch (error) {
        throw error;
    }
};

// Helper to sort reviews
const sortReviews = (reviews, sortOption, currentUserId) => {
    if (!reviews) return [];

    // Create a copy to avoid mutating original
    const sortedReviews = [...reviews];

    switch (sortOption) {
        case 'highest':
            return sortedReviews.sort((a, b) => b.rating - a.rating);
        case 'lowest':
            return sortedReviews.sort((a, b) => a.rating - b.rating);
        case 'newest':
            return sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'oldest':
            return sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'my-review':
            if (!currentUserId) return sortedReviews;
            // Filter mode: Show ONLY my review
            // Or Sort mode: Put mine first
            // User complaint: "showing not only my reviw showing all reviews why ?"
            // Interpretation: User wants FILTERING.
            // We will Filter here.
            return sortedReviews.filter(r => {
                if (!r.user) return false; // Skip invalid
                const rUserId = r.user._id ? r.user._id.toString() : r.user.toString();
                return rUserId === currentUserId.toString();
            });
        default:
            return sortedReviews.sort((a, b) => b.rating - a.rating); // Default to highest
    }
};

// Get single profile by ID
exports.getProfileById = async (id, reviewSort = 'highest', currentUserId = null) => {
    try {
        const profile = await profileRepository.getProfileById(id);

        if (!profile) {
            return null;
        }

        // Sort reviews if present (data is already populated by repo now)
        if (profile.review && profile.review.length > 0) {
            // We need to apply sorting on the raw profile object before formatting
            // But wait, profile returned from repo is a POJO (Project Object) because of aggregation.
            // We can modify it directly.
            // Note: review.user is populated now.

            profile.review = sortReviews(profile.review, reviewSort, currentUserId);
        }

        // Format profile (exclude password and sensitive data if any remains)
        // formatProfiles expects an array, so we wrap and unwrap
        const formattedProfiles = formatProfiles([profile]);
        return formattedProfiles[0];
    } catch (error) {
        throw error;
    }
};

// Request a skill
exports.requestSkill = async (targetUserId, currentUserId, { skillId, message }) => {
    try {
        const User = require("../models/User");
        const mongoose = require("mongoose");

        if (targetUserId === currentUserId) {
            const error = new Error('You cannot request a skill from yourself');
            error.statusCode = 400;
            throw error;
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Check for duplicate pending requests
        const existingRequest = targetUser.requestsReceived.find(
            (req) =>
                req.user &&
                req.user.toString() === currentUserId.toString() &&
                req.skill &&
                req.skill.toString() === skillId.toString() &&
                req.status.status === 'pending'
        );

        if (existingRequest) {
            const error = new Error('You already have a pending request for this skill');
            error.statusCode = 400;
            throw error;
        }



        // Generate a shared ID for syncing
        const requestId = new mongoose.Types.ObjectId();

        // Incoming request for target: user = sender
        const requestForTarget = {
            _id: requestId,
            user: currentUserId,
            skill: skillId,
            message: message,
            status: { status: 'pending', message: '' },
            seen: false,
            createdAt: new Date()
        };

        // Outgoing request for sender: user = target
        const requestForSender = {
            _id: requestId,
            user: targetUserId,
            skill: skillId,
            message: message,
            status: { status: 'pending', message: '' },
            seen: true,
            createdAt: new Date()
        };

        targetUser.requestsReceived.push(requestForTarget);
        currentUser.requestsSent.push(requestForSender);

        await targetUser.save();
        await currentUser.save();

        return true;
    } catch (error) {
        throw error;
    }
};