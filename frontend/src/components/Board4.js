// src/components/Board.js
import React from 'react';
// Dữ liệu board và gridPositions sẽ được lấy từ server trong gameState
import { gridPositions } from '../logic/data'; 
import '../styles/Board.css';

const Board = ({ board, players }) => {

    const getPositionStyle = (squareId) => {
        const position = gridPositions.find(p => p.id === squareId);
        if (position) {
            const [row, col] = position.area.split(' / ');
            return { gridArea: `${row} / ${col} / span 1 / span 1` };
        }
        return {};
    };

    return (
        <div className="board-container">
            <div className="center-logo">
                <h1>Kỳ Sử Lạc Hồng</h1>
            </div>
            {board && board.map((square) => {
                const borderStyle = square.ownerColor
                    ? { borderColor: square.ownerColor }
                    : {};
                return (
                <div 
                    key={`square-${square.id}`} 
                    className={`square square-${square.type} ${square.colorGroup || ''}`}
                    style={{ ...getPositionStyle(square.id), ...borderStyle }}
                >
                    <div className={`square-color-header ${square.colorGroup || ''}`}></div>
                    <div className="square-name">{square.name}</div>
                    {square.type === 'property' && <div className="square-price">{square.price.toLocaleString()} vàng</div>}
                    
                    <div className="player-tokens-container">
                        {players && players.map(player => 
                            player.position === square.id && (
                                <div 
                                    // SỬA LỖI: Tạo key độc nhất bằng cách kết hợp id của ô và id của người chơi
                                    key={`token-${square.id}-${player.id}`} 
                                    className="player-token" 
                                    style={{ backgroundColor: player.color || 'red' }}
                                    title={player.name}
                                >
                                    {player.name ? player.name.charAt(0).toUpperCase() : 'P'} 
                                </div>
                            )
                        )}
                    </div>
                </div>
            )})}
        </div>
    );
};

export default Board;