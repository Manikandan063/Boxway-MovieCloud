const express = require('express');
const router = express.Router();
const {
    getAdminDashboardStats,
    getArchitectDashboardStats,
    getHRDashboardStats,
    getAccountantDashboardStats,
    getInternDashboardStats
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Admin Dashboard
router.get('/admin', authorize('Admin'), getAdminDashboardStats);

// Architect Dashboard (Own or specific ID)
router.get('/architect', authorize('Architect', 'Admin'), getArchitectDashboardStats);
router.get('/architect/:id', authorize('Admin'), getArchitectDashboardStats);

// Intern Dashboard (Own or specific ID)
router.get('/intern', authorize('Intern', 'Admin'), getInternDashboardStats);
router.get('/intern/:id', authorize('Admin'), getInternDashboardStats);

// HR & Accountant
router.get('/hr', authorize('HR', 'Admin'), getHRDashboardStats);
router.get('/accountant', authorize('Accountant', 'Admin'), getAccountantDashboardStats);

// Reports Dashboard
const { getReportsDashboard } = require('../controllers/reportController');
router.get('/reports', authorize('Admin', 'Architect', 'Accountant'), getReportsDashboard);

module.exports = router;
