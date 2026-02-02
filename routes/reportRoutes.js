const express = require('express');
const router = express.Router();
const {
    getReportsDashboard,
    createReport,
    getReportById,
    downloadReport,
    downloadAllReports
} = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Admin', 'Architect', 'Accountant'), createReport)
    .get(authorize('Admin', 'Architect', 'Accountant'), getReportsDashboard);

router.get('/download-all', authorize('Admin'), downloadAllReports);
router.get('/:id/download', downloadReport);
router.get('/:id', getReportById);

module.exports = router;
