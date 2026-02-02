const User = require('../models/User');
const Project = require('../models/Project');
const Client = require('../models/Client');
const Payroll = require('../models/Payroll');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();
        const activeClients = await Client.countDocuments();
        const staffCount = await User.countDocuments();
        const pendingPayroll = await Payroll.countDocuments({ status: 'Pending' });

        const recentProjects = await Project.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title status currentPhase createdAt');

        const data = {
            totalProjects,
            activeClients,
            staffCount,
            pendingPayroll,
            recentProjects
        };

        return successResponse(res, data, 'Admin dashboard stats fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get Architect Dashboard
// @route   GET /api/dashboard/architect or /api/dashboard/architect/:id
// @access  Private/Architect (Admins can view others)
const getArchitectDashboardStats = async (req, res) => {
    try {
        const targetId = (req.user.role === 'Admin' && req.params.id) ? req.params.id : req.user._id;

        const myProjects = await Project.find({ assignedStaff: targetId })
            .sort({ updatedAt: -1 })
            .limit(5);

        const activeTasks = await Task.countDocuments({ assignedTo: targetId, status: 'In Progress' });

        const data = {
            recentProjects: myProjects, // Showing assigned projects for architect
            activeTasksCount: activeTasks,
            role: 'Architect'
        };
        return successResponse(res, data, 'Architect dashboard stats fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get HR Dashboard
// @route   GET /api/dashboard/hr
// @access  Private/HR
const getHRDashboardStats = async (req, res) => {
    try {
        const totalStaff = await User.countDocuments({ role: { $ne: 'Admin' } });
        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        const data = {
            totalStaff,
            todayAttendanceCount: todayAttendance,
            role: 'HR'
        };
        return successResponse(res, data, 'HR dashboard stats fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get Accountant Dashboard
// @route   GET /api/dashboard/accountant
// @access  Private/Accountant
const getAccountantDashboardStats = async (req, res) => {
    try {
        const pendingPayroll = await Payroll.countDocuments({ status: 'Pending' });
        const totalPaidThisMonth = await Payroll.aggregate([
            { $match: { status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalCalculatedSalary' } } }
        ]);

        const data = {
            pendingPayrollCount: pendingPayroll,
            totalPaidThisMonth: totalPaidThisMonth[0]?.total || 0,
            role: 'Accountant'
        };
        return successResponse(res, data, 'Accountant dashboard stats fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get Intern Dashboard
// @route   GET /api/dashboard/intern or /api/dashboard/intern/:id
// @access  Private/Intern (Admins can view others)
const getInternDashboardStats = async (req, res) => {
    try {
        const targetId = (req.user.role === 'Admin' && req.params.id) ? req.params.id : req.user._id;

        const myTasks = await Task.find({ assignedTo: targetId })
            .populate('project', 'title status currentPhase') // Link to project info
            .sort('-createdAt')
            .limit(10);

        const completedTasks = await Task.countDocuments({ assignedTo: targetId, status: 'Completed' });

        // Get unique project details from the intern's tasks
        const recentProjects = [...new Set(myTasks.map(t => t.project).filter(p => p !== null))].slice(0, 5);

        const data = {
            tasks: myTasks,
            completedTasksCount: completedTasks,
            recentProjects, // Projects the intern is currently working on
            role: 'Intern'
        };
        return successResponse(res, data, 'Intern dashboard stats fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    getAdminDashboardStats,
    getArchitectDashboardStats,
    getHRDashboardStats,
    getAccountantDashboardStats,
    getInternDashboardStats
};
