const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    card_number: { type: String },
});

const transactionSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    country: { type: String, required: true },
    duration: { type: String, required: true },
    volume: { type: Number, required: true },
    amount: { type: Number, required: true },
    card_number: { type: String },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { User, Transaction };
