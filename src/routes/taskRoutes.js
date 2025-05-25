const express = require('express');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    markTaskComplete,
    deleteTask,
    handleValidationErrors
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const router = express.Router();

const TASK_CATEGORIES = ['Personal', 'Work', 'Shopping', 'Other']; // Ensure this matches your model

/**
 * @swagger
 * /tasks:
 * post:
 * summary: Create a new task
 * description: Creates a new task for the authenticated user.
 * tags:
 * - Tasks
 * security:
 * - BearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - title
 * properties:
 * title:
 * type: string
 * description: Title of the task (max 100 characters).
 * example: Plan weekend trip
 * description:
 * type: string
 * description: Detailed description of the task (max 500 characters).
 * example: Research destinations, book flights, find accommodation.
 * category:
 * type: string
 * enum: ['Personal', 'Work', 'Shopping', 'Other']
 * description: Category of the task.
 * example: Personal
 * responses:
 * 201:
 * description: Task created successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Task'
 * 400:
 * description: Bad request (validation errors)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ValidationError'
 * 401:
 * description: Unauthorized (no token or invalid token)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 *
 * get:
 * summary: Get all tasks for the authenticated user
 * description: Retrieves a list of all tasks owned by the authenticated user, sorted by creation date (newest first).
 * tags:
 * - Tasks
 * security:
 * - BearerAuth: []
 * responses:
 * 200:
 * description: List of tasks
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Task'
 * 401:
 * description: Unauthorized (no token or invalid token)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 */
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
        handleValidationErrors,
        createTask
    )
    .get(protect, getTasks);

/**
 * @swagger
 * /tasks/{id}:
 * get:
 * summary: Get a single task by ID
 * description: Retrieves a single task owned by the authenticated user by its ID.
 * tags:
 * - Tasks
 * security:
 * - BearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: ObjectId
 * required: true
 * description: ID of the task to retrieve.
 * example: 60c72b2f9b1d8e001c8e2a1c
 * responses:
 * 200:
 * description: Task found
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Task'
 * 400:
 * description: Bad request (invalid task ID format)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ValidationError'
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 404:
 * description: Task not found or not owned by user
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 *
 * put:
 * summary: Update an existing task
 * description: Updates an existing task by its ID, owned by the authenticated user. Supports partial updates (only provide fields you want to change).
 * tags:
 * - Tasks
 * security:
 * - BearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: ObjectId
 * required: true
 * description: ID of the task to update.
 * example: 60c72b2f9b1d8e001c8e2a1c
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * title:
 * type: string
 * description: New title for the task (max 100 characters).
 * example: Buy organic groceries
 * description:
 * type: string
 * description: New detailed description for the task (max 500 characters).
 * example: Get organic milk, eggs, whole wheat bread.
 * category:
 * type: string
 * enum: ['Personal', 'Work', 'Shopping', 'Other']
 * description: New category for the task.
 * example: Shopping
 * completed:
 * type: boolean
 * description: New completion status for the task.
 * example: true
 * responses:
 * 200:
 * description: Task updated successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Task'
 * 400:
 * description: Bad request (validation errors)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ValidationError'
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 404:
 * description: Task not found or not owned by user
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 *
 * delete:
 * summary: Delete a task
 * description: Deletes a task by its ID, owned by the authenticated user.
 * tags:
 * - Tasks
 * security:
 * - BearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: ObjectId
 * required: true
 * description: ID of the task to delete.
 * example: 60c72b2f9b1d8e001c8e2a1c
 * responses:
 * 200:
 * description: Task removed successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Task removed successfully
 * 400:
 * description: Bad request (invalid task ID format)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ValidationError'
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 404:
 * description: Task not found or not owned by user
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 */
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
                .toBoolean(),
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

/**
 * @swagger
 * /tasks/{id}/complete:
 * put:
 * summary: Mark a task as complete or incomplete
 * description: Updates the completion status of a task by its ID, owned by the authenticated user.
 * tags:
 * - Tasks
 * security:
 * - BearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * format: ObjectId
 * required: true
 * description: ID of the task to update.
 * example: 60c72b2f9b1d8e001c8e2a1c
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - completed
 * properties:
 * completed:
 * type: boolean
 * description: True to mark as complete, false to mark as incomplete.
 * example: true
 * responses:
 * 200:
 * description: Task completion status updated successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Task'
 * 400:
 * description: Bad request (validation errors)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ValidationError'
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 404:
 * description: Task not found or not owned by user
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 * 500:
 * description: Server error
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Error'
 */
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