const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // req.user = decoded;
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
// middleware/authmiddleware.js

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, 'Romil', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        req.userId = decoded.userId; // Ensure userId is available
        next();
    });
};

module.exports = authenticate;
