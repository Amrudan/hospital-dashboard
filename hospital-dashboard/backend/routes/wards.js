const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');

// GET all wards
router.get('/', wardController.getAllWards);

// GET ward by ID
router.get('/:id', wardController.getWardById);

// POST create new ward
router.post('/', wardController.createWard);

// PUT update ward
router.put('/:id', wardController.updateWard);

// DELETE ward
router.delete('/:id', wardController.deleteWard);

// POST assign staff to ward
router.post('/:id/assign-staff', wardController.assignStaffToWard);

module.exports = router; 