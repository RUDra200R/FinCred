const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    groupName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    emails: {
        type: [String], // Array of email addresses
        required: true,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;
