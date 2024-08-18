const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    income: { type: Number, required: true },
    housing: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    healthcare: { type: Number, default: 0 },
    personal: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    totalExpenses: { type: Number },
    remainingMoney: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
