const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { body } = require('express-validator');
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Register a new user
 * description: This endpoint allows new users to register an account with the task management system.
 * Upon successful registration, it returns user details and a JWT token for authentication.
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserRegister'
 * examples:
 * UserRegistration:
 * value:
 * username: newuser123
 * password: securepassword
 * responses:
 * 201:
 * description: User registered successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AuthResponse'
 * 400:
 * description: Bad request (e.g., validation errors or user already exists)
 * content:
 * application/json:
 * schema:
 * oneOf:
 * - $ref: '#/components/schemas/ValidationError'
 * - type: object
 * properties:
 * message:
 * type: string
 * example: User already exists
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: Log in an existing user
 * description: This endpoint allows an existing user to log in and receive a JWT token for subsequent authenticated requests.
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UserLogin'
 * examples:
 * UserLogin:
 * value:
 * username: existinguser
 * password: loginpassword
 * responses:
 * 200:
 * description: User logged in successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/AuthResponse'
 * 401:
 * description: Invalid username or password
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Invalid username or password
 * 400:
 * description: Bad request (validation errors)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ValidationError'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 */
router.post(
    '/login',
    [
        body('username').notEmpty().withMessage('Username is required').trim().escape(),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    loginUser
);

module.exports = router;