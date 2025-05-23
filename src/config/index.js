module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager',
    jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
    port: process.env.PORT || 3000
};