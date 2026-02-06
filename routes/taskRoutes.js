const express = require('express');
const router = express.Router();
const { createTask, getTasks, getMyTasks, updateTask, deleteTask, submitDrawing, approveTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Admin', 'Architect', 'Manager'), createTask)
    .get(getTasks);

router.get('/my', getMyTasks);

router.put('/:id/submit', submitDrawing);
router.put('/:id/approve', authorize('Admin', 'Architect', 'Manager'), approveTask);

router.route('/:id')
    .put(updateTask) // Staff can update their own tasks (logic in controller)
    .delete(authorize('Admin', 'Architect', 'Manager'), deleteTask);

module.exports = router;
