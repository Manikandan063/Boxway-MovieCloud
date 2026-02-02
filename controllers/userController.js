const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Register a new user (Staff)
// @route   POST /api/users
// @access  Private/Admin
const registerUser = async (req, res) => {
    const { name, email, password, role, contactInfo, salaryDetails, joiningDate } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return errorResponse(res, 'User already exists', 400);
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            contactInfo,
            salaryDetails,
            joiningDate,
        });

        if (user) {
            return successResponse(res, {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }, 'User registered successfully', 201);
        } else {
            return errorResponse(res, 'Invalid user data', 400);
        }
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        return successResponse(res, users, 'Users fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin (or User updating self partially - simplified to Admin for now as per prompt for core mgmt)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.contactInfo = req.body.contactInfo || user.contactInfo;
            user.salaryDetails = req.body.salaryDetails || user.salaryDetails;
            user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Remove password from response
            const responseUser = updatedUser.toObject();
            delete responseUser.password;

            return successResponse(res, responseUser, 'User updated successfully');
        } else {
            return errorResponse(res, 'User not found', 404);
        }
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            return successResponse(res, {}, 'User removed');
        } else {
            return errorResponse(res, 'User not found', 404);
        }
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    registerUser,
    getUsers,
    updateUser,
    deleteUser,
};
