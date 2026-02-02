const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        return successResponse(res, task, 'Task created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const filter = {};
        // If staff, only see own tasks? Or allow seeing all project tasks? 
        // For simplicity, let's let staff see tasks assigned to them if strictly 'Intern', but maybe 'Architect' sees all.
        // Implementing simple filter:
        if (req.query.assignedTo) {
            filter.assignedTo = req.query.assignedTo;
        }
        if (req.query.project) {
            filter.project = req.query.project;
        }

        // If user is basic staff (e.g., Intern), maybe restrict to their own tasks?
        // skipping complex role logic for now, utilizing query params.

        const tasks = await Task.find(filter)
            .populate('project', 'title')
            .populate('assignedTo', 'name');

        return successResponse(res, tasks, 'Tasks fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get My Tasks
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('project', 'title');
        return successResponse(res, tasks, 'My tasks fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Update task (progress, status)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return errorResponse(res, 'Task not found', 404);
        }

        // Check if user is authorized to update (Admin, Architect, or Assigned User)
        // Simplified check:
        if (req.user.role !== 'Admin' && req.user.role !== 'Architect' && task.assignedTo.toString() !== req.user._id.toString()) {
            return errorResponse(res, 'Not authorized to update this task', 403);
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return successResponse(res, updatedTask, 'Task updated successfully');

    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin/Architect
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (task) {
            await task.deleteOne();
            return successResponse(res, {}, 'Task deleted successfully');
        }
        return errorResponse(res, 'Task not found', 404);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Submit drawing for a task
// @route   PUT /api/tasks/:id/submit
// @access  Private (Assigned User)
const submitDrawing = async (req, res) => {
    const { drawingUrl } = req.body;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);

        if (task.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return errorResponse(res, 'Only the assigned staff can submit drawings', 403);
        }

        task.drawingUrl = drawingUrl;
        task.status = 'Review';
        task.approvalStatus = 'Pending';
        await task.save();

        return successResponse(res, task, 'Drawing submitted for review');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Approve or Reject task drawing
// @route   PUT /api/tasks/:id/approve
// @access  Private/Admin/Architect
const approveTask = async (req, res) => {
    const { approvalStatus, approvalNotes } = req.body; // Approved or Rejected
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);

        if (req.user.role !== 'Admin' && req.user.role !== 'Architect') {
            return errorResponse(res, 'Only Admin or Architect can approve/reject tasks', 403);
        }

        task.approvalStatus = approvalStatus;
        task.approvalNotes = approvalNotes;

        if (approvalStatus === 'Approved') {
            task.status = 'Completed';
            task.progress = 100;
        } else if (approvalStatus === 'Rejected') {
            task.status = 'In Progress';
            task.progress = 50; // Set back to progress on rejection
        }

        await task.save();
        return successResponse(res, task, `Task ${approvalStatus} successfully`);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    createTask,
    getTasks,
    getMyTasks,
    updateTask,
    deleteTask,
    submitDrawing,
    approveTask,
};
