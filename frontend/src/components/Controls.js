// src/components/Controls.js
import React from 'react';
import '../styles/Controls.css';

const Controls = ({ onPlayerAction, isMyTurn, phase, player, board }) => {
    // Nếu không phải lượt của người chơi, hiển thị thông báo chờ
    if (!isMyTurn) {
        return (
            <div className="controls">
                <h3>Đang chờ lượt người chơi khác...</h3>
            </div>
        );
    }

    // Lấy thông tin về ô đất hiện tại người chơi đang đứng
    const currentSquare = board.find(s => s.id === player.position);

    // Hàm render các nút điều khiển chính dựa trên phase của game
    const renderActions = () => {
        switch (phase) {
            case 'rolling':
                return (
                    <button className="control-button roll-dice" onClick={() => onPlayerAction({ type: 'rollDice' })}>
                        Gieo Xúc Xắc
                    </button>
                );

            case 'management':
                const isBuyable = currentSquare && (currentSquare.type === 'property' || currentSquare.type === 'river') && currentSquare.ownerId === null;
                return (
                    <div className="management-controls">
                        <h4>Lượt của bạn</h4>
                        {isBuyable && player.money >= currentSquare.price && (
                             <button className="control-button action-button" onClick={() => onPlayerAction({ type: 'buyProperty' })}>
                                Mua Đất ({currentSquare.price.toLocaleString()} vàng)
                            </button>
                        )}
                        <div className="property-management">
                            <h5>Quản lý tài sản</h5>
                            {player.properties.length > 0 ? player.properties.map(propId => {
                                const square = board.find(s => s.id === propId);
                                if (!square || square.type !== 'property') return null;
                                const canBuild = player.money >= square.buildCost && square.buildings < 5;
                                return (
                                    <div key={propId} className="property-manage-row">
                                        <span>{square.name} ({square.buildings} nhà)</span>
                                        <button 
                                            className="build-button"
                                            onClick={() => onPlayerAction({ type: 'build', payload: { squareId: propId } })}
                                            disabled={!canBuild}
                                        >
                                            Xây ({square.buildCost?.toLocaleString()})
                                        </button>
                                    </div>
                                );
                            }) : <p>Bạn chưa sở hữu tài sản nào.</p>}
                        </div>
                        <button className="control-button end-turn-button" onClick={() => onPlayerAction({ type: 'endTurn' })}>
                            Kết Thúc Lượt
                        </button>
                    </div>
                );

            case 'jail':
                return (
                    <div className="jail-controls">
                        <h4>Bạn đang ở trong tù!</h4>
                        <button className="control-button" onClick={() => onPlayerAction({ type: 'rollDice' })}>Thử gieo đôi</button>
                        <button className="control-button" onClick={() => onPlayerAction({ type: 'payBail' })} disabled={player.money < 50000}>Trả 50,000 để ra tù</button>
                        {player.getOutOfJailCards > 0 && 
                            <button className="control-button" onClick={() => onPlayerAction({ type: 'useJailCard' })}>Dùng thẻ ra tù</button>
                        }
                    </div>
                );
            
            case 'teleport':
            case 'festival':
                return <p className="info-message">Hãy chọn một ô trên bàn cờ để thực hiện hành động.</p>;

            case 'game_over':
                return <h4>Trận đấu đã kết thúc!</h4>;

            default:
                return (
                    <button className="control-button end-turn-button" onClick={() => onPlayerAction({ type: 'endTurn' })}>
                        Kết Thúc Lượt
                    </button>
                );
        }
    };

    return (
        <div className="controls">
            {/* Nút sử dụng thẻ nhân vật, hiển thị ở mọi phase nếu đủ điều kiện */}
            {player.character && !player.characterUsed && (
                 <button className="control-button character-card-button" onClick={() => onPlayerAction({ type: 'useCharacterCard' })}>
                    Dùng thẻ: {player.character.name}
                </button>
            )}
            <hr />
            {renderActions()}
        </div>
    );
};

export default Controls;