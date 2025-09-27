const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getCurrentUser
} = require('../controllers/authController');
const {
    validateUserRegistration,
    validateUserLogin,
    handleValidationErrors
} = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, handleValidationErrors, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, handleValidationErrors, loginUser);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (will be protected in Phase 2)
router.get('/me', getCurrentUser);

module.exports = router;