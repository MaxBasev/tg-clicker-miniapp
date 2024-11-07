import React from 'react';
import '../styles/Login.css';

interface LoginProps {
	onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-header">
					<span className="login-emoji">👋</span>
					<h2>Добро пожаловать!</h2>
					<p>Войдите, чтобы продолжить</p>
				</div>
				<button className="telegram-login-button" onClick={onLogin}>
					<span className="telegram-icon">📱</span>
					Войти через Telegram
				</button>
			</div>
		</div>
	);
}; 