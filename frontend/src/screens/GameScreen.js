import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import PlayerInfo from '../components/PlayerInfo';
import Controls from '../components/Controls';
import Popup from '../components/Popup';
import DecisionPopup from '../components/DecisionPopup';
import { Music, VolumeX } from 'lucide-react';
import '../styles/App.css'; // Bạn có thể tạo một file CSS riêng cho GameScreen nếu muốn

function GameScreen({ socket }) {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState(null);
    const [myId, setMyId] = useState('');
    const [popup, setPopup] = useState({ show: false, message: '' });
    const [decision, setDecision] = useState({ show: false, type: '', options: [], message: '' });
    const [isMuted, setIsMuted] = useState(true);
    const bgMusicRef = useRef(null);

    useEffect(() => {
        // Lấy ID của client từ socket
        socket.on('connected', ({ id }) => {
            setMyId(id);
        });
        const handleGameStarted = (initialState) => {
            setGameState(initialState);
        };

        // Cập nhật trạng thái game
        socket.on('updateGameState', (newState) => {
            setGameState(newState);
            
            // Hiển thị popup thông báo chung
            if (newState.message) {
                setPopup({ show: true, message: newState.message });
                setTimeout(() => setPopup({ show: false, message: '' }), 3000); // Tự động ẩn sau 3s
            }

            // Xử lý popup quyết định cho người chơi hiện tại
            const currentPlayer = newState.players.find(p => p.id === myId);
            if (currentPlayer && newState.currentTurn === myId && newState.currentPhase.startsWith('decision_')) {
                setDecision({
                    show: true,
                    type: newState.currentPhase,
                    options: newState.decisionData.options || [],
                    message: newState.decisionData.message || ''
                });
            } else {
                setDecision({ show: false, type: '', options: [], message: '' });
            }
        });

        // Xử lý khi game bị reset (do người chơi thoát)
        socket.on('gameReset', ({ message }) => {
            alert(message); // Hoặc một popup đẹp hơn
            navigate('/'); // Quay về sảnh chờ
        });

        // Cập nhật thời gian
        socket.on('timeUpdate', ({ remainingTime }) => {
            if (gameState) {
                setGameState(prevState => ({ ...prevState, remainingTime }));
            }
        });

        // Yêu cầu trạng thái game hiện tại khi vừa vào phòng
        // (Phòng trường hợp re-connect hoặc vào xem)
        socket.emit('requestGameState', roomId);
        socket.on('gameStarted', handleGameStarted);


        // Cleanup listeners khi component unmount
        return () => {
            socket.off('connected');
            socket.off('gameStarted', handleGameStarted);
            socket.off('updateGameState');
            socket.off('gameReset');
            socket.off('timeUpdate');
        };
    }, [socket, roomId, navigate, myId, gameState]);

    // Xử lý nhạc nền
    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.muted = isMuted;
            if (!isMuted) {
                bgMusicRef.current.play().catch(e => console.log("Audio play failed:", e));
            }
        }
    }, [isMuted]);

    const handlePlayerAction = (action) => {
        socket.emit('playerAction', action);
        // Ẩn popup quyết định ngay sau khi gửi action
        if (decision.show) {
            setDecision({ show: false, type: '', options: [], message: '' });
        }
    };

    if (!gameState) {
        return <div>Đang tải ván đấu...</div>;
    }

    const me = gameState.players.find(p => p.id === myId);

    return (
        <div className="app-container">
            <audio ref={bgMusicRef} src="/music/background-music.mp3" loop />
            <div className="top-bar">
                <div className="game-info">
                    <span>Phòng: {roomId}</span>
                    <span className="timer">Thời gian còn lại: {Math.floor(gameState.remainingTime / 60)}:{('0' + gameState.remainingTime % 60).slice(-2)}</span>
                </div>
                <button onClick={() => setIsMuted(!isMuted)} className="mute-btn">
                    {isMuted ? <VolumeX size={24} /> : <Music size={24} />}
                </button>
            </div>

            <div className="main-content">
                <div className="player-info-container">
                    {gameState.players.map((player, index) => (
                        <PlayerInfo
                            key={player.id}
                            player={player}
                            isMyTurn={gameState.currentTurn === player.id}
                            isMe={player.id === myId}
                        />
                    ))}
                </div>

                <Board
                    board={gameState.board}
                    players={gameState.players}
                    characterData={gameState.characterData}
                />

                <div className="controls-container">
                    <Controls
                        player={me}
                        isMyTurn={gameState.currentTurn === myId}
                        phase={gameState.currentPhase}
                        onAction={handlePlayerAction}
                        doublesCount={me?.doublesCount}
                    />
                </div>
            </div>

            {popup.show && <Popup message={popup.message} />}
            
            {decision.show && (
                <DecisionPopup
                    decision={decision}
                    onAction={handlePlayerAction}
                />
            )}
        </div>
    );
}

export default GameScreen;