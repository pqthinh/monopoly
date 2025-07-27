import React from 'react';
import { gridPositions } from '../logic/data';
import { DiceDisplayArea, Dice } from './BoardStyled';
import '../styles/Board.css';

const Board = ({ board, players, dice, isRolling, onSquareClick, selectionMode }) => {
    const getPositionStyle = (squareId) => {
        const position = gridPositions.find(p => p.id === squareId);
        if (position) {
            const [row, col] = position.area.split(' / ');
            return { gridArea: `${row} / ${col} / span 1 / span 1` };
        }
        return {};
    };
    const getBuildingIcon = (buildingType) => {
        switch (buildingType) {
            case 'Chùa': return '⛪';
            case 'Khu quân sự': return '🏰';
            case 'Làng': return '🏘️';
            default: return '🏠';
        }
    };

    return (
        <div className="board-container">
            <div className="center-logo">
                {/* <DiceDisplayArea>
                    <DiceVisual isRolling={isRolling}>
                        <DiceFace value={dice && dice[0] > 0 ? dice[0] : '?'} />
                    </DiceVisual>
                    <DiceVisual isRolling={isRolling}>
                        <DiceFace value={dice && dice[1] > 0 ? dice[1] : '?'} />
                    </DiceVisual>
                </DiceDisplayArea> */}
                <DiceDisplayArea className="dice-display-area">
                    <Dice value={dice && dice[0] > 0 ? dice[0] : '?'} isRolling={isRolling} />
                    <Dice value={dice && dice[1] > 0 ? dice[1] : '?'} isRolling={isRolling} />
                </DiceDisplayArea>
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
                                {[...Array(square.buildings)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`building-icon ${square.buildingType?.toLowerCase().replace(' ', '-')}`}
                                        title={square.buildingType || 'Nhà'}
                                    >
                                        {getBuildingIcon(square.buildingType)}
                                    </div>
                                ))}
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
    );
};

export default Board;