import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Простой API для сохранения счета
app.post('/api/score', (req, res) => {
	// В будущем здесь будет сохранение в БД
	console.log('Received score:', req.body);
	res.json({ success: true });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
}); 