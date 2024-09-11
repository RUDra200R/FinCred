const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // Make sure this field is always populated from the logged-in user
    },
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
