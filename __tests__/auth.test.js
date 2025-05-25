const request = require('supertest');
const app = require('../src/app'); // Your Express app
const User = require('../src/models/userModel'); // User model to clear database

describe('Auth API', () => {
    // Clear the User collection before each test to ensure test isolation
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('username', 'testuser');
            expect(res.body).toHaveProperty('token');
        });

        it('should return 400 if username is too short', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'a',
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toEqual('Username must be at least 3 characters long');
        });

        it('should return 400 if password is too short', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: '123'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toEqual('Password must be at least 6 characters long');
        });

        it('should return 400 if user already exists', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'existinguser',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'existinguser',
                    password: 'password456'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        const username = 'loginuser';
        const password = 'loginpassword';

        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({ username, password });
        });

        it('should log in an existing user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username, password });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('username', username);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 401 for invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username, password: 'wrongpassword' });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid username or password');
        });

        it('should return 401 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'nonexistent', password: 'anypassword' });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid username or password');
        });
    });
});