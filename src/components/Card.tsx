import React from 'react';
import '../styles/Card.css';

interface CardProps {
	title?: string;
	children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
	return (
		<div className="card">
			{title && <div className="card-title">{title}</div>}
			<div className="card-content">{children}</div>
		</div>
	);
}; 