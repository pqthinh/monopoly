import React from 'react';
import Board from './Board';
import PlayerInfo from './PlayerInfo';
import Controls from './Controls';
import Popup from './Popup';
import { Music, VolumeX } from 'lucide-react';
import { formatTime } from '../utils';
import '../styles/Game.css';

const Game = ({ socket, gameState, myId }) => {
    const [isMusicPlaying, setIsMusicPlaying] = React.useState(false);
    const audioRef = React.useRef(null);

    const toggleMusic = () => {
        if (isMusicPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsMusicPlaying(!isMusicPlaying);
    };

    if (!gameState || !gameState.players || !myId) {
        return <div>Đang tải dữ liệu trận đấu...</div>;
    }

    const me = gameState.players.find(p => p.id === myId);
    const isMyTurn = gameState.currentPlayerId === myId;

    const handlePlayerAction = (action) => {
        socket.emit('playerAction', action);
    };

    return (
        <div className="game-wrapper">
            <div className="game-background"></div>
            <div className="game-container">
                <audio ref={audioRef} src="/background-music.mp3" loop></audio>

                <div className="game-content">
                    <div className="left-panel">
                        <div className="game-info">
                            <div className="room-info">
                                <span className="info-label">ID PHÒNG:</span>
                                <span className="info-value">{gameState.roomId}</span>
                            </div>
                            <div className="time-info">
                                <span className="info-label">THỜI GIAN:</span>
                                <span className="info-value">{formatTime(gameState.remainingTime)}</span>
                            </div>
                            <button onClick={toggleMusic} className="music-toggle">
                                {isMusicPlaying ? (
                                    <>
                                        <VolumeX size={24} />
                                        TẮT NHẠC
                                    </>
                                ) : (
                                    <>
                                        <Music size={24} />
                                        BẬT NHẠC
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <Controls
                            onPlayerAction={handlePlayerAction}
                            isMyTurn={isMyTurn}
                            phase={gameState.currentPhase}
                            player={me}
                            board={gameState.board}
                        />
                        {gameState.currentPhase === 'game_over' && gameState.room.isHost === myId && (
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
                        <h2>Trận đấu: {gameState.roomName}</h2>
                        <h3>Thời gian còn lại: {formatTime(gameState.remainingTime)}s</h3>
                        <h3>Vòng: {gameState.currentRound}</h3>
                        <h3>Giai đoạn: {gameState.currentPhase}</h3>
                        <h3>Người chơi hiện tại: {gameState.currentPlayerName}</h3>
                        <h4>Thời gian lượt: {formatTime(gameState.turnTimeRemaining)}</h4>
                    </div>
                    
                    <div className="center-panel">
                        <Board
                            board={gameState.board}
                            players={gameState.players}
                            dice={gameState.dice}
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
                        />
                    </div>

                    <div className="right-panel">
                        <PlayerInfo 
                            players={gameState.players} 
                            currentPlayerId={gameState.currentPlayerId} 
                        />
                        <Popup message={gameState.message} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Game;