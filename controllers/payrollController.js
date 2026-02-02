const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Generate/Calculate Payroll for a staff member for a month
// @route   POST /api/payroll/calculate
// @access  Private/Admin/Accountant
const calculatePayroll = async (req, res) => {
    const { staffId, month, attendanceDays, allowances } = req.body;

    try {
        const user = await User.findById(staffId);
        if (!user) {
            return errorResponse(res, 'Staff member not found', 404);
        }

        const dailySalary = (user.salaryDetails.basicSalary || 0) / 30; // Assuming 30 days
        const calculatedSalary = (dailySalary * attendanceDays) + (Number(allowances) || user.salaryDetails.allowances || 0);

        const payroll = await Payroll.create({
            staff: staffId,
            month,
            attendanceDays,
            basicSalary: user.salaryDetails.basicSalary,
            allowances: Number(allowances) || user.salaryDetails.allowances,
            totalCalculatedSalary: Math.round(calculatedSalary),
            status: 'Pending',
        });

        return successResponse(res, payroll, 'Payroll calculated and generated successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get All Payroll Records
// @route   GET /api/payroll
// @access  Private/Admin/Accountant
const getAllPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find({}).populate('staff', 'name role');
        return successResponse(res, payrolls, 'Payroll records fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Update Payroll Status (Approve/Pay)
// @route   PUT /api/payroll/:id
// @access  Private/Admin/Accountant
const updatePayrollStatus = async (req, res) => {
    const { status } = req.body; // Pending, Approved, Paid
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (payroll) {
            payroll.status = status;
            if (status === 'Paid') {
                payroll.paymentDate = Date.now();
            }
            await payroll.save();
            return successResponse(res, payroll, 'Payroll status updated');
        }
        return errorResponse(res, 'Payroll record not found', 404);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get My Payroll (For Staff)
// @route   GET /api/payroll/my
// @access  Private
const getMyPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find({ staff: req.user._id });
        return successResponse(res, payrolls, 'My payroll history fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Manually Create Payroll Record
// @route   POST /api/payroll
// @access  Private/Admin/Accountant
const createPayroll = async (req, res) => {
    try {
        const payroll = await Payroll.create(req.body);
        return successResponse(res, payroll, 'Payroll record created manually', 201);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    createPayroll,
    calculatePayroll,
    getAllPayroll,
    updatePayrollStatus,
    getMyPayroll,
};
