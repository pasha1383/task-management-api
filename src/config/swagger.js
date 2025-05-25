// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0', // Specify OpenAPI version
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description: 'A simple RESTful API for managing tasks with user authentication, CRUD operations, and categories.',
            contact: {
                name: 'Your Name', // Optional: Replace with your name or team
                email: 'your.email@example.com', // Optional: Replace with your email
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api', // Your API base URL
                description: 'Development server',
            },
            // You can add more servers for staging, production, etc.
            // {
            //     url: 'https://your-staging-api.com/api',
            //     description: 'Staging server',
            // }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
                },
            },
            schemas: {
                UserRegister: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'Unique username for the user',
                            example: 'john_doe',
                        },
                        password: {
                            type: 'string',
                            description: 'Password for the user (min 6 characters)',
                            example: 'password123',
                        },
                    },
                },
                UserLogin: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            description: 'Username of the user',
                            example: 'john_doe',
                        },
                        password: {
                            type: 'string',
                            description: 'Password of the user',
                            example: 'password123',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique ID of the user',
                            example: '60c72b2f9b1d8e001c8e2a1b',
                        },
                        username: {
                            type: 'string',
                            description: 'Username of the user',
                            example: 'john_doe',
                        },
                        token: {
                            type: 'string',
                            description: 'JWT token for authentication',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                    },
                },
                Task: {
                    type: 'object',
                    required: ['title', 'user'],
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique ID of the task',
                            example: '60c72b2f9b1d8e001c8e2a1c',
                        },
                        title: {
                            type: 'string',
                            description: 'Title of the task',
                            example: 'Buy groceries',
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the task',
                            example: 'Milk, eggs, bread, and fruits',
                        },
                        category: {
                            type: 'string',
                            enum: ['Personal', 'Work', 'Shopping', 'Other'],
                            description: 'Category of the task',
                            example: 'Shopping',
                        },
                        completed: {
                            type: 'boolean',
                            description: 'Completion status of the task',
                            example: false,
                        },
                        user: {
                            type: 'string',
                            description: 'ID of the user who owns the task',
                            example: '60c72b2f9b1d8e001c8e2a1b',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp of task creation',
                            example: '2024-01-29T10:00:00.000Z',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp of last task update',
                            example: '2024-01-29T10:05:00.000Z',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                            example: 'Not authorized, no token',
                        },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', example: 'field' },
                                    value: { type: 'string', example: 'ab' },
                                    msg: { type: 'string', example: 'Username must be at least 3 characters long' },
                                    path: { type: 'string', example: 'username' },
                                    location: { type: 'string', example: 'body' }
                                }
                            }
                        }
                    }
                }
            },
        },
        // --- ALL API PATHS DEFINED HERE ---
        paths: {
            '/auth/register': {
                post: {
                    summary: 'Register a new user',
                    description: 'This endpoint allows new users to register an account with the task management system. Upon successful registration, it returns user details and a JWT token for authentication.',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserRegister'
                                },
                                examples: {
                                    UserRegistration: {
                                        value: {
                                            username: 'newuser123',
                                            password: 'securepassword'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'User registered successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/AuthResponse'
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad request (e.g., validation errors or user already exists)',
                            content: {
                                'application/json': {
                                    schema: {
                                        oneOf: [
                                            { $ref: '#/components/schemas/ValidationError' },
                                            {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string', example: 'User already exists' }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/auth/login': {
                post: {
                    summary: 'Log in an existing user',
                    description: 'This endpoint allows an existing user to log in and receive a JWT token for subsequent authenticated requests.',
                    tags: ['Authentication'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserLogin'
                                },
                                examples: {
                                    UserLogin: {
                                        value: {
                                            username: 'existinguser',
                                            password: 'loginpassword'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'User logged in successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/AuthResponse'
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Invalid username or password',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: { type: 'string', example: 'Invalid username or password' }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad request (validation errors)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ValidationError'
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/tasks': {
                post: {
                    summary: 'Create a new task',
                    description: 'Creates a new task for the authenticated user.',
                    tags: ['Tasks'],
                    security: [{ BearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title'],
                                    properties: {
                                        title: {
                                            type: 'string',
                                            description: 'Title of the task (max 100 characters).',
                                            example: 'Plan weekend trip'
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'Detailed description of the task (max 500 characters).',
                                            example: 'Research destinations, book flights, find accommodation.'
                                        },
                                        category: {
                                            type: 'string',
                                            enum: ['Personal', 'Work', 'Shopping', 'Other'],
                                            description: 'Category of the task.',
                                            example: 'Personal'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Task created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Task'
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad request (validation errors)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ValidationError'
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized (no token or invalid token)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                },
                get: {
                    summary: 'Get all tasks for the authenticated user',
                    description: 'Retrieves a list of all tasks owned by the authenticated user, sorted by creation date (newest first).',
                    tags: ['Tasks'],
                    security: [{ BearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'List of tasks',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Task'
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized (no token or invalid token)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/tasks/{id}': {
                get: {
                    summary: 'Get a single task by ID',
                    description: 'Retrieves a single task owned by the authenticated user by its ID.',
                    tags: ['Tasks'],
                    security: [{ BearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            schema: {
                                type: 'string',
                                format: 'ObjectId'
                            },
                            required: true,
                            description: 'ID of the task to retrieve.',
                            example: '60c72b2f9b1d8e001c8e2a1c'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Task found',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Task'
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad request (invalid task ID format)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ValidationError'
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        404: {
                            description: 'Task not found or not owned by user',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                },
                put: {
                    summary: 'Update an existing task',
                    description: 'Updates an existing task by its ID, owned by the authenticated user. Supports partial updates (only provide fields you want to change).',
                    tags: ['Tasks'],
                    security: [{ BearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            schema: {
                                type: 'string',
                                format: 'ObjectId'
                            },
                            required: true,
                            description: 'ID of the task to update.',
                            example: '60c72b2f9b1d8e001c8e2a1c'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: {
                                            type: 'string',
                                            description: 'New title for the task (max 100 characters).',
                                            example: 'Buy organic groceries'
                                        },
                                        description: {
                                            type: 'string',
                                            description: 'New detailed description for the task (max 500 characters).',
                                            example: 'Get organic milk, eggs, whole wheat bread.'
                                        },
                                        category: {
                                            type: 'string',
                                            enum: ['Personal', 'Work', 'Shopping', 'Other'],
                                            description: 'New category for the task.',
                                            example: 'Shopping'
                                        },
                                        completed: {
                                            type: 'boolean',
                                            description: 'New completion status for the task.',
                                            example: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Task updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Task'
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad request (validation errors)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ValidationError'
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        404: {
                            description: 'Task not found or not owned by user',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                },
                delete: {
                    summary: 'Delete a task',
                    description: 'Deletes a task by its ID, owned by the authenticated user.',
                    tags: ['Tasks'],
                    security: [{ BearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            schema: {
                                type: 'string',
                                format: 'ObjectId'
                            },
                            required: true,
                            description: 'ID of the task to delete.',
                            example: '60c72b2f9b1d8e001c8e2a1c'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Task removed successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Task removed successfully'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad request (invalid task ID format)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ValidationError'
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        404: {
                            description: 'Task not found or not owned by user',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/tasks/{id}/complete': {
                put: {
                    summary: 'Mark a task as complete or incomplete',
                    description: 'Updates the completion status of a task by its ID, owned by the authenticated user.',
                    tags: ['Tasks'],
                    security: [{ BearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            schema: {
                                type: 'string',
                                format: 'ObjectId'
                            },
                            required: true,
                            description: 'ID of the task to update.',
                            example: '60c72b2f9b1d8e001c8e2a1c'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['completed'],
                                    properties: {
                                        completed: {
                                            type: 'boolean',
                                            description: 'True to mark as complete, false to mark as incomplete.',
                                            example: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Task completion status updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Task'
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad request (validation errors)',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ValidationError'
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'Unauthorized',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        404: {
                            description: 'Task not found or not owned by user',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [], // No need to specify route files as paths are defined directly
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;