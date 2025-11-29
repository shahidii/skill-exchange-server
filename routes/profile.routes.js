const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

// @route    GET /api/profiles/skills
// @desc     Get all skills with pagination (for dropdown infinite scroll)
// @access   Public
router.get("/skills", optionalAuth, profileController.getSkills);

// @route    GET /api/profiles
// @desc     Get up to 9 recommended profiles with pagination
// @access   Public (optional authentication for personalized results)
router.get("/", optionalAuth, profileController.getProfiles);

module.exports = router;