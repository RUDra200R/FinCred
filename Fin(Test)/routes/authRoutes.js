const express = require('express');
const { register, login, logout, getProfileData, deleteAccount} = require('../controller/authcontroller');
const authenticate = require('../middleware/authMiddleware');
const { submitContactForm ,calculateBudget, sendOtp, resetPassword } = require('../controller/authcontroller');
const { addExpenseAndNotify} = require('../controller/authcontroller');


const router = express.Router();
router.post('/contact', submitContactForm);
router.post('/budget', calculateBudget);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/sendOpt', sendOtp); 
router.post('/resetpassword', resetPassword);
router.get('/profile', authenticate, getProfileData);
router.delete('/delete', authenticate, deleteAccount);
router.post('/shared-expenses', addExpenseAndNotify);
router.get('/home', authenticate, (req, res) => {
    res.status(200).json({ message: `Welcome user ${req.user.userId}` });
});


module.exports = router;
