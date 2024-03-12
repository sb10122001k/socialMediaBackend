// authMiddleware.js

const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('x-access-token'); 

        if (!token) {
            return res.status(401).json({ auth: false, message: 'No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWTSECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    }
};

module.exports = authenticateUser;
