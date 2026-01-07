import React from 'react';
import '../styles/MiniGames.css';

interface MiniGameProps {
	score: number;
	onScoreChange: (newScore: number) => void;
	onGame2048Select: () => void;
	onSnakeSelect: () => void;
	onFlappyBirdSelect: () => void;
}

export const MiniGames: React.FC<MiniGameProps> = ({
	score,
	onGame2048Select,
	onSnakeSelect,
	onFlappyBirdSelect
}) => {
	const games = [
		{
			id: '2048',
			name: '2048',
			price: 0,
			reward: 0,
			icon: '🧩',
			description: 'Классическая головоломка',
			action: onGame2048Select,
			color: '#FF6B6B'
		},
		{
			id: 'snake',
			name: 'Змейка',
			price: 0,
			reward: 0,
			icon: '🐍',
			description: 'Собирай яблоки',
			action: onSnakeSelect,
			color: '#4CAF50'
		},
		{
			id: 'flappybird',
			name: 'Космическая ракета',
			price: 0,
			reward: 0,
			icon: '🚀',
			description: 'Преодолей все препятствия',
			action: onFlappyBirdSelect,
			color: '#2196F3'
		}
	];

	return (
		<div className="mini-games">
			<div className="games-grid">
				{games.map((game) => (
					<div
						key={game.id}
						className={`game-card ${score < game.price ? 'disabled' : ''}`}
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
									Цена: {game.price} 🪙
								</div>
							)}
							{game.reward > 0 && (
								<div className="game-reward">
									Награда: {game.reward} 🪙
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