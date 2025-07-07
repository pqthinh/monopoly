const mongoose = require('mongoose');

const GameLogSchema = new mongoose.Schema({
    players: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        character: String,
    }],
    winner: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
    },
    duration: Number, // In seconds
    logs: [String],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('GameLog', GameLogSchema);