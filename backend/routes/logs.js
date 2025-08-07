const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   POST api/logs
// @desc    Receive log entries from frontend
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const logEntry = req.body;
        
        // Add user information to the log entry
        logEntry.userId = req.user.id;
        logEntry.serverTimestamp = new Date().toISOString();
        
        // Log to console for debugging/monitoring
        console.log(`[LOG] User ${req.user.id}:`, logEntry);
        
        // In a production environment, you might want to:
        // - Store logs in a database
        // - Send to a logging service like Winston, Elasticsearch, etc.
        // - Filter sensitive information
        
        res.status(200).json({ 
            message: 'Log received successfully',
            timestamp: logEntry.serverTimestamp 
        });
    } catch (err) {
        console.error('Error processing log entry:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/logs
// @desc    Get logs for current user (optional endpoint for debugging)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // This is a simple implementation - in production you'd retrieve from database
        res.json({ 
            message: 'Logs endpoint is working',
            userId: req.user.id,
            note: 'Log storage not implemented yet - check server console for logs'
        });
    } catch (err) {
        console.error('Error retrieving logs:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;