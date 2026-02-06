const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Architect', 'HR', 'Accountant', 'Intern', 'Manager'],
        default: 'Intern',
    },
    contactInfo: {
        phone: String,
        address: String,
    },
    designation: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', ''],
        default: "",
    },
    dob: {
        type: Date,
    },
    qualification: {
        type: String,
        default: "",
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String,
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
    },
    joiningDate: {
        type: Date,
        default: Date.now,
    },
    salaryDetails: {
        basicSalary: Number,
        allowances: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
