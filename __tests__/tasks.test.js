const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/userModel');
const Task = require('../src/models/taskModel');

let token;
let userId;
let taskId; // To store a created task ID for update/delete tests

describe('Tasks API', () => {
    // Before all tests, register and login a user to get a token
    beforeAll(async () => {
        await User.deleteMany({}); // Ensure no leftover users
        await Task.deleteMany({}); // Ensure no leftover tasks

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'taskuser',
                password: 'taskpassword'
            });
        userId = registerRes.body._id;

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'taskuser',
                password: 'taskpassword'
            });
        token = loginRes.body.token;
    });

    // Clean up tasks after each test to prevent side effects, but keep the user
    afterEach(async () => {
        await Task.deleteMany({ user: userId });
    });


    describe('Authentication Middleware', () => {
        it('should return 401 if no token is provided for a protected route', async () => {
            const res = await request(app).get('/api/tasks');
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual('Not authorized, no token');
        });

        it('should return 401 if an invalid token is provided', async () => {
            const res = await request(app)
                .get('/api/tasks')
                .set('Authorization', 'Bearer invalid_token');
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual('Not authorized, token failed');
        });
    });

    describe('POST /api/tasks', () => {
        it('should create a new task successfully', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Test Task',
                    description: 'This is a description for the test task.',
                    category: 'Personal'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.title).toEqual('New Test Task');
            expect(res.body.user).toEqual(userId);
            expect(res.body.completed).toBe(false); // Default value
            taskId = res.body._id; // Store for later tests
        });

        it('should return 400 if title is missing', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: 'Description without title'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toEqual('Title is required');
        });

        it('should return 400 if category is invalid', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Invalid Category Task',
                    category: 'InvalidCategory'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toContain('Category must be one of');
        });
    });

    describe('GET /api/tasks', () => {
        beforeEach(async () => {
            // Create some tasks for the user
            await Task.create({ title: 'Task 1', user: userId });
            await Task.create({ title: 'Task 2', user: userId });
        });

        it('should fetch all tasks for the authenticated user', async () => {
            const res = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].title).toEqual('Task 2'); // Sorted by createdAt desc
        });

        it('should not fetch tasks from other users', async () => {
            // Create a task for another user
            const otherUser = await User.create({ username: 'otheruser', password: 'otherpassword' });
            await Task.create({ title: 'Other User Task', user: otherUser._id });

            const res = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2); // Still only finds current user's tasks
            const titles = res.body.map(t => t.title);
            expect(titles).not.toContain('Other User Task');
        });
    });

    describe('GET /api/tasks/:id', () => {
        let testTaskId;
        beforeEach(async () => {
            const task = await Task.create({ title: 'Specific Task', user: userId });
            testTaskId = task._id.toString();
        });

        it('should fetch a single task by ID', async () => {
            const res = await request(app)
                .get(`/api/tasks/${testTaskId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toEqual('Specific Task');
            expect(res.body._id).toEqual(testTaskId);
        });

        it('should return 404 if task ID does not exist', async () => {
            const res = await request(app)
                .get(`/api/tasks/60d5ec49e2175a001c3d1f3b`) // Random but valid-looking ID
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Task not found');
        });

        it('should return 400 for invalid task ID format', async () => {
            const res = await request(app)
                .get(`/api/tasks/invalidid`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toEqual('Invalid task ID');
        });

        it('should return 404 if task belongs to another user', async () => {
            const otherUser = await User.create({ username: 'anotheruser', password: 'anotherpassword' });
            const otherTask = await Task.create({ title: 'Another Users Task', user: otherUser._id });

            const res = await request(app)
                .get(`/api/tasks/${otherTask._id.toString()}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Task not found');
        });
    });

    describe('PUT /api/tasks/:id', () => {
        let testTaskId;
        beforeEach(async () => {
            const task = await Task.create({ title: 'Task to update', user: userId, completed: false });
            testTaskId = task._id.toString();
        });

        it('should update a task successfully', async () => {
            const res = await request(app)
                .put(`/api/tasks/${testTaskId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Task Title',
                    completed: true
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toEqual('Updated Task Title');
            expect(res.body.completed).toBe(true);
            expect(res.body._id).toEqual(testTaskId);
        });

        it('should return 400 for invalid category during update', async () => {
            const res = await request(app)
                .put(`/api/tasks/${testTaskId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    category: 'BadCategory'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toContain('Category must be one of');
        });

        it('should return 404 if task to update does not exist or not owned', async () => {
            const res = await request(app)
                .put(`/api/tasks/60d5ec49e2175a001c3d1f3b`) // Non-existent ID
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Non-existent task update' });
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Task not found or not owned by user');
        });
    });

    describe('PUT /api/tasks/:id/complete', () => {
        let testTaskId;
        beforeEach(async () => {
            const task = await Task.create({ title: 'Task to mark', user: userId, completed: false });
            testTaskId = task._id.toString();
        });

        it('should mark a task as complete', async () => {
            const res = await request(app)
                .put(`/api/tasks/${testTaskId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({ completed: true });
            expect(res.statusCode).toEqual(200);
            expect(res.body.completed).toBe(true);
            expect(res.body._id).toEqual(testTaskId);
        });

        it('should mark a task as incomplete', async () => {
            // First mark complete
            await request(app)
                .put(`/api/tasks/${testTaskId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({ completed: true });

            const res = await request(app)
                .put(`/api/tasks/${testTaskId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({ completed: false });
            expect(res.statusCode).toEqual(200);
            expect(res.body.completed).toBe(false);
        });

        it('should return 400 if completed is not a boolean', async () => {
            const res = await request(app)
                .put(`/api/tasks/${testTaskId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({ completed: 'notabool' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toEqual('Completed must be a boolean value');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        let testTaskId;
        beforeEach(async () => {
            const task = await Task.create({ title: 'Task to delete', user: userId });
            testTaskId = task._id.toString();
        });

        it('should delete a task successfully', async () => {
            const res = await request(app)
                .delete(`/api/tasks/${testTaskId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Task removed successfully');

            // Verify it's actually deleted
            const fetchRes = await request(app)
                .get(`/api/tasks/${testTaskId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(fetchRes.statusCode).toEqual(404);
        });

        it('should return 404 if task to delete does not exist or not owned', async () => {
            const res = await request(app)
                .delete(`/api/tasks/60d5ec49e2175a001c3d1f3b`) // Non-existent ID
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Task not found or not owned by user');
        });
    });
});