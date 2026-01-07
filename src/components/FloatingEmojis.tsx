import React from 'react';
import '../styles/FloatingEmojis.css';

export const FloatingEmojis = () => {
	const [floatingItems, setFloatingItems] = React.useState<{ id: number; emoji: string; style: React.CSSProperties }[]>([]);

	React.useEffect(() => {
		const emojis = ['🎮', '👾', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎫', '🎰'];
		const items = Array.from({ length: 20 }).map((_, i) => ({
			id: i,
			emoji: emojis[Math.floor(Math.random() * emojis.length)],
			style: {
				animationDelay: `${Math.random() * 10}s`,
				left: `${Math.random() * 100}%`,
				fontSize: `${Math.random() * 20 + 10}px`
			}
		}));
		setFloatingItems(items);
	}, []);

	return (
		<div className="floating-emojis-container">
			{floatingItems.map((item) => (
				<div
					key={item.id}
					className="floating-emoji"
					style={item.style}
				>
					{item.emoji}
				</div>
			))}
		</div>
	);
};