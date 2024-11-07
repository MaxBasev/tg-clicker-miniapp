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
	onScoreChange,
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
		},
		{
			id: 'guess_number',
			name: 'Угадай число',
			price: 50,
			reward: 100,
			icon: '🎲',
			description: 'Испытайте удачу!',
			color: '#9C27B0',
			action: () => {
				if (score >= 50) {
					const result = Math.random() >= 0.5;
					if (result) {
						onScoreChange(score - 50 + 100);
						alert('Победа! +100 монет');
					} else {
						onScoreChange(score - 50);
						alert('Поражение! Попробуйте еще раз');
					}
				} else {
					alert('Недостаточно монет!');
				}
			}
		},
		{
			id: 'coin_flip',
			name: 'Орел или решка',
			price: 25,
			reward: 50,
			icon: '🪙',
			description: 'Подбросить монетку',
			color: '#FFC107',
			action: () => {
				if (score >= 25) {
					const result = Math.random() >= 0.5;
					if (result) {
						onScoreChange(score - 25 + 50);
						alert('Победа! +50 монет');
					} else {
						onScoreChange(score - 25);
						alert('Поражение! Попробуйте еще раз');
					}
				} else {
					alert('Недостаточно монет!');
				}
			}
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