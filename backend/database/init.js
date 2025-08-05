const { sequelize, testConnection } = require('./database');
const User = require('../models/User');
const GameLog = require('../models/GameLog');

const initializeDatabase = async () => {
    try {
        // Test connection
        await testConnection();
        
        // Sync all models with database (create tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables synchronized successfully.');
        
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
};

module.exports = { initializeDatabase };