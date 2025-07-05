// src/components/PlayerInfo.js
import React from 'react';

const PlayerInfo = ({ players, myId }) => {
    return (
        <div className="player-info">
            <h2>Thông tin người chơi</h2>
            {players.map((player, index) => (
                // SỬA LỖI: Sử dụng kết hợp player.id và index để đảm bảo key là duy nhất
                <div key={player.id || `player-${index}`} className={player.id === myId ? 'my-info' : ''}>
                    <p style={{ color: player.color, fontWeight: 'bold' }}>
                        {player.name}: {(player.money || 0).toLocaleString()} vàng
                    </p>
                    {player.character && <p>Nhân vật: {player.character.name}</p>}
                </div>
            ))}
        </div>
    );
};

export default PlayerInfo;