const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const Game = require('./gameLogic.js');
const { hashStringToNumber } = require('./util.js');
const { initializeDatabase } = require('./database/init.js');
const GameLog = require('./models/GameLog');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cors({
    origin: 'https://monopoly.lexispeak.com',
    methods: ['GET', 'POST']
}));

app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));

async function startServer() {
    try {
        console.log("Starting backend server...");
        const success = await initializeDatabase();
        if (!success) {
            console.error('❌ Failed to initialize database. Exiting...');
            process.exit(1);
        }
        console.log('✅ Database initialized successfully.');

        // Routes
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/games', require('./routes/game'));
        app.get('/api/test', (req, res) => res.send('API is working!'));

        // Any other requests that don't match the API routes will be handled by React app
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'frontend', 'build', 'index.html'));
        });

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: ["https://monopoly.lexispeak.com"],
                methods: ["GET", "POST"]
            },
            maxHttpBufferSize: 1e8, // 100 MB
            pingTimeout: 60000,
            path: "/"
        });

        let rooms = {};

        // Helper function to update and broadcast room list
        const updateRoomList = () => {
            const roomListForClient = Object.values(rooms).map(room => ({
                id: room.id,
                name: room.name,
                players: room.players.map(p => ({ id: p.id, name: p.name, isHost: p.isHost })),
                playerCount: room.players.length,
                gameStarted: !!room.game,
                hostId: room.hostId
            }));
            io.emit('roomListUpdate', roomListForClient);
        };

        // Helper function to save game log
        const saveGameLog = async (room, winner = null, gameEndReason = null) => {
            try {
                if (!room.game) return;
                
                const players = room.players.map(p => ({
                    userId: p.userId || null,
                    username: p.name,
                    character: p.character || null,
                    socketId: p.id
                }));

                const winnerData = winner ? {
                    userId: winner.userId || null,
                    username: winner.name,
                    socketId: winner.id
                } : null;

                await GameLog.create({
                    players,
                    winner: winnerData,
                    duration: room.gameTime - (room.game.remainingTime || 0),
                    logs: room.game.gameLog || [],
                    roomId: room.id,
                    gameEndReason: gameEndReason || 'normal'
                });

                console.log(`✅ Game log saved for room ${room.id}`);
            } catch (error) {
                console.error('❌ Failed to save game log:', error);
            }
        };

        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);
            socket.emit('connected', { id: socket.id });
            updateRoomList();

            socket.on('setName', (name) => {
                socket.name = name || `Người chơi #${Math.floor(Math.random() * 100)}`;
            });

            // Sửa phần khởi tạo room
            socket.on('createRoom', ({ roomName, gameTime, myId }) => {
                const roomId = `room-${hashStringToNumber(roomName || socket.name)}`;
                if (rooms[roomId]) {
                    return socket.emit('error', 'Phòng đã tồn tại, vui lòng chọn tên khác.');
                }
                rooms[roomId] = {
                    id: roomId,
                    name: roomName || `Phòng của ${socket.name || 'người chơi'}`,
                    players: [],
                    game: null,
                    hostId: myId,
                    gameTime: gameTime || 600,
                    timerInterval: null,
                    turnTimer: null,
                    minPlayers: 2,
                    maxPlayers: 6,
                };
                updateRoomList();
                socket.emit('roomCreated', roomId);
                socket.emit('joinRoom', roomId);
            });

            socket.on('joinRoom', (roomId, playerName, userId) => {
                const room = rooms[roomId];
                if (!room) {
                    return socket.emit('joinRoomError', 'Phòng không tồn tại.');
                }
                if (room.players.length >= room.maxPlayers) {
                    return socket.emit('joinRoomError', 'Phòng đã đầy.');
                }
                if (room.game) {
                    return socket.emit('joinRoomError', 'Trận đấu đã bắt đầu.');
                }

                socket.join(roomId);
                socket.roomId = roomId;
                socket.name = playerName;
                socket.userId = userId;

                const isHost = socket.id === room.hostId;
                room.players.push({ id: socket.id, name: playerName, isHost: isHost, userId: userId });

                io.to(roomId).emit('playerJoined', { roomId, players: room.players, hostId: room.hostId });
                updateRoomList();
            });

            socket.on('startGame', () => {
                const room = rooms[socket.roomId];
                if (!room || socket.id !== room.hostId) {
                    return socket.emit('error', 'Không có quyền bắt đầu game');
                }
                
                if (room.players.length < room.minPlayers) {
                    return socket.emit('error', 'Chưa đủ số người chơi tối thiểu');
                }

                if (room.players.length > room.maxPlayers) {
                    return socket.emit('error', 'Đã vượt quá số người chơi tối đa');
                }

                console.log(`Game starting in room "${room.name}"`);
                startNewGame(room);
            });

            function startNewGame(room) {
                if (room.timerInterval) {
                    clearInterval(room.timerInterval);
                }
                
                const playerSockets = room.players.map(p => ({ id: p.id, name: p.name }));
                room.game = new Game(playerSockets, room.gameTime);
                
                io.to(room.id).emit('gameStarted', room.game.getGameState());
                updateRoomList();

                room.timerInterval = setInterval(async () => {
                    if (room.game.remainingTime > 0) {
                        room.game.remainingTime--;
                        if (room.game.turnTimeRemaining > 0) {
                            room.game.turnTimeRemaining--;
                        } else {
                            room.game.handleTurnTimeout();
                        }
                        io.to(room.id).emit('timeUpdate', room.game.getGameState());
                    } else {
                        room.game.endGameByTime();
                        const gameState = room.game.getGameState();
                        io.to(room.id).emit('updateGameState', gameState);
                        
                        await saveGameLog(room, gameState.winner, 'time_limit');
                        
                        clearInterval(room.timerInterval);
                    }
                }, 1000);
            }

            socket.on('playerAction', async (action) => {
                const room = rooms[socket.roomId];
                if (room && room.game) {
                    room.game.handleAction(socket.id, action);
                    const gameState = room.game.getGameState();
                    io.to(socket.roomId).emit('updateGameState', gameState);

                    if (room.game.currentPhase === 'game_over') {
                        if (room.timerInterval) clearInterval(room.timerInterval);
                        
                        await saveGameLog(room, gameState.winner, 'normal');
                    }
                }
            });

            socket.on('disconnect', async () => {
                console.log(`User disconnected: ${socket.id}`);
                const room = rooms[socket.roomId];
                if (!room) {
                    updateRoomList();
                    return;
                }

                if (room.game && room.game.currentPhase !== 'game_over') {
                    room.game.handlePlayerQuit(socket.id);
                    const gameState = room.game.getGameState();
                    io.to(socket.roomId).emit('updateGameState', gameState);
                    
                    room.players = room.players.filter(p => p.id !== socket.id);
                    
                    if (room.players.length < room.minPlayers) {
                        room.game.endGame(null, "không đủ người chơi");
                        const finalGameState = room.game.getGameState();
                        
                        await saveGameLog(room, finalGameState.winner, 'insufficient_players');
                        
                        delete rooms[socket.roomId];
                        io.to(socket.roomId).emit('updateGameState', finalGameState);
                        if (room.timerInterval) clearInterval(room.timerInterval);
                    }
                } else if (!room.game) {
                    room.players = room.players.filter(p => p.id !== socket.id);
                    if (room.players.length === 0) {
                        delete rooms[socket.roomId];
                    } else {
                        io.to(socket.roomId).emit('playerLeft', { 
                            roomId: socket.roomId, 
                            players: room.players
                        });
                    }
                } else {
                    // This else block is a bug because room is already checked above.
                    // If room.game exists and currentPhase is 'game_over', the room should be deleted.
                    delete rooms[socket.roomId];
                }
                
                updateRoomList();
            });

            socket.on('startNewGame', () => {
                const room = rooms[socket.roomId];
                if (room && socket.id === room.hostId && room.players.length >= room.minPlayers) {
                    startNewGame(room);
                }
            });

            socket.on('sendChatMessage', (data) => {
                const room = rooms[socket.roomId];
                if (room) {
                    const chatMessage = {
                        id: Date.now(),
                        playerId: socket.id,
                        playerName: socket.name || 'Người chơi',
                        message: data.message,
                        timestamp: new Date().toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    };
                    
                    io.to(socket.roomId).emit('chatMessage', chatMessage);
                    console.log(`Chat message in room ${socket.roomId}: ${socket.name}: ${data.message}`);
                }
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        });

        // Add global error handler for Socket.IO
        io.engine.on('connection_error', (err) => {
            console.error('Connection error:', err);
        });
        
        server.listen(PORT, () => {
            console.log(`✅ Backend server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('❌ An unexpected error occurred during server startup:', error);
        process.exit(1);
    }
}

startServer();
