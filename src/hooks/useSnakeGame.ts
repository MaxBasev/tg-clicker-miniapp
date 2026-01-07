import { useState, useEffect, useRef, useCallback } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
];
const INITIAL_DIRECTION: Direction = 'UP';
const GAME_SPEED = 150;

interface UseSnakeGameProps {
    onGameOver?: (score: number) => void;
}

export const useSnakeGame = ({ onGameOver }: UseSnakeGameProps) => {
    const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
    const [food, setFood] = useState<Position>({ x: 5, y: 5 });
    const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const directionRef = useRef(direction);
    const gameLoopRef = useRef<number>();

    // Keep directionRef in sync with state
    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    const generateFood = useCallback((currentSnake: Position[]) => {
        let foodPosition: Position;
        let isValidPosition: boolean;

        do {
            foodPosition = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            // Check collision with snake using coordinates
            const collision = currentSnake.some(segment =>
                segment.x === foodPosition.x && segment.y === foodPosition.y
            );
            isValidPosition = !collision;
        } while (!isValidPosition);

        setFood(foodPosition);
    }, []);

    const resetGame = useCallback(() => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        setIsGameOver(false);
        setScore(0);
        // We pass INITIAL_SNAKE to generateFood to ensure safe initial food placement
        generateFood(INITIAL_SNAKE);
        setIsPaused(false);
    }, [generateFood]);

    const moveSnake = useCallback(() => {
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

            // Wall Collision
            if (
                newHead.x < 0 ||
                newHead.x >= GRID_SIZE ||
                newHead.y < 0 ||
                newHead.y >= GRID_SIZE
            ) {
                setIsGameOver(true);
                if (onGameOver) onGameOver(score);
                return currentSnake;
            }

            // Self Collision
            if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setIsGameOver(true);
                if (onGameOver) onGameOver(score);
                return currentSnake;
            }

            const newSnake = [newHead, ...currentSnake];

            // Food Collision
            if (newHead.x === food.x && newHead.y === food.y) {
                setScore(s => s + 10);
                generateFood(newSnake);
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [isGameOver, isPaused, food, score, onGameOver, generateFood]);

    // Game Loop
    useEffect(() => {
        if (isGameOver || isPaused) return;

        gameLoopRef.current = window.setInterval(moveSnake, GAME_SPEED);
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isGameOver, isPaused, moveSnake]);

    const changeDirection = useCallback((newDir: Direction) => {
        setDirection(prev => {
            if (newDir === 'UP' && prev === 'DOWN') return prev;
            if (newDir === 'DOWN' && prev === 'UP') return prev;
            if (newDir === 'LEFT' && prev === 'RIGHT') return prev;
            if (newDir === 'RIGHT' && prev === 'LEFT') return prev;
            return newDir;
        });
    }, []);

    const togglePause = useCallback(() => {
        setIsPaused(p => !p);
    }, []);

    return {
        snake,
        food,
        score,
        isGameOver,
        isPaused,
        resetGame,
        changeDirection,
        togglePause,
        GRID_SIZE
    };
};
