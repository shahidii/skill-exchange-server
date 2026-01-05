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
