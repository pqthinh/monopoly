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
        <div>
            <h1>Lịch sử đấu</h1>
            <Link to="/">Về sảnh chờ</Link>
            <ul>
                {games.map(game => (
                    <li key={game._id}>
                        <p>Ngày chơi: {new Date(game.createdAt).toLocaleString()}</p>
                        <p>Người thắng: {game.winner ? game.winner.username : 'Hòa'}</p>
                        <Link to={`/analysis/${game._id}`}>Xem chi tiết & Phân tích</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HistoryScreen;