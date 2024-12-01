import { useEffect } from 'react';
import { WebApp } from '@twa-dev/sdk';

function App() {
	useEffect(() => {
		WebApp.ready();
	}, []);

	return (
		<div className="App">
			<header>
				<h1>Личный кабинет</h1>
			</header>
			<main>
				<div className="profile-section">
					<h2>Профиль пользователя</h2>
					<div className="user-info">
						<p>Имя: {WebApp.initDataUnsafe.user?.first_name}</p>
						<p>ID: {WebApp.initDataUnsafe.user?.id}</p>
					</div>
				</div>
			</main>
		</div>
	);
}

export default App; 