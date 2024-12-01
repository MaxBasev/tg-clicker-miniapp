import { Request, Response } from 'express';
import { User } from '../models/User';

export const userController = {
	async updateScore(req: Request, res: Response) {
		try {
			const { telegramId, score, multiplier } = req.body;

			const user = await User.findOneAndUpdate(
				{ telegramId },
				{
					score,
					multiplier,
					lastUpdated: new Date(),
					$setOnInsert: {
						username: req.body.username,
						firstName: req.body.firstName
					}
				},
				{
					new: true,
					upsert: true
				}
			);

			res.json(user);
		} catch (error) {
			res.status(500).json({ error: 'Failed to update score' });
		}
	},

	async getLeaderboard(req: Request, res: Response) {
		try {
			const leaders = await User.find()
				.sort({ score: -1 })
				.limit(10)
				.select('username firstName score');

			res.json(leaders);
		} catch (error) {
			res.status(500).json({ error: 'Failed to get leaderboard' });
		}
	},

	async getUserScore(req: Request, res: Response) {
		try {
			const { telegramId } = req.params;
			const user = await User.findOne({ telegramId });

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			res.json(user);
		} catch (error) {
			res.status(500).json({ error: 'Failed to get user score' });
		}
	}
}; 