const Client = require('../models/Client');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Create new client
// @route   POST /api/clients
// @access  Private/Admin/Architect
const createClient = async (req, res) => {
    try {
        const client = await Client.create(req.body);
        return successResponse(res, client, 'Client created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
    try {
        const clients = await Client.find({});
        return successResponse(res, clients, 'Clients fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).populate('assignedProjects');
        if (client) {
            return successResponse(res, client, 'Client details fetched');
        } else {
            return errorResponse(res, 'Client not found', 404);
        }
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private/Admin/Architect
const updateClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (client) {
            return successResponse(res, client, 'Client updated successfully');
        } else {
            return errorResponse(res, 'Client not found', 404);
        }
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (client) {
            await client.deleteOne();
            return successResponse(res, {}, 'Client deleted successfully');
        } else {
            return errorResponse(res, 'Client not found', 404);
        }
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
};
