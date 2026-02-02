// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { errorResponse } = require('../utils/responseHandler');

// const protect = async (req, res, next) => {
//     let token;

//     if (
//         req.headers.authorization &&
//         req.headers.authorization.startsWith('Bearer')
//     ) {
//         try {
//             token = req.headers.authorization.split(' ')[1];

//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             req.user = await User.findById(decoded.id).select('-password');

//             if (!req.user) {
//                 return errorResponse(res, 'Not authorized, user not found', 401);
//             }

//             if (!req.user.isActive) {
//                 return errorResponse(res, 'User is inactive', 403);
//             }

//             next();
//         } catch (error) {
//             return errorResponse(res, 'Not authorized, token failed', 401, error);
//         }
//     }

//     if (!token) {
//         return errorResponse(res, 'Not authorized, no token', 401);
//     }
// };

// const authorize = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return errorResponse(res, `User role ${req.user.role} is not authorized to access this route`, 403);
//         }
//         next();
//     };
// };

// module.exports = { protect, authorize };


const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user.role) {
            return res.status(403).json({ message: 'User role not found' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };
