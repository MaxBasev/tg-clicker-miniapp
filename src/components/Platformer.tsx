import React, { useEffect } from 'react';
import { usePlatformerGame } from '../hooks/usePlatformerGame';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import '../styles/Platformer.css';

interface PlatformerProps {
    onGameOver: (score: number) => void;
    onBack: () => void;
}

export const Platformer: React.FC<PlatformerProps> = ({ onGameOver, onBack }) => {
    const { impactOccurred } = useHapticFeedback();

    const {
        canvasRef,
        handleTouchStart,
        handleTouchEnd,
        score
    } = usePlatformerGame({
        onGameOver: (finalScore) => {
            impactOccurred('heavy');
            onGameOver(finalScore);
        }
    });

    // Keyboard controls support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowLeft') {
                handleTouchStart('left');
            }
            if (e.code === 'ArrowRight') {
                handleTouchStart('right');
            }
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault(); // Prevent scrolling
                // If holding down, we don't want to spam if we rely on "just pressed" logic usually, 
                // but jump() checks isGrounded so it's okay.
                handleTouchStart('jump');
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'ArrowLeft') handleTouchEnd('left');
            if (e.code === 'ArrowRight') handleTouchEnd('right');
            // Jump doesn't need keyup for variable height yet, but good practice if we add it later
            if (e.code === 'Space' || e.code === 'ArrowUp') handleTouchEnd('jump');
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return (
        <div className="platformer-game">
            <div className="game-header">
                <button className="back-button" onClick={onBack}>←</button>
                <div className="score">Coins: {score}</div>
            </div>

            <canvas
                ref={canvasRef}
                width={640} // 20 tiles * 32
                height={480} // 15 tiles * 32
                className="game-canvas"
            />

            <div className="controls-overlay">
                <div className="dpad">
                    <button
                        className="control-btn left"
                        onTouchStart={() => handleTouchStart('left')}
                        onTouchEnd={() => handleTouchEnd('left')}
                        onMouseDown={() => handleTouchStart('left')}
                        onMouseUp={() => handleTouchEnd('left')}
                        onMouseLeave={() => handleTouchEnd('left')}
                    >
                        ⬅
                    </button>
                    <button
                        className="control-btn right"
                        onTouchStart={() => handleTouchStart('right')}
                        onTouchEnd={() => handleTouchEnd('right')}
                        onMouseDown={() => handleTouchStart('right')}
                        onMouseUp={() => handleTouchEnd('right')}
                        onMouseLeave={() => handleTouchEnd('right')}
                    >
                        ➡
                    </button>
                </div>
                <div className="action-buttons">
                    <button
                        className="control-btn jump"
                        onTouchStart={() => {
                            handleTouchStart('jump');
                            impactOccurred('light');
                        }}
                        onMouseDown={() => {
                            handleTouchStart('jump');
                            impactOccurred('light');
                        }}
                    >
                        A
                    </button>
                </div>
            </div>
        </div>
    );
};
