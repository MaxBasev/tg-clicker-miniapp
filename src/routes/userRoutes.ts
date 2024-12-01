import express from 'express';
import { userController } from '../controllers/userController';

const router = express.Router();

router.post('/score', userController.updateScore);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/score/:telegramId', userController.getUserScore);

export default router; 