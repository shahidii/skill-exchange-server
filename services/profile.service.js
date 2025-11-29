const profileRepository = require("../repositories/profile.repository");
const authRepository = require("../repositories/auth.repository");
const { setJsonWithTtl, getJson } = require("../utils/cache");
const { formatProfiles } = require("../utils/formatUser");

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
            const user = await authRepository.findUserById(userId);
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
