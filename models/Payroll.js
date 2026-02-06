const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    month: {
        type: String, // e.g., "January 2024"
        required: true,
    },
    basicSalary: {
        type: Number,
    },
    allowances: {
        type: Number,
        default: 0,
    },
    attendanceDays: {
        type: Number,
        required: true,
    },
    totalDays: {
        type: Number,
        default: 30,
    },
    totalCalculatedSalary: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Paid'],
        default: 'Pending',
    },
    paymentDate: {
        type: Date,
    },
    deductions: {
        type: Number,
        default: 0,
    },
    bonuses: {
        type: Number,
        default: 0,
    },
    netSalary: {
        type: Number,
    },
}, {
    timestamps: true,
});

const Payroll = mongoose.model('Payroll', payrollSchema);
module.exports = Payroll;
