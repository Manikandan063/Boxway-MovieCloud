const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', 'Half Day'],
        default: 'Present',
    },
    checkInTime: Date,
    checkOutTime: Date,
    notes: String,
}, {
    timestamps: true,
});

// Ensure one record per user per day (optional, but good practice)
attendanceSchema.index({ user: 1, date: 1 }, { unique: false }); // Making unique false for now to simplify testing/multiple entries 

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
