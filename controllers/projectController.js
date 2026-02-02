const Project = require('../models/Project');
const Client = require('../models/Client');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin/Architect
const createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);

        // Add project to client's assignedProjects
        if (project.client) {
            await Client.findByIdAndUpdate(project.client, {
                $push: { assignedProjects: project._id }
            });
        }

        return successResponse(res, project, 'Project created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate('client', 'name')
            .populate('assignedStaff', 'name role');
        return successResponse(res, projects, 'Projects fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client')
            .populate('assignedStaff', 'name role email');

        if (project) {
            return successResponse(res, project, 'Project details fetched');
        }
        return errorResponse(res, 'Project not found', 404);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin/Architect
const updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (project) {
            return successResponse(res, project, 'Project updated successfully');
        }
        return errorResponse(res, 'Project not found', 404);

    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (project) {
            await project.deleteOne();
            return successResponse(res, {}, 'Project deleted successfully');
        }
        return errorResponse(res, 'Project not found', 404);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
};
