// src/components/Lobby.js
import React, { useState, useEffect } from 'react';
import '../styles/Lobby.css';

const Lobby = ({ socket, myId }) => {
    const [playerName, setPlayerName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState({});

    useEffect(() => {
        socket.on('roomListUpdate', (updatedRooms) => {
            setRooms(updatedRooms);
        });

        // Đặt tên mặc định khi kết nối
        setPlayerName(`Hào kiệt #${Math.floor(Math.random() * 1000)}`);

        return () => {
            socket.off('roomListUpdate');
        };
    }, [socket]);

    const handleSetName = () => {
        socket.emit('setPlayerName', playerName);
        alert(`Tên của bạn đã được đặt là: ${playerName}`);
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
            <h1>Sảnh Chờ - Kỳ Sử Lạc Hồng</h1>
            <div className="name-setter">
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                />
                <button onClick={handleSetName}>Đặt Tên</button>
            </div>
            
            <div className="room-creator">
                <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Tên phòng (bỏ trống để tự động)"
                />
                <button onClick={handleCreateRoom}>Tạo Phòng Mới</button>
            </div>
            
            <hr />

            <h2>Danh sách phòng</h2>
            <div className="room-list">
                {Object.keys(rooms).length > 0 ? (
                    Object.values(rooms).map(room => (
                        <div key={room.id} className="room-item">
                            <span className="room-name">{room.name}</span>
                            <span className="room-players">{room.playerCount} / 4</span>
                            <button 
                                onClick={() => handleJoinRoom(room.id)}
                                disabled={room.playerCount >= 4}
                            >
                                {room.playerCount >= 4 ? 'Đầy' : 'Vào Phòng'}
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Chưa có phòng nào. Hãy tạo một phòng mới!</p>
                )}
            </div>
        </div>
    );
};

export default Lobby;