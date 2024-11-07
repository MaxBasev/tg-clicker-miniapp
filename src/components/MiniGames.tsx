import React, { useState } from 'react';
import '../styles/MiniGames.css';
import WebApp from '@twa-dev/sdk';

interface MiniGameProps {
	score: number;
	onScoreChange: (newScore: number) => void;
	onGame2048Select: () => void;
	onSnakeSelect: () => void;
}

export const MiniGames: React.FC<MiniGameProps> = ({ score, onScoreChange, onGame2048Select, onSnakeSelect }) => {
	const [gameResult, setGameResult] = useState<string | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const games = [
		{
			id: 'guess_number',
			name: 'Угадай число',
			price: 50,
			reward: 100,
			icon: '🎲',
			description: 'Испытайте удачу!'
		},
		{
			id: 'coin_flip',
			name: 'Орел или решка',
			price: 25,
			reward: 50,
			icon: '🪙',
			description: 'Подбросить монетку'
		},
		{
			id: '2048',
			name: '2048',
			price: 0,
			reward: 0,
			icon: '🧩',
			description: 'Классическая головоломка',
			customAction: onGame2048Select
		},
		{
			id: 'snake',
			name: 'Змейка',
			price: 0,
			reward: 0,
			icon: '🐍',
			description: 'Классическая змейка',
			customAction: onSnakeSelect
		}
	];

	const playGuessNumber = () => {
		const number = Math.floor(Math.random() * 10) + 1;
		const guess = Math.floor(Math.random() * 10) + 1;

		if (guess === number) {
			onScoreChange(score + games[0].reward);
			setGameResult(`🎉 Выпало число ${number}! Вы выиграли ${games[0].reward} монет!`);
		} else {
			setGameResult(`😔 Выпало число ${number}. Попробуйте еще раз!`);
		}
		setIsPlaying(false);
	};

	const playCoinFlip = () => {
		const result = Math.random() < 0.5;
		const playerChoice = Math.random() < 0.5;

		if (result === playerChoice) {
			onScoreChange(score + games[1].reward);
			setGameResult(`🎉 ${result ? 'Орел' : 'Решка'}! Вы выиграли ${games[1].reward} монет!`);
		} else {
			setGameResult(`😔 ${result ? 'Орел' : 'Решка'}! Попробуйте еще раз!`);
		}
		setIsPlaying(false);
	};

	const startGame = (gameId: string) => {
		const game = games.find(g => g.id === gameId);
		if (!game) return;

		if (game.customAction) {
			game.customAction();
			return;
		}

		if (score < game.price) {
			WebApp.showAlert('Недостаточно монет для игры!');
			return;
		}

		onScoreChange(score - game.price);
		setIsPlaying(true);
		setGameResult(null);

		if (gameId === 'guess_number') {
			playGuessNumber();
		} else if (gameId === 'coin_flip') {
			playCoinFlip();
		}
	};

	return (
		<div className="mini-games">
			<h3 className="mini-games-title">Мини-игры</h3>

			{gameResult && (
				<div className="game-result">
					{gameResult}
				</div>
			)}

			<div className="games-list">
				{games.map(game => (
					<div
						key={game.id}
						className={`game-card ${score < game.price ? 'disabled' : ''}`}
						onClick={() => !isPlaying && startGame(game.id)}
					>
						<div className="game-icon">{game.icon}</div>
						<div className="game-info">
							<h4>{game.name}</h4>
							<p>{game.description}</p>
							<div className="game-price">
								<span>Цена: {game.price} 💰</span>
								<span>Награда: {game.reward} 💰</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}; 