import { useRef, useEffect, useState, useCallback } from 'react';

// Constants
const GRAVITY = 0.5;
const JUMP_FORCE = -11; // Slightly stronger
const SPEED = 4;
const TILE_SIZE = 32;

// Map Definitions (Simple 0=Air, 1=Ground, 2=Coin, 3=Hazard)
// Map Generator to create a longer, more interesting level
const generateLevel = () => {
    const width = 200;
    const height = 14; // 0-13
    const map: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));

    // Floor (Default solid)
    for (let x = 0; x < width; x++) {
        map[height - 1][x] = 1;
        map[height - 2][x] = 1;
    }

    // --- SECTION 1: Start (0-40) ---
    // Simple platforms
    for (let x = 15; x < 20; x++) map[9][x] = 1;
    for (let x = 15; x < 20; x++) map[8][x] = 2; // Coins on top

    // --- SECTION 2: The Pit (40-45) ---
    for (let x = 40; x < 45; x++) {
        map[height - 1][x] = 0;
        map[height - 2][x] = 0;
    }
    // Floating platform over pit
    map[9][42] = 1;
    map[8][42] = 2; // Risk coin

    // --- SECTION 3: Stairs (50-70) ---
    for (let i = 0; i < 5; i++) {
        for (let h = 0; h <= i; h++) {
            map[height - 3 - h][50 + i] = 1; // Up
            map[height - 3 - h][60 - i] = 1; // Down
        }
    }

    // --- SECTION 4: Floating Islands (70-100) ---
    for (let x = 70; x < 85; x += 4) {
        map[8][x] = 1;
        map[7][x] = 2;
    }

    // --- SECTION 5: High Wall & Pipe-like structures (100-140) ---
    // "Pipe" 1
    map[height - 3][105] = 1; map[height - 4][105] = 1;
    // "Pipe" 2 (Higher)
    map[height - 3][115] = 1; map[height - 4][115] = 1; map[height - 5][115] = 1;
    // Enemy patrolling between them (handled in enemiesRef)

    // --- SECTION 6: The Gauntlet (140-180) --
    // Broken floor
    for (let x = 140; x < 160; x += 2) {
        map[height - 1][x] = 0;
        map[height - 2][x] = 0;
        map[10][x] = 1; // Platform above
    }

    // --- SECTION 7: End (190+) ---
    // Flagpole base
    map[height - 3][190] = 1;

    return map;
};

const LEVEL_1 = generateLevel();

interface PlatformerProps {
    onGameOver: (score: number) => void;
}

interface Enemy {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    type: 'goomba';
    dead: boolean;
}

