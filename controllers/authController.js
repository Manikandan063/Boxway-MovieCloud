// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const { successResponse, errorResponse } = require('../utils/responseHandler');

// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: '30d',
//     });
// };

// // @desc    Auth user & get token
// // @route   POST /api/auth/login
// // @access  Public
// const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });

//         if (user && (await user.matchPassword(password))) {
//             if (!user.isActive) {
//                 return errorResponse(res, 'User is inactive', 403);
//             }

//             res.json({
//                 success: true,
//                 data: {
//                     _id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     role: user.role,
//                     token: generateToken(user._id),
//                 },
//             });
//         } else {
//             return errorResponse(res, 'Invalid email or password', 401);
//         }
//     } catch (error) {
//         return errorResponse(res, error.message, 500, error);
//     }
// };

// // @desc    Get current logged in user
// // @route   GET /api/auth/me
// // @access  Private
// const getMe = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).select('-password');
//         return successResponse(res, user, 'User profile fetched successfully');
//     } catch (error) {
//         return errorResponse(res, error.message, 500, error);
//     }
// };

// module.exports = {
//     login,
//     getMe,
// };


const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'User inactive' });
    }

    res.json({
        success: true,
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            role: user.role,
        },
    });
};

const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = { login, getMe };
