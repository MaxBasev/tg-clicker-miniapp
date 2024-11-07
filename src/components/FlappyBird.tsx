import React, { useState, useEffect, useRef } from 'react';
import '../styles/FlappyBird.css';

interface FlappyBirdProps {
	onGameOver?: (score: number) => void;
	onBack: () => void;
}

interface Bird {
	y: number;
	velocity: number;
}

interface Pipe {
	x: number;
	topHeight: number;
	passed: boolean;
}

const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const BIRD_SIZE = 30;
const GAME_HEIGHT = 400;
const GAME_WIDTH = 300;
const ROCKET_EMOJI = '🚀';
const PIPE_COLOR = '#2ECC71';
const SKY_COLOR = '#87CEEB';

export const FlappyBird: React.FC<FlappyBirdProps> = ({ onGameOver, onBack }) => {
	const [gameStarted, setGameStarted] = useState(false);
	const [gameOver, setGameOver] = useState(false);
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(() => {
		const saved = localStorage.getItem('flappyHighScore');
		return saved ? parseInt(saved) : 0;
	});

	const [bird, setBird] = useState<Bird>({
		y: GAME_HEIGHT / 2,
		velocity: 0
	});

	const [pipes, setPipes] = useState<Pipe[]>([]);
	const gameLoopRef = useRef<number>();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const createPipe = () => {
		const minHeight = 50;
		const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight;
		const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

		return {
			x: GAME_WIDTH,
			topHeight,
			passed: false
		};
	};

	const jump = () => {
		if (!gameStarted) {
			setGameStarted(true);
			setPipes([createPipe()]);
		}

		if (!gameOver) {
			setBird(prev => ({
				...prev,
				velocity: JUMP_FORCE
			}));
		}
	};

	const handleClick = () => {
		if (gameOver) {
			setGameOver(false);
			setGameStarted(false);
			setScore(0);
			setBird({
				y: GAME_HEIGHT / 2,
				velocity: 0
			});
			setPipes([]);
		} else {
			jump();
		}
	};

	const checkCollision = (birdY: number, pipes: Pipe[]) => {
		const birdTop = birdY;
		const birdBottom = birdY + BIRD_SIZE;

		for (const pipe of pipes) {
			if (
				pipe.x <= BIRD_SIZE * 2 &&
				pipe.x + PIPE_WIDTH >= BIRD_SIZE
			) {
				if (birdTop <= pipe.topHeight || birdBottom >= pipe.topHeight + PIPE_GAP) {
					return true;
				}
			}
		}

		return birdTop <= 0 || birdBottom >= GAME_HEIGHT;
	};

	const updateGame = () => {
		if (!gameStarted || gameOver) return;

		setBird(prev => ({
			y: prev.y + prev.velocity,
			velocity: prev.velocity + GRAVITY
		}));

		setPipes(prevPipes => {
			let newPipes = prevPipes.map(pipe => ({
				...pipe,
				x: pipe.x - PIPE_SPEED
			}));

			// Добавляем новую трубу
			if (newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
				newPipes.push(createPipe());
			}

			// Убираем трубы, которые ушли за экран
			newPipes = newPipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

			// Обновляем счет
			newPipes.forEach(pipe => {
				if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_SIZE) {
					pipe.passed = true;
					setScore(prev => prev + 1);
				}
			});

			return newPipes;
		});
	};

	const drawGame = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Очищаем канвас
		ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

		// Рисуем фон
		ctx.fillStyle = SKY_COLOR;
		ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

		// Рисуем трубы
		ctx.fillStyle = PIPE_COLOR;
		pipes.forEach(pipe => {
			// Верхняя труба
			ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
			// Нижняя труба
			ctx.fillRect(
				pipe.x,
				pipe.topHeight + PIPE_GAP,
				PIPE_WIDTH,
				GAME_HEIGHT - (pipe.topHeight + PIPE_GAP)
			);
		});

		// Рисуем ракету (эмодзи)
		ctx.save();
		ctx.font = `${BIRD_SIZE}px Arial`;
		ctx.translate(BIRD_SIZE, bird.y + BIRD_SIZE / 2);

		// Наклоняем ракету в зависимости от скорости
		const rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5);
		ctx.rotate(rotation);

		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(ROCKET_EMOJI, 0, 0);
		ctx.restore();

		// Добавляем эффект выхлопа
		if (gameStarted && !gameOver) {
			ctx.save();
			ctx.translate(BIRD_SIZE - 15, bird.y + BIRD_SIZE / 2);
			ctx.rotate(rotation);

			// Рисуем несколько частиц выхлопа
			const particles = 3;
			for (let i = 0; i < particles; i++) {
				const offset = (Math.random() - 0.5) * 10;
				const size = Math.random() * 8 + 4;
				const alpha = Math.random() * 0.5 + 0.2;

				ctx.beginPath();
				ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
				ctx.arc(-10 - Math.random() * 15, offset, size, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}
	};

	useEffect(() => {
		const gameLoop = () => {
			updateGame();
			drawGame();

			if (checkCollision(bird.y, pipes)) {
				setGameOver(true);
				if (score > highScore) {
					setHighScore(score);
					localStorage.setItem('flappyHighScore', score.toString());
				}
				onGameOver?.(score);
				return;
			}

			gameLoopRef.current = requestAnimationFrame(gameLoop);
		};

		gameLoopRef.current = requestAnimationFrame(gameLoop);

		return () => {
			if (gameLoopRef.current) {
				cancelAnimationFrame(gameLoopRef.current);
			}
		};
	}, [gameStarted, gameOver, bird, pipes]);

	return (
		<div className="flappy-bird">
			<div className="game-header">
				<button className="back-button" onClick={onBack}>
					← Назад
				</button>
				<div className="score-container">
					<div>Счёт: {score}</div>
					<div>Рекорд: {highScore}</div>
				</div>
			</div>

			<canvas
				ref={canvasRef}
				width={GAME_WIDTH}
				height={GAME_HEIGHT}
				onClick={handleClick}
				className="game-canvas"
			/>

			{!gameStarted && !gameOver && (
				<div className="game-message">
					Нажмите, чтобы запустить ракету 🚀
				</div>
			)}

			{gameOver && (
				<div className="game-message">
					Крушение! Нажмите, чтобы запустить новую ракету 💥
				</div>
			)}
		</div>
	);
}; 