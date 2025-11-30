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