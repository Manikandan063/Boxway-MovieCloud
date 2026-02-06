const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin or Architect who created it
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    items: [{
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
        }
    }],
    subTotal: {
        type: Number,
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    balanceDue: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
        default: 'Draft'
    },
    notes: {
        type: String
    },
    gstNumber: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Middleware to calculate amounts before saving
invoiceSchema.pre('save', async function () {
    // Recalculate item amounts
    let subTotal = 0;
    this.items.forEach(item => {
        item.amount = item.quantity * item.unitPrice;
        subTotal += item.amount;
    });

    this.subTotal = subTotal;

    // Calculate total
    this.totalAmount = this.subTotal + (this.tax || 0) - (this.discount || 0);
    this.balanceDue = this.totalAmount - (this.amountPaid || 0);

    if (this.balanceDue <= 0 && this.totalAmount > 0) {
        this.status = 'Paid';
    } else if (this.amountPaid > 0 && this.balanceDue > 0) {
        this.status = 'Partially Paid';
    }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
