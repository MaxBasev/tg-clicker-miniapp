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
	laserCharge: number;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const PIPE_SPEED = 2;
const BIRD_SIZE = 35;
const GAME_HEIGHT = 400;
const GAME_WIDTH = 300;
const PIPE_SPAWN_INTERVAL = 2200;
const LASER_COLOR = '#FF073A';
const LASER_GLOW = '#FF6B6B';
const GUN_WIDTH = 50;
const GUN_HEIGHT = 60;
const LASER_GAP = 180;

// Добавим новые константы для визуальных эффектов
const STARS: { x: number; y: number; size: number; speed: number }[] = Array(50)
	.fill(0)
	.map(() => ({
		x: Math.random() * GAME_WIDTH,
		y: Math.random() * GAME_HEIGHT,
		size: Math.random() * 2 + 1,
		speed: Math.random() * 0.5 + 0.5
	}));

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

	const createPipe = React.useCallback(() => {
		const minHeight = GAME_HEIGHT * 0.2;
		const maxHeight = GAME_HEIGHT * 0.6;
		const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

		return {
			x: GAME_WIDTH,
			topHeight,
			passed: false,
			laserCharge: 1
		};
	}, []);

	// Move jump before it's used if needed, or hoist
	// But updateGame needs createPipe so putting createPipe first is good.

	const updateGame = React.useCallback(() => {
		if (!gameStarted || gameOver) return;

		setBird(prev => ({
			y: Math.max(0, Math.min(prev.y + prev.velocity, GAME_HEIGHT - BIRD_SIZE)),
			velocity: prev.velocity + GRAVITY
		}));

		setPipes(prevPipes => {
			const updatedPipes = prevPipes
				.map(pipe => ({
					...pipe,
					x: pipe.x - PIPE_SPEED
				}))
				.filter(pipe => pipe.x + GUN_WIDTH > 0);

			if (prevPipes.length === 0 || prevPipes[prevPipes.length - 1].x < GAME_WIDTH - PIPE_SPAWN_INTERVAL) {
				return [...updatedPipes, createPipe()];
			}

			return updatedPipes;
		});
	}, [gameStarted, gameOver, createPipe]);

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

	const checkCollision = (birdY: number, pipes: Pipe[]): boolean => {
		const birdRadius = BIRD_SIZE * 0.3;
		const birdX = BIRD_SIZE;

		for (const pipe of pipes) {
			if (
				birdX + birdRadius > pipe.x &&
				birdX - birdRadius < pipe.x + GUN_WIDTH
			) {
				if (birdY - birdRadius < pipe.topHeight - LASER_GAP / 2) {
					return true;
				}
				if (birdY + birdRadius > pipe.topHeight + LASER_GAP / 2) {
					return true;
				}

				if (!pipe.passed && birdX > pipe.x + GUN_WIDTH) {
					pipe.passed = true;
					setScore(prev => prev + 1);
				}
			}
		}

		if (birdY - birdRadius <= 0 || birdY + birdRadius >= GAME_HEIGHT) {
			return true;
		}

		return false;
	};



	const drawGame = React.useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Очищаем канвас
		ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

		// Рисуем космический фон
		const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
		gradient.addColorStop(0, '#000033');
		gradient.addColorStop(1, '#000066');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

		// Рисуем звезды
		ctx.fillStyle = '#FFF';
		STARS.forEach(star => {
			star.x -= star.speed;
			if (star.x < 0) star.x = GAME_WIDTH;

			ctx.beginPath();
			ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
			ctx.fill();
		});

		// Рисуем лазерные пушки и лазеры
		pipes.forEach(pipe => {
			ctx.save();

			// Верхняя пушка
			const drawGun = (x: number, y: number, isTop: boolean) => {
				// Основной корпус пушки
				ctx.fillStyle = '#2C3E50';
				ctx.strokeStyle = '#34495E';
				ctx.lineWidth = 2;

				const gunBody = new Path2D();
				gunBody.moveTo(x, y);
				gunBody.lineTo(x + GUN_WIDTH, y);
				gunBody.lineTo(x + GUN_WIDTH - 10, y + (isTop ? GUN_HEIGHT : -GUN_HEIGHT));
				gunBody.lineTo(x + 10, y + (isTop ? GUN_HEIGHT : -GUN_HEIGHT));
				gunBody.closePath();

				ctx.fill(gunBody);
				ctx.stroke(gunBody);

				// Детали пушки
				ctx.fillStyle = '#95A5A6';
				ctx.beginPath();
				ctx.arc(x + GUN_WIDTH / 2, y + (isTop ? 20 : -20), 15, 0, Math.PI * 2);
				ctx.fill();
				ctx.stroke();

				// Дуло пушки
				ctx.fillStyle = '#7F8C8D';
				ctx.fillRect(x + GUN_WIDTH / 2 - 5, y + (isTop ? GUN_HEIGHT - 10 : -GUN_HEIGHT + 10), 10, 20);

				// Декоративные элементы
				ctx.strokeStyle = '#E74C3C';
				ctx.beginPath();
				ctx.moveTo(x + 15, y + (isTop ? 10 : -10));
				ctx.lineTo(x + GUN_WIDTH - 15, y + (isTop ? 10 : -10));
				ctx.stroke();
			};

			// Рисуем верхнюю пушку
			drawGun(pipe.x, 0, true);
			// Рисуем нижнюю пушку
			drawGun(pipe.x, GAME_HEIGHT, false);

			// Рисуем лазерные лучи
			const drawLaser = (startY: number, endY: number) => {
				// Основной луч
				ctx.beginPath();
				ctx.shadowBlur = 20;
				ctx.shadowColor = LASER_GLOW;
				ctx.strokeStyle = LASER_COLOR;
				ctx.lineWidth = 4;

				// Зигзагообразный лазер
				ctx.beginPath();
				ctx.moveTo(pipe.x + GUN_WIDTH / 2, startY);

				const segments = 8;
				// const segmentHeight = Math.abs(endY - startY) / segments; // unused
				const amplitude = 5; // Амплитуда зигзага

				for (let i = 1; i <= segments; i++) {
					const y = startY + (endY - startY) * (i / segments);
					const x = pipe.x + GUN_WIDTH / 2 + (i % 2 === 0 ? amplitude : -amplitude);
					ctx.lineTo(x, y);
				}

				ctx.stroke();

				// Добавляем свечение
				ctx.lineWidth = 2;
				ctx.strokeStyle = LASER_GLOW;
				ctx.stroke();

				// Добавляем частицы вокруг лазера
				for (let i = startY; i < endY; i += 20) {
					if (Math.random() > 0.7) {
						const particleSize = Math.random() * 3 + 1;
						ctx.fillStyle = LASER_GLOW;
						ctx.beginPath();
						ctx.arc(
							pipe.x + GUN_WIDTH / 2 + (Math.random() - 0.5) * 10,
							i,
							particleSize,
							0,
							Math.PI * 2
						);
						ctx.fill();
					}
				}
			};

			// Рисуем верхний лазер
			drawLaser(GUN_HEIGHT, pipe.topHeight - LASER_GAP / 2);
			// Рисуем нижний лазер
			drawLaser(pipe.topHeight + LASER_GAP / 2, GAME_HEIGHT - GUN_HEIGHT);

			// Эффект заряда
			const chargeGlow = ctx.createLinearGradient(
				pipe.x + GUN_WIDTH / 2 - 10,
				0,
				pipe.x + GUN_WIDTH / 2 + 10,
				0
			);
			chargeGlow.addColorStop(0, 'rgba(255, 7, 58, 0)');
			chargeGlow.addColorStop(0.5, `rgba(255, 7, 58, ${pipe.laserCharge * 0.3})`);
			chargeGlow.addColorStop(1, 'rgba(255, 7, 58, 0)');

			ctx.fillStyle = chargeGlow;
			ctx.fillRect(pipe.x + GUN_WIDTH / 2 - 10, 0, 20, GAME_HEIGHT);

			ctx.restore();
		});

		// Рисуем ракету
		ctx.save();
		ctx.translate(BIRD_SIZE, bird.y + BIRD_SIZE / 2);

		const rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5);
		ctx.rotate(rotation);

		// Добавляем щит вокруг ракеты
		ctx.beginPath();
		ctx.arc(0, 0, BIRD_SIZE * 0.8, 0, Math.PI * 2);
		const shieldGradient = ctx.createRadialGradient(0, 0, BIRD_SIZE * 0.4, 0, 0, BIRD_SIZE * 0.8);
		shieldGradient.addColorStop(0, 'rgba(30, 144, 255, 0)');
		shieldGradient.addColorStop(0.5, 'rgba(30, 144, 255, 0.1)');
		shieldGradient.addColorStop(1, 'rgba(30, 144, 255, 0.2)');
		ctx.fillStyle = shieldGradient;
		ctx.fill();

		// Ракета
		ctx.shadowColor = '#FFA500';
		ctx.shadowBlur = 20;
		ctx.font = `${BIRD_SIZE}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('🚀', 0, 0);

		// Выхлоп ракеты
		if (gameStarted && !gameOver) {
			const particles = 5;
			for (let i = 0; i < particles; i++) {
				const offset = (Math.random() - 0.5) * 10;
				const distance = Math.random() * 20 + 10;
				const size = Math.random() * 8 + 4;

				const particleGradient = ctx.createRadialGradient(
					-distance, offset, 0,
					-distance, offset, size
				);
				particleGradient.addColorStop(0, 'rgba(255, 165, 0, 0.8)');
				particleGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');

				ctx.fillStyle = particleGradient;
				ctx.beginPath();
				ctx.arc(-distance, offset, size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.restore();

		// Рисуем счет
		ctx.fillStyle = '#FFF';
		ctx.font = 'bold 24px Arial';
		ctx.textAlign = 'center';
		ctx.fillText(`${score}`, GAME_WIDTH / 2, 40);
	}, [bird, gameStarted, gameOver, pipes, score]);

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
	}, [gameStarted, gameOver, bird, pipes, updateGame, drawGame, score, highScore, onGameOver]);

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
					<div className="message-content">
						<div>Нажмите, чтобы запустить ракету 🚀</div>
						<div className="game-tip">
							Подсказка: Легкими нажатиями удерживайте ракету между лазерами
						</div>
					</div>
				</div>
			)}

			{gameOver && (
				<div className="game-message game-over-message">
					<div className="message-content">
						<div className="game-over-title">Крушение! 💥</div>
						<div className="final-score">Счёт: {score}</div>
						<div className="tap-to-restart">Нажмите, чтобы запустить новую ракету</div>
					</div>
				</div>
			)}
		</div>
	);
}; 