import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function AnalysisScreen() {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const res = await axios.get(`/api/games/${gameId}`);
                setGame(res.data);
            } catch (error) {
                console.error("Failed to fetch game details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameId]);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const res = await axios.post(`/api/analysis/${gameId}`);
            setAnalysis(res.data.analysis);
        } catch (error) {
            console.error("Failed to analyze game", error);
            setAnalysis('Không thể phân tích trận đấu.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <p>Đang tải chi tiết trận đấu...</p>;
    if (!game) return <p>Không tìm thấy trận đấu.</p>;

    return (
        <div>
            <h1>Chi tiết trận đấu</h1>
            <Link to="/history">Quay lại lịch sử</Link>
            <div>
                <h3>Log trận đấu</h3>
                <pre>{game.logs.join('\n')}</pre>
            </div>
            <button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? 'Đang phân tích...' : 'Phân tích bằng AI ✨'}
            </button>
            {analysis && (
                <div>
                    <h3>Phân tích từ AI</h3>
                    <p>{analysis}</p>
                </div>
            )}
        </div>
    );
}

export default AnalysisScreen;