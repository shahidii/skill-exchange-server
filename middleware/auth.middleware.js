
// middleware/authMiddleware.js
// JWT authentication and role-based access control middleware

const { verifyToken } = require('../utils/jwt');
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('No token provided');
    error.code = 'NO_TOKEN';
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error('Session expired. Please log in again.');
    error.code = 'INVALID_TOKEN';
    error.statusCode = 401;
    throw error;
  }
});

// Is guest only
const guestOnly = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const error = new Error('User is already logged in');
    error.code = 'USER_LOGGED_IN';
    error.statusCode = 401;
    throw error;
  }
  next();
});

// Optional authentication - attaches user if token is present, but doesn't fail if missing
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no token, continue without user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token); // Using verifyToken from utils/jwt

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    // If token is invalid, just continue without user (don't throw error)
    next();
  }
};

module.exports = { authenticate, guestOnly, optionalAuth };
