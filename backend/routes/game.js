const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GameLog = require('../models/GameLog');

// @route   GET api/games
// @desc    Get all games for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find games where the user is one of the players
        const games = await GameLog.find({ 'players.userId': req.user.id }).sort({ createdAt: -1 });
        res.json(games);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/games/:id
// @desc    Get game by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const game = await GameLog.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }
        // Optional: Check if the user was a player in this game
        res.json(game);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;