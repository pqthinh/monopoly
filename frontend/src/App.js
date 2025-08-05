import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import AuthScreen from './components/AuthScreen';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './styles/App.css';

const socket = io('http://localhost:4000/');
// const socket = io('https://monopoly.lexispeak.com/');

function App() {
    const [gameState, setGameState] = useState(null);
    const [myId, setMyId] = useState('');
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing authentication on app load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    // Socket connection setup
    useEffect(() => {
        if (user && token) {
            socket.on('connected', ({ id }) => {
                setMyId(id);
                // Set the authenticated user's name
                socket.emit('setName', user.username);
            });

            socket.on('gameStarted', (initialState) => {
                setGameState(initialState);
            });

            socket.on('updateGameState', (newState) => {
                setGameState(newState);
            });
            
            socket.on('timeUpdate', (newState) => {
                setGameState(newState);
            });

            return () => {
                socket.off('connected');
                socket.off('gameStarted');
                socket.off('updateGameState');
                socket.off('timeUpdate');
            };
        }
    }, [user, token]);

    const handleLogin = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setGameState(null);
        setMyId('');
        socket.disconnect();
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <h1 className="loading-title">Kỳ Sử Lạc Hồng</h1>
                    <div className="loading-spinner">⏳</div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/auth" 
                    element={
                        !user ? (
                            <AuthScreen onLogin={handleLogin} />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    } 
                />
                <Route 
                    path="/" 
                    element={
                        !user ? (
                            <Navigate to="/auth" replace />
                        ) : !gameState ? (
                            <Lobby 
                                socket={socket} 
                                myId={myId} 
                                user={user}
                                token={token}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/game" replace />
                        )
                    } 
                />
                <Route 
                    path="/game" 
                    element={
                        !user ? (
                            <Navigate to="/auth" replace />
                        ) : gameState ? (
                            <Game 
                                socket={socket} 
                                gameState={gameState} 
                                myId={myId} 
                                user={user}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;