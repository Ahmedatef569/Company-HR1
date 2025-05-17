require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-token-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    NODE_ENV: process.env.NODE_ENV || 'development'
};
