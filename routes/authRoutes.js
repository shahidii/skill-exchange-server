const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// @route    POST /api/auth/signup
// @desc     Register a new user
// @access   Public
router.post("/signup", authController.signup);

// @route    POST /api/auth/login
// @desc     Login a user
// @access   Public
router.post("/login", authController.login);

// @route    POST /api/auth/reset-password
// @desc     Initiate password reset - validate credentials, send OTP
// @access   Public
router.post("/reset-password", authController.resetPassword);

// @route    POST /api/auth/resend-otp
// @desc     Resend OTP to the same email used in reset initiation
// @access   Public
router.post("/resend-otp", authController.resendOtp);

// @route    POST /api/auth/verify-otp
// @desc     Verify OTP and finalize password reset
// @access   Public
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
