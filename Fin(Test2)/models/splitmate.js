const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    email: { type: String, required: true },// user email 
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
