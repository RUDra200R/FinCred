require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public')); // Serve static files from 'public' directory

// Connect to MongoDB
connectDB();

// Routes
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve other HTML files
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/budget', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'budget.html'));
});
app.get('/wallet', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wallet.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/otp', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'otp.html'));
});

app.get('/password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'resetpassword.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
