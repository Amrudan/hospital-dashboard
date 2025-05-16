const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  contact: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  dateAdmitted: {
    type: Date,
    default: Date.now
  },
  medicalHistory: {
    type: String
  },
  assignedWard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward'
  },
  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  patientType: {
    type: String,
    enum: ['Inpatient', 'Outpatient'],
    default: 'Outpatient'
  },
  status: {
    type: String,
    enum: ['Admitted', 'Discharged', 'Critical', 'Stable'],
    default: 'Admitted'
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema); 


