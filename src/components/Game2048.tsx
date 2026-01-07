import React, { useState, useEffect, useRef } from 'react';
import '../styles/Game2048.css';

interface Game2048Props {
	onWin?: (score: number) => void;
	onGameOver?: (score: number) => void;
	onBack: () => void;
}

export const Game2048: React.FC<Game2048Props> = ({ onWin, onGameOver, onBack }) => {
	const [board, setBoard] = useState<number[][]>([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);

	// Добавляем состояния для отслеживания свайпов
	const touchStart = useRef<{ x: number; y: number } | null>(null);
	const minSwipeDistance = 50; // Минимальное расстояние для свайпа

	// Инициализация игры
	// Инициализация игры
	// Обернем addNewTile в useCallback чтобы использовать в initGame
	const addNewTile = React.useCallback((currentBoard: number[][]) => {
		const available = [];
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (currentBoard[i][j] === 0) {
					available.push({ x: i, y: j });
				}
			}
		}
		if (available.length > 0) {
			const randomCell = available[Math.floor(Math.random() * available.length)];
			currentBoard[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
		}
		return currentBoard;
	}, []);

	const initGame = React.useCallback(() => {
		const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
		addNewTile(addNewTile(newBoard));
		setBoard(newBoard);
		setScore(0);
		setGameOver(false);
	}, [addNewTile]);

	// Инициализация игры
	const initialized = useRef(false);

	useEffect(() => {
		if (!initialized.current) {
			// eslint-disable-next-line
			initGame();
			initialized.current = true;
		}
	}, [initGame]);

	const checkGameOver = React.useCallback((currentBoard: number[][]) => {
		// Проверка на победу (плитка 2048)
		if (currentBoard.some(row => row.some(cell => cell === 2048))) {
			onWin?.(score);
			return;
		}

		// Проверка на возможность хода
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (currentBoard[i][j] === 0) return;
				if (i < 3 && currentBoard[i][j] === currentBoard[i + 1][j]) return;
				if (j < 3 && currentBoard[i][j] === currentBoard[i][j + 1]) return;
			}
		}

		setGameOver(true);
		onGameOver?.(score);
	}, [onWin, onGameOver, score]);

	const moveLeft = React.useCallback((board: number[][]) => {
		let newScore = score;
		const newBoard = board.map(row => {
			const line = row.filter(cell => cell !== 0);
			for (let i = 0; i < line.length - 1; i++) {
				if (line[i] === line[i + 1]) {
					line[i] *= 2;
					newScore += line[i];
					line.splice(i + 1, 1);
				}
			}
			while (line.length < 4) line.push(0);
			return line;
		});
		setScore(newScore);
		return newBoard;
	}, [score]);

	// Move rotate definition here or make it separate pure function outside if possible, 
	// but for now keeping inside component is easiest to avoid large refactor
	const rotate = (board: number[][]) => {
		const newBoard = Array(4).fill(0).map(() => Array(4).fill(0));
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				newBoard[i][j] = board[3 - j][i];
			}
		}
		return newBoard;
	};

	const move = React.useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
		let newBoard = [...board.map(row => [...row])];
		let rotations = 0;

		switch (direction) {
			case 'right':
				rotations = 2;
				break;
			case 'up':
				rotations = 1;
				break;
			case 'down':
				rotations = 3;
				break;
		}

		// Поворачиваем доску
		for (let i = 0; i < rotations; i++) {
			newBoard = rotate(newBoard);
		}

		// Делаем ход влево
		newBoard = moveLeft(newBoard);

		// Поворачиваем обратно
		for (let i = 0; i < (4 - rotations) % 4; i++) {
			newBoard = rotate(newBoard);
		}

		if (JSON.stringify(board) !== JSON.stringify(newBoard)) {
			// Мы создаем копию доски для addNewTile, чтобы не мутировать стейт напрямую
			// Хотя здесь newBoard уже копия
			const boardWithNewTile = addNewTile([...newBoard.map(row => [...row])]);
			setBoard(boardWithNewTile);
			checkGameOver(boardWithNewTile);
		}
	}, [board, addNewTile, checkGameOver, moveLeft]);



	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (gameOver) return;

			switch (e.key) {
				case 'ArrowLeft':
					move('left');
					break;
				case 'ArrowRight':
					move('right');
					break;
				case 'ArrowUp':
					move('up');
					break;
				case 'ArrowDown':
					move('down');
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [gameOver, move]);

	const handleTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		touchStart.current = {
			x: touch.clientX,
			y: touch.clientY
		};
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		e.preventDefault(); // Предотвращаем скролл страницы
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!touchStart.current) return;

		const touch = e.changedTouches[0];
		const deltaX = touch.clientX - touchStart.current.x;
		const deltaY = touch.clientY - touchStart.current.y;

		// Определяем направление свайпа по большему изменению координат
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			if (Math.abs(deltaX) >= minSwipeDistance) {
				if (deltaX > 0) {
					move('right');
				} else {
					move('left');
				}
			}
		} else {
			if (Math.abs(deltaY) >= minSwipeDistance) {
				if (deltaY > 0) {
					move('up');
				} else {
					move('down');
				}
			}
		}

		touchStart.current = null;
	};

	return (
		<div className="game-2048">
			<div className="game-header">
				<button className="back-button" onClick={onBack}>
					← Назад
				</button>
				<div className="score-container">
					<div className="score-label">Счёт</div>
					<div className="score-value">{score}</div>
				</div>
				<button className="new-game-btn" onClick={initGame}>
					Новая игра
				</button>
			</div>

			<div
				className="game-board"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				{board.map((row, i) => (
					row.map((cell, j) => (
						<div key={`${i}-${j}`} className={`tile tile-${cell}`}>
							{cell !== 0 && cell}
						</div>
					))
				))}
			</div>

			<div className="game-instructions">
				<p>Используйте свайпы для перемещения плиток</p>
				<div className="swipe-hints">
					<span>←</span>
					<span>↑</span>
					<span>↓</span>
					<span>→</span>
				</div>
			</div>

			{gameOver && (
				<div className="game-over">
					<div className="game-over-message">
						Игра окончена!
						<div className="final-score">Счёт: {score}</div>
						<button onClick={initGame}>Играть снова</button>
					</div>
				</div>
			)}
		</div>
	);
}; 