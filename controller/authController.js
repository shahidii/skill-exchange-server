const asyncHandler = require("../utility/asyncHandler");
const authService = require("../service/authService");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
    const { fullName, email, password , mobileNumber , skillsHave , skillsNeed } = req.body;
    const result = await authService.signup({fullName, email, password , mobileNumber , skillsHave , skillsNeed});
    res.status(201).json(result);
});

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({email, password});
    res.status(200).json(result);
});
