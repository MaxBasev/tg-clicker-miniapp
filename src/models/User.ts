import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	telegramId: {
		type: Number,
		required: true,
		unique: true
	},
	username: String,
	firstName: String,
	score: {
		type: Number,
		default: 0
	},
	multiplier: {
		type: Number,
		default: 1
	},
	lastUpdated: {
		type: Date,
		default: Date.now
	}
});

export const User = mongoose.model('User', userSchema); 