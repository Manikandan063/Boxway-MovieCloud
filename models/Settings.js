const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'Boxway Architecture' },
    companyAddress: String,
    salaryStructures: {
        intern: { type: Number, default: 0 },
        architect: { type: Number, default: 0 },
        hr: { type: Number, default: 0 },
        accountant: { type: Number, default: 0 }
    },
    defaultProjectPhases: {
        type: [String],
        default: [
            "Concept Design",
            "Schematic Design",
            "Design Development",
            "Construction Documents",
            "Bidding/Negotiation",
            "Construction Administration"
        ]
    },
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    security: {
        twoFactorAuth: { type: Boolean, default: false },
        passwordExpiryDays: { type: Number, default: 90 },
        sessionTimeoutLimit: { type: Number, default: 60 }, // minutes
    },
    notifications: {
        emailNotification: { type: Boolean, default: true },
        taskReminder: { type: Boolean, default: true },
        approvalRequest: { type: Boolean, default: true },
        siteIssueAlert: { type: Boolean, default: true },
    },
    userManagement: {
        allowSelfRegistration: { type: Boolean, default: false },
        defaultUserRole: { type: String, default: 'Intern' },
    }
}, {
    timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
