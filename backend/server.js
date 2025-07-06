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

let rooms = {}; // Đối tượng để quản lý tất cả các phòng đang hoạt động

// Hàm gửi danh sách phòng được cập nhật cho tất cả client
const updateRoomList = () => {
    const roomListForClient = Object.values(rooms).map(room => ({
        id: room.id,
        name: room.name,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        playerCount: room.players.length,
        gameStarted: !!room.game // Cho client biết game đã bắt đầu hay chưa
    }));
    io.emit('roomListUpdate', roomListForClient);
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit('connected', { id: socket.id });
    updateRoomList(); // Gửi danh sách phòng cho người dùng mới

    // Gán tên cho người chơi khi họ kết nối
    socket.on('setPlayerName', (name) => {
        socket.playerName = name || `Hào kiệt #${Math.floor(Math.random() * 1000)}`;
    });

    // Xử lý việc tạo phòng mới
    socket.on('createRoom', (roomName) => {
        const roomId = `room-${socket.id}`;
        rooms[roomId] = {
            id: roomId,
            name: roomName || `Phòng của ${socket.playerName || socket.id}`,
            players: [],
            game: null,
            hostId: socket.id
        };
        console.log(`Room created: ${rooms[roomId].name} by ${socket.id}`);
        updateRoomList();
        // Tự động cho người tạo phòng tham gia phòng đó
        socket.emit('roomCreated', roomId);
    });

    // Xử lý việc tham gia phòng
    socket.on('joinRoom', (roomId) => {
        const room = rooms[roomId];
        if (!room) {
            socket.emit('joinRoomError', 'Phòng không tồn tại.');
            return;
        }
        if (room.players.length >= 4) {
            socket.emit('joinRoomError', 'Phòng đã đầy.');
            return;
        }
        if (room.game) {
            socket.emit('joinRoomError', 'Trận đấu đã bắt đầu.');
            return;
        }

        socket.join(roomId);
        socket.roomId = roomId; // Lưu lại roomId để dễ xử lý khi ngắt kết nối
        room.players.push({ id: socket.id, name: socket.playerName || `Hào kiệt` });
        console.log(`${socket.id} (${socket.playerName}) joined room ${roomId}`);

        // Thông báo cho mọi người trong phòng về người chơi mới
        io.to(roomId).emit('playerJoined', { roomId, players: room.players });
        updateRoomList();

        // Bắt đầu game khi có đủ 2 người chơi trở lên (để dễ test)
        // Thay đổi điều kiện này thành room.players.length === 4 nếu muốn đủ 4 người
        if (room.players.length === 4 && !room.game) {
            console.log(`Game starting in room ${roomId}`);
            const playerSockets = room.players.map(p => ({ id: p.id, playerName: p.name }));
            room.game = new Game(playerSockets);
            io.to(roomId).emit('gameStarted', room.game.getGameState());
            updateRoomList(); // Cập nhật trạng thái 'gameStarted' của phòng
        }
    });
    
    // Xử lý hành động của người chơi trong game
    socket.on('playerAction', (action) => {
        const roomId = socket.roomId;
        const room = rooms[roomId];

        // Chỉ xử lý hành động nếu phòng và game tồn tại
        if (room && room.game) {
            // Việc kiểm tra có phải lượt của người chơi hay không sẽ do gameLogic.js đảm nhiệm
            room.game.handleAction(socket.id, action);
            
            // Sau mỗi hành động, gửi trạng thái game mới nhất cho tất cả client trong phòng
            io.to(roomId).emit('updateGameState', room.game.getGameState());
        }
    });

    // Xử lý khi người chơi ngắt kết nối
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const roomId = socket.roomId;
        const room = rooms[roomId];

        if (room) {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                
                // Nếu game đang diễn ra, hủy game và thông báo cho những người còn lại
                if (room.game) {
                    io.to(roomId).emit('gameReset', { message: 'Một người chơi đã thoát, trận đấu bị hủy.' });
                    // Xóa phòng sau khi game bị hủy
                    delete rooms[roomId];
                } else {
                    // Nếu game chưa bắt đầu, chỉ cần cập nhật danh sách người chơi
                    io.to(roomId).emit('playerLeft', { roomId, players: room.players });
                }
            }
        }
        // Cập nhật lại danh sách phòng cho tất cả mọi người
        updateRoomList();
    });
});

server.listen(4000, () => {
    console.log('Backend server is running on port 4000');
});
