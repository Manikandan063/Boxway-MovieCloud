const Attendance = require('../models/Attendance');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Mark Attendance (Check In/Out)
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res) => {
    const { status, notes } = req.body;
    const userId = req.user._id;

    try {
        // Get start and end of current day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Check if attendance already exists for today
        const existingAttendance = await Attendance.findOne({
            user: userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (existingAttendance) {
            // If already checked out
            if (existingAttendance.checkOutTime) {
                return errorResponse(res, 'You have already checked out for today', 400);
            }

            // Perform Check Out
            existingAttendance.checkOutTime = Date.now();
            if (notes) existingAttendance.notes = notes; // Update notes if provided on checkout

            // Calculate status based on duration if needed, restricted to enum or valid values
            // For now, keep original status or update if provided
            if (status) existingAttendance.status = status;

            await existingAttendance.save();
            return successResponse(res, existingAttendance, 'Checked out successfully', 200);

        } else {
            // Perform Check In
            const attendance = await Attendance.create({
                user: userId,
                date: Date.now(),
                status: status || 'Present',
                checkInTime: Date.now(),
                notes,
            });

            return successResponse(res, attendance, 'Checked in successfully', 201);
        }

    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get All Attendance (Admin)
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({}).populate('user', 'name role');
        return successResponse(res, attendance, 'Attendance records fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get My Attendance
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
        return successResponse(res, attendance, 'My attendance records fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    markAttendance,
    getAllAttendance,
    getMyAttendance,
};
