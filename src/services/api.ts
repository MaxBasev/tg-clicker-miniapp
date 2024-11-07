const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const api = {
	async updateScore(userData: {
		telegramId: number;
		username?: string;
		firstName?: string;
		score: number;
		multiplier: number;
	}) {
		const response = await fetch(`${API_URL}/users/score`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData),
		});
		return response.json();
	},

	async getLeaderboard() {
		const response = await fetch(`${API_URL}/users/leaderboard`);
		return response.json();
	},

	async getUserScore(telegramId: number) {
		const response = await fetch(`${API_URL}/users/score/${telegramId}`);
		return response.json();
	}
}; 