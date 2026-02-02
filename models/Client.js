const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    siteLocation: {
        type: String,
        required: true,
    },
    contractDetails: {
        type: String, // Could be a file URL or text description
    },
    assignedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    }],
}, {
    timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
