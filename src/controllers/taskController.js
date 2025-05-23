const Task = require('../models/taskModel');
const { validationResult } = require('express-validator'); // Import this

// Helper function to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Create a new task
const createTask = async (req, res) => {
    const { title, description, category } = req.body; // Validation handled by middleware
    try {
        const task = await Task.create({
            title,
            description,
            category,
            user: req.user._id, // User is attached via auth middleware
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all tasks for the authenticated user
const getTasks = async (req, res) => {
    // No specific input validation needed for GET all tasks
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
    // ID validation handled by middleware
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        // Mongoose CastError for invalid ObjectId will be caught here
        res.status(500).json({ message: error.message });
    }
};

// Update a task
const updateTask = async (req, res) => {
    const { title, description, category, completed } = req.body; // Validation handled by middleware
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (task) {
            task.title = title !== undefined ? title : task.title; // Allow partial updates
            task.description = description !== undefined ? description : task.description;
            task.category = category !== undefined ? category : task.category;
            task.completed = typeof completed === 'boolean' ? completed : task.completed;
            task.updatedAt = Date.now();

            const updatedTask = await task.save();
            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mark task as complete/incomplete
const markTaskComplete = async (req, res) => {
    const { completed } = req.body; // Validation handled by middleware
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
        if (task) {
            task.completed = completed;
            task.updatedAt = Date.now();
            const updatedTask = await task.save();
            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a task
const deleteTask = async (req, res) => {
    // ID validation handled by middleware
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (task) {
            res.json({ message: 'Task removed' });
        } else {
            res.status(404).json({ message: 'Task not found' });
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
    handleValidationErrors // Export this for use in routes
};