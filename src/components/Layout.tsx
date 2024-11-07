import React from 'react';
import '../styles/Layout.css';

interface LayoutProps {
	children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="layout">
			{children}
		</div>
	);
}; 