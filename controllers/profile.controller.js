const asyncHandler = require("../utils/asyncHandler");
const profileService = require("../services/profile.service");

// @desc    Get up to 9 recommended profiles with pagination
// @route   GET /api/auth/profiles
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
