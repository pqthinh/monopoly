import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './styles/App.css';

// const socket = io('http://localhost:4000/');
const socket = io('https://monopoly.lexispeak.com/');

function App() {
    const [gameState, setGameState] = useState(null);
    const [myId, setMyId] = useState('');

    useEffect(() => {
        socket.on('connected', ({ id }) => {
            setMyId(id);
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
    }, []);

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        !gameState ? (
                            <Lobby socket={socket} myId={myId} />
                        ) : (
                            <Navigate to="/game" replace />
                        )
                    } 
                />
                <Route 
                    path="/game" 
                    element={
                        gameState ? (
                            <Game 
                                socket={socket} 
                                gameState={gameState} 
                                myId={myId} 
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