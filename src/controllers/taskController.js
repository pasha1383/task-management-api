const Task = require('../models/taskModel'); // Still needed for Task model reference in service
const taskService = require('../services/taskService'); // Import the service
const { validationResult } = require('express-validator');

// Helper function to handle validation results (remains the same)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Create a new task
const createTask = async (req, res) => {
    const { title, description, category } = req.body;
    try {
        const task = await taskService.createTask({
            title,
            description,
            category,
            userId: req.user._id, // Pass user ID to the service
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all tasks for the authenticated user
const getTasks = async (req, res) => {
    try {
        const tasks = await taskService.getTasksByUserId(req.user._id);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
    try {
        const task = await taskService.getTaskByIdAndUserId(req.params.id, req.user._id);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { title, description, category, completed } = req.body;
    try {
        const updatedTask = await taskService.updateTask(
            req.params.id,
            req.user._id,
            { title, description, category, completed } // Pass all potentially updated fields
        );
        if (updatedTask) {
            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found or not owned by user' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mark task as complete/incomplete
const markTaskComplete = async (req, res) => {
    const { completed } = req.body;
    try {
        const updatedTask = await taskService.markTaskComplete(
            req.params.id,
            req.user._id,
            completed
        );
        if (updatedTask) {
            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found or not owned by user' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    try {
        const deletedTask = await taskService.deleteTask(req.params.id, req.user._id);
        if (deletedTask) {
            res.json({ message: 'Task removed successfully' });
        } else {
            res.status(404).json({ message: 'Task not found or not owned by user' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    markTaskComplete,
    deleteTask,
    handleValidationErrors
};