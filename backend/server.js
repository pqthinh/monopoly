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
        id: room.id,
        name: room.name,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        playerCount: room.players.length,
        gameStarted: !!room.game // Trạng thái game đã bắt đầu hay chưa
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

    socket.on('createRoom', ({ roomName, gameTime }) => {
        const roomId = `room-${socket.id}`;
        rooms[roomId] = {
            id: roomId,
            name: roomName || `Phòng của ${socket.name || 'người chơi'}`,
            players: [],
            game: null,
            hostId: socket.id,
            gameTime: gameTime || 600,
            timerInterval: null,
            turnTimer: null,
        };
        console.log(`Room created: "${rooms[roomId].name}" by ${socket.id} with time: ${rooms[roomId].gameTime}s`);
        updateRoomList();
        socket.emit('roomCreated', roomId);
        socket.emit('joinRoom', roomId);
    });

    socket.on('joinRoom', (roomId) => {
        const room = rooms[roomId];
        if (!room) {
            return socket.emit('joinRoomError', 'Phòng không tồn tại.');
        }
        if (room.players.length >= 4) {
            return socket.emit('joinRoomError', 'Phòng đã đầy.');
        }
        if (room.game) {
            return socket.emit('joinRoomError', 'Trận đấu đã bắt đầu.');
        }

        socket.join(roomId);
        socket.roomId = roomId;
        room.players.push({ id: socket.id, name: socket.name || `Người chơi` });
        console.log(`> ${socket.name} (${socket.id}) joined room "${room.name}"`);

        io.to(roomId).emit('playerJoined', { roomId, players: room.players });
        updateRoomList();

        if (room.players.length >= 4 && !room.game) {
            console.log(`Game starting in room "${room.name}"`);
            const playerSockets = room.players.map(p => ({ id: p.id, name: p.name }));
            room.game = new Game(playerSockets, room.gameTime);
            
            io.to(roomId).emit('gameStarted', room.game.getGameState());
            updateRoomList();

            // Timer cho game
            room.timerInterval = setInterval(() => {
                if (room.game.remainingTime > 0) {
                    room.game.remainingTime--;
                    
                    // Cập nhật timer lượt
                    if (room.game.turnTimeRemaining > 0) {
                        room.game.turnTimeRemaining--;
                    } else {
                        room.game.handleTurnTimeout();
                    }
                    
                    io.to(roomId).emit('timeUpdate', room.game.getGameState());
                } else {
                    room.game.endGameByTime();
                    io.to(roomId).emit('updateGameState', room.game.getGameState());
                    clearInterval(room.timerInterval);
                }
            }, 1000);
        }
    });

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
            room.players = room.players.filter(p => p.id !== socket.id);

            if (room.game) {
                io.to(socket.roomId).emit('gameReset', { message: 'Một người chơi đã thoát, trận đấu bị hủy.' });
                if (room.timerInterval) clearInterval(room.timerInterval);
                delete rooms[socket.roomId];
            } else if (room.players.length === 0) {
                delete rooms[socket.roomId];
            } else {
                io.to(socket.roomId).emit('playerLeft', { roomId: socket.roomId, players: room.players });
            }
        }
        updateRoomList();
    });
});

server.listen(4000, () => {
    console.log('✅ Backend server is running on http://localhost:4000');
});