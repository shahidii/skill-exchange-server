const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate, guestOnly, optionalAuth } = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

// @route    POST /api/auth/signup
// @desc     Register a new user
// @access   Public
router.post("/signup", guestOnly, authController.signup);

// @route    POST /api/auth/login
// @desc     Login a user
// @access   Public
router.post("/login", guestOnly, authController.login);

// @route    POST /api/auth/reset-password
// @desc     Initiate password reset - validate credentials, send OTP
// @access   Public
router.post("/reset-password", guestOnly, authController.resetPassword);

// @route    POST /api/auth/resend-otp
// @desc     Resend OTP to the same email used in reset initiation
// @access   Public
router.post("/resend-otp", guestOnly, authController.resendOtp);

// @route    POST /api/auth/verify-otp
// @desc     Verify OTP and finalize password reset
// @access   Public
router.post("/verify-otp", authController.verifyOtp);

// @route    POST /api/auth/update-email
// @desc     Update user email
// @access   Private
router.post("/update-email", authenticate, authController.updateEmail);

// @route    GET /api/auth/profile
// @desc     Get user profile
// @access   Private
router.get("/profile", authenticate, authController.getProfile);

// @route    POST /api/auth/update-profile
// @desc     Update user profile
// @access   Private
router.post("/update-profile", authenticate, authController.updateProfile);

// @route    POST /api/auth/update-contact
// @desc     Update user contact details
// @access   Private
router.post("/update-contact", authenticate, authController.updateContact);

// @route    POST /api/auth/update-avatar
// @desc     Update user avatar
// @access   Private
router.post("/update-avatar", authenticate, upload.single('avatar'), authController.updateAvatar);


module.exports = router;
