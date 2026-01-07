import React, { useState } from 'react';
import { useLeaderboard, GameType } from '../hooks/useLeaderboard';
import '../styles/Leaderboard.css';

interface LeaderboardProps {
    onBack: () => void;
}

const GAME_LABELS: Record<GameType, string> = {
    snake: 'Snake',
    game2048: '2048',
    flappybird: 'Flappy Rocket'
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
    const { getScores } = useLeaderboard();
    const [activeTab, setActiveTab] = useState<GameType>('snake');

    const scores = getScores(activeTab);

    return (
        <div className="leaderboard-screen">
            <div className="leaderboard-header">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                <h2>Leaderboard</h2>
                <div style={{ width: 40 }} /> {/* Spacer for centering */}
            </div>

            <div className="leaderboard-tabs">
                {(Object.keys(GAME_LABELS) as GameType[]).map(game => (
                    <button
                        key={game}
                        className={`tab-btn ${activeTab === game ? 'active' : ''}`}
                        onClick={() => setActiveTab(game)}
                    >
                        {GAME_LABELS[game]}
                    </button>
                ))}
            </div>

            <div className="leaderboard-content">
                <div className="scores-list">
                    {scores.length === 0 ? (
                        <div className="no-scores">
                            <div className="empty-icon">🏆</div>
                            <p>No scores yet</p>
                            <p className="sub-text">Play to climb the top!</p>
                        </div>
                    ) : (
                        scores.map((entry, index) => (
                            <div key={entry.id} className="score-item">
                                <div className="score-rank">#{index + 1}</div>
                                <div className="score-info">
                                    <div className="score-player">{entry.playerName}</div>
                                    <div className="score-date">
                                        {new Date(entry.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="score-value">{entry.score}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
