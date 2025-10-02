const asyncHandler = require("../utility/asyncHandler");
const authService = require("../service/authService");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
    const { fullName, email, password, mobileNumber, skillsHave, skillsNeed } = req.body;
    const { user } = await authService.signup({ fullName, email, password, mobileNumber, skillsHave, skillsNeed });
    
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
        message: 'Password reset successful! Please log in'
    });
});
