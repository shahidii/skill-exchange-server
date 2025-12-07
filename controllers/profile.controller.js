const asyncHandler = require("../utils/asyncHandler");
const profileService = require("../services/profile.service");

// @desc    Search profiles with pagination
// @route   GET /api/profiles/search
// @access  Public
exports.searchProfiles = asyncHandler(async (req, res) => {
    const userId = req.user?.id; // Optional - undefined if not authenticated

    // Extract and validate pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));

    // Extract search parameters
    const { q, skills } = req.query;

    const result = await profileService.searchProfiles({
        userId,
        query: q,
        skills: skills ? (Array.isArray(skills) ? skills : [skills]) : [],
        page,
        limit
    });

    res.status(200).json({
        success: true,
        message: 'Profiles retrieved successfully',
        data: result
    });
});

// @desc    Get up to 9 recommended profiles with pagination
// @route   GET /api/profiles
// @access  Public
exports.getProfiles = asyncHandler(async (req, res) => {
    const userId = req.user?.id; // Optional - undefined if not authenticated

    // Extract and validate pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));

    const result = await profileService.getProfiles(userId, page, limit);

    res.status(200).json({
        success: true,
        message: 'Profiles retrieved successfully',
        data: result
    });
});

// @desc    Get skills with pagination
// @route   GET /api/profiles/skills
// @access  Public
exports.getSkills = asyncHandler(async (req, res) => {
    const userId = req.user?.id; // Optional - undefined if not authenticated

    // Extract and validate pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const result = await profileService.getSkills(userId, page, limit);

    res.status(200).json({
        success: true,
        message: 'Skills retrieved successfully',
        data: result
    });
});

// @desc    Get single profile by ID
// @route   GET /api/profiles/:id
// @access  Public
exports.getProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reviewSort } = req.query; // 'highest', 'lowest', 'newest', 'oldest', 'my-review'
    const currentUserId = req.user?.id; // Optional, for 'my-review' sort

    const profile = await profileService.getProfileById(id, reviewSort, currentUserId);

    if (!profile) {
        res.status(404);
        throw new Error('Profile not found');
    }

    res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
    });
});

// @desc    Add a review to a profile
// @route   POST /api/profiles/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
        res.status(400);
        throw new Error('Rating and comment are required');
    }

    await profileService.addReview(id, userId, { rating, comment });

    res.status(201).json({
        success: true,
        message: 'Review added successfully'
    });
});

// @desc    Delete own review from a profile
// @route   DELETE /api/profiles/:id/reviews
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params; // Profile ID
    const userId = req.user.id;

    await profileService.deleteReview(id, userId);

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });
});