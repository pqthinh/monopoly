import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

// Components
import Lobby from './components/Lobby';
import GameScreen from './screens/GameScreen'; // We will create this wrapper
import AuthScreen from './screens/AuthScreen'; // And this one
import HistoryScreen from './screens/HistoryScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import PrivateRoute from './components/PrivateRoute';

import './styles/App.css';

// Configure axios
axios.defaults.baseURL = 'http://localhost:4000'; // Your backend URL
const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

const socket = io('http://localhost:4000');

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            setAuthToken(token);
        } else {
            localStorage.removeItem('token');
            setAuthToken(null);
        }
    }, [token]);

    const handleSetToken = (newToken) => {
        setToken(newToken);
        navigate('/'); // Navigate to lobby after login/register
    };
    
    const handleLogout = () => {
        setToken(null);
        navigate('/auth');
    }

    return (
        <div className="App">
            {token && <button onClick={handleLogout} style={{ position: 'absolute', top: 10, right: 10 }}>Đăng xuất</button>}
            <Routes>
                <Route path="/auth" element={<AuthScreen setToken={handleSetToken} />} />
                
                {/* Private Routes */}
                <Route path="/" element={<PrivateRoute token={token}><Lobby socket={socket} /></PrivateRoute>} />
                <Route path="/game/:roomId" element={<PrivateRoute token={token}><GameScreen socket={socket} /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute token={token}><HistoryScreen /></PrivateRoute>} />
                <Route path="/analysis/:gameId" element={<PrivateRoute token={token}><AnalysisScreen /></PrivateRoute>} />
            </Routes>
        </div>
    );
}

export default App;