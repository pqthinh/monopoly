// src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Board from './components/Board';
import PlayerInfo from './components/PlayerInfo';
import Controls from './components/Controls';
import Popup from './components/Popup';
import DecisionPopup from './components/DecisionPopup'; 
import './styles/App.css';

const socket = io('http://localhost:4000');

function App() {
    const [gameState, setGameState] = useState(null);
    const [myId, setMyId] = useState('');
    const [isInLobby, setIsInLobby] = useState(true);
    const [showDecisionPopup, setShowDecisionPopup] = useState(false);
    const [popupInfo, setPopupInfo] = useState(null);

    useEffect(() => {
        socket.on('connected', ({ id }) => {
            setMyId(id);
        });

        const handleGameStarted = (initialState) => {
            setGameState(initialState);
            setIsInLobby(false);
        };

        const handleUpdateState = (newState) => {
            setGameState(newState);
            if (['teleport', 'festival'].includes(newState.currentPhase)) {
                setShowDecisionPopup(true);
                setPopupInfo({ 
                    phase: newState.currentPhase, 
                    options: newState.board,
                    player: newState.players.find(p => p.id === newState.currentPlayerId) 
                });
            } else {
                setShowDecisionPopup(false);
            }
        };

        const handleGameReset = (data) => {
            alert(data || data.message); // Hiển thị thông báo reset
            setGameState(null);
            setIsInLobby(true);
        };
        
        socket.on('gameStarted', handleGameStarted);
        socket.on('updateGameState', handleUpdateState);
        socket.on('gameReset', handleGameReset);

        return () => {
            socket.off('connected');
            socket.off('gameStarted', handleGameStarted);
            socket.off('updateGameState', handleUpdateState);
            socket.off('gameReset', handleGameReset);
        };
    }, []);

    const handlePlayerAction = (action) => {
        socket.emit('playerAction', action);
    };

    if (isInLobby) {
        return <Lobby socket={socket} myId={myId} />;
    }

    if (!gameState || !gameState.players || !myId) {
        return <div>Đang tải dữ liệu trận đấu...</div>;
    }
    
    const me = gameState.players.find(p => p.id === myId);
    
    if (!me) {
        console.error("Lỗi đồng bộ: Không tìm thấy ID người chơi trong trạng thái game.", { myId: myId, players: gameState.players.map(p => p.id) });
        return <div>Lỗi: Không tìm thấy thông tin người chơi trong trận đấu. Vui lòng tải lại trang.</div>;
    }

    const isMyTurn = gameState.currentPlayerId === myId;

    return (
        <div className="app">
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
            />
            <div className="right-panel">
                <PlayerInfo players={gameState.players} myId={myId} />
                <Controls 
                    onPlayerAction={handlePlayerAction} 
                    isMyTurn={isMyTurn} 
                    phase={gameState.currentPhase}
                    player={me}
                    board={gameState.board}
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
    );
}

export default App;
