const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    assignedStaff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    currentPhase: {
        type: String,
        enum: ['Concept Design', 'Design Stage', '3D Visualization', 'Approval Drawings', 'Working Drawings', 'Site Execution', 'Completion'],
        default: 'Concept Design',
    },
    phases: [{
        name: {
            type: String,
            enum: ['Concept Design', 'Design Stage', '3D Visualization', 'Approval Drawings', 'Working Drawings', 'Site Execution', 'Completion'],
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
        },
        startDate: Date,
        endDate: Date,
    }],
    status: {
        type: String,
        enum: ['Active', 'Completed', 'On Hold'],
        default: 'Active',
    },
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
