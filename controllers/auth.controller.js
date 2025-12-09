const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
    const { fullName, email, password, mobileNumber, skillsOffered, skillsNeeded } = req.body;
    const { user } = await authService.signup({ fullName, email, password, mobileNumber, skillsOffered, skillsNeeded });

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user }
    });
});

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: { user, token }
    });
});

// @desc    Initiate reset password: validate credentials, send OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    const { maskedEmail, otpTtlSeconds } = await authService.resetPassword({ email, newPassword });
    res.status(200).json({
        success: true,
        message: `6 digit OTP shared to ${maskedEmail}`,
        data: { email, ttlSeconds: otpTtlSeconds }
    });
});

// @desc    Resend OTP to the same email
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const { maskedEmail, otpTtlSeconds } = await authService.resendOtp({ email });
    res.status(200).json({
        success: true,
        message: `New OTP sent to ${maskedEmail}`,
        data: { email, ttlSeconds: otpTtlSeconds }
    });
});

// @desc    Verify OTP and finalize password reset
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    await authService.verifyOtp({ email, otp });
    res.status(200).json({
        success: true,
        message: 'OTP verified successfully! Please log in'
    });
});

// @desc    Update user email
// @route   POST /api/auth/update-email
// @access  Private
exports.updateEmail = asyncHandler(async (req, res) => {
    const { currentEmail, newEmail } = req.body;
    const { maskedEmail, otpTtlSeconds } = await authService.updateEmail({ currentEmail, newEmail });
    res.status(200).json({
        success: true,
        message: `6 digit OTP shared to ${maskedEmail}`,
        data: { email: currentEmail, ttlSeconds: otpTtlSeconds }
    });
});

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
    const { reviewSort } = req.query;
    const result = await authService.getProfile(req.user.id, reviewSort);
    res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: result
    });
});

// @desc    Update user profile (partial)
// @route   POST /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
    const { user, updatedFields } = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user, updatedFields }
    });
});

// @desc    Update contact details (partial)
// @route   POST /api/auth/update-contact
// @access  Private
exports.updateContact = asyncHandler(async (req, res) => {
    const { user, updatedFields } = await authService.updateContact(req.user.id, req.body);
    res.status(200).json({
        success: true,
        message: 'Contact updated successfully',
        data: { user, updatedFields }
    });
});

// @desc    Update user avatar
// @route   POST /api/auth/update-avatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        const error = new Error('Please upload an image file');
        error.code = 'NO_FILE_UPLOADED';
        error.statusCode = 400;
        throw error;
    }
    const avatarPath = req.file.path;
    const { user, updatedFields } = await authService.updateAvatar(req.user.id, avatarPath);
    res.status(200).json({
        success: true,
        message: 'Avatar updated successfully',
        data: { user, updatedFields }
    });
});

// @desc    Update Request Status (Accept/Decline)
// @route   POST /api/auth/requests/:requestId
// @access  Private
exports.updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status, message } = req.body;
    const userId = req.user.id;

    await authService.updateRequestStatus(userId, requestId, status, message);

    res.status(200).json({
        success: true,
        message: `Request ${status} successfully`
    });
});

// @desc    Mark Requests as Seen
// @route   POST /api/auth/requests/seen
// @access  Private
exports.markRequestsSeen = asyncHandler(async (req, res) => {
    const { type } = req.body; // 'incoming' or 'my'
    const userId = req.user.id;

    await authService.markRequestsSeen(userId, type);

    res.status(200).json({
        success: true,
        message: 'Requests marked as seen'
    });
});

// @desc    Delete or Unsend Request
// @route   DELETE /api/auth/requests/:requestId
// @access  Private
exports.deleteRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.query; // 'unsend' or 'delete'
    const userId = req.user.id;

    if (!action) {
        res.status(400);
        throw new Error('Action query parameter (unsend/delete) is required');
    }

    await authService.deleteRequest(userId, requestId, action);

    res.status(200).json({
        success: true,
        message: action === 'unsend' ? 'Request unsent successfully' : 'Request deleted from history'
    });
});
