const express = require('express');
const router = express.Router();
const { markAttendance, getAllAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', markAttendance);
router.get('/', authorize('Admin', 'HR'), getAllAttendance);
router.get('/my', getMyAttendance);

module.exports = router;
