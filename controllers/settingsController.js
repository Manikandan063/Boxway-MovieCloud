const Settings = require('../models/Settings');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get System Settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({}); // Create default if not exists
        }
        return successResponse(res, settings, 'System settings fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Update System Settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
        }
        return successResponse(res, settings, 'System settings updated');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
