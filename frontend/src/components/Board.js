// src/components/Board.js
import React from 'react';
import { gridPositions } from '../logic/data';
import '../styles/Board.css';

const Board = ({ board, players, dice, lastEventCard, onSquareClick, selectionMode, remainingTime }) => {
    const getPositionStyle = (squareId) => {
        const position = gridPositions.find(p => p.id === squareId);
        if (position) {
            const [row, col] = position.area.split(' / ');
            return { gridArea: `${row} / ${col} / span 1 / span 1` };
        }
        return {};
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <><div className="game-timer-overlay">
            <div className="timer">
                {formatTime(remainingTime)}
            </div>
        </div>
            <div className="board-container">
                <div className="center-logo">
                    <div className="dice-display-area">
                        <div className="dice-visual">{dice && dice[0] > 0 ? dice[0] : '?'}</div>
                        <div className="dice-visual">{dice && dice[1] > 0 ? dice[1] : '?'}</div>
                    </div>

                    <div className="event-card-display">
                        {lastEventCard ? (
                            <>
                                <div className={`card-header ${lastEventCard.type.replace(/\s/g, '-').toLowerCase()}`}>
                                    {lastEventCard.type}
                                </div>
                                <div className="card-text">
                                    {lastEventCard.text}
                                </div>
                            </>
                        ) : (
                            <p>Khu vực thẻ Cơ Hội / Vận Mệnh</p>
                        )}
                    </div>
                </div>
                {board && board.map((square) => {
                    const borderStyle = square.ownerColor
                        ? { borderColor: square.ownerColor, borderWidth: '4px', borderStyle: 'solid' }
                        : {};

                    const isSelectable = selectionMode && (square.type === 'property' || square.type === 'river');

                    return (
                        <div
                            key={`square-${square.id}`}
                            className={`square square-${square.type} ${square.colorGroup || ''} ${isSelectable ? 'selectable' : ''}`}
                            style={{ ...getPositionStyle(square.id), ...borderStyle }}
                            onClick={() => isSelectable && onSquareClick && onSquareClick(square.id)}
                        >
                            <div className={`square-color-header ${square.colorGroup || ''} square-color-header-${square.header || ''}`}></div>
                            <div className="square-name">{square.name}</div>
                            {square.type === 'property' && <div className="square-price">{square.price.toLocaleString()}đ</div>}
                            {square.buildings > 0 &&
                                <div className="building-container">
                                    {[...Array(square.buildings)].map((_, i) => <div key={i} className="building-icon">🏠</div>)}
                                </div>
                            }
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
                    )
                })}
            </div>
        </>
    );
};

export default Board;