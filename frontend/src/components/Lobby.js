import React, { useState, useEffect } from 'react';
import { Users, Plus, Crown, Gamepad2, User, Wifi } from 'lucide-react';
import '../styles/Lobby.css'

const Lobby = ({ socket, myId }) => {
    const [playerName, setPlayerName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState({});
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        socket.on('roomListUpdate', (updatedRooms) => {
            setRooms(updatedRooms);
        });

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Đặt tên mặc định khi kết nối
        setPlayerName(`Hào kiệt #${Math.floor(Math.random() * 1000)}`);

        return () => {
            socket.off('roomListUpdate');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket]);

    const handleSetName = () => {
        socket.emit('setPlayerName', playerName);
        // Hiển thị thông báo đẹp hơn
        const notification = document.createElement('div');
        notification.className = 'name-notification';
        notification.innerHTML = `✨ Tên của bạn đã được đặt là: <strong>${playerName}</strong>`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };

    const handleCreateRoom = () => {
        socket.emit('createRoom', roomName);
        setRoomName('');
    };
    
    const handleJoinRoom = (roomId) => {
        // Đặt tên trước khi vào phòng
        socket.emit('setPlayerName', playerName);
        socket.emit('joinRoom', roomId);
    };

    return (
        <div className="lobby-container">
            <div className="lobby-content">
                <div className="lobby-header">
                    <h1 className="game-title">Kỳ Sử Lạc Hồng</h1>
                    <p className="game-subtitle">Cuộc phiêu lưu bất động sản huyền thoại</p>
                    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        <Wifi size={16} />
                        {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                    </div>
                </div>

                <div className="player-setup">
                    <div className="setup-section">
                        <h3 className="setup-title">
                            <User size={20} />
                            Thiết lập người chơi
                        </h3>
                        <div className="input-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Nhập tên của bạn"
                                    className="input-field"
                                />
                            </div>
                            <button onClick={handleSetName} className="action-button primary">
                                <Crown size={16} />
                                Đặt Tên
                            </button>
                        </div>
                    </div>

                    <div className="setup-section">
                        <h3 className="setup-title">
                            <Plus size={20} />
                            Tạo phòng mới
                        </h3>
                        <div className="input-group">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Tên phòng (bỏ trống để tự động)"
                                    className="input-field"
                                />
                            </div>
                            <button onClick={handleCreateRoom} className="action-button secondary">
                                <Plus size={16} />
                                Tạo Phòng
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rooms-section">
                    <div className="rooms-header">
                        <h2 className="rooms-title">Danh sách phòng</h2>
                        <span className="rooms-count">{Object.keys(rooms).length} phòng</span>
                    </div>

                    <div className="room-list">
                        {Object.keys(rooms).length > 0 ? (
                            Object.values(rooms).map(room => (
                                <div key={room.id} className="room-card">
                                    <div className="room-info">
                                        <div className="room-name">
                                            <Gamepad2 size={18} />
                                            {room.name}
                                        </div>
                                        <div className="room-id">ID: {room.id}</div>
                                    </div>
                                    <div className={`players-indicator ${room.playerCount >= 4 ? 'full' : ''}`}>
                                        <Users size={16} />
                                        {room.playerCount} / 4
                                    </div>
                                    <button 
                                        onClick={() => handleJoinRoom(room.id)}
                                        disabled={room.playerCount >= 4}
                                        className="join-button"
                                    >
                                        {room.playerCount >= 4 ? (
                                            <>🚫 Đầy</>
                                        ) : (
                                            <>🎮 Vào Phòng</>
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🎮</div>
                                <div className="empty-state-text">Chưa có phòng nào</div>
                                <div className="empty-state-subtext">Hãy tạo một phòng mới để bắt đầu!</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;