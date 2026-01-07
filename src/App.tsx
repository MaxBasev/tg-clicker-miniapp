import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { MiniGames } from './components/MiniGames';
import { Game2048 } from './components/Game2048';
import { Snake } from './components/Snake';
import { FlappyBird } from './components/FlappyBird';
import { Shop, ShopItem } from './components/Shop';
import { Layout } from './components/Layout';
import { FloatingEmojis } from './components/FloatingEmojis';
import { SoundProvider, useSound } from './contexts/SoundContext';
import { ScreenTransition } from './components/ScreenTransition';
import { Leaderboard } from './components/Leaderboard';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useHapticFeedback } from './hooks/useHapticFeedback';
import { useDailyReward } from './hooks/useDailyReward';
import { DailyRewardModal } from './components/DailyRewardModal';
import './styles/App.css';

type Screen = 'games' | 'game2048' | 'snake' | 'flappybird' | 'shop' | 'leaderboard';

// Вспомогательная функция для безопасного показа алертов
const showAlert = (message: string) => {
	try {
		WebApp.showAlert(message);
	} catch {
		console.log('Alert message (development):', message);
	}
};

// Define initial items here or import if shared (defining here for stability)
const INITIAL_SHOP_ITEMS: ShopItem[] = [
	{
		id: 'theme_dark',
		name: 'Dark Mode',
		description: 'Dark theme for the app',
		cost: 0,
		icon: '🌙',
		category: 'theme',
		purchased: true,
		active: true
	},
	{
		id: 'theme_neon',
		name: 'Neon',
		description: 'Bright neon colors',
		cost: 1000,
		icon: '🌈',
		category: 'theme',
		purchased: false,
		active: false
	},
	{
		id: 'skin_snake_golden',
		name: 'Golden Snake',
		description: 'Exclusive skin',
		cost: 500,
		icon: '👑',
		category: 'skin',
		purchased: false,
		active: false
	}
];

