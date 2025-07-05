// src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Board from './components/Board';
import PlayerInfo from './components/PlayerInfo';
import Controls from './components/Controls';
import Popup from './components/Popup';
import './styles/App.css';

const socket = io('http://localhost:4000');

function App() {
    const [gameState, setGameState] = useState(null);
    const [myId, setMyId] = useState('');
    const [isInLobby, setIsInLobby] = useState(true);

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
        };
        const handleGameReset = (message) => {
            alert(message);
            setGameState(null);
            setIsInLobby(true);
        };
        
        socket.on('gameStarted', handleGameStarted);
        socket.on('updateGameState', handleUpdateState);
        socket.on('gameReset', handleGameReset);

        return () => {
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

    if (!gameState) {
        return <div>Đang chờ dữ liệu trận đấu...</div>;
    }
    
    const me = gameState.players.find(p => p.id === myId);
    if (!me) return <div>Lỗi: Không tìm thấy thông tin người chơi. Đang quay về sảnh...</div>;

    const isMyTurn = gameState.players[gameState.currentPlayerIndex].id === myId;

    return (
        <div className="app">
            <Board board={gameState.board} players={gameState.players} />
            <div className="right-panel">
                <PlayerInfo players={gameState.players} myId={myId} />
                <Controls
                    onPlayerAction={handlePlayerAction}
                    isMyTurn={isMyTurn}
                    phase={gameState.currentPhase}
                    gameState={gameState} // Truyền gameState xuống
                />
                {/* ... (phần hiển thị xúc xắc có thể di chuyển vào Board nếu muốn) */}
                {gameState.dice && gameState.dice.length > 0 && (
                    <div className="dice-area">
                        <div className="dice">{gameState.dice.length > 0 ? gameState.dice [0] : ''}</div>
                        <div className="dice">{gameState.dice.length > 1 ? gameState.dice [1] : ''}</div>
                    </div>
                )}
            </div>
            {isMyTurn && gameState.message && <Popup message={gameState.message} />}
        </div>
    );
}

export default App;