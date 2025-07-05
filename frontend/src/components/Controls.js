// src/components/Controls.js
import React from 'react';

const Controls = ({ onPlayerAction, isMyTurn, phase, player, board }) => {
    if (!isMyTurn) {
        return (
            <div className="controls">
                <h3>Đang chờ lượt...</h3>
            </div>
        );
    }

    const renderManagementPhase = () => (
        <div>
            <h4>Quản lý tài sản</h4>
            {player.properties.map(propId => {
                const square = board.find(s => s.id === propId);
                return (
                    <div key={propId} className="property-manage-row">
                        <span>{square.name} (Xây: {square.buildCost?.toLocaleString()})</span>
                        <button onClick={() => onPlayerAction({ type: 'build', payload: { squareId: propId } })}>
                            Xây
                        </button>
                    </div>
                );
            })}
            <hr/>
            <button onClick={() => onPlayerAction({ type: 'rollDice' })}>Gieo Xúc Xắc</button>
        </div>
    );

    const renderJailPhase = () => (
        <div>
            <h4>Bạn đang ở trong tù!</h4>
            <button onClick={() => onPlayerAction({ type: 'rollDice' })}>Thử gieo đôi</button>
            <button onClick={() => onPlayerAction({ type: 'payBail' })}>Trả 50,000 để ra tù</button>
            {player.getOutOfJailCards > 0 && 
                <button onClick={() => onPlayerAction({ type: 'useJailCard' })}>Dùng thẻ ra tù</button>
            }
        </div>
    );
    
    const renderDecisionPhase = () => (
        <div>
            <button onClick={() => onPlayerAction({ type: 'buyProperty' })}>Mua Đất</button>
            <button onClick={() => onPlayerAction({ type: 'endTurn' })}>Bỏ Qua</button>
        </div>
    );

    const renderRentPhase = () => (
        <div>
            <p>Bạn đã trả tiền thuê.</p>
            <button onClick={() => onPlayerAction({ type: 'endTurn' })}>OK</button>
        </div>
    );

    return (
        <div className="controls">
            {phase === 'management' && renderManagementPhase()}
            {phase === 'jail' && renderJailPhase()}
            {phase === 'decision' && renderDecisionPhase()}
            {phase === 'rent' && renderRentPhase()}
            {phase === 'event' && <button onClick={() => onPlayerAction({ type: 'endTurn' })}>OK</button>}
            {/* Thêm các phase teleport, festival... */}
        </div>
    );
};

export default Controls;