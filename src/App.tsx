import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { MainButton } from '@vkruglikov/react-telegram-web-app';
import { Clicker } from './components/Clicker';
import { MiniGames } from './components/MiniGames';
import { Game2048 } from './components/Game2048';
import { Layout } from './components/Layout';
import { FloatingEmojis } from './components/FloatingEmojis';
import './styles/App.css';

type Screen = 'clicker' | 'games' | 'game2048';

function App() {
	const [currentScreen, setCurrentScreen] = useState<Screen>('clicker');
	const [score, setScore] = useState(() => {
		const saved = localStorage.getItem('score');
		return saved ? parseInt(saved) : 0;
	});

	useEffect(() => {
		WebApp.ready();
		WebApp.setHeaderColor('secondary_bg_color');
	}, []);

	const handleScoreChange = (newScore: number) => {
		setScore(newScore);
		localStorage.setItem('score', newScore.toString());
	};

	const handleDonateClick = () => {
		WebApp.showAlert('Спасибо за желание поддержать! 🙏\nК сожалению, сейчас это невозможно 😅');
	};

	const renderHeader = () => {
		let title: string;
		let buttonText: string;
		let onButtonClick: () => void;

		switch (currentScreen) {
			case 'games':
				title = 'Мини-игры';
				buttonText = '🔙 Назад';
				onButtonClick = () => setCurrentScreen('clicker');
				break;
			case 'game2048':
				title = '2048';
				buttonText = '🔙 К играм';
				onButtonClick = () => setCurrentScreen('games');
				break;
			default:
				title = 'Кликер';
				buttonText = '🎮 Играть';
				onButtonClick = () => setCurrentScreen('games');
		}

		return (
			<div className="header">
				<h1>{title}</h1>
				<button
					className="screen-toggle"
					onClick={onButtonClick}
				>
					{buttonText}
				</button>
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
						/>
					</div>
				);
			case 'game2048':
				return (
					<div className="game2048-screen">
						<Game2048
							onWin={(gameScore) => {
								handleScoreChange(score + gameScore);
								WebApp.showAlert(`🎉 Поздравляем! Вы собрали 2048!\nНаграда: ${gameScore} монет!`);
							}}
							onGameOver={(gameScore) => {
								const reward = Math.floor(gameScore / 10);
								handleScoreChange(score + reward);
								WebApp.showAlert(`Игра окончена!\nВы получаете ${reward} монет!`);
							}}
						/>
					</div>
				);
			default:
				return (
					<div className="main-screen">
						<div className="clicker-section">
							<Clicker score={score} onScoreChange={handleScoreChange} />
						</div>
						<div className="actions">
							<MainButton
								text="☕️ Кинуть донат разрабу на кофе ☕️"
								onClick={handleDonateClick}
								color="#FF6B6B"
								textColor="#FFFFFF"
							/>
						</div>
					</div>
				);
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