export const usePlatformerGame = ({ onGameOver }: PlatformerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    // Game State Refs (Mutable)
    const playerRef = useRef({
        x: 50,
        y: 200,
        width: 24,
        height: 28,
        vx: 0,
        vy: 0,
        isGrounded: false,
        facingRight: true
    });

    // Separate enemies ref
    const enemiesRef = useRef<Enemy[]>([
        { id: 1, x: 400, y: 0, width: 30, height: 30, vx: -1, type: 'goomba', dead: false },
        { id: 2, x: 700, y: 0, width: 30, height: 30, vx: -1, type: 'goomba', dead: false },
        { id: 3, x: 1200, y: 0, width: 30, height: 30, vx: -1, type: 'goomba', dead: false }, // Near pipe
        { id: 4, x: 1700, y: 0, width: 30, height: 30, vx: -1, type: 'goomba', dead: false }, // Near end
        { id: 5, x: 2500, y: 0, width: 30, height: 30, vx: -1, type: 'goomba', dead: false }, // (if map was longer)
        // Add more for the new sections
        { id: 6, x: 3000, y: 0, width: 30, height: 30, vx: -1, type: 'goomba', dead: false }, // Late game
        { id: 7, x: 3500, y: 0, width: 30, height: 30, vx: -1, type: 'goomba', dead: false }
    ]);

    const cameraRef = useRef({
        x: 0,
        y: 0
    });

    const controlsRef = useRef({
        left: false,
        right: false,
        jump: false
    });

    // We copy level to manipulate it inside checkCollision (e.g. coins)
    // We copy level to manipulate it inside checkCollision (e.g. coins)
    // NOTE: This runs once on mount, so it's stateful across re-renders
    const levelRef = useRef(LEVEL_1.map(row => [...row]));

    // FORCE RESET LEVEL ON MOUNT (To enable HMR updates and restart)
    useEffect(() => {
        levelRef.current = LEVEL_1.map(row => [...row]);
        // Also reset player position if we wanted to fully restart, but maybe too aggressive?
        // Let's just ensure the map is fresh.
    }, []);

    // --- Physics Helpers ---

    const checkTileCollision = (rect: { x: number, y: number, width: number, height: number }) => {
        const startCol = Math.floor(rect.x / TILE_SIZE);
        const endCol = Math.floor((rect.x + rect.width) / TILE_SIZE);
        const startRow = Math.floor(rect.y / TILE_SIZE);
        const endRow = Math.floor((rect.y + rect.height) / TILE_SIZE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tile = levelRef.current[row]?.[col];
                if (tile === 1) return true; // Solid wall
            }
        }
        return false;
    };

    const checkCoinCollection = (rect: { x: number, y: number, width: number, height: number }) => {
        const startCol = Math.floor(rect.x / TILE_SIZE);
        const endCol = Math.floor((rect.x + rect.width) / TILE_SIZE);
        const startRow = Math.floor(rect.y / TILE_SIZE);
        const endRow = Math.floor((rect.y + rect.height) / TILE_SIZE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (levelRef.current[row]?.[col] === 2) {
                    levelRef.current[row][col] = 0; // Remove coin
                    setScore(prev => prev + 10);
                }
            }
        }
    };

    const jump = useCallback(() => {
        if (playerRef.current.isGrounded) {
            playerRef.current.vy = JUMP_FORCE;
            playerRef.current.isGrounded = false;
        }
    }, []);

    const update = useCallback(() => {
        if (isGameOver) return;

        const p = playerRef.current;
        const c = controlsRef.current;
        const cam = cameraRef.current;

        // --- Player X Movement ---
        if (c.left) {
            p.vx = -SPEED;
            p.facingRight = false;
        } else if (c.right) {
            p.vx = SPEED;
            p.facingRight = true;
        } else {
            p.vx = 0;
        }

        const nextX = p.x + p.vx;
        if (nextX >= 0) {
            if (!checkTileCollision({ ...p, x: nextX })) {
                p.x = nextX;
            }
        }

        // --- Player Y Movement ---
        p.vy += GRAVITY;

        if (!checkTileCollision({ ...p, y: p.y + p.vy })) {
            p.y += p.vy;
            p.isGrounded = false;
        } else {
            if (p.vy > 0) { // Landing
                p.isGrounded = true;
                p.y = Math.floor((p.y + p.vy) / TILE_SIZE) * TILE_SIZE - p.height - 0.01;
            } else { // Head bump
                p.y = Math.ceil((p.y + p.vy) / TILE_SIZE) * TILE_SIZE;
            }
            p.vy = 0;
        }

        // --- Interactions ---
        checkCoinCollection(p);

        // --- Enemies Update ---
        enemiesRef.current.forEach(enemy => {
            if (enemy.dead) return;

            // Apply gravity
            // let evy = 0; // Simplify enemy gravity for now or add vertical logic? 
            // Just simple patrol: stick to ground?
            // Let's assume they are "falling" if in air
            // For now, simpler: Just move X, if wall turn around.

            // Wall check
            if (checkTileCollision({ ...enemy, x: enemy.x + enemy.vx })) {
                enemy.vx *= -1;
            } else {
                enemy.x += enemy.vx;
            }

            // Ground check (snap to ground roughly)
            // Just place them on ground for this simple demo or add gravity later
            if (!checkTileCollision({ ...enemy, y: enemy.y + 10 })) {
                enemy.y += 2; // gravity
            } else {
                // Snap
                const row = Math.floor((enemy.y + enemy.height + 2) / TILE_SIZE);
                enemy.y = row * TILE_SIZE - enemy.height - 0.1;
            }

            // --- Player vs Enemy Collision ---
            // AABB Check
            if (
                p.x < enemy.x + enemy.width &&
                p.x + p.width > enemy.x &&
                p.y < enemy.y + enemy.height &&
                p.y + p.height > enemy.y
            ) {
                // Collision happened. Check if player landed ON TOP (Stomp)
                // Player bottom previous frame was above enemy top? 
                // Using current velocity: if moving DOWN and player bottom is roughly at enemy top

                // Tolerance: player bottom is within top 25% of enemy
                const relativeY = (p.y + p.height) - enemy.y;
                if (p.vy > 0 && relativeY > 0 && relativeY < 15) {
                    // Stomp!
                    enemy.dead = true;
                    p.vy = -5; // Bounce
                    setScore(prev => prev + 100);
                } else {
                    // Dead
                    setIsGameOver(true);
                    onGameOver(score);
                }
            }
        });

        // --- Death by Pit ---
        if (p.y > 600) {
            setIsGameOver(true);
            onGameOver(score);
        }

        // Win Condition (Reach the end)
        if (p.x > 190 * TILE_SIZE) {
            setIsGameOver(true);
            // Big Bonus
            onGameOver(score + 1000);
        }

        // --- Camera ---
        let targetCamX = p.x - 200;
        if (targetCamX < 0) targetCamX = 0;
        cam.x += (targetCamX - cam.x) * 0.1;

    }, [isGameOver, onGameOver, score]);

    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        const cam = cameraRef.current;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.translate(-Math.floor(cam.x), 0);

        // Draw Level
        levelRef.current.forEach((row, rowIndex) => {
            // Cull invisible? Nah
            row.forEach((tile, colIndex) => {
                const x = colIndex * TILE_SIZE;
                const y = rowIndex * TILE_SIZE;
                if (x < cam.x - 50 || x > cam.x + 800) return; // Simple culling

                if (tile === 1) {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillRect(x, y, TILE_SIZE, 5);
                } else if (tile === 2) {
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#FFF';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 2 - 2, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });

        // Draw Player
        const p = playerRef.current;
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(p.x, p.y + 10, p.width, p.height - 10);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(p.x, p.y + 10, p.width, 10);
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(p.x + 4, p.y, p.width - 8, 10);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(p.x + 2, p.y, p.width - 4, 4);
        ctx.fillRect(p.facingRight ? p.x + 12 : p.x, p.y + 2, 6, 2);

        // Draw Enemies
        enemiesRef.current.forEach(enemy => {
            if (enemy.dead) return;
            // Goomba (Brown mushroom thing)
            ctx.fillStyle = '#8d4e28';
            ctx.fillRect(enemy.x, enemy.y + 10, enemy.width, enemy.height - 10); // Body
            ctx.fillStyle = '#f5c6aa'; // Face
            ctx.fillRect(enemy.x + 5, enemy.y + 10, 20, 10);

            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 8, enemy.y + 12, 4, 4);
            ctx.fillRect(enemy.x + 18, enemy.y + 12, 4, 4);

            // Feet animation
            const time = Date.now() / 200;
            const footOffset = Math.sin(time) * 5;
            ctx.fillStyle = '#000';
            if (enemy.vx > 0) {
                ctx.fillRect(enemy.x, enemy.y + enemy.height - 5, 10, 5);
                ctx.fillRect(enemy.x + 20 + footOffset, enemy.y + enemy.height - 5, 10, 5);
            } else {
                ctx.fillRect(enemy.x + 5, enemy.y + enemy.height - 5, 10, 5);
                ctx.fillRect(enemy.x + 20, enemy.y + enemy.height - 5, 10, 5);
            }
        });

        ctx.restore();
    }, []);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const loop = () => {
            update();
            draw(ctx);
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [update, draw]);

    const handleTouchStart = (action: 'left' | 'right' | 'jump') => {
        if (action === 'jump') jump();
        else controlsRef.current[action] = true;
    };

    const handleTouchEnd = (action: 'left' | 'right' | 'jump') => {
        if (action !== 'jump') controlsRef.current[action] = false;
    };

    return {
        canvasRef,
        handleTouchStart,
        handleTouchEnd,
        score,
        isGameOver
    };
};
