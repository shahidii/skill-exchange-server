const OpenAI = require("openai");

let openai;
try {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("CRITICAL: OPENROUTER_API_KEY is missing in environment variables!");
    }

    let apiKey = process.env.OPENROUTER_API_KEY.trim();
    if (apiKey.endsWith('.')) {
        apiKey = apiKey.slice(0, -1);
    }

    openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        headers: {
            "User-Agent": "SkillSwap/1.0.0",
            "HTTP-Referer": "https://skill-swap-web-taupe.vercel.app",
            "X-Title": "Skill Swap"
        }
    });
} catch (error) {
    throw error;
}

const models = {
    // default: "openai/gpt-4o",
    default: "openai/gpt-4o-mini",
    // default : "google/gemini-2.0-flash-exp:free",
    secondary: "google/gemini-2.0-flash-exp:free"
};

module.exports = {
    openai,
    models
};
