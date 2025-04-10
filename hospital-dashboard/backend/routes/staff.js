const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// GET all staff
router.get('/', staffController.getAllStaff);

// GET staff by role
router.get('/role/:role', staffController.getStaffByRole);

// GET staff by ID
router.get('/:id', staffController.getStaffById);

// POST create new staff
router.post('/', staffController.createStaff);

// PUT update staff
router.put('/:id', staffController.updateStaff);

// DELETE staff
router.delete('/:id', staffController.deleteStaff);

module.exports = router; 