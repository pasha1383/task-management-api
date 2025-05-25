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
                            example: 'Something went wrong',
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
    },
    apis: [
        './src/routes/*.js',       // Path to your route files
        './src/models/*.js'        // If you add JSDoc to models for schemas
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;