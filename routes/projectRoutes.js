const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject, updateProjectProgress } = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Admin', 'Architect', 'Manager'), createProject)
    .get(getProjects);

router.route('/:id/progress')
    .put(authorize('Admin', 'Architect', 'Manager'), updateProjectProgress);

router.route('/:id')
    .get(getProjectById)
    .put(authorize('Admin', 'Architect', 'Manager'), updateProject)
    .delete(authorize('Admin'), deleteProject);

module.exports = router;
