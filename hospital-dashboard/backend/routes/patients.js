const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// GET all patients
router.get('/', patientController.getAllPatients);

// GET patient by ID
router.get('/:id', patientController.getPatientById);

// POST create new patient
router.post('/', patientController.createPatient);

// PUT update patient
router.put('/:id', patientController.updatePatient);

// DELETE patient
router.delete('/:id', patientController.deletePatient);

module.exports = router; 