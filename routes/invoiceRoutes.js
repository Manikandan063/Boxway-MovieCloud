const express = require('express');
const router = express.Router();
const {
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    deleteInvoice
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Admin', 'Architect', 'Manager'), createInvoice)
    .get(getInvoices);

router.route('/:id')
    .get(getInvoiceById)
    .put(authorize('Admin', 'Architect', 'Manager'), updateInvoice)
    .delete(authorize('Admin'), deleteInvoice);

module.exports = router;
