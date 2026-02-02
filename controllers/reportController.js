const Report = require('../models/Report');
const path = require('path');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get Reports Dashboard Stats
// @route   GET /api/reports/dashboard
// @access  Private/Admin/Architect/Accountant
const getReportsDashboard = async (req, res) => {
    try {
        const stats = await Report.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        const recentReports = await Report.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('generatedBy', 'name');

        const data = {
            stats,
            recentReports
        };

        return successResponse(res, data, 'Reports dashboard data fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Create/Generate New Report
// @route   POST /api/reports
// @access  Private/Admin/Architect/Accountant
const createReport = async (req, res) => {
    try {
        const reportData = {
            ...req.body,
            generatedBy: req.user._id,
            // In a real app, this is where you'd trigger PDF generation logic
            fileUrl: req.body.fileUrl || `/reports/generated/${Date.now()}.pdf`
        };

        const report = await Report.create(reportData);
        return successResponse(res, report, 'Report generated successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Get Single Report Details
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('generatedBy', 'name')
            .populate('project', 'title');

        if (!report) return errorResponse(res, 'Report not found', 404);

        return successResponse(res, report, 'Report details fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Download Single Report (PDF)
// @route   GET /api/reports/:id/download
// @access  Private
const downloadReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return errorResponse(res, 'Report not found', 404);

        const filePath = path.resolve(__dirname, '../../', report.fileUrl);

        res.download(filePath, `${report.title}.pdf`, (err) => {
            if (err) {
                if (!res.headersSent) {
                    return errorResponse(res, 'File not found on server', 404);
                }
            }
        });
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Download All Reports (ZIP/Bulk)
// @route   GET /api/reports/download-all
// @access  Private/Admin
const downloadAllReports = async (req, res) => {
    try {
        const filePath = path.resolve(__dirname, '../../reports/compressed/all_reports.zip');

        res.download(filePath, 'Boxway_All_Reports.zip', (err) => {
            if (err) {
                if (!res.headersSent) {
                    return errorResponse(res, 'Bulk report file not found on server', 404);
                }
            }
        });
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    getReportsDashboard,
    createReport,
    getReportById,
    downloadReport,
    downloadAllReports
};
