const express = require('express');
const router = express.Router();
const { createClient, getClients, getClientById, updateClient, deleteClient } = require('../controllers/clientController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('Admin', 'Architect'), createClient)
    .get(getClients);

router.route('/:id')
    .get(getClientById)
    .put(authorize('Admin', 'Architect'), updateClient)
    .delete(authorize('Admin'), deleteClient);

module.exports = router;
