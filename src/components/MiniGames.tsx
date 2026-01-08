import React from 'react';
import '../styles/MiniGames.css';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useSound } from '../contexts/SoundContext';

interface MiniGameProps {
	score: number;
	onGame2048Select: () => void;
	onSnakeSelect: () => void;
	onFlappyBirdSelect: () => void;
	onPlatformerSelect: () => void;
	onLeaderboardSelect: () => void;
}

export const MiniGames: React.FC<MiniGameProps> = ({
	score,
	onGame2048Select,
	onSnakeSelect,
	onFlappyBirdSelect,
	onPlatformerSelect,
	onLeaderboardSelect
}) => {
	const { impactOccurred } = useHapticFeedback();
	const { playSound } = useSound();

	const handleGameSelect = (action: () => void) => {
		impactOccurred('light');
		playSound('click');
		action();
	};

	const games = [
		{
			id: '2048',
			name: '2048',
			price: 0,
			reward: 0,
			icon: '🧩',
			description: 'Classic puzzle game',
			action: () => handleGameSelect(onGame2048Select),
			color: '#FF6B6B'
		},
		{
			id: 'snake',
			name: 'Snake',
			price: 0,
			reward: 0,
			icon: '🐍',
			description: 'Collect apples',
			action: () => handleGameSelect(onSnakeSelect),
			color: '#4CAF50'
		},
		{
			id: 'flappybird',
			name: 'Space Rocket',
			price: 0,
			reward: 0,
			icon: '🚀',
			description: 'Avoid obstacles',
			action: () => handleGameSelect(onFlappyBirdSelect),
			color: '#2196F3'
		},
		{
			id: 'platformer',
			name: 'Super Plumber',
			price: 0,
			reward: 0,
			icon: '🍄',
			description: 'Jump & Run',
			action: () => handleGameSelect(onPlatformerSelect),
			color: '#FF5722'
		},
		{
			id: 'leaderboard',
			name: 'Leaderboard',
			price: 0,
			reward: 0,
			icon: '🏆',
			description: 'Top scores',
			action: () => handleGameSelect(onLeaderboardSelect),
			color: '#FFD700'
		}
	];

	return (
		<div className="mini-games">
			<div className="games-grid">
				{games.map((game) => (
					<div
						key={game.id}
						className={`game - card ${score < game.price ? 'disabled' : ''} `}
						onClick={game.action}
						style={{
							'--game-color': game.color
						} as React.CSSProperties}
					>
						<div className="game-icon-wrapper">
							<div className="game-icon">{game.icon}</div>
							<div className="game-icon-glow"></div>
						</div>
						<div className="game-info">
							<h3>{game.name}</h3>
							<p>{game.description}</p>
							{game.price > 0 && (
								<div className="game-price">
									Price: {game.price} 🪙
								</div>
							)}
							{game.reward > 0 && (
								<div className="game-reward">
									Reward: {game.reward} 🪙
								</div>
							)}
						</div>
						<div className="game-card-shine"></div>
					</div>
				))}
			</div>
		</div>
	);
}; 