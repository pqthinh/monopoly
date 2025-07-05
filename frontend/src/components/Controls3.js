import React from 'react';
import '../styles/Controls.css'; // Import file CSS cho Controls

const Controls = ({ onPlayerAction, isMyTurn, phase, gameState }) => {
    if (!isMyTurn) {
        return <div className="controls"><h3>Đang chờ lượt...</h3></div>;
    }

    return (
        <div className="controls">
            <div className="actions">
                {phase === 'management' && (
                    <button onClick={() => onPlayerAction({ type: 'rollDice' })}>Gieo Xúc Xắc</button>
                )}
                {phase === 'decision' && (
                    <div>
                        <button onClick={() => onPlayerAction({ type: 'buyProperty' })}>Mua Đất</button>
                        <button onClick={() => onPlayerAction({ type: 'passAction' })}>Bỏ Qua</button>
                    </div>
                )}
                {/* Thêm các nút cho các phase khác nếu cần */}
            </div>
            <div className="game-log">
                <h3>Nhật ký sự kiện</h3>
                <div className="log-messages">
                    {gameState && gameState.message && gameState.message.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Controls;