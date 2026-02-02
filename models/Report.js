const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Progress', 'Financial', 'Safety', 'Material', 'Timeline'],
        required: true,
    },
    description: String,
    fileUrl: {
        type: String, // Path or URL to PDF
        required: true,
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    },
    dateRange: {
        start: Date,
        end: Date,
    }
}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
