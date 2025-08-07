const { sequelize } = require('./database');
const fs = require('fs');
const path = require('path');
const User = require('../models/User'); // Import model User

const initializeDatabase = async () => {
    try {
        console.log('Initializing database...');
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        await sequelize.authenticate();
        console.log('✅ SQLite database connection established successfully.');

        await sequelize.sync({ alter: true });
        console.log('✅ All models were synchronized successfully.');
        return true;
    } catch (error) {
        console.error('❌ Unable to initialize database:', error);
        return false;
    }
};

module.exports = { initializeDatabase };