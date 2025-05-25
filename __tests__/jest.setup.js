// __tests__/jest.setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`Connected to in-memory MongoDB for testing: ${uri}`);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('Disconnected from in-memory MongoDB.');
});