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

	// Обработка свайпов (можно тоже вынести в хук, но пока оставим здесь для простоты)
	const touchStart = React.useRef<{ x: number; y: number } | null>(null);
	const minSwipeDistance = 30;

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
					← Назад
				</button>
				<div className="score">Счёт: {score}</div>
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

					return (
						<div
							key={index}
							className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''} ${isHead ? 'head' : ''}`}
						/>
					);
				})}
			</div>

			{isGameOver && (
				<div className="game-over">
					<div className="game-over-content">
						<h2>Игра окончена!</h2>
						<p>Счёт: {score}</p>
						<button onClick={resetGame}>Играть снова</button>
					</div>
				</div>
			)}
		</div>
	);
}; 