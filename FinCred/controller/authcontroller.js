const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contact = require('../models/contact');
const Budget = require('../models/Budget');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Use environment variables for security
        pass: process.env.GMAIL_PASS  // Use environment variables for security
    }
});
const register = async (req, res) => {
    const { name, email, jobProfile, salary, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, jobProfile, salary, password: hashedPassword });
        await newUser.save();
         // Prepare email options
         const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Welcome to Our FinCred',
            text: `Hello ${name},\n\nThank you for registering on our platform. We are excited to have you on board!`
        };

        // Send the registration email
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Registration successful and email sent!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'Logged in successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// sendotp and reset password
const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Save OTP and its expiration time (5 minutes) in the user's record
        user.resetPasswordOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes from now
        await user.save();

        // Send OTP to user's email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error('Error sending OTP:', err);
        res.status(500).json({ message: 'An error occurred while sending the OTP' });
    }
};

const resetPassword = async (req, res) => {
    const { otp, newPassword } = req.body;

    try {
        // Find the user by OTP
        const user = await User.findOne({
            resetPasswordOtp: otp,
            otpExpires: { $gte: Date.now() } // Ensure OTP is not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Update user's password and clear OTP fields
        user.password = await bcrypt.hash(newPassword, 10); // Hash the password before saving
        user.resetPasswordOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    }
     catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ message: 'An error occurred while resetting the password' });
    }
};


const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

// Budget form


const calculateBudget = async (req, res) => {
    const { income, housing = 0, food = 0, transportation = 0, education = 0, healthcare = 0, personal = 0, savings = 0 } = req.body;

    try {
        const totalExpenses = housing + food + transportation + education + healthcare + personal + savings;
        const remainingMoney = income - totalExpenses;

        const newBudget = new Budget({
            income,
            housing,
            food,
            transportation,
            education,
            healthcare,
            personal,
            savings,
            totalExpenses,
            remainingMoney,
            createdAt: new Date()
        });

        await newBudget.save();

        res.status(201).json({
            income,
            totalExpenses,
            remainingMoney,
            message: 'Budget calculated and saved successfully'
        });
    } catch (error) {
        console.error('Error calculating budget:', error); // Log detailed error
        res.status(500).json({
            message: 'Server error',
            error: error.message // Send detailed error message
        });
    }
};



// contact form

const submitContactForm = async (req, res) => {
    const { name, email, phone, message } = req.body;

    try {
        const newContact = new Contact({ name, email, phone, message });
        await newContact.save();
        res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



module.exports = { register, login, logout, submitContactForm, calculateBudget, sendOtp, resetPassword  };
