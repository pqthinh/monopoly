// backend/server.js
const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const Game = require('./gameLogic.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
});

let rooms = {}; // Đối tượng để quản lý tất cả các phòng

// Hàm gửi danh sách phòng cập nhật cho tất cả mọi người
const updateRoomList = () => {
    // Chỉ gửi thông tin cần thiết, không gửi toàn bộ đối tượng socket
    const roomListForClient = Object.fromEntries(
        Object.entries(rooms).map(([roomId, room]) => [
            roomId,
            {
                id: room.id,
                name: room.name,
                players: room.players.map(p => ({ id: p.id, name: p.name })),
                playerCount: room.players.length
            }
        ])
    );
    io.emit('roomListUpdate', roomListForClient);
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit('connected', { id: socket.id });
    updateRoomList(); // Gửi danh sách phòng cho người mới kết nối

    // Đặt tên cho người chơi
    socket.on('setPlayerName', (name) => {
        socket.playerName = name || `Hào kiệt #${Math.floor(Math.random() * 1000)}`;
    });

    // Tạo một phòng mới
    socket.on('createRoom', (roomName) => {
        const roomId = `room-${socket.id}`;
        rooms[roomId] = {
            id: roomId,
            name: roomName || `Phòng của ${socket.playerName}`,
            players: [],
            game: null
        };
        console.log(`Room created: ${rooms[roomId].name}`);
        updateRoomList();
    });

    // Tham gia một phòng
    socket.on('joinRoom', (roomId) => {
        const room = rooms[roomId];
        if (!room || room.players.length >= 4) {
            socket.emit('joinRoomError', 'Phòng không tồn tại hoặc đã đầy.');
            return;
        }

        socket.join(roomId);
        room.players.push({ id: socket.id, name: socket.playerName || `Hào kiệt` });
        console.log(`${socket.id} joined room ${roomId}`);

        // Thông báo cho mọi người trong phòng về người chơi mới
        io.to(roomId).emit('playerJoined', { roomId, players: room.players });
        updateRoomList();

        // Nếu đủ 4 người, bắt đầu game
        if (room.players.length === 4) {
            console.log(`Game starting in room ${roomId}`);
            const playerSockets = room.players.map(p => ({ id: p.id, playerName: p.name }));
            room.game = new Game(playerSockets);
            io.to(roomId).emit('gameStarted', room.game.getGameState());
        }
    });
    
    // Xử lý hành động trong game
    socket.on('playerAction', (action) => {
        const roomId = Array.from(socket.rooms)[1]; // Lấy roomId từ socket
        const room = rooms[roomId];
        if (room && room.game) {
            const game = room.game;
            
            const player = game.players.find(p => p.id === socket.id);
            if (game.players[game.currentPlayerIndex].id !== player.id) return;
    console.log("game.players", game.players)
            console.log("game.currentPlayerIndex", game.currentPlayerIndex)
            console.log("player", player)
            switch (action.type) {
                case 'rollDice': game.rollDice(); break;
                case 'buyProperty': game.buyProperty(); break;
                case 'passAction': game.passAction(); break;
            }

            io.to(roomId).emit('updateGameState', game.getGameState());
        }
    });

    // Xử lý khi người chơi thoát
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Tìm và xóa người chơi khỏi tất cả các phòng
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                
                // Nếu game đang diễn ra, hủy game và thông báo
                if (room.game) {
                    io.to(roomId).emit('gameReset', 'Một người chơi đã thoát, trận đấu bị hủy.');
                    delete rooms[roomId]; // Hủy phòng
                } else {
                    // Nếu chưa bắt đầu, chỉ cần cập nhật danh sách người chơi trong phòng
                     io.to(roomId).emit('playerLeft', { roomId, players: room.players });
                }
                
                break; // Thoát vòng lặp khi đã tìm thấy và xử lý
            }
        }
        updateRoomList();
    });
});

server.listen(4000, () => {
    console.log('Backend server is running on port 4000');
});