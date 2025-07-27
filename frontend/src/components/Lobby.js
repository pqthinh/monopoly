import React, { useState, useEffect } from 'react';
import { Users, Plus, Crown, Gamepad2, User, Wifi, Clock } from 'lucide-react';
import '../styles/Lobby.css';

const Lobby = ({ socket, myId }) => {
    const [name, setName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState({});
    const [isConnected, setIsConnected] = useState(true);
    const [gameTime, setGameTime] = useState(600); // Mặc định 10 phút (600 giây)

    useEffect(() => {
        socket.on('roomListUpdate', (updatedRooms) => {
            setRooms(updatedRooms);
        });

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        setName(`Người chơi #${Math.floor(Math.random() * 100)}`);

        return () => {
            socket.off('roomListUpdate');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket]);

    const handleSetName = () => {
        socket.emit('setName', name);
        const notification = document.createElement('div');
        notification.className = 'name-notification';
        notification.innerHTML = `✨ Tên của bạn đã được đặt là: <strong>${name}</strong>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };

    const handleCreateRoom = () => {
        socket.emit('createRoom', { roomName, gameTime, myId });
        setRoomName('');
    };

    const handleJoinRoom = (roomId) => {
        socket.emit('setName', name);
        socket.emit('joinRoom', roomId);
    };

    return (
        <div className="lobby-container">
            <div className="lobby-content">
                <div className="lobby-header">
                    <div className="game-logo">
                        <h1 className="game-title">Kỳ Sử Lạc Hồng</h1>
                        <p className="game-subtitle">Boardgame lịch sử Việt Nam</p>
                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            <Wifi size={16} />
                            {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                        </div>
                    </div>
                </div>

                <div className="lobby-main">
                    <div className="player-setup-card">
                        <div className="setup-section player-section">
                            <h3 className="setup-title">
                                <User size={24} />
                                Thiết lập
                            </h3>
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={name}
                                    name="playerName"
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên của bạn"
                                    className="input-field"
                                />
                                <button onClick={handleSetName} className="action-button primary">
                                    <Crown size={20} />
                                    Đặt Tên
                                </button>
                            </div>
                        </div>

                        <div className="setup-section room-section">
                            <h3 className="setup-title">
                                <Plus size={24} />
                                Tạo phòng mới
                            </h3>
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={roomName}
                                    name="roomName"
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Tên phòng (bỏ trống để tự động)"
                                    className="input-field"
                                />
                                <button onClick={handleCreateRoom} className="action-button create-room">
                                    <Plus size={20} />
                                    Tạo Phòng
                                </button>
                            </div>
                            <div className="time-select-group">
                                <label className="time-label">
                                    <Clock size={20} />
                                    Thời gian chơi:
                                </label>
                                <select 
                                    value={gameTime} 
                                    onChange={(e) => setGameTime(Number(e.target.value))}
                                    className="time-select"
                                    name="gameTime"
                                >
                                    <option value={300}>5 phút</option>
                                    <option value={600}>10 phút</option>
                                    <option value={900}>15 phút</option>
                                    <option value={1200}>20 phút</option>
                                    <option value={1800}>30 phút</option>
                                    <option value={2400}>40 phút</option>
                                    <option value={3600}>60 phút</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="rooms-section">
                        <div className="rooms-header">
                            <h2 className="rooms-title">
                                <Gamepad2 size={24} />
                                Danh sách phòng
                            </h2>
                            <span className="rooms-count">{Object.keys(rooms).length} phòng</span>
                        </div>

                        <div className="room-list">
                            {Object.keys(rooms).length > 0 ? (
                                Object.values(rooms).map(room => (
                                    <div key={room.id}>
                                        <div className="room-card">
                                            <div className="room-info">
                                                <div className="room-name">
                                                    <Crown size={20} />
                                                    {room.name}
                                                </div>
                                                <div className="room-id">ID: {room.id}</div>
                                            </div>
                                            <div className="room-details">
                                                <div className={`players-count ${room.playerCount >= 4 ? 'full' : ''}`}>
                                                    <Users size={16} />
                                                    {room.playerCount}/6
                                                </div>
                                                <button
                                                    onClick={() => handleJoinRoom(room.id)}
                                                    disabled={room.playerCount >= 4}
                                                    className="join-button"
                                                >
                                                    {room.playerCount >= 6 ? '🚫 Đầy' : '🎮 Vào Phòng'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="start-game-section">
                                            <button 
                                                className="start-game-button"
                                                onClick={() => socket.emit('startGame')}
                                                disabled={room?.players.length < 2 && room.hostId !== myId}
                                            >
                                                Bắt đầu trận đấu
                                            </button>
                                            {room?.players.length < 2 && (
                                                <p className="warning-text">Cần ít nhất 2 người chơi để bắt đầu</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-rooms">
                                    <div className="empty-icon">🎲</div>
                                    <h3>Chưa có phòng nào</h3>
                                    <p>Hãy tạo phòng mới để bắt đầu!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;