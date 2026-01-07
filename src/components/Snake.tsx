import React, { useEffect } from 'react';
import '../styles/Snake.css';
import { useSnakeGame } from '../hooks/useSnakeGame';

interface SnakeProps {
	onGameOver?: (score: number) => void;
	onBack: () => void;
}

export const Snake: React.FC<SnakeProps> = ({ onGameOver, onBack }) => {
	const {
		snake,
		food,
		score,
		isGameOver,
		isPaused,
		resetGame,
		changeDirection,
		togglePause,
		GRID_SIZE
	} = useSnakeGame({ onGameOver });

	// Load shop items on mount to check for active skins
	const [shopItems] = React.useState<{ id: string; active: boolean }[]>(() => {
		try {
			return JSON.parse(localStorage.getItem('shopItems') || '[]');
		} catch {
			return [];
		}
	});

	// Check if golden skin is purchased AND active
	const goldenSkin = shopItems.find((item: { id: string; active: boolean }) => item.id === 'skin_snake_golden' && item.active);
	const activeSkinClass = goldenSkin ? 'golden' : '';

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowUp':
					changeDirection('UP');
					break;
				case 'ArrowDown':
					changeDirection('DOWN');
					break;
				case 'ArrowLeft':
					changeDirection('LEFT');
					break;
				case 'ArrowRight':
					changeDirection('RIGHT');
					break;
				case ' ':
					togglePause();
					break;
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [changeDirection, togglePause]);

	// Обработка свайпов
	const touchStart = React.useRef<{ x: number; y: number } | null>(null);
	const minSwipeDistance = 20; // More sensitive

	const handleTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		touchStart.current = {
			x: touch.clientX,
			y: touch.clientY
		};
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!touchStart.current) return;

		const touch = e.changedTouches[0];
		const deltaX = touch.clientX - touchStart.current.x;
		const deltaY = touch.clientY - touchStart.current.y;

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			if (Math.abs(deltaX) >= minSwipeDistance) {
				if (deltaX > 0) {
					changeDirection('RIGHT');
				} else {
					changeDirection('LEFT');
				}
			}
		} else {
			if (Math.abs(deltaY) >= minSwipeDistance) {
				if (deltaY > 0) {
					changeDirection('DOWN');
				} else {
					changeDirection('UP');
				}
			}
		}

		touchStart.current = null;
	};

	return (
		<div
			className="snake-game"
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			<div className="game-header">
				<button className="back-button" onClick={onBack}>
					← Back
				</button>
				<div className="score">Score: {score}</div>
				<div className="controls">
					<button className="control-button" onClick={togglePause}>
						{isPaused ? '▶️' : '⏸️'}
					</button>
					<button className="control-button" onClick={resetGame}>
						🔄
					</button>
				</div>
			</div>

			<div className="game-grid">
				{Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
					const x = index % GRID_SIZE;
					const y = Math.floor(index / GRID_SIZE);
					const isSnake = snake.some(segment => segment.x === x && segment.y === y);
					const isFood = food.x === x && food.y === y;
					const isHead = snake[0].x === x && snake[0].y === y;

					// Apply skin class if this cell is part of snake
					const cellSkinClass = isSnake ? activeSkinClass : '';

					return (
						<div
							key={index}
							className={`cell ${isSnake ? 'snake' : ''} ${cellSkinClass} ${isFood ? 'food' : ''} ${isHead ? 'head' : ''}`}
						/>
					);
				})}
			</div>

			{isGameOver && (
				<div className="game-over">
					<div className="game-over-content">
						<h2>Game Over!</h2>
						<p>Score: {score}</p>
						<button onClick={resetGame}>Play Again</button>
					</div>
				</div>
			)}
		</div>
	);
}; 