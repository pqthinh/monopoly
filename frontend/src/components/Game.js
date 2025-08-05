import React, { useState, useEffect } from 'react';
import Board from './Board';
import PlayerInfo from './PlayerInfo';
import Controls from './Controls';
import Popup from './Popup';
import { Music, VolumeX, Settings, LogOut, User } from 'lucide-react';
import { Button } from './Button';
import DecisionPopup from './DecisionPopup';
import { formatTime, hashStringToNumber } from '../utils';
import gameLogger from '../services/GameLogger';
import '../styles/Game.css';

const Game = ({ socket, gameState, myId, user, onLogout }) => {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = React.useRef(null);
    const [showDecisionPopup, setShowDecisionPopup] = useState(false);
    const [popupInfo, setPopupInfo] = useState(null);
    const [showGameMenu, setShowGameMenu] = useState(false);

    const toggleMusic = () => {
        if (isMusicPlaying) {
            audioRef.current.pause();
            gameLogger.userAction('Music paused');
        } else {
            audioRef.current.play();
            gameLogger.userAction('Music started');
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    const me = gameState.players.find(p => p.id === myId);
    const isMyTurn = gameState.currentPlayerId === myId;
    const handlePlayerAction = (action) => {
        gameLogger.gameEvent('Player action', { action, playerId: myId, currentPhase: gameState.currentPhase });
        socket.emit('playerAction', action);
    };

    const handleLogout = () => {
        gameLogger.userAction('Logout from game', { userId: user?.id, gameState: gameState.currentPhase });
        onLogout();
    };

    useEffect(() => {
        if (['teleport', 'festival'].includes(gameState.currentPhase)) {
            setShowDecisionPopup(true);
            setPopupInfo({
                phase: gameState.currentPhase,
                options: gameState.board,
                player: gameState.players?.find(p => p.id === gameState.currentPlayerId)
            });
        } else {
            setShowDecisionPopup(false);
        }
        
        return () => {
            setShowDecisionPopup(false);
            setPopupInfo(null);
        }
    }, [gameState, myId]);

    // Handle loading state
    if (!gameState || !gameState.players || !myId) {
        return <div>Đang tải dữ liệu trận đấu... <a href="/">reload</a></div>;
    }


    return (
        <div className="game-wrapper">
            <div className="game-background"></div>
            <div className="game-container">
                <audio ref={audioRef} src="/background-music.mp3" loop></audio>

                <div className="game-content">
                    <div className="left-panel">
                        <div className="game-header">
                            <div className="game-user-info">
                                <div className="user-avatar-small">
                                    <User size={16} />
                                </div>
                                <span className="username">{user?.username}</span>
                                <div className="game-menu">
                                    <button 
                                        className="game-menu-button"
                                        onClick={() => setShowGameMenu(!showGameMenu)}
                                    >
                                        <Settings size={16} />
                                    </button>
                                    {showGameMenu && (
                                        <div className="game-dropdown">
                                            <button onClick={handleLogout}>
                                                <LogOut size={14} />
                                                Rời khỏi game
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button onClick={toggleMusic} icon={isMusicPlaying ? <VolumeX size="2em" /> : <Music size="2em" />} style={{width: '48%' }} />
                            <Button variant='info' label="" value={formatTime(gameState?.remainingTime)} style={{width: '48%',padding: '8px' }}/>
                        </div>
                        <Button variant='info' label="ID" value={gameState.name|| hashStringToNumber(gameState?.isHost||socket.name||"thinhpq10")} />
                        <Controls
                            onPlayerAction={handlePlayerAction}
                            isMyTurn={isMyTurn}
                            phase={gameState.currentPhase}
                            player={me}
                            board={gameState.board}
                        />
                        {gameState.currentPhase === 'game_over' && gameState.isHost === myId && (
                            <div className="game-over-overlay">
                                <div className="game-over-content">
                                    <h2>{gameState.message}</h2>
                                    <button
                                        className="play-again-button"
                                        onClick={() => socket.emit('startNewGame')}
                                    >
                                        Chơi tiếp
                                    </button>
                                </div>
                            </div>
                        )}
                        <h3>Vòng: {gameState.currentRound}</h3>
                        <h3>Giai đoạn: {gameState.currentPhase}</h3>
                        <h3>Người chơi hiện tại: {gameState.currentPlayerName}</h3>
                        <h4>Thời gian lượt: {formatTime(gameState.turnTimeRemaining)}</h4>
                        <div className="event-card-display">
                            {gameState.lastEventCard ? (
                                <>
                                    <div className={`card-header ${gameState.lastEventCard.type.replace(/\s/g, '-').toLowerCase()}`}>
                                        {gameState.lastEventCard.type}
                                    </div>
                                    <div className="card-text">
                                        {gameState.lastEventCard.text}
                                    </div>
                                </>
                            ) : (
                                <p>Khu vực thẻ Cơ Hội / Vận Mệnh</p>
                            )}
                        </div>
                    </div>

                    <div className="center-panel">
                        <Board
                            board={gameState.board}
                            players={gameState.players}
                            dice={gameState.dice}
                            isRolling={gameState.currentPhase === 'rolling'}
                            lastEventCard={gameState.lastEventCard}
                            onSquareClick={(squareId) => {
                                if (isMyTurn && gameState.currentPhase === 'teleport') {
                                    handlePlayerAction({ type: 'teleportTo', payload: { squareId } });
                                }
                                if (isMyTurn && gameState.currentPhase === 'festival') {
                                    handlePlayerAction({ type: 'organizeFestival', payload: { squareId } });
                                }
                            }}
                            selectionMode={isMyTurn && (gameState.currentPhase === 'teleport' || gameState.currentPhase === 'festival')}
                            remainingTime={gameState.remainingTime}
                            turnTimeRemaining={gameState.turnTimeRemaining}
                        />
                    </div>

                    <div className="right-panel">
                        <PlayerInfo
                            players={gameState.players}
                            currentPlayerId={gameState.currentPlayerId}
                        />
                        <Popup message={gameState.message} />
                    </div>
                    {showDecisionPopup && isMyTurn && (
                        <DecisionPopup
                            info={popupInfo}
                            onDecision={(decision) => {
                                handlePlayerAction(decision);
                                setShowDecisionPopup(false);
                            }}
                            onClose={() => setShowDecisionPopup(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game;