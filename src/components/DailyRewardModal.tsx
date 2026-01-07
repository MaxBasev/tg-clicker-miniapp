import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REWARDS } from '../hooks/useDailyReward';
import '../styles/DailyRewardModal.css';

interface DailyRewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClaim: () => void;
    streak: number;
    canClaim: boolean;
    reward: number; // Current reward amount to claim or view
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
    isOpen,
    onClose,
    onClaim,
    streak,
    canClaim,
    reward
}) => {
    // Current day index (0-6)
    // If streak is 0, we are at day 0. If streak is 1, next is day 1 (index 1)?
    // Logic: streak is how many claimed. 
    // If streak = 0, next is Day 1 (Index 0).
    // If streak = 1, next is Day 2 (Index 1).
    const currentDayIndex = streak % 7;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="daily-reward-overlay">
                    <motion.div
                        className="daily-reward-modal"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                    >
                        <div className="modal-header">
                            <h2>Daily Reward 📅</h2>
                            <button className="close-btn" onClick={onClose}>✕</button>
                        </div>

                        <div className="streak-grid">
                            {REWARDS.map((amount, index) => {
                                const isCompleted = index < currentDayIndex;
                                const isCurrent = index === currentDayIndex;
                                const dayNum = index + 1;

                                return (
                                    <div
                                        key={index}
                                        className={`streak-day ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                    >
                                        <span className="day-label">Day {dayNum}</span>
                                        <div className="coin-icon">💰</div>
                                        <span className="amount">{amount}</span>
                                        {isCompleted && <div className="check-mark">✓</div>}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="modal-footer">
                            {canClaim ? (
                                <button className="claim-btn" onClick={onClaim}>
                                    Claim {reward} 🪙
                                </button>
                            ) : (
                                <button className="claim-btn disabled" disabled>
                                    Come back tomorrow
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
