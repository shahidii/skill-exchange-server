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

module.exports = router;
