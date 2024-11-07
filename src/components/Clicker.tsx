import React, { useState, useEffect } from 'react';
import '../styles/Clicker.css';

interface ClickerProps {
	score: number;
	onScoreChange: (newScore: number) => void;
}

export const Clicker: React.FC<ClickerProps> = ({ score, onScoreChange }) => {
	const [multiplier, setMultiplier] = useState(() => {
		const saved = localStorage.getItem('multiplier');
		return saved ? parseInt(saved) : 1;
	});

	const [clickEffect, setClickEffect] = useState<Array<{
		x: number;
		y: number;
		id: number;
		emoji: string;
	}>>([]);

	const emojis = ['💰', '💎', '✨', '🌟', '⭐️', '🔥', '🚀'];

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const newEffects = Array(3).fill(null).map((_, i) => ({
			x: x + (Math.random() - 0.5) * 40,
			y: y + (Math.random() - 0.5) * 40,
			id: Date.now() + i,
			emoji: emojis[Math.floor(Math.random() * emojis.length)]
		}));

		setClickEffect(prev => [...prev, ...newEffects]);
		onScoreChange(score + multiplier);

		const button = e.currentTarget;
		button.style.transform = 'scale(0.95) rotate(5deg)';
		setTimeout(() => {
			button.style.transform = 'scale(1) rotate(0deg)';
		}, 100);
	};

	useEffect(() => {
		if (clickEffect.length > 0) {
			const timer = setTimeout(() => {
				setClickEffect(prev => prev.slice(3));
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [clickEffect]);

	return (
		<div className="clicker-container">
			<div className="score-display">
				<span className="score-number">{score}</span>
				<span className="score-label">монет</span>
			</div>

			<div className="click-button" onClick={handleClick}>
				<span className="button-emoji">💰</span>
				<div className="button-shine"></div>

				{clickEffect.map(effect => (
					<div
						key={effect.id}
						className="click-effect"
						style={{
							left: effect.x,
							top: effect.y,
						}}
					>
						<span className="effect-emoji">{effect.emoji}</span>
						<span className="effect-number">+{multiplier}</span>
					</div>
				))}
			</div>

			<div className="upgrades">
				<button
					className="upgrade-button"
					onClick={() => {
						if (score >= 100) {
							onScoreChange(score - 100);
							setMultiplier(prev => prev + 1);
						}
					}}
					disabled={score < 100}
				>
					Улучшить (100 монет)
					<span className="upgrade-multiplier">×{multiplier}</span>
				</button>
			</div>
		</div>
	);
}; 