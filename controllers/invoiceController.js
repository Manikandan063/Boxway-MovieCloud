const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private/Admin/Architect
const createInvoice = async (req, res) => {
    try {
        const {
            project: projectId,
            dueDate,
            items,
            tax,
            discount,
            notes,
            status,
            gstNumber
        } = req.body;

        const project = await Project.findById(projectId).populate('client');
        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        // Auto-generate Invoice Number (Simple logic: INV-Timestamp-Random)
        // Ideally checking for duplicates, but timestamp is usually unique enough for low volume
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${dateStr}-${randomNum}`;

        const invoice = await Invoice.create({
            invoiceNumber,
            project: projectId,
            client: project.client._id, // Assign to project's client
            issuedBy: req.user._id,
            dueDate,
            items,
            tax,
            discount,
            notes,
            status: status || 'Draft',
            gstNumber
        });

        return successResponse(res, invoice, 'Invoice created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({})
            .populate('project', 'title')
            .populate('client', 'name')
            .sort({ createdAt: -1 });

        return successResponse(res, invoices, 'Invoices fetched successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('project', 'title description')
            .populate('client', 'name email phone address')
            .populate('issuedBy', 'name');

        if (!invoice) {
            return errorResponse(res, 'Invoice not found', 404);
        }

        return successResponse(res, invoice, 'Invoice details fetched');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private/Admin/Architect
const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return errorResponse(res, 'Invoice not found', 404);
        }

        // Allow updating fields
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Calculate functionality is in 'pre' save, so strictly speaking
        // findByIdAndUpdate might bypass 'pre' save middleware depending on Mongoose version/options.
        // It's safer to retrieve, assign, and save() to trigger middleware, 
        // OR rely on client to send correct totals, OR ensure update logic handles it.
        // For robustness, let's use .save() pattern if items change.

        if (req.body.items || req.body.tax !== undefined || req.body.discount !== undefined || req.body.amountPaid !== undefined) {
            // Re-fetch and save to trigger pre-save calculation logic
            const doc = await Invoice.findById(req.params.id);
            if (req.body.items) doc.items = req.body.items;
            if (req.body.tax !== undefined) doc.tax = req.body.tax;
            if (req.body.discount !== undefined) doc.discount = req.body.discount;
            if (req.body.amountPaid !== undefined) doc.amountPaid = req.body.amountPaid;
            if (req.body.status) doc.status = req.body.status;
            if (req.body.dueDate) doc.dueDate = req.body.dueDate;
            if (req.body.notes) doc.notes = req.body.notes;
            if (req.body.gstNumber) doc.gstNumber = req.body.gstNumber;

            await doc.save();
            return successResponse(res, doc, 'Invoice updated successfully');
        }

        return successResponse(res, updatedInvoice, 'Invoice updated successfully');
    } catch (error) {
        return errorResponse(res, error.message, 400, error);
    }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (invoice) {
            await invoice.deleteOne();
            return successResponse(res, {}, 'Invoice deleted successfully');
        }
        return errorResponse(res, 'Invoice not found', 404);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
};
