const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Budget = require('../models/Budget');
const Expense = require('../models/splitmate');
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
            return res.status(400).json({ message: 'Email already exists' });
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

        res.status(201).json({ message: 'Account Created and email sent successfully !' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Password' });
        }

        // Create JWT token with userId in the payload
        const token = jwt.sign(
            { userId: user._id , email: user.email}, 
            process.env.JWT_SECRET || 'Romil', 
            { expiresIn: '1h' }
        );
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ message: 'Logged in successfully' });
    } catch (err) {
        console.error('Login error:', err); 
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
// Delete operation
const deleteAccount = async (req, res) => {
    try {
        const userId = req.userId; 
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: `${user.name} account deleted successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// logout operation
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

// Profile form
const getProfileData = async (req, res) => {
    try {
        const userId = req.userId; // Assuming you have user ID from the JWT token
        const user = await User.findById(userId, 'name email jobProfile salary');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            jobProfile: user.jobProfile,
            salary: user.salary
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Budget form


const calculateBudget = async (req, res) => {
    const { income, housing = 0, food = 0, transportation = 0, education = 0, healthcare = 0, personal = 0, savings = 0 } = req.body;

    try {
        const totalExpenses = housing + food + transportation + education + healthcare + personal + savings;
        const remainingMoney = income - totalExpenses;
        const email = req.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const newBudget = new Budget({
            email,
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
const getUserBudgets = async (req, res) => {
    try {
        const email = req.email; // Get email from the authenticated request
        const budgets = await Budget.find({ email }).sort({ createdAt: -1 }).limit(2); // Fetch last 2 entries
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving budgets', error });
    }
};
  
// contact form

const submitContactForm = async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    try {
        const newContact = new Contact({
            name,
            email,
            phone,
            message,
        });

        await newContact.save();
        res.status(201).json({ message: 'Contact form submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

//splitMate
const addExpenseAndNotify = async (req, res) => {
    const { groupName, description, amount, emails } = req.body;
    const userId = req.userId; // Assuming email is available in the request object

    // Check if all required fields are provided and validate types
    if (!groupName || !description || isNaN(amount) || !emails || !Array.isArray(emails) || !emails.length) {
        return res.status(400).json({ message: 'All fields are required and should be valid.' });
    }

    try {
        // Create a new expense document with the username
        const newExpense = new Expense({
            groupName,
            description,
            amount,
            emails,
            userId:userId
        });

        await newExpense.save();

        // Send notifications to each member about their share
        const memberShare = amount / emails.length;
        for (const email of emails) {
            // Validate email format if necessary
            if (!isValidEmail(email)) {
                console.error(`Invalid email address: ${email}`);
                continue; // Skip invalid email
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `SplitMate Notification: ${groupName}`,
                text: `Hello,

You have a new shared expense: "${description}" in the group "${groupName}". 
Total expense: ₹${amount.toFixed(2)}.
Your share: ₹${memberShare.toFixed(2)}.

Please settle your part of the shared expense at your earliest convenience.

Thank you!`
            };

            // Send email and handle errors
            try {
                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error(`Error sending email to ${email}:`, emailError);
            }
        }
        // await Promise.all(emailPromises);
        // Return a success response
        res.status(201).json({
            message: 'Expense added and notifications sent successfully.'
        });
    } catch (err) {
        // Return a server error message if something goes wrong
        console.error('Error adding expense:', err);
        res.status(500).json({ message: 'Error adding expense.', error: err.message });
    }
};
const getExpenses = async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch expenses that include the user's email
        const expenses = await Expense.find({ userId }).sort({ createdAt: -1 }).limit(2);;

        if (!expenses.length) {
            return res.status(404).json({ message: 'No expenses found for this user.' });
        }

        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses.' });
    }
};



// Utility function to validate email addresses (simple example)
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};



module.exports = { register, login, logout, submitContactForm, calculateBudget, sendOtp, resetPassword, getProfileData, deleteAccount, addExpenseAndNotify, getUserBudgets, getExpenses};
