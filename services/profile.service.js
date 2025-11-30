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