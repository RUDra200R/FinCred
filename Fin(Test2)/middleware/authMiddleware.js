const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Get token either from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        // Verify the token and extract the userId from it
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Romil');
        req.userId = decoded.userId;
        req.email = decoded.email; 
        next(); 
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticate;
