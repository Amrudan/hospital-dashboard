const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');

// GET all lab tests
router.get('/', labController.getAllLabTests);

// GET lab tests by patient
router.get('/patient/:patientId', labController.getLabTestsByPatient);

// GET lab test by ID
router.get('/:id', labController.getLabTestById);

// POST create new lab test
router.post('/', labController.createLabTest);

// PUT update lab test
router.put('/:id', labController.updateLabTest);

// DELETE lab test
router.delete('/:id', labController.deleteLabTest);

// POST add test results
router.post('/:id/add-results', labController.addTestResults);

module.exports = router; 