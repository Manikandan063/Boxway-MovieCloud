const express = require('express');
const router = express.Router();
const { registerUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Basic protection for routes, but allow /register to be public temporarily for setup
// router.use(protect); // Temporarily commented out

// Allow Admin and HR to manage users
router.post('/register', registerUser); // Removed authorize for temporary setup
router.get('/', protect, authorize('Admin', 'HR', 'Manager'), getUsers);

router.route('/:id')
    .put(protect, authorize('Admin', 'HR'), updateUser)
    .delete(protect, authorize('Admin', 'HR'), deleteUser);

module.exports = router;
