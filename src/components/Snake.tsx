import React, { useState, useEffect, useRef } from 'react';
import '../styles/Snake.css';

interface SnakeProps {
	onGameOver?: (score: number) => void;
	onBack: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
	{ x: 10, y: 10 },
	{ x: 10, y: 11 },
	{ x: 10, y: 12 }
];
const INITIAL_DIRECTION = 'UP';
const GAME_SPEED = 150;

export const Snake: React.FC<SnakeProps> = ({ onGameOver, onBack }) => {
	const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
	const [food, setFood] = useState<Position>({ x: 5, y: 5 });
	const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
	const [isGameOver, setIsGameOver] = useState(false);
	const [score, setScore] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	const directionRef = useRef(direction);
	const gameLoopRef = useRef<number>();

	const generateFood = () => {
		let foodPosition: Position;
		let isValidPosition: boolean;

		do {
			foodPosition = {
				x: Math.floor(Math.random() * GRID_SIZE),
				y: Math.floor(Math.random() * GRID_SIZE)
			};
			isValidPosition = !snake.some(segment =>
				segment.x === foodPosition.x && segment.y === foodPosition.y
			);
		} while (!isValidPosition);

		setFood(foodPosition);
	};

	const resetGame = () => {
		setSnake(INITIAL_SNAKE);
		setDirection(INITIAL_DIRECTION);
		setIsGameOver(false);
		setScore(0);
		generateFood();
		setIsPaused(false);
	};

	const moveSnake = () => {
		if (isGameOver || isPaused) return;

		setSnake(currentSnake => {
			const head = currentSnake[0];
			const newHead = { ...head };

			switch (directionRef.current) {
				case 'UP':
					newHead.y -= 1;
					break;
				case 'DOWN':
					newHead.y += 1;
					break;
				case 'LEFT':
					newHead.x -= 1;
					break;
				case 'RIGHT':
					newHead.x += 1;
					break;
			}

			// Проверка столкновения со стеной
			if (
				newHead.x < 0 ||
				newHead.x >= GRID_SIZE ||
				newHead.y < 0 ||
				newHead.y >= GRID_SIZE
			) {
				setIsGameOver(true);
				onGameOver?.(score);
				return currentSnake;
			}

			// Проверка столкновения с собой
			if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
				setIsGameOver(true);
				onGameOver?.(score);
				return currentSnake;
			}

			const newSnake = [newHead, ...currentSnake];

			// Проверка еды
			if (newHead.x === food.x && newHead.y === food.y) {
				setScore(s => s + 10);
				generateFood();
			} else {
				newSnake.pop();
			}

			return newSnake;
		});
	};

	useEffect(() => {
		directionRef.current = direction;
	}, [direction]);

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowUp':
					if (directionRef.current !== 'DOWN') setDirection('UP');
					break;
				case 'ArrowDown':
					if (directionRef.current !== 'UP') setDirection('DOWN');
					break;
				case 'ArrowLeft':
					if (directionRef.current !== 'RIGHT') setDirection('LEFT');
					break;
				case 'ArrowRight':
					if (directionRef.current !== 'LEFT') setDirection('RIGHT');
					break;
				case ' ':
					setIsPaused(p => !p);
					break;
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, []);

	// Обработка свайпов
	const touchStart = useRef<Position | null>(null);
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
				if (deltaX > 0 && directionRef.current !== 'LEFT') {
					setDirection('RIGHT');
				} else if (deltaX < 0 && directionRef.current !== 'RIGHT') {
					setDirection('LEFT');
				}
			}
		} else {
			if (Math.abs(deltaY) >= minSwipeDistance) {
				if (deltaY > 0 && directionRef.current !== 'UP') {
					setDirection('DOWN');
				} else if (deltaY < 0 && directionRef.current !== 'DOWN') {
					setDirection('UP');
				}
			}
		}

		touchStart.current = null;
	};

	useEffect(() => {
		if (isGameOver || isPaused) return;

		gameLoopRef.current = window.setInterval(moveSnake, GAME_SPEED);
		return () => {
			if (gameLoopRef.current) clearInterval(gameLoopRef.current);
		};
	}, [isGameOver, isPaused, moveSnake]);

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
					<button className="control-button" onClick={() => setIsPaused(p => !p)}>
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