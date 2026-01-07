import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useSound } from '../contexts/SoundContext';
import '../styles/Game2048.css';

interface Game2048Props {
	onWin?: (score: number) => void;
	onGameOver?: (score: number) => void;
	onBack: () => void;
}

interface Tile {
	id: number;
	x: number;
	y: number;
	value: number;
	isNew?: boolean;
	isMerged?: boolean;
}

export const Game2048: React.FC<Game2048Props> = ({ onWin, onGameOver, onBack }) => {
	const { impactOccurred, notificationOccurred } = useHapticFeedback();
	const { playSound } = useSound();

	const [tiles, setTiles] = useState<Tile[]>([]);
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [won, setWon] = useState(false);

	// Unique ID counter for tiles
	const nextId = useRef(1);
	const initialized = useRef(false);

	const BOARD_SIZE = 4;

	const getEmptyCells = (currentTiles: Tile[]) => {
		const cells: { x: number; y: number }[] = [];
		for (let x = 0; x < BOARD_SIZE; x++) {
			for (let y = 0; y < BOARD_SIZE; y++) {
				if (!currentTiles.some(tile => tile.x === x && tile.y === y)) {
					cells.push({ x, y });
				}
			}
		}
		return cells;
	};

	const addRandomTile = useCallback((currentTiles: Tile[]) => {
		const emptyCells = getEmptyCells(currentTiles);
		if (emptyCells.length === 0) return currentTiles;

		const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
		const newTile: Tile = {
			id: nextId.current++,
			x: randomCell.x,
			y: randomCell.y,
			value: Math.random() < 0.9 ? 2 : 4,
			isNew: true
		};

		return [...currentTiles, newTile];
	}, []);

	const initGame = useCallback(() => {
		setScore(0);
		setGameOver(false);
		setWon(false);
		nextId.current = 1;
		let newTiles: Tile[] = [];
		newTiles = addRandomTile(newTiles);
		newTiles = addRandomTile(newTiles);
		setTiles(newTiles);
	}, [addRandomTile]);

	useEffect(() => {
		if (!initialized.current) {
			initGame();
			initialized.current = true;
		}
	}, [initGame]);

	const checkGameOverState = useCallback((currentTiles: Tile[]) => {
		if (getEmptyCells(currentTiles).length > 0) return false;

		// Check for possible merges
		for (let x = 0; x < BOARD_SIZE; x++) {
			for (let y = 0; y < BOARD_SIZE; y++) {
				const current = currentTiles.find(t => t.x === x && t.y === y);
				if (!current) continue;

				const right = currentTiles.find(t => t.x === x + 1 && t.y === y);
				const down = currentTiles.find(t => t.x === x && t.y === y + 1);

				if (right && right.value === current.value) return false;
				if (down && down.value === current.value) return false;
			}
		}
		return true;
	}, []);

	const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
		if (gameOver) return;

		setTiles(prevTiles => {
			let hasChanged = false;
			let newScore = score;
			const newTiles = [...prevTiles].map(t => ({ ...t, isNew: false, isMerged: false }));

			// Helper to get tile at position in the working set (unused)
			// const getTileAt = (tiles: Tile[], x: number, y: number) => tiles.find(t => t.x === x && t.y === y);

			// Vectors for iteration
			// const vectors = ... (unused)

			const isHorizontal = direction === 'left' || direction === 'right';

			// traverse direction vars
			const traveralsX = [0, 1, 2, 3];
			const traveralsY = [0, 1, 2, 3];

			if (direction === 'right') traveralsX.reverse();
			if (direction === 'down') traveralsY.reverse();

			// Logic: Iterate through columns/rows (perpendicular to move direction)
			// Then iterate along the line of movement to stack tiles

			// Simplified approach: Group by row/col and process each line independently
			const lines: Tile[][] = [];

			if (isHorizontal) {
				for (let y = 0; y < BOARD_SIZE; y++) {
					lines.push(newTiles.filter(t => t.y === y).sort((a, b) => direction === 'left' ? a.x - b.x : b.x - a.x));
				}
			} else {
				for (let x = 0; x < BOARD_SIZE; x++) {
					lines.push(newTiles.filter(t => t.x === x).sort((a, b) => direction === 'up' ? a.y - b.y : b.y - a.y));
				}
			}

			const processedTiles: Tile[] = [];

			lines.forEach(line => {
				let targetPos = (direction === 'left' || direction === 'up') ? 0 : 3;
				const increment = (direction === 'left' || direction === 'up') ? 1 : -1;

				for (let i = 0; i < line.length; i++) {
					const tile = line[i];

					// Check next tile for merge
					if (i < line.length - 1 && line[i + 1].value === tile.value) {
						// Merge
						// const nextTile = line[i + 1]; unused

						// Update position of current tile (it moves to target)
						// And position of next tile (it moves to target too)
						// Then they are replaced by a merged tile

						// In this simulated approach for React state, we effectively remove both and add a new one?
						// Or keep one ID? To animate correctly, we usually keep the 'surviving' ID or create a new one.
						// Best animation: Both slide to the same spot, then are replaced by a new doubled tile.
						// But framer-motion layout animation handles "position change" well.
						// Handling "merge" (2 becoming 1) is trickier.

						// Strategy: Update 'tile' to new position. Mark 'nextTile' as "to be deleted" but moving to same position?
						// Simpler: Just create a new tile state immediately. Framer motion might jump if ID changes.
						// To enable smooth merge:
						// 1. We update `tile` to move to `targetPos`.
						// 2. We update `nextTile` to move to `targetPos`.
						// 3. We create a NEW tile at `targetPos` with doubled value.
						// 4. We rely on React Key behavior.

						// For simplicity in this version without complex layout transitions:
						// We will just update properties.

						const newValue = tile.value * 2;
						newScore += newValue;

						// We create a merged tile.
						// Note: We "recycle" one ID to keep continuity for at least one tile?
						// Let's keep `tile` and upgrade it, and destroy `nextTile`.

						tile.value = newValue;
						tile.isMerged = true;

						if (isHorizontal) tile.x = targetPos; else tile.y = targetPos;

						// Mark nextTile for deletion or handle implicitly by not adding it to processed
						// But to animate the slide of the second tile merging, it needs to 'exist' briefly.
						// For now, simpler implementation: standard 2048 logic, one step per keypress.

						processedTiles.push(tile);
						// Skip next tile
						i++;

						hasChanged = true; // Value changed implies board changed
						// Check position change for the first tile
						// (Technically complex to check every field, assuming true if merge happened)
					} else {
						// Just move
						const oldX = tile.x;
						const oldY = tile.y;

						if (isHorizontal) tile.x = targetPos; else tile.y = targetPos;

						if (tile.x !== oldX || tile.y !== oldY) hasChanged = true;

						processedTiles.push(tile);
					}
					targetPos += increment;
				}
			});

			if (hasChanged) {
				// Check win
				if (processedTiles.some(t => t.value === 2048) && !won) {
					setWon(true);
					onWin?.(newScore);
					playSound('success');
				} else {
					playSound('move');
					impactOccurred('medium');
				}

				setScore(newScore);

				// Add new random tile
				const tilesAfterMove = addRandomTile(processedTiles);

				// Check game over
				if (checkGameOverState(tilesAfterMove)) {
					setGameOver(true);
					playSound('gameover');
					notificationOccurred('error');
					onGameOver?.(newScore);
				}

				return tilesAfterMove;
			}

			return prevTiles;
		});
	}, [gameOver, score, addRandomTile, checkGameOverState, impactOccurred, playSound, won, onWin, onGameOver]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowLeft': move('left'); break;
				case 'ArrowRight': move('right'); break;
				case 'ArrowUp': move('up'); break;
				case 'ArrowDown': move('down'); break;
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [move]);

	// Swipe handling
	const touchStart = useRef<{ x: number; y: number } | null>(null);
	const minSwipeDistance = 50;

	const handleTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		touchStart.current = { x: touch.clientX, y: touch.clientY };
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!touchStart.current) return;
		const touch = e.changedTouches[0];
		const deltaX = touch.clientX - touchStart.current.x;
		const deltaY = touch.clientY - touchStart.current.y;

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			if (Math.abs(deltaX) >= minSwipeDistance) move(deltaX > 0 ? 'right' : 'left');
		} else {
			if (Math.abs(deltaY) >= minSwipeDistance) move(deltaY > 0 ? 'down' : 'up');
		}
	};

	return (
		<div className="game-2048">
			<div className="game-header">
				<button className="back-button" onClick={onBack}>← Back</button>
				<div className="score-container">
					<div className="score-label">Score</div>
					<div className="score-value">{score}</div>
				</div>
				<button className="new-game-btn" onClick={initGame}>New Game</button>
			</div>

			<div
				className="game-board-container"
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				<div className="game-grid-background">
					{Array.from({ length: 16 }).map((_, i) => (
						<div key={i} className="grid-cell" />
					))}
				</div>

				<AnimatePresence>
					{tiles.map(tile => (
						<motion.div
							key={tile.id}
							className={`tile tile-${tile.value}`}
							initial={tile.isNew ? { scale: 0 } : false}
							animate={{
								x: tile.x * 100 + tile.x * 10, // 100px size + 10px gap
								y: tile.y * 100 + tile.y * 10,
								scale: tile.isMerged ? [1, 1.2, 1] : 1
							}}
							transition={{
								x: { type: "spring", stiffness: 400, damping: 25 },
								y: { type: "spring", stiffness: 400, damping: 25 },
								scale: { duration: 0.2 }
							}}
							style={{
								position: 'absolute',
								width: '100px',
								height: '100px',
								top: '10px',  // Offset for padding
								left: '10px' // Offset for padding
							}}
						>
							<div className="tile-inner">{tile.value}</div>
						</motion.div>
					))}
				</AnimatePresence>
			</div>

			{gameOver && (
				<div className="game-over">
					<div className="game-over-message">
						Game Over!
						<div className="final-score">Score: {score}</div>
						<button onClick={initGame}>Play Again</button>
					</div>
				</div>
			)}
		</div>
	);
}; 