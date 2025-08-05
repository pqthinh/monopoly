import React, { useState, useEffect } from 'react';
import { Users, Plus, Crown, Gamepad2, User, Wifi, Clock, LogOut, History, Trophy } from 'lucide-react';
import '../styles/Lobby.css';

const Lobby = ({ socket, myId, user, token, onLogout }) => {
    const [name, setName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState({});
    const [isConnected, setIsConnected] = useState(true);
    const [gameTime, setGameTime] = useState(600); // Mặc định 10 phút (600 giây)
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [gameHistory, setGameHistory] = useState([]);

    useEffect(() => {
        socket.on('roomListUpdate', (updatedRooms) => {
            setRooms(updatedRooms);
        });

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Use authenticated user's name
        if (user && user.username) {
            setName(user.username);
            socket.emit('setName', user.username);
        } else {
            setName(`Người chơi #${Math.floor(Math.random() * 100)}`);
        }

        // Load game history if user is authenticated
        if (user && token) {
            loadGameHistory();
        }

        return () => {
            socket.off('roomListUpdate');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket, user, token]);

    const loadGameHistory = async () => {
        try {
            const response = await fetch('/api/games', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const history = await response.json();
                setGameHistory(history.slice(0, 5)); // Show last 5 games
            }
        } catch (error) {
            console.error('Error loading game history:', error);
        }
    };

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

    const formatGameDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} phút`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

                    {/* User Profile Section */}
                    <div className="user-profile-section">
                        <div className="user-info">
                            <div className="user-avatar">
                                <User size={24} />
                            </div>
                            <div className="user-details">
                                <h3>{user.username}</h3>
                                <p>ID: {user.id}</p>
                            </div>
                            <div className="user-menu">
                                <button 
                                    className="user-menu-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    ⚙️
                                </button>
                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <button onClick={() => setShowUserMenu(false)}>
                                            <History size={16} />
                                            Lịch sử trận đấu
                                        </button>
                                        <button onClick={onLogout}>
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lobby-main">
                    <div className="lobby-left-panel">
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

                        {/* Game History Section */}
                        {gameHistory.length > 0 && (
                            <div className="game-history-card">
                                <h3 className="history-title">
                                    <Trophy size={24} />
                                    Lịch sử trận đấu gần đây
                                </h3>
                                <div className="history-list">
                                    {gameHistory.map((game, index) => (
                                        <div key={game.id} className="history-item">
                                            <div className="history-info">
                                                <span className="history-date">
                                                    {formatDate(game.createdAt)}
                                                </span>
                                                <span className="history-duration">
                                                    {formatGameDuration(game.duration)}
                                                </span>
                                            </div>
                                            <div className="history-result">
                                                {game.winner && game.winner.username === user.username ? (
                                                    <span className="win-badge">🏆 Thắng</span>
                                                ) : (
                                                    <span className="lose-badge">📉 Thua</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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