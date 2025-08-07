const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'monopoly.db'),
    logging: false, // Set to console.log to see SQL queries
});

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to SQLite database:', error);
    }
};

module.exports = { sequelize, testConnection };