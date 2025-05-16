const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const supplyController = require('../controllers/supplyController');

// SUPPLIES ROUTES
router.get('/supplies', supplyController.getAllSupplies);
router.post('/supplies', supplyController.addSupply);
router.delete('/supplies/:id', supplyController.deleteSupply);

// GET all prescriptions
router.get('/', pharmacyController.getAllPrescriptions);

// GET prescriptions by patient
router.get('/patient/:patientId', pharmacyController.getPrescriptionsByPatient);

// GET prescription by ID
router.get('/:id', pharmacyController.getPrescriptionById);

// POST create new prescription
router.post('/', pharmacyController.createPrescription);

// PUT update prescription
router.put('/:id', pharmacyController.updatePrescription);

// DELETE prescription
router.delete('/:id', pharmacyController.deletePrescription);

// POST dispense medication
router.post('/:id/dispense', pharmacyController.dispenseMedication);

module.exports = router; 