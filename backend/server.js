const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const Game = require('./gameLogic.js');
const { hashStringToNumber } = require('./util.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: ["http://localhost:3000", "https://monopoly.lexispeak.com"] },
    path: "/"
    // path: "/socket.io/"
});

let rooms = {};

const updateRoomList = () => {
    const roomListForClient = Object.values(rooms).map(room => ({
        ...room,
        id: room.id,
        name: room.name,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        playerCount: room.players.length,
        gameStarted: !!room.game,
        hostId: room.hostId
    }));
    io.emit('roomListUpdate', roomListForClient);
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
        const roomId = `room-${socket.id}`;
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

    socket.on('joinRoom', (roomId) => {
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
        room.players.push({ id: socket.id, name: socket.name || `Người chơi`,isHost: socket.id === room.hostId  });

        io.to(roomId).emit('playerJoined', { roomId, players: room.players, hostId: room.hostId  });
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
        
        const playerSockets = room.players.map(p => ({ ...p, id: p.id, name: p.name }));
        room.game = new Game(playerSockets, room.gameTime);
        
        io.to(room.id).emit('gameStarted', room.game.getGameState());
        updateRoomList();

        room.timerInterval = setInterval(() => {
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
                io.to(room.id).emit('updateGameState', room.game.getGameState());
                clearInterval(room.timerInterval);
            }
        }, 1000);
    }

    socket.on('playerAction', (action) => {
        const room = rooms[socket.roomId];
        if (room && room.game) {
            room.game.handleAction(socket.id, action);
            io.to(socket.roomId).emit('updateGameState', room.game.getGameState());

            if (room.game.currentPhase === 'game_over') {
                if (room.timerInterval) clearInterval(room.timerInterval);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const room = rooms[socket.roomId];
        if (room) {
            if (room.game && !room.game.currentPhase !== 'game_over') {
                room.game.handlePlayerQuit(socket.id);
                io.to(socket.roomId).emit('updateGameState', room.game.getGameState());
                
                room.players = room.players.filter(p => p.id !== socket.id);
                
                if (room.players.length < room.minPlayers) {
                    room.game.endGame(null, "không đủ người chơi");
                    delete rooms[socket.roomId];
                    io.to(socket.roomId).emit('updateGameState', room.game.getGameState());
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
                delete rooms[socket.roomId];
            }
        }
        updateRoomList();
    });

    socket.on('startNewGame', () => {
        const room = rooms[socket.roomId];
        if (room && socket.id === room.hostId && room.players.length >= room.minPlayers) {
            startNewGame(room);
        }
    });
});

server.listen(4000, () => {
    console.log('✅ Backend server is running on http://localhost:4000');
});