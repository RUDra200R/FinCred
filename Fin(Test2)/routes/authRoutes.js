const express = require('express');
const { register, login, logout, getProfileData, deleteAccount, getUserBudgets} = require('../controller/authcontroller');
const authenticate = require('../middleware/authMiddleware');
const { submitContactForm ,calculateBudget, sendOtp, resetPassword} = require('../controller/authcontroller');
const { addExpenseAndNotify, getExpenses} = require('../controller/authcontroller');


const router = express.Router();
router.post('/contact', submitContactForm);
router.post('/budget', authenticate, calculateBudget);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/sendOpt', sendOtp); 
router.post('/resetpassword', resetPassword);
router.get('/profile', authenticate, getProfileData);
router.get('/budgets', authenticate, getUserBudgets);
router.delete('/delete', authenticate, deleteAccount);
router.post('/shared-expenses',authenticate, addExpenseAndNotify);
router.get('/expense', authenticate, getExpenses);
router.get('/home', authenticate, (req, res) => {
    res.status(200).json({ message: `Welcome user ${req.user.userId}` });
});


module.exports = router;
