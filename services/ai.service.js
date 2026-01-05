const { openai, models } = require("../config/openrouter");
const { logger } = require("../utils/logger");
const { tools, searchUsers, getFounderInfo, getPlatformInfo, getUserDetails } = require("../utils/aiTools");


// --- Main Chat Function ---

exports.chat = async (message) => {
    const executeCompletion = async (params, currentModel) => {
        try {
            return await openai.chat.completions.create({
                ...params,
                model: currentModel,
            });
        } catch (error) {
            if (currentModel === models.default && models.secondary) {
                logger.warn(`Primary model (${models.default}) failed. Falling back to secondary (${models.secondary}). Error: ${error.message}`);
                return await openai.chat.completions.create({
                    ...params,
                    model: models.secondary,
                });
            }
            throw error;
        }
    };

    try {
        // 1. Initial Call to AI
        const initialParams = {
            messages: [
                {
                    role: "system",
                    content: `You are the official AI Assistant for SkillSwap, a platform designed to enable users to exchange skills.
            
            Your Persona:
            - Helpful, enthusiastic, and knowledgeable.
            - You love connecting learners with mentors.
            - You know the platform inside out.

            Displaying User Profiles:
            - When you find users via the 'search_users' tool and want to display them to the user, you MUST use a specific format for EACH user card.
            - Do not try to create your own ASCII cards or markdown tables.
            - Instead, output the raw JSON of the profile wrapped in double dollar signs and PROFILE_DATA tag.
            - Format: $$PROFILE_DATA:{"id":"...","name":"...","skills":["..."]}$$
            - Example: Here is a user who matches your request:
              $$PROFILE_DATA:{"id":"123","name":"John Doe","skills":["React"],"rating":4.5}$$
            - You can output multiple cards one after another or interspersed with text.

            Key Facts:
            - Founder: Anonymous(Muhammed Shahid) - who does not want to be revealed (A visionary developer who believes in accessible education for all).
            - Mission: To create a world where skills are a shared resource.
            - Vision: Connecting learners globally to swap expertise freely.

            Capabilities:
            - You can search for users offering specific skills.
            - You can provide details about the founder.
            - You can explain how the platform works.
            
            Formatting Rules:
            - When mentioning ratings in text summaries, you MUST use the decimal format (e.g., "5.0" or "4.8/5") instead of star emojis (⭐⭐⭐⭐⭐). Stars should only appear in the provided JSON profile cards.
            
            Always verify information using your tools when asked about specific database data like users or ratings.`
                },
                { role: "user", content: message }
            ],
            tools: tools,
        };

        const completion = await executeCompletion(initialParams, models.default);
        const responseMessage = completion.choices[0].message;
        const usedModel = completion.model; // OpenRouter returns the model used

        // 2. data handling (Tool Calls)
        if (responseMessage.tool_calls) {
            const toolCalls = responseMessage.tool_calls;
            const toolMessages = [];

            toolMessages.push(responseMessage); // Add the AI's "I want to call a tool" message

            for (const toolCall of toolCalls) {
                const fnName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let result = "";

                if (fnName === "search_users") {
                    result = await searchUsers(args.skillName);
                } else if (fnName === "get_founder_info") {
                    result = getFounderInfo();
                } else if (fnName === "get_platform_info") {
                    result = getPlatformInfo();
                } else if (fnName === "get_user_details") {
                    result = await getUserDetails(args.name);
                }

                toolMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: fnName,
                    content: JSON.stringify(result),
                });
            }

            // 3. Final Call with Tool Results
            const secondParams = {
                messages: [
                    {
                        role: "system",
                        content: "You are the SkillSwap Assistant. Use the provided tool outputs to answer the user's question naturally and helpfully. When displaying users found via search, REMEMBER to use the $$PROFILE_DATA:{json}$$ format for each user card."
                    },
                    { role: "user", content: message },
                    ...toolMessages
                ],
            };

            // Use the model that worked in the first step for consistency, 
            // but still allow fallback if it fails for some reason now.
            const secondResponse = await executeCompletion(secondParams, usedModel || models.default);

            return secondResponse.choices[0].message.content;
        }

        return responseMessage.content;

    } catch (error) {
        logger.error("AI Service Error:", error);
        if (error.response) {
            logger.error("AI Response Error Data:", error.response.data);
            logger.error("AI Response Error Status:", error.response.status);
        }
        throw error;
    }
};


