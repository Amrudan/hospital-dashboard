const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');

// GET all labs
router.get('/', async (req, res) => {
  try {
    const labs = await Lab.find({});
    res.json(labs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single lab
router.get('/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json(lab);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new lab
router.post('/', async (req, res) => {
  const lab = new Lab({
    labNumber: req.body.labNumber,
    labType: req.body.labType,
    status: req.body.status,
    equipment: req.body.equipment,
    technicianInCharge: req.body.technicianInCharge,
    operatingHours: req.body.operatingHours,
    tests: req.body.tests,
    description: req.body.description,
    lastMaintenance: req.body.lastMaintenance,
    nextMaintenance: req.body.nextMaintenance,
    specialNotes: req.body.specialNotes
  });

  try {
    const newLab = await lab.save();
    res.status(201).json(newLab);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update lab
router.put('/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    Object.assign(lab, req.body);
    const updatedLab = await lab.save();
    res.json(updatedLab);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE lab
router.delete('/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    await lab.remove();
    res.json({ message: 'Lab deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 