const LabTest = require('../models/labTest');

const labController = {
  // Get all lab tests
  getAllLabTests: async (req, res) => {
    try {
      const tests = await LabTest.find();
      res.json(tests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get lab tests by patient
  getLabTestsByPatient: async (req, res) => {
    try {
      const tests = await LabTest.find({ patientId: req.params.patientId });
      res.json(tests);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get lab test by ID
  getLabTestById: async (req, res) => {
    try {
      const test = await LabTest.findById(req.params.id);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.json(test);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Create new lab test
  createLabTest: async (req, res) => {
    try {
      const newTest = new LabTest({
        ...req.body,
        status: "In Process"
      });
      const savedTest = await newTest.save();
      res.status(201).json(savedTest);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Update lab test
  updateLabTest: async (req, res) => {
    try {
      const updatedTest = await LabTest.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedTest) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.json(updatedTest);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Delete lab test
  deleteLabTest: async (req, res) => {
    try {
      const deletedTest = await LabTest.findByIdAndDelete(req.params.id);
      if (!deletedTest) {
        return res.status(404).json({ message: 'Test not found' });
      }
      res.json({ message: 'Test deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Add test results
  addTestResults: async (req, res) => {
    try {
      const test = await LabTest.findById(req.params.id);
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      test.results = req.body.results;
      test.status = "Successfully Completed";
      const updatedTest = await test.save();
      res.json(updatedTest);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = labController;  