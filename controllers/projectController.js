const Project = require('../models/Project');
const path = require('path');
const Client = require('../models/Client');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const sendEmail = require('../utils/emailService');


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

// @desc    Update project progress and notify client
// @route   PUT /api/projects/:id/progress
// @access  Private/Admin/Architect
const updateProjectProgress = async (req, res) => {
    try {
        const { currentPhase, status, remarks } = req.body;
        const projectId = req.params.id;

        // Find project and populate client to get phone number
        const project = await Project.findById(projectId).populate('client');

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        // Update Project Phase
        if (currentPhase) {
            project.currentPhase = currentPhase;

            // Manage Phase History
            const phaseIndex = project.phases.findIndex(p => p.name === currentPhase);
            if (phaseIndex > -1) {
                // Update existing phase
                if (status) project.phases[phaseIndex].status = status;
                if (status === 'Completed' && !project.phases[phaseIndex].endDate) {
                    project.phases[phaseIndex].endDate = new Date();
                }
            } else {
                // Add new phase entry if it doesn't exist
                project.phases.push({
                    name: currentPhase,
                    status: status || 'In Progress',
                    startDate: new Date()
                });
            }
        }

        await project.save();

        // Send Email Notification
        let emailMsg = 'Notification skipped (No Client/Email)';
        if (project.client && project.client.email) {
            try {
                const subject = `BOXWAY ARCHITECTURE: Project Update - ${project.title}`;
                const message = `
                    Hello ${project.client.name},

                    We are pleased to inform you that the work status of your project "${project.title}" has been updated.

                    Current Stage: ${currentPhase}
                    Status: ${status || 'In Progress'}
                    ${remarks ? `Note: ${remarks}` : ''}

                    If you have any questions, please contact us.

                    Best Regards,
                    Boxway Architecture Office
                `;

                const html = `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #dddddd; border-radius: 4px; overflow: hidden;">
                        <!-- Black Header -->
                        <div style="background-color: #1a1a1a; color: #ffffff; padding: 20px; text-align: center;">
                            <img src="cid:logo" alt="Logo" style="height: 50px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;">
                            <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px;">BOXWAY ARCHITECTURE</h1>
                            <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.7;">Project Status Update</p>
                        </div>

                        <!-- Body -->
                        <div style="padding: 25px; background-color: #ffffff; color: #333333;">
                            <p>Hello <strong>${project.client.name}</strong>,</p>
                            <p>We are pleased to inform you that the work status of your project "<strong>${project.title}</strong>" has been updated.</p>
                            
                            <!-- Information Box with Side Lines -->
                            <div style="margin-top: 25px; border: 1px solid #eeeeee; border-radius: 5px; background-color: #f9f9f9; padding: 10px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; width: 140px; color: #666666; font-size: 11px; text-transform: uppercase; font-weight: bold;">
                                            Current Stage
                                        </td>
                                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #000000; font-weight: 500;">
                                            : ${currentPhase}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; font-size: 11px; text-transform: uppercase; font-weight: bold;">
                                            Status
                                        </td>
                                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #218838; font-weight: bold;">
                                            : ${status || 'In Progress'}
                                        </td>
                                    </tr>
                                    ${remarks ? `
                                    <tr>
                                        <td style="padding: 12px; color: #666666; font-size: 11px; text-transform: uppercase; font-weight: bold; vertical-align: top;">
                                            Notes
                                        </td>
                                        <td style="padding: 12px; color: #333333; line-height: 1.5;">
                                            : ${remarks}
                                        </td>
                                    </tr>` : ''}
                                </table>
                            </div>

                            <p style="margin-top: 25px; font-size: 14px;">If you have any questions, please contact our office.</p>
                        </div>

                        <!-- Footer -->
                        <div style="padding: 15px; background-color: #f4f4f4; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #eeeeee;">
                            &copy; ${new Date().getFullYear()} Boxway Architecture Office. All rights reserved.
                        </div>
                    </div>
                `;

                // Prepare attachments: Always include the logo, and add any files sent in the request
                const emailAttachments = [
                    {
                        filename: 'logo.png',
                        path: path.join(__dirname, '../assets/logo.png'),
                        cid: 'logo' // Same CID as used in the HTML template
                    },
                    ...(req.body.attachments || [])
                ];

                await sendEmail({
                    email: project.client.email,
                    subject,
                    message,
                    html,
                    attachments: emailAttachments
                });
                emailMsg = 'Notification Sent via Email';
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                emailMsg = `Email Failed: ${emailError.message}`;
            }
        }

        return successResponse(res, project, `Progress Updated. ${emailMsg}`);

    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    updateProjectProgress,
};