function App() {
	const [currentScreen, setCurrentScreen] = useState<Screen>('games');
	const [score, setScore] = useState(() => {
		const saved = localStorage.getItem('score');
		return saved ? parseInt(saved) : 0;
	});

	const { addScore } = useLeaderboard();
	const { isMuted, toggleMute, playSound } = useSound();

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
			flappybird: 'Flappy Rocket • Mini Games',
			shop: 'Shop • Mini Games',
			leaderboard: 'Leaderboard • Mini Games'
		};
		document.title = titles[currentScreen];
	}, [currentScreen]);

	const handleScoreChange = (newScore: number) => {
		setScore(newScore);
		localStorage.setItem('score', newScore.toString());
	};

	// Shop State
	const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
		const saved = localStorage.getItem('shopItems');
		if (saved) {
			try {
				const parsedSaved = JSON.parse(saved) as ShopItem[];
				return INITIAL_SHOP_ITEMS.map(initItem => {
					const savedItem = parsedSaved.find(s => s.id === initItem.id);
					return savedItem ? { ...initItem, purchased: savedItem.purchased, active: savedItem.active } : initItem;
				});
			} catch {
				return INITIAL_SHOP_ITEMS;
			}
		}
		return INITIAL_SHOP_ITEMS;
	});

	const { impactOccurred, notificationOccurred } = useHapticFeedback();

	// Daily Reward
	const { canClaim, claimReward, streak, nextReward } = useDailyReward();
	const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

	const handleClaimReward = () => {
		const reward = claimReward();
		if (reward > 0) {
			handleScoreChange(score + reward);
			impactOccurred('heavy');
			playSound('success');
			notificationOccurred('success');
			// Don't close immediately, let them see the checkmark or animation? 
			// For now close after short delay or let user close.
			setTimeout(() => setIsRewardModalOpen(false), 1500);
		}
	};

	// Theme Application Effect
	useEffect(() => {
		const activeTheme = shopItems.find(item => item.category === 'theme' && item.active);

		// Remove existing theme classes
		document.body.classList.remove('theme-neon');

		if (activeTheme?.id === 'theme_neon') {
			document.body.classList.add('theme-neon');
			try {
				if (WebApp.colorScheme === 'dark') {
					WebApp.setHeaderColor('#0a0a20');
				}
			} catch { }
		} else {
			try {
				WebApp.setHeaderColor('secondary_bg_color');
			} catch { }
		}

		localStorage.setItem('shopItems', JSON.stringify(shopItems));
	}, [shopItems]);

	const handleShopItemClick = (item: ShopItem) => {
		if (item.purchased) {
			// Activate
			setShopItems(prev => prev.map(i => {
				if (i.category === item.category) {
					// Deactivate others of same category, activate this one
					return { ...i, active: i.id === item.id };
				}
				return i;
			}));
			impactOccurred('light');
			playSound('click');
		} else {
			// Buy
			if (score >= item.cost) {
				handleScoreChange(score - item.cost);
				setShopItems(prev => prev.map(i =>
					i.id === item.id ? { ...i, purchased: true } : i
				));
				impactOccurred('medium');
				playSound('success');
				notificationOccurred('success');
			} else {
				impactOccurred('heavy');
				notificationOccurred('warning');
			}
		}
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
				buttonText = '🔙 Back';
				onButtonClick = () => setCurrentScreen('games');
				break;
			case 'snake':
				title = 'Snake';
				buttonText = '🔙 Back';
				onButtonClick = () => setCurrentScreen('games');
				break;
			case 'flappybird':
				title = 'Flappy Bird';
				buttonText = '🔙 Back';
				onButtonClick = () => setCurrentScreen('games');
				break;
			case 'shop':
				title = 'Shop';
				buttonText = '🔙 Back';
				onButtonClick = () => setCurrentScreen('games');
				break;
			case 'leaderboard':
				title = 'Leaderboard';
				buttonText = '🔙 Back';
				onButtonClick = () => setCurrentScreen('games');
				break;
		}

		return (
			<div className="header">
				<h1>{title}</h1>
				<div className="header-controls">
					{currentScreen === 'games' && (
						<>
							<button className="shop-button" onClick={() => setCurrentScreen('shop')}>
								🛒
							</button>
							<button className="daily-button" onClick={() => setIsRewardModalOpen(true)} style={{ marginLeft: 8 }}>
								📅
								{canClaim && <div className="notification-dot" />}
							</button>
						</>
					)}
					<button className="sound-toggle" onClick={toggleMute}>
						{isMuted ? '🔇' : '🔊'}
					</button>
					{buttonText && onButtonClick && (
						<button
							className="screen-toggle"
							onClick={onButtonClick}
						>
							{buttonText}
						</button>
					)}
				</div>
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
							onGame2048Select={() => setCurrentScreen('game2048')}
							onSnakeSelect={() => setCurrentScreen('snake')}
							onFlappyBirdSelect={() => setCurrentScreen('flappybird')}
							onLeaderboardSelect={() => setCurrentScreen('leaderboard')}
						/>
					</div>
				);
			case 'game2048':
				return (
					<div className="game2048-screen">
						<Game2048
							onWin={(gameScore) => {
								handleScoreChange(score + gameScore);
								addScore('game2048', gameScore); // Save to leaderboard
								showAlert(`🎉 Поздравляем! Вы собрали 2048!\nНаграда: ${gameScore} монет!`);
							}}
							onGameOver={(gameScore) => {
								const reward = Math.floor(gameScore / 10);
								handleScoreChange(score + reward);
								addScore('game2048', gameScore); // Save to leaderboard
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
								addScore('snake', gameScore); // Save to leaderboard
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
								addScore('flappybird', gameScore); // Save to leaderboard
								showAlert(`Игра окончена!\nВы получаете ${reward} монет!`);
							}}
							onBack={() => setCurrentScreen('games')}
						/>
					</div>
				);
			case 'shop':
				return (
					<div className="shop-container">
						<Shop
							score={score}
							items={shopItems}
							onItemClick={handleShopItemClick}
							onBack={() => setCurrentScreen('games')}
						/>
					</div>
				);
			case 'leaderboard':
				return (
					<div className="leaderboard-container">
						<Leaderboard onBack={() => setCurrentScreen('games')} />
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
			<ScreenTransition screenKey={currentScreen}>
				{renderScreen()}
			</ScreenTransition>

			<DailyRewardModal
				isOpen={isRewardModalOpen}
				onClose={() => setIsRewardModalOpen(false)}
				onClaim={handleClaimReward}
				streak={streak}
				canClaim={canClaim}
				reward={nextReward}
			/>
		</Layout>
	);
}

export default function AppWrapper() {
	return (
		<SoundProvider>
			<App />
		</SoundProvider>
	);
}
