const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

const GameLog = sequelize.define('GameLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    players: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    winner: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    logs: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    roomId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gameEndReason: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'game_logs',
    timestamps: true,
});

module.exports = GameLog;