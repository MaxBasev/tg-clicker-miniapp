import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { MiniGames } from './components/MiniGames';
import { Game2048 } from './components/Game2048';
import { Snake } from './components/Snake';
import { FlappyBird } from './components/FlappyBird';
import { Layout } from './components/Layout';
import { FloatingEmojis } from './components/FloatingEmojis';
import './styles/App.css';

type Screen = 'games' | 'game2048' | 'snake' | 'flappybird';

// Вспомогательная функция для безопасного показа алертов
const showAlert = (message: string) => {
	try {
		WebApp.showAlert(message);
	} catch {
		console.log('Alert message (development):', message);
	}
};

function App() {
	const [currentScreen, setCurrentScreen] = useState<Screen>('games');
	const [score, setScore] = useState(() => {
		const saved = localStorage.getItem('score');
		return saved ? parseInt(saved) : 0;
	});

	useEffect(() => {
		try {
			WebApp.ready();
			WebApp.setHeaderColor('secondary_bg_color');
		} catch {
			console.log('WebApp not available in development');
		}
	}, []);

	// Update document title based on current screen
	useEffect(() => {
		const titles: Record<Screen, string> = {
			games: 'Procent Mini Games • Telegram',
			game2048: '2048 • Mini Games',
			snake: 'Snake • Mini Games',
			flappybird: 'Flappy Rocket • Mini Games'
		};
		document.title = titles[currentScreen];
	}, [currentScreen]);

	const handleScoreChange = (newScore: number) => {
		setScore(newScore);
		localStorage.setItem('score', newScore.toString());
	};

	const renderHeader = () => {
		let title: string;
		let buttonText: string | null = null;
		let onButtonClick: (() => void) | null = null;

		switch (currentScreen) {
			case 'games':
				title = 'Procent Mini Games';
				buttonText = null; // no back button on games screen
				onButtonClick = null;
				break;
			case 'game2048':
				title = '2048';
				buttonText = '🔙 К играм';
				onButtonClick = () => setCurrentScreen('games');
				break;
			case 'snake':
				title = 'Змейка';
				buttonText = '🔙 К играм';
				onButtonClick = () => setCurrentScreen('games');
				break;
			case 'flappybird':
				title = 'Flappy Bird';
				buttonText = '🔙 К играм';
				onButtonClick = () => setCurrentScreen('games');
				break;
		}

		return (
			<div className="header">
				<h1>{title}</h1>
				{buttonText && onButtonClick && (
					<button
						className="screen-toggle"
						onClick={onButtonClick}
					>
						{buttonText}
					</button>
				)}
			</div>
		);
	};

	const renderScreen = () => {
		switch (currentScreen) {
			case 'games':
				return (
					<div className="games-screen">
						<MiniGames
							score={score}
							onScoreChange={handleScoreChange}
							onGame2048Select={() => setCurrentScreen('game2048')}
							onSnakeSelect={() => setCurrentScreen('snake')}
							onFlappyBirdSelect={() => setCurrentScreen('flappybird')}
						/>
					</div>
				);
			case 'game2048':
				return (
					<div className="game2048-screen">
						<Game2048
							onWin={(gameScore) => {
								handleScoreChange(score + gameScore);
								showAlert(`🎉 Поздравляем! Вы собрали 2048!\nНаграда: ${gameScore} монет!`);
							}}
							onGameOver={(gameScore) => {
								const reward = Math.floor(gameScore / 10);
								handleScoreChange(score + reward);
								showAlert(`Игра окончена!\nВы получаете ${reward} монет!`);
							}}
							onBack={() => setCurrentScreen('games')}
						/>
					</div>
				);
			case 'snake':
				return (
					<div className="snake-screen">
						<Snake
							onGameOver={(gameScore) => {
								const reward = gameScore * 2;
								handleScoreChange(score + reward);
								showAlert(`Игра окончена!\nВы получаете ${reward} монет!`);
							}}
							onBack={() => setCurrentScreen('games')}
						/>
					</div>
				);
			case 'flappybird':
				return (
					<div className="flappybird-screen">
						<FlappyBird
							onGameOver={(gameScore) => {
								const reward = gameScore * 5;
								handleScoreChange(score + reward);
								showAlert(`Игра окончена!\nВы получаете ${reward} монет!`);
							}}
							onBack={() => setCurrentScreen('games')}
						/>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Layout>
			<FloatingEmojis />
			{renderHeader()}
			{renderScreen()}
		</Layout>
	);
}

export default App;
