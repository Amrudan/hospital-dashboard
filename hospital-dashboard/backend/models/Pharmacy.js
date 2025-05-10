const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  }
});

const pharmacySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  medications: [medicationSchema],
  prescriptionDate: {
    type: Date,
    default: Date.now
  },
  dispensedDate: {
    type: Date
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Dispensed', 'Cancelled'],
    default: 'Pending'
  },
  totalCost: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Pharmacy', pharmacySchema); 