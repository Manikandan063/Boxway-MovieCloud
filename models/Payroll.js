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
        required: true,
    },
    allowances: {
        type: Number,
        default: 0,
    },
    attendanceDays: {
        type: Number,
        required: true,
    },
    totalCalculatedSalary: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Paid'],
        default: 'Pending',
    },
    paymentDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Payroll = mongoose.model('Payroll', payrollSchema);
module.exports = Payroll;
