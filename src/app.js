// src/app.js (modified)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// --- Swagger/OpenAPI Imports ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
// -------------------------------

dotenv.config();

const app = express();

// Database connection
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// --- Swagger UI Route ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ------------------------

// Basic error handling (can be expanded)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;