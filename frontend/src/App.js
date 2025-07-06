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

// Kết nối tới server. Đảm bảo URL này đúng với môi trường của bạn.
const socket = io('http://localhost:4000');

function App() {
    const [gameState, setGameState] = useState(null);
    const [myId, setMyId] = useState('');
    const [isInLobby, setIsInLobby] = useState(true);
    const [showDecisionPopup, setShowDecisionPopup] = useState(false);
    const [popupInfo, setPopupInfo] = useState(null);

    useEffect(() => {
        // Lưu lại socket ID của chính mình khi kết nối thành công
        socket.on('connected', ({ id }) => {
            setMyId(id);
        });

        // Xử lý khi game bắt đầu
        const handleGameStarted = (initialState) => {
            setGameState(initialState);
            setIsInLobby(false);
        };

        // Xử lý khi trạng thái game được cập nhật
        const handleUpdateState = (newState) => {
            setGameState(newState);
            // Hiển thị popup quyết định cho các phase đặc biệt
            if (['teleport', 'festival'].includes(newState.currentPhase)) {
                setShowDecisionPopup(true);
                // Truyền thông tin cần thiết cho popup
                setPopupInfo({ 
                    phase: newState.currentPhase, 
                    options: newState.board,
                    player: newState.players.find(p => p.id === newState.currentPlayerId) 
                });
            } else {
                setShowDecisionPopup(false);
            }
        };

        // Xử lý khi game được reset
        const handleGameReset = (data) => {
            alert(data || data.message); // Hiển thị thông báo reset
            setGameState(null);
            setIsInLobby(true);
        };
        
        // Đăng ký các trình nghe sự kiện
        socket.on('gameStarted', handleGameStarted);
        socket.on('updateGameState', handleUpdateState);
        socket.on('gameReset', handleGameReset);

        // Dọn dẹp các trình nghe khi component bị gỡ bỏ
        return () => {
            socket.off('connected');
            socket.off('gameStarted', handleGameStarted);
            socket.off('updateGameState', handleUpdateState);
            socket.off('gameReset', handleGameReset);
        };
    }, []);

    // Hàm gửi hành động của người chơi lên server
    const handlePlayerAction = (action) => {
        socket.emit('playerAction', action);
    };

    // Hiển thị sảnh chờ nếu game chưa bắt đầu
    if (isInLobby) {
        return <Lobby socket={socket} myId={myId} />;
    }

    // Hiển thị thông báo tải nếu chưa có gameState
    if (!gameState || !gameState.players) {
        return <div>Đang chờ dữ liệu trận đấu...</div>;
    }
    
    // Tìm dữ liệu của người chơi hiện tại từ gameState
    const me = gameState.players.find(p => p.id === myId);
    
    // Nếu không tìm thấy dữ liệu người chơi, hiển thị lỗi.
    if (!me) {
        return <div>Lỗi: Không tìm thấy thông tin người chơi. Vui lòng tải lại trang.</div>;
    }

    // SỬA LỖI: Xác định lượt chơi bằng cách so sánh myId với currentPlayerId từ gameState
    const isMyTurn = gameState.currentPlayerId === myId;

    return (
        <div className="app">
            <Board 
                board={gameState.board} 
                players={gameState.players}
                onSquareClick={(squareId) => {
                    // Xử lý click trên ô cờ, ví dụ cho việc dịch chuyển hoặc tổ chức lễ hội
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
                 {gameState.dice[0] > 0 && (
                    <div className="dice-area">
                        <div className="dice">{gameState.dice[0]}</div>
                        <div className="dice">{gameState.dice[1]}</div>
                    </div>
                )}
                {/* Popup thông báo chung của game, hiển thị cho tất cả người chơi */}
                <Popup message={gameState.message} />
            </div>
            {/* Popup có điều kiện cho các quyết định cụ thể */}
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
