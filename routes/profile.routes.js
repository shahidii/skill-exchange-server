const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { optionalAuth, authenticate } = require("../middleware/auth.middleware");

// @route    GET /api/profiles/skills
// @desc     Get all skills with pagination (for dropdown infinite scroll)
// @access   Public
router.get("/skills", optionalAuth, profileController.getSkills);

// @route    GET /api/profiles/search
// @desc     Search profiles with pagination
// @access   Public
router.get("/search", optionalAuth, profileController.searchProfiles);

// @route    GET /api/profiles
// @desc     Get up to 9 recommended profiles with pagination
// @access   Public (optional authentication for personalized results)
router.get("/", optionalAuth, profileController.getProfiles);

// @route    GET /api/profiles/:id
// @desc     Get single profile by ID
// @access   Public
router.get("/:id", optionalAuth, profileController.getProfileById);

// @route    POST /api/profiles/:id/reviews
// @desc     Add a review
// @access   Private
router.post("/:id/reviews", authenticate, profileController.addReview);

// @route    DELETE /api/profiles/:id/reviews
// @desc     Delete a review
// @access   Private
router.delete("/:id/reviews", authenticate, profileController.deleteReview);

// @route    POST /api/profiles/:id/request
// @desc     Request a skill
// @access   Private
router.post("/:id/request", authenticate, profileController.requestSkill);

module.exports = router;