const Pharmacy = require('../models/Pharmacy');

// Get all prescriptions
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Pharmacy.find()
      .populate('patient', 'name')
      .populate('prescribedBy', 'name role')
      .populate('dispensedBy', 'name role');
    
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescriptions by patient ID
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await Pharmacy.find({ patient: req.params.patientId })
      .populate('patient', 'name')
      .populate('prescribedBy', 'name role')
      .populate('dispensedBy', 'name role');
    
    if (prescriptions.length === 0) {
      return res.status(404).json({ message: 'No prescriptions found for this patient' });
    }
    
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single prescription
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Pharmacy.findById(req.params.id)
      .populate('patient', 'name')
      .populate('prescribedBy', 'name role')
      .populate('dispensedBy', 'name role');
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const newPrescription = new Pharmacy(req.body);
    const savedPrescription = await newPrescription.save();
    
    res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a prescription
exports.updatePrescription = async (req, res) => {
  try {
    const updatedPrescription = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.status(200).json(updatedPrescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a prescription
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Pharmacy.findByIdAndDelete(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dispense medication
exports.dispenseMedication = async (req, res) => {
  try {
    const { dispensedBy } = req.body;
    
    if (!dispensedBy) {
      return res.status(400).json({ message: 'Dispensed by ID is required' });
    }
    
    const prescription = await Pharmacy.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    prescription.dispensedBy = dispensedBy;
    prescription.dispensedDate = new Date();
    prescription.status = 'Dispensed';
    
    const updatedPrescription = await prescription.save();
    
    res.status(200).json(updatedPrescription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 