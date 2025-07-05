// src/components/Controls.js
import React from 'react';

const Controls = ({ onPlayerAction, isMyTurn, phase }) => {
    // Nếu không phải lượt của bạn, hiển thị thông báo chờ
    if (!isMyTurn) {
        return (
            <div className="controls">
                <h3>Đang chờ lượt người chơi khác...</h3>
            </div>
        );
    }

    // Nếu là lượt của bạn, hiển thị các nút tương ứng với phase hiện tại
    return (
        <div className="controls">
            {phase === 'management' && (
                <button onClick={() => onPlayerAction({ type: 'rollDice' })}>Gieo Xúc Xắc</button>
            )}
            {phase === 'decision' && (
                 <div>
                    <p>Bạn có muốn mua vùng đất này không?</p>
                    <button onClick={() => onPlayerAction({ type: 'buyProperty' })}>Mua Đất</button>
                    <button onClick={() => onPlayerAction({ type: 'passAction' })}>Bỏ Qua</button>
                </div>
            )}
            {/* Bạn có thể thêm các nút cho phase 'jail' ở đây */}
        </div>
    );
};

export default Controls;