const aiRepository = require("../repositories/ai.repository");
const { formatProfile } = require("../utils/formatUser");

// Define available tools
const tools = [
    {
        type: "function",
        function: {
            name: "search_users",
            description: "Search for users who offer a specific skill, sorted by rating",
            parameters: {
                type: "object",
                properties: {
                    skillName: {
                        type: "string",
                        description: "The name of the skill to search for (e.g., 'React', 'Python')",
                    },
                },
                required: ["skillName"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_founder_info",
            description: "Get information about the founder of SkillSwap",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_platform_info",
            description: "Get information about the SkillSwap platform's mission and vision",
            parameters: {
                type: "object",
                properties: {},
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_user_details",
            description: "Get detailed information about a specific user by name",
            parameters: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "The name of the user to find",
                    },
                },
                required: ["name"],
            },
        },
    }
];

// --- Tool Helper Functions ---

async function searchUsers(skillName) {
    try {
        const skillRegex = new RegExp(skillName, "i");
        const skills = await aiRepository.findSkillByNameRegex(skillRegex);

        // skills is an array of objects with _id
        const skillIds = skills.map(s => s._id);

        if (skillIds.length === 0) return { message: "No requests found for this skill." };

        const users = await aiRepository.findUsersBySkillsOffered(skillIds);

        // Map users to a simplified format for the AI, but using formatProfile properties
        return users.map(u => {
            // We can use formatProfile but we might want a lighter version for a list
            // However, consistency is key, so let's use the standard formatter logic
            // but maybe strip heavy arrays if needed. For now, full profile is fine as list is small (limit 5).
            const formatted = formatProfile(u);
            return {
                id: formatted._id,
                name: formatted.fullName,
                bio: formatted.bio,
                location: formatted.location,
                rating: formatted.rating,
                skills: formatted.skillsOffered.map(s => s.name),
                requestsCount: u.requestsReceived ? u.requestsReceived.length : 0, // formatProfile has acceptedRequestsCount, but generic "popularity" is raw count usually
                avatar: formatted.avatar
            };
        });
    } catch (e) {
        console.error(e);
        return { error: "Failed to search users." };
    }
}

function getFounderInfo() {
    return {
        name: "Muhammed Shahid",
        role: "Founder & Lead Developer",
        vision: "To build a platform where knowledge is accessible to everyone, regardless of their financial background.",
        background: "A passionate developer with a knack for building scalable web applications and AI integration."
    };
}

function getPlatformInfo() {
    return {
        name: "SkillSwap",
        description: "A community-driven skill exchange platform.",
        benefits: [
            "Learn new skills from experts.",
            "Teach what you know to reinforce your learning.",
            "Connect with like-minded individuals.",
            "Completely free to use."
        ],
        howItWorks: "1. Create a profile. 2. List skills you can teach and skills you want to learn. 3. Search for users and send requests. 4. Connect and learn!"
    };
}

async function getUserDetails(name) {
    try {
        const user = await aiRepository.findUserByNameRegex(new RegExp(name, "i"));

        if (!user) return { message: "User not found." };

        // Use standard formatProfile
        return formatProfile(user);
    } catch (e) {
        return { error: "Failed to get user details" };
    }
}

module.exports = {
    tools,
    searchUsers,
    getFounderInfo,
    getPlatformInfo,
    getUserDetails
};
