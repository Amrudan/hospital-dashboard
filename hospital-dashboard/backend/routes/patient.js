const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient'); // Note the capital 'P' in Patient

// Get all patients
router.get('/list', async (req, res) => {
  try {
    const patients = await Patient.find().select('_id name age gender');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 