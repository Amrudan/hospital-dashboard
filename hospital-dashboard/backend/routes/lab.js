const express = require('express');
const router = express.Router();
const Lab = require('../models/lab');

// Get all lab tests
router.get('/', async (req, res) => {
  try {
    const tests = await Lab.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    console.error('Error fetching lab tests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new lab test
router.post('/', async (req, res) => {
  try {
    const labTest = new Lab(req.body);
    const savedTest = await labTest.save();
    res.status(201).json(savedTest);
  } catch (err) {
    console.error('Error creating lab test:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update lab test
router.put('/:id', async (req, res) => {
  try {
    const test = await Lab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!test) {
      return res.status(404).json({ error: 'Lab test not found' });
    }
    res.json(test);
  } catch (err) {
    console.error('Error updating lab test:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete lab test
router.delete('/:id', async (req, res) => {
  try {
    const test = await Lab.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ error: 'Lab test not found' });
    }
    res.json({ message: 'Lab test deleted successfully' });
  } catch (err) {
    console.error('Error deleting lab test:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 