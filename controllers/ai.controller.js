const aiService = require("../services/ai.service");
const asyncHandler = require("../utils/asyncHandler");

const chat = asyncHandler(async (req, res) => {

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }

    const response = await aiService.chat(message);

    res.status(200).json({
        success: true,
        message: response
    });

});

module.exports = {
    chat
};
