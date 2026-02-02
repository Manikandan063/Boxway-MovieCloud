const express = require('express');
const router = express.Router();
const { createPayroll, calculatePayroll, getAllPayroll, updatePayrollStatus, getMyPayroll } = require('../controllers/payrollController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Admin', 'Accountant'), createPayroll)
    .get(authorize('Admin', 'Accountant'), getAllPayroll);

router.post('/calculate', authorize('Admin', 'Accountant'), calculatePayroll);
router.get('/my', getMyPayroll);

router.route('/:id')
    .put(authorize('Admin', 'Accountant'), updatePayrollStatus);

module.exports = router;
