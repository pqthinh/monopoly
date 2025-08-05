const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GameLog = require('../models/GameLog');
const User = require('../models/User');

// @route   GET api/games
// @desc    Get all games for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find games where the user is one of the players
        const games = await GameLog.findAll({
            where: {
                players: {
                    // Using JSON search for SQLite
                    // This will find games where the players JSON contains the user's id
                }
            },
            order: [['createdAt', 'DESC']]
        });

        // Filter games where the current user was a player (JSON search fallback)
        const userGames = games.filter(game => 
            game.players.some(player => player.userId === req.user.id)
        );

        res.json(userGames);
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
        const game = await GameLog.findByPk(req.params.id);
        if (!game) {
            return res.status(404).json({ msg: 'Game not found' });
        }
        
        // Check if the user was a player in this game
        const isPlayerInGame = game.players.some(player => player.userId === req.user.id);
        if (!isPlayerInGame) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        res.json(game);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/games
// @desc    Create a new game log
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { players, winner, duration, logs, roomId, gameEndReason } = req.body;
        
        const gameLog = await GameLog.create({
            players,
            winner,
            duration,
            logs,
            roomId,
            gameEndReason
        });

        res.json(gameLog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;