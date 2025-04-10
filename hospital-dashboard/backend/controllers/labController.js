const Lab = require('../models/Lab');

// Get all lab tests
exports.getAllLabTests = async (req, res) => {
  try {
    const labTests = await Lab.find()
      .populate('patient', 'name')
      .populate('requestedBy', 'name role')
      .populate('conductedBy', 'name role');
    
    res.status(200).json(labTests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get lab tests by patient ID
exports.getLabTestsByPatient = async (req, res) => {
  try {
    const labTests = await Lab.find({ patient: req.params.patientId })
      .populate('patient', 'name')
      .populate('requestedBy', 'name role')
      .populate('conductedBy', 'name role');
    
    if (labTests.length === 0) {
      return res.status(404).json({ message: 'No lab tests found for this patient' });
    }
    
    res.status(200).json(labTests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single lab test
exports.getLabTestById = async (req, res) => {
  try {
    const labTest = await Lab.findById(req.params.id)
      .populate('patient', 'name')
      .populate('requestedBy', 'name role')
      .populate('conductedBy', 'name role');
    
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    
    res.status(200).json(labTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new lab test
exports.createLabTest = async (req, res) => {
  try {
    const newLabTest = new Lab(req.body);
    const savedLabTest = await newLabTest.save();
    
    res.status(201).json(savedLabTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a lab test
exports.updateLabTest = async (req, res) => {
  try {
    const updatedLabTest = await Lab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedLabTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    
    res.status(200).json(updatedLabTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a lab test
exports.deleteLabTest = async (req, res) => {
  try {
    const labTest = await Lab.findByIdAndDelete(req.params.id);
    
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    
    res.status(200).json({ message: 'Lab test deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add test results
exports.addTestResults = async (req, res) => {
  try {
    const { results, conductedBy, completionDate } = req.body;
    
    if (!results) {
      return res.status(400).json({ message: 'Test results are required' });
    }
    
    const labTest = await Lab.findById(req.params.id);
    
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    
    labTest.results = results;
    if (conductedBy) labTest.conductedBy = conductedBy;
    if (completionDate) labTest.completionDate = completionDate;
    labTest.status = 'Completed';
    
    const updatedLabTest = await labTest.save();
    
    res.status(200).json(updatedLabTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 