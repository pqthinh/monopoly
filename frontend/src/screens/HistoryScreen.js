import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function HistoryScreen() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await axios.get('/api/games');
                setGames(res.data);
            } catch (error) {
                console.error("Failed to fetch game history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    if (loading) return <p>Đang tải lịch sử...</p>;

    return (
        <div className="screen-container">
            <h1>Lịch sử đấu</h1>
            <Link to="/" className="link-button" style={{marginBottom: '20px', display: 'inline-block'}}>Về sảnh chờ</Link>
            
            <ul className="history-list">
                {games.map(game => (
                    <li key={game._id} className="history-item">
                        <div className="history-item-info">
                            <p className="date">Ngày chơi: {new Date(game.createdAt).toLocaleString()}</p>
                            <p className="winner">Người thắng: {game.winner ? game.winner.username : 'Hòa'}</p>
                        </div>
                        <Link to={`/analysis/${game._id}`} className="button-style">Xem & Phân tích</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HistoryScreen;