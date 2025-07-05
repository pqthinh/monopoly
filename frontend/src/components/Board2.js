// src/components/Board.js
import React from 'react';
// Dữ liệu board và gridPositions sẽ được lấy từ server trong gameState
// import { gridPositions } from '../logic/data';
import '../styles/Board.css';

const Board = ({ board, players }) => {

    const gridPositions = [
        { id: 0, area: '11 / 11', type: 'corner' }, { id: 1, area: '11 / 10' }, { id: 2, area: '11 / 9' }, { id: 3, area: '11 / 8' }, { id: 4, area: '11 / 7' }, { id: 5, area: '11 / 6' }, { id: 6, area: '11 / 5' }, { id: 7, area: '11 / 4' }, { id: 8, area: '11 / 3' },
     { id: 9, area: '11 / 2' }, 
        { id: 10, area: '11 / 1', type: 'corner' }, { id: 11, area: '10 / 1' }, { id: 12, area: '9 / 1' }, { id: 13, area: '8 / 1' }, { id: 14, area: '7 / 1' }, { id: 15, area: '6 / 1' }, { id: 16, area: '5 / 1' }, { id: 17, area: '4 / 1' }, 
        { id: 18, area: '3 / 1', type: 'corner' }, { id: 19, area: '2 / 1' }, { id: 20, area: '1 / 1' }, { id: 21, area: '1 / 2' }, { id: 22, area: '1 / 3' }, { id: 23, area: '1 / 4' }, { id: 24, area: '1 / 5' }, { id: 25, area: '1 / 6' }, { id: 26, area: '1 / 7' }, 
        { id: 27, area: '1 / 8', type: 'corner' }, { id: 28, area: '1 / 9' }, { id: 29, area: '1 / 10' }, { id: 30, area: '1 / 11' }, { id: 31, area: '2 / 11' }, { id: 32, area: '3 / 11' }, { id: 33, area: '4 / 11' }, { id: 34, area: '5 / 11' }, { id: 35, area: '6 / 11' }
    ];

    const cornerSquares = [0, 9, 18, 27];

    const getPositionStyle = (squareId) => {
        const position = gridPositions.find(p => p.id === squareId);
        if (position) {
            const [row, col] = position.area.split(' / ');
            return { gridArea: `${row} / ${col} / span 1 / span 1` };
        }
        return {};
    };

    const getBorderStyle = (colorGroup) => {
        if (colorGroup) {
            return { borderBottomColor: colorGroup, borderLeftColor: colorGroup, borderTopColor: colorGroup, borderRightColor: colorGroup };
        }
        return {};
    };

    const getBackgroundStyle = (type) => {
        if (type) {
            return { backgroundImage: `url(/images/${type}.jpg)`, backgroundSize: 'cover' };
        }
        return {};
    };

    const getCornerSquareType = (squareId) => {
        switch (squareId) {
            case 0: return 'LẬP QUỐC';
            case 9: return 'NHÀ TÙ';
            case 18: return 'LỄ HỘI';
            case 20: return 'NGỰA Ô';
            default: return '';
        }
    };

    return (
        <div className="board-container">
            <div className="board-grid">
                {board && board.map((square) => (
                    <div
                        key={`square-${square.id}`}
                        className={`square square-${square.type} ${square.colorGroup || ''} ${cornerSquares.includes(square.id) ? 'corner-square' : ''}`}
                        style={{ ...getPositionStyle(square.id), ...getBorderStyle(square.colorGroup), ...getBackgroundStyle(square.type) }}
                    >
                        <div className="square-content">
                            <div className="square-name">{cornerSquares.includes(square.id) ? getCornerSquareType(square.id) : square.name}</div>
                            {square.type === 'property' && <div className="square-price">{square.price.toLocaleString()} vàng</div>}
                            <div className="player-tokens-container">
                                {players && players.map(player =>
                                    player.position === square.id && (
                                        <div
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
                    </div>
                ))}
                <div className="center-area">
                    <h2>Thông tin</h2>
                    {/* Chỗ này để hiển thị thẻ nhân vật (cần backend gửi data) */}
                    <p>Thẻ Nhân Vật (sẽ cập nhật)</p>
                    {/* Xúc xắc có thể hiển thị ở đây hoặc ở Controls */}
                </div>
            </div>
        </div>
    );
};

export default Board;