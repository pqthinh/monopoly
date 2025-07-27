import React from 'react';
import '../styles/Controls.css';
import { Dices, Castle, Swords, IdCard } from 'lucide-react';

const Controls = ({ onPlayerAction, isMyTurn, phase, player, board }) => {
    const currentSquare = board.find(s => s.id === player.position);
    
    return (
        <div className="controls-container">
            <div className="control-buttons">
                <button 
                    className="control-button dice-button"
                    onClick={() => onPlayerAction({ type: 'rollDice' })}
                    disabled={!isMyTurn || phase !== 'rolling'}
                >
                    <Dices className="button-icon" size={24} />
                    <span className="button-text">GIEO XÚC XẮC</span>
                </button>

                <button 
                    className="control-button build-button"
                    onClick={() => onPlayerAction({ type: 'build' })}
                    disabled={!isMyTurn || phase !== 'management'}
                >
                    <Castle className="button-icon" size={24} />
                    <span className="button-text">XÂY NHÀ</span>
                </button>

                <button 
                    className="control-button challenge-button"
                    onClick={() => onPlayerAction({ type: 'challenge' })}
                    disabled={!isMyTurn}
                >
                    <Swords className="button-icon" size={24} />
                    <span className="button-text">THÁCH ĐẤU</span>
                </button>

                <button 
                    className="control-button event-button"
                    onClick={() => onPlayerAction({ type: 'drawEvent' })}
                    disabled={!isMyTurn || phase !== 'management'}
                >
                    <IdCard className="button-icon" size={24} />
                    <span className="button-text">THẺ SỰ KIỆN</span>
                </button>
            </div>

            {!isMyTurn && (
                <div className="waiting-message">
                    Đang chờ lượt người chơi khác...
                </div>
            )}
        </div>
    );
};

export default Controls;