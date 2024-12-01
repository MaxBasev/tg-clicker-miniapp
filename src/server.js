const express = require('express');
const app = express();

app.use(express.json());

// Простой API для работы с данными пользователя
app.get('/api/user/:id', (req, res) => {
	// Здесь будет логика получения данных пользователя
	res.json({
		id: req.params.id,
		name: 'Тестовый пользователь',
		// другие данные
	});
});

app.listen(3000, () => {
	console.log('Сервер запущен на порту 3000');
}); 