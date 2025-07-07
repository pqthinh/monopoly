import React from 'react';
import '../styles/PlayerInfo.css'; // File CSS riêng cho component này

// Hàm để lấy màu sắc tương ứng với người chơi
const getPlayerColor = (characterName) => {
    const colors = {
        'Lạc Long Quân': '#4a90e2',
        'Âu Cơ': '#f5a623',
        'Thánh Gióng': '#50e3c2',
        'Sơn Tinh': '#bd10e0',
    };
    return colors[characterName] || '#777';
};

function PlayerInfo({ player, isMyTurn, isMe }) {
    // Xác định các lớp CSS động
    const playerInfoClasses = [
        'player-info',
        isMyTurn ? 'active-turn' : '',
        isMe ? 'my-info' : ''
    ].join(' ');

    const playerColor = getPlayerColor(player.character?.name);

    return (
        <div className={playerInfoClasses} style={{ '--player-color': playerColor }}>
            <div className="player-header">
                <img 
                    src={player.character?.avatar || '/path/to/default/avatar.png'} 
                    alt={player.character?.name} 
                    className="player-avatar"
                />
                <div className="player-details">
                    <h3 className="player-name">{player.name}</h3>
                    <p className="player-character">{player.character?.name || 'Chưa chọn nhân vật'}</p>
                </div>
            </div>
            
            <div className="player-stats">
                <div className="stat-item money">
                    <span className="stat-icon">💰</span>
                    <span>{player.money.toLocaleString('vi-VN')}</span>
                </div>
                {player.inJail && (
                    <div className="stat-item status-jail">
                        <span className="stat-icon">⛓️</span>
                        <span>Đang bị giam (còn {player.jailTurns} lượt)</span>
                    </div>
                )}
            </div>

            <div className="player-properties">
                <h4>Tài sản</h4>
                {player.properties && player.properties.length > 0 ? (
                    <div className="property-list">
                        {player.properties.map(propId => (
                            <div key={propId} className="property-dot" title={`Mảnh đất ${propId}`}></div>
                        ))}
                    </div>
                ) : (
                    <p className="no-properties">Chưa có tài sản</p>
                )}
            </div>
        </div>
    );
}

export default PlayerInfo;