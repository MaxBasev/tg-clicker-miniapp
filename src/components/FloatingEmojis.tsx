import React from 'react';
import '../styles/FloatingEmojis.css';

export const FloatingEmojis: React.FC = () => {
	const emojis = ['💰', '💎', '✨', '🌟', '⭐️', '🔥', '🚀', '💫', '🌠', '⚡️'];

	return (
		<div className="floating-container">
			{Array.from({ length: 20 }).map((_, index) => (
				<div
					key={index}
					className="floating-emoji"
					style={{
						animationDelay: `${Math.random() * 10}s`,
						left: `${Math.random() * 100}%`,
						fontSize: `${Math.random() * 20 + 10}px`
					}}
				>
					{emojis[Math.floor(Math.random() * emojis.length)]}
				</div>
			))}
		</div>
	);
}; 