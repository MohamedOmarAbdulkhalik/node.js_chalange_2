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
const { protect } = require('../middleware/auth'); // Add this import

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, handleValidationErrors, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, handleValidationErrors, loginUser);

// @route   GET /api/auth/me
router.get('/me', protect, getCurrentUser); // Add protect middleware

module.exports = router;