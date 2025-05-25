// src/services/taskService.js
const Task = require('../models/taskModel');

const taskService = {
    /**
     * Creates a new task.
     * @param {string} title
     * @param {string} description
     * @param {string} category
     * @param {string} userId - The ID of the user creating the task.
     * @returns {Promise<Object>} The created task object.
     */
    createTask: async ({ title, description, category, userId }) => {
        const task = await Task.create({
            title,
            description,
            category,
            user: userId,
        });
        return task;
    },

    /**
     * Retrieves all tasks for a specific user.
     * @param {string} userId - The ID of the user.
     * @returns {Promise<Array>} An array of task objects.
     */
    getTasksByUserId: async (userId) => {
        const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
        return tasks;
    },

    /**
     * Retrieves a single task by ID for a specific user.
     * @param {string} taskId - The ID of the task.
     * @param {string} userId - The ID of the user who owns the task.
     * @returns {Promise<Object|null>} The task object or null if not found/owned by user.
     */
    getTaskByIdAndUserId: async (taskId, userId) => {
        const task = await Task.findOne({ _id: taskId, user: userId });
        return task;
    },

    /**
     * Updates an existing task.
     * @param {string} taskId - The ID of the task to update.
     * @param {string} userId - The ID of the user who owns the task.
     * @param {object} updateData - Object containing fields to update (title, description, category, completed).
     * @returns {Promise<Object|null>} The updated task object or null if not found/owned by user.
     */
    updateTask: async (taskId, userId, updateData) => {
        const task = await Task.findOne({ _id: taskId, user: userId });
        if (!task) {
            return null; // Task not found or not owned by user
        }

        // Apply updates, ensuring only allowed fields are updated
        if (updateData.title !== undefined) task.title = updateData.title;
        if (updateData.description !== undefined) task.description = updateData.description;
        if (updateData.category !== undefined) task.category = updateData.category;
        if (typeof updateData.completed === 'boolean') task.completed = updateData.completed;

        task.updatedAt = Date.now();
        const updatedTask = await task.save();
        return updatedTask;
    },

    /**
     * Marks a task as complete or incomplete.
     * @param {string} taskId - The ID of the task.
     * @param {string} userId - The ID of the user who owns the task.
     * @param {boolean} completed - The new completion status.
     * @returns {Promise<Object|null>} The updated task object or null if not found/owned by user.
     */
    markTaskComplete: async (taskId, userId, completed) => {
        const task = await Task.findOne({ _id: taskId, user: userId });
        if (!task) {
            return null;
        }
        task.completed = completed;
        task.updatedAt = Date.now();
        const updatedTask = await task.save();
        return updatedTask;
    },

    /**
     * Deletes a task.
     * @param {string} taskId - The ID of the task to delete.
     * @param {string} userId - The ID of the user who owns the task.
     * @returns {Promise<Object|null>} The deleted task object or null if not found/owned by user.
     */
    deleteTask: async (taskId, userId) => {
        const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
        return task; // Returns the deleted document or null
    }
};

module.exports = taskService;