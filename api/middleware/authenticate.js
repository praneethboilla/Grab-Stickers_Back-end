const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({ message: 'Authentication failed: Token missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userId: decoded.userId };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
}

module.exports = authenticate;