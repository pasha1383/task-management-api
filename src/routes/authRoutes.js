const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { body } = require('express-validator'); // Import body for validation
const router = express.Router();

// Validation for registration
router.post(
    '/register',
    [
        body('username')
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long')
            .trim()
            .escape(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    registerUser
);

// Validation for login
router.post(
    '/login',
    [
        body('username').notEmpty().withMessage('Username is required').trim().escape(),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    loginUser
);

module.exports = router;