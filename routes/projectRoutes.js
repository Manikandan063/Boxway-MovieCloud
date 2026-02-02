const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Admin', 'Architect'), createProject)
    .get(getProjects);

router.route('/:id')
    .get(getProjectById)
    .put(authorize('Admin', 'Architect'), updateProject)
    .delete(authorize('Admin'), deleteProject);

module.exports = router;
