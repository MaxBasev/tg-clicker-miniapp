import { useState, useCallback, useEffect } from 'react';

export type GameType = 'snake' | 'game2048' | 'flappybird';

export interface ScoreEntry {
    id: string;
    score: number;
    date: string;
    playerName: string;
}

const MAX_SCORES = 10;
const STORAGE_KEY = 'tg-minigames-leaderboard';

export const useLeaderboard = () => {
    const [scores, setScores] = useState<Record<GameType, ScoreEntry[]>>({
        snake: [],
        game2048: [],
        flappybird: []
    });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setScores(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse leaderboard data', e);
            }
        }
    }, []);

    const addScore = useCallback((game: GameType, score: number) => {
        setScores(prev => {
            const gameScores = [...(prev[game] || [])];

            // Add new score
            gameScores.push({
                id: Date.now().toString(),
                score,
                date: new Date().toISOString(),
                playerName: 'You' // In future could be Telegram username
            });

            // Sort by score desc
            gameScores.sort((a, b) => b.score - a.score);

            // Keep top N
            const keptScores = gameScores.slice(0, MAX_SCORES);

            const newState = { ...prev, [game]: keptScores };

            // Save to local storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

            return newState;
        });
    }, []);

    const getScores = useCallback((game: GameType) => {
        return scores[game] || [];
    }, [scores]);

    const getHighScore = useCallback((game: GameType) => {
        const gameScores = scores[game] || [];
        return gameScores.length > 0 ? gameScores[0].score : 0;
    }, [scores]);

    return {
        scores,
        addScore,
        getScores,
        getHighScore
    };
};
