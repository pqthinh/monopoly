import React from 'react';
import { Dice1, Dice2, Dice6, Home, Hammer, DollarSign, Crown } from 'lucide-react';
import '../styles/Controls.css';

const Controls = ({ onPlayerAction, isMyTurn, phase, player, board }) => {
    if (!isMyTurn) {
        return (
            <div className="controls">
                <div className="waiting-state">
                    <div className="waiting-icon">⏳</div>
                    <h3>Đang chờ lượt người chơi khác...</h3>
                    <p>Hãy kiên nhẫn chờ đợi!</p>
                </div>
            </div>
        );
    }

    const currentSquare = board.find(s => s.id === player.position);

    const renderActions = () => {
        switch (phase) {
            case 'rolling':
                return (
                    <div className="action-section">
                        <div className="action-header">
                            <Dice1 size={20} />
                            <h4>Lượt của bạn</h4>
                        </div>
                        <button 
                            className="control-button roll-dice" 
                            onClick={() => onPlayerAction({ type: 'rollDice' })}
                        >
                            <Dice6 size={18} />
                            Gieo Xúc Xắc
                        </button>
                    </div>
                );

            case 'management':
                const isBuyable = currentSquare && (currentSquare.type === 'property' || currentSquare.type === 'river') && currentSquare.ownerId === null;
                return (
                    <div className="management-controls">
                        <div className="action-header">
                            <Crown size={20} />
                            <h4>Quản lý tài sản</h4>
                        </div>
                        {isBuyable && player.money >= currentSquare.price && (
                             <button 
                                className="control-button buy-button" 
                                onClick={() => onPlayerAction({ type: 'buyProperty' })}
                            >
                                <Home size={16} />
                                Mua Đất ({currentSquare.price.toLocaleString()}đ)
                            </button>
                        )}
                        <div className="property-management">
                            <h5>
                                <Hammer size={16} />
                                Xây dựng
                            </h5>
                            {player.properties.length > 0 ? player.properties.map(propId => {
                                const square = board.find(s => s.id === propId);
                                if (!square || square.type !== 'property') return null;
                                const canBuild = player.money >= square.buildCost && square.buildings < 5;
                                return (
                                    <div key={propId} className="property-manage-row">
                                        <span className="property-info">
                                            <Home size={14} />
                                            {square.name} ({square.buildings} nhà)
                                        </span>
                                        <button 
                                            className="build-button"
                                            onClick={() => onPlayerAction({ type: 'build', payload: { squareId: propId } })}
                                            disabled={!canBuild}
                                        >
                                            <Hammer size={12} />
                                            Xây ({square.buildCost?.toLocaleString()})
                                        </button>
                                    </div>
                                );
                            }) : (
                                <div className="no-properties">
                                    <Home size={24} />
                                    <p>Bạn chưa sở hữu tài sản nào.</p>
                                </div>
                            )}
                        </div>
                        <button 
                            className="control-button end-turn-button" 
                            onClick={() => onPlayerAction({ type: 'endTurn' })}
                        >
                            ➡️ Kết Thúc Lượt
                        </button>
                    </div>
                );

            case 'jail':
                return (
                    <div className="jail-controls">
                        <div className="action-header jail-header">
                            🏛️
                            <h4>Bạn đang ở trong tù!</h4>
                        </div>
                        <button 
                            className="control-button jail-button" 
                            onClick={() => onPlayerAction({ type: 'rollDice' })}
                        >
                            <Dice2 size={16} />
                            Thử gieo đôi
                        </button>
                        <button 
                            className="control-button jail-button" 
                            onClick={() => onPlayerAction({ type: 'payBail' })} 
                            disabled={player.money < 50000}
                        >
                            <DollarSign size={16} />
                            Trả 50,000đ để ra tù
                        </button>
                        {player.getOutOfJailCards > 0 && 
                            <button 
                                className="control-button jail-button" 
                                onClick={() => onPlayerAction({ type: 'useJailCard' })}
                            >
                                🎫 Dùng thẻ ra tù
                            </button>
                        }
                    </div>
                );
            
            case 'teleport':
            case 'festival':
                return (
                    <div className="special-action">
                        <div className="action-header">
                            ✨
                            <h4>Hành động đặc biệt</h4>
                        </div>
                        <p className="info-message">
                            🎯 Hãy chọn một ô trên bàn cờ để thực hiện hành động.
                        </p>
                    </div>
                );

            case 'game_over':
                return (
                    <div className="game-over-state">
                        <div className="action-header">
                            🏆
                            <h4>Trận đấu đã kết thúc!</h4>
                        </div>
                    </div>
                );

            default:
                return (
                    <button 
                        className="control-button end-turn-button" 
                        onClick={() => onPlayerAction({ type: 'endTurn' })}
                    >
                        ➡️ Kết Thúc Lượt
                    </button>
                );
        }
    };

    return (
        <div className="controls">
            {player.character && !player.characterUsed && (
                <div className="character-section">
                    <button 
                        className="control-button character-card-button" 
                        onClick={() => onPlayerAction({ type: 'useCharacterCard' })}
                    >
                        <Crown size={16} />
                        Dùng thẻ: {player.character.name}
                    </button>
                </div>
            )}
            <div className="controls-divider"></div>
            {renderActions()}
        </div>
    );
};

export default Controls;