// backend/server.js
const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const Game = require('./gameLogic.js');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: ["http://localhost:3000", "https://monopoly.lexispeak.com"] },
    path: "/socket.io/"
});
app.use(cors());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/game'));
app.use('/api/analysis', require('./routes/analysis'));

let rooms = {};

// Hàm tiện ích để cập nhật danh sách phòng cho tất cả client
const updateRoomList = () => {
    // Chỉ gửi những thông tin cần thiết về phòng cho client
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
    // Gửi ID của socket cho client để xác định "bản thân"
    socket.emit('connected', { id: socket.id });
    // Cập nhật danh sách phòng cho client vừa kết nối
    updateRoomList();

    // Lắng nghe sự kiện client đặt tên
    socket.on('setName', (name) => {
        socket.name = name || `Hào kiệt #${Math.floor(Math.random() * 1000)}`;
    });

    // Lắng nghe sự kiện client tạo phòng mới
    socket.on('createRoom', ({ roomName, gameTime }) => {
        const roomId = `room-${socket.id}`;
        rooms[roomId] = {
            id: roomId,
            name: roomName || `Phòng của ${socket.name || 'người chơi'}`,
            players: [],
            game: null,
            hostId: socket.id,
            gameTime: gameTime || 600, // Lưu lại thời gian game (giây), mặc định là 10 phút
            timerInterval: null, // Dùng để lưu trữ interval của bộ đếm ngược
        };
        console.log(`Room created: "${rooms[roomId].name}" by ${socket.id} with time: ${rooms[roomId].gameTime}s`);
        updateRoomList();
        // Thông báo cho người tạo phòng rằng phòng đã được tạo thành công
        socket.emit('roomCreated', roomId);
        // Tự động cho người tạo phòng vào phòng họ vừa tạo
        socket.emit('joinRoom', roomId);
    });

    // Lắng nghe sự kiện client tham gia phòng
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
        room.players.push({ id: socket.id, name: socket.name || `Hào kiệt` });
        console.log(`> ${socket.name} (${socket.id}) joined room "${room.name}"`);

        // Gửi thông báo cho tất cả người chơi trong phòng về người chơi mới
        io.to(roomId).emit('playerJoined', { roomId, players: room.players });
        updateRoomList();

        // Bắt đầu game khi đủ 2 người chơi và game chưa bắt đầu
        if (room.players.length >= 4 && !room.game) {
            console.log(`Game starting in room "${room.name}"`);
            const playerSockets = room.players.map(p => ({ id: p.id, name: p.name }));
            // Khởi tạo game với thông tin người chơi và thời gian chơi
            room.game = new Game(playerSockets, room.gameTime);
            
            // Gửi trạng thái game ban đầu cho tất cả người chơi trong phòng
            io.to(roomId).emit('gameStarted', room.game.getGameState());
            updateRoomList();

            // Khởi động bộ đếm ngược
            room.timerInterval = setInterval(() => {
                if (room.game.remainingTime > 0) {
                    room.game.remainingTime--;
                    // Gửi cập nhật thời gian còn lại
                    io.to(roomId).emit('timeUpdate', { remainingTime: room.game.remainingTime });
                } else {
                    // Khi hết giờ, kết thúc game và dừng bộ đếm ngược
                    room.game.endGameByTime();
                    io.to(roomId).emit('updateGameState', room.game.getGameState());
                    clearInterval(room.timerInterval);
                }
            }, 1000);
        }
    });

    // Lắng nghe hành động từ người chơi
    socket.on('playerAction', (action) => {
        const room = rooms[socket.roomId];
        if (room && room.game) {
            room.game.handleAction(socket.id, action);
            io.to(socket.roomId).emit('updateGameState', room.game.getGameState());

            // Nếu hành động của người chơi dẫn đến kết thúc game, dọn dẹp bộ đếm ngược
            if (room.game.currentPhase === 'game_over' && room.timerInterval) {
                 clearInterval(room.timerInterval);
            }
        }
    });

    // Xử lý khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const room = rooms[socket.roomId];
        if (room) {
            // Xóa người chơi khỏi phòng
            room.players = room.players.filter(p => p.id !== socket.id);

            // Nếu game đang diễn ra, hủy game và thông báo cho người chơi còn lại
            if (room.game) {
                io.to(socket.roomId).emit('gameReset', { message: 'Một người chơi đã thoát, trận đấu bị hủy.' });
                // Dừng bộ đếm ngược và xóa phòng
                if (room.timerInterval) clearInterval(room.timerInterval);
                delete rooms[socket.roomId];
            } else if (room.players.length === 0) {
                // Nếu không còn ai trong phòng, xóa phòng
                delete rooms[socket.roomId];
            } else {
                // Cập nhật lại thông tin người chơi trong phòng
                io.to(socket.roomId).emit('playerLeft', { roomId: socket.roomId, players: room.players });
            }
        }
        updateRoomList();
    });
});

server.listen(4000, () => {
    console.log('✅ Backend server is running on http://localhost:4000');
});