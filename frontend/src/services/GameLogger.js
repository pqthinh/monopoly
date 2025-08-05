// Simple logging service for game events
class GameLogger {
    constructor() {
        this.logs = [];
        this.isEnabled = true;
    }

    log(level, message, data = {}) {
        if (!this.isEnabled) return;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            sessionId: this.getSessionId()
        };
        
        this.logs.push(logEntry);
        console.log(`[${level.toUpperCase()}] ${message}`, data);
        
        // Send to backend if available
        this.sendToBackend(logEntry);
    }

    info(message, data) {
        this.log('info', message, data);
    }

    warn(message, data) {
        this.log('warn', message, data);
    }

    error(message, data) {
        this.log('error', message, data);
    }

    gameEvent(eventType, eventData) {
        this.log('game', `Game Event: ${eventType}`, eventData);
    }

    userAction(action, details) {
        this.log('user', `User Action: ${action}`, details);
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    async sendToBackend(logEntry) {
        try {
            // Only send if we have a valid token
            const token = localStorage.getItem('token');
            if (!token || token.startsWith('mock-')) return;

            await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            console.warn('Failed to send log to backend:', error);
        }
    }

    getLogs(level = null, limit = 100) {
        let filteredLogs = this.logs;
        
        if (level) {
            filteredLogs = this.logs.filter(log => log.level === level);
        }
        
        return filteredLogs.slice(-limit);
    }

    clearLogs() {
        this.logs = [];
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}

// Create singleton instance
const gameLogger = new GameLogger();

export default gameLogger;