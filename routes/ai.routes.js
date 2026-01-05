const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const { authenticate, optionalAuth } = require("../middleware/auth.middleware");

router.post("/chat", authenticate, aiController.chat);

module.exports = router;
