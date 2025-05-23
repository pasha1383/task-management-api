const express = require('express');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    markTaskComplete,
    deleteTask,
    handleValidationErrors // Import the validation error handler
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator'); // Import body and param for validation
const router = express.Router();

// Categories enum (should ideally come from a central config or database)
const TASK_CATEGORIES = ['Personal', 'Work', 'Shopping', 'Other'];

router.route('/')
    .post(
        protect,
        [
            body('title')
                .notEmpty()
                .withMessage('Title is required')
                .isLength({ max: 100 })
                .withMessage('Title cannot exceed 100 characters')
                .trim()
                .escape(),
            body('description')
                .optional()
                .isLength({ max: 500 })
                .withMessage('Description cannot exceed 500 characters')
                .trim()
                .escape(),
            body('category')
                .optional()
                .isIn(TASK_CATEGORIES)
                .withMessage(`Category must be one of: ${TASK_CATEGORIES.join(', ')}`),
        ],
        handleValidationErrors, // Middleware to check for validation errors
        createTask
    )
    .get(protect, getTasks); // No specific input validation needed here

router.route('/:id')
    .get(
        protect,
        [
            param('id').isMongoId().withMessage('Invalid task ID'),
        ],
        handleValidationErrors,
        getTaskById
    )
    .put(
        protect,
        [
            param('id').isMongoId().withMessage('Invalid task ID'),
            body('title')
                .optional()
                .isLength({ max: 100 })
                .withMessage('Title cannot exceed 100 characters')
                .trim()
                .escape(),
            body('description')
                .optional()
                .isLength({ max: 500 })
                .withMessage('Description cannot exceed 500 characters')
                .trim()
                .escape(),
            body('category')
                .optional()
                .isIn(TASK_CATEGORIES)
                .withMessage(`Category must be one of: ${TASK_CATEGORIES.join(', ')}`),
            body('completed')
                .optional()
                .isBoolean()
                .withMessage('Completed must be a boolean value')
                .toBoolean(), // Convert to boolean
        ],
        handleValidationErrors,
        updateTask
    )
    .delete(
        protect,
        [
            param('id').isMongoId().withMessage('Invalid task ID'),
        ],
        handleValidationErrors,
        deleteTask
    );

// Specific endpoint for marking complete/incomplete
router.put(
    '/:id/complete',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid task ID'),
        body('completed')
            .isBoolean()
            .withMessage('Completed must be a boolean value')
            .toBoolean(),
    ],
    handleValidationErrors,
    markTaskComplete
);

module.exports = router;