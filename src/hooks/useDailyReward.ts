import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'daily_reward_state';

interface DailyRewardState {
    lastClaimDate: string | null; // ISO string
    streak: number;
    lastClaimTime: number; // timestamp
}

const INITIAL_STATE: DailyRewardState = {
    lastClaimDate: null,
    streak: 0,
    lastClaimTime: 0
};

export const REWARDS = [100, 250, 500, 1000, 2500, 5000, 10000];

export const useDailyReward = () => {
    const [state, setState] = useState<DailyRewardState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });

    const [canClaim, setCanClaim] = useState(false);
    // const [timeToNextClaim, setTimeToNextClaim] = useState<string>('');

    // Check validity of streak and claim status
    useEffect(() => {
        const checkStatus = () => {
            const now = Date.now();
            const lastClaim = new Date(state.lastClaimTime);
            const today = new Date();

            // Should verify if "today" is a different day than "lastClaim"
            const isDifferentDay = lastClaim.getDate() !== today.getDate() ||
                lastClaim.getMonth() !== today.getMonth() ||
                lastClaim.getFullYear() !== today.getFullYear();

            // Check if streak is broken (more than 48 hours since last claim time)
            // Actually, usually it's: if you miss a whole calendar day.
            // Let's keep it simple: if (now - lastClaimTime) > 48 hours, reset.
            const hoursSinceLastClaim = (now - state.lastClaimTime) / (1000 * 60 * 60);

            if (state.lastClaimTime > 0 && hoursSinceLastClaim > 48) {
                // Streak broken, but we don't reset state here automatically to avoid UI flickering, 
                // just know that next claim will be day 1.
                // Or better, reset it on claim? Let's just calculate `currentStreak` dynamically.
            }

            // Can claim if it's a different calendar day AND less than 24h passed? 
            // Standard mobile game logic: New Day starts at specific time or just 24h cooldown?
            // "Calendar day" logic is more user friendly.

            if (state.lastClaimDate === null) {
                setCanClaim(true);
            } else {
                setCanClaim(isDifferentDay);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [state]);

    const claimReward = useCallback(() => {
        if (!canClaim) return 0;

        const now = new Date();
        const nowTs = now.getTime();
        let newStreak = state.streak + 1;

        // Reset streak if too much time passed (48h tolerance allows skipping one day effectively? No, 24h+ margin)
        // If last claim was > 48h ago, reset to 1.
        if (state.lastClaimTime > 0) {
            const hoursSinceLastClaim = (nowTs - state.lastClaimTime) / (1000 * 60 * 60);
            if (hoursSinceLastClaim >= 48) {
                newStreak = 1;
            }
        }

        // Cap streak at 7, then maybe reset or keep at 7? Let's loop it!
        // Or specific logic: REWARDS[(newStreak - 1) % 7]

        const rewardIndex = (newStreak - 1) % 7;
        const reward = REWARDS[rewardIndex];

        const newState = {
            lastClaimDate: now.toISOString(),
            lastClaimTime: nowTs,
            streak: newStreak
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        setState(newState);
        setCanClaim(false);

        return reward;
    }, [canClaim, state]);

    return {
        streak: state.streak,
        canClaim,
        claimReward,
        nextReward: REWARDS[(state.streak) % 7] // Preview next reward
    };
};
