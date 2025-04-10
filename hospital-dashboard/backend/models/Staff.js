const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Doctor', 'Nurse', 'Admin', 'Lab Technician', 'Pharmacist', 'Receptionist']
  },
  specialization: {
    type: String
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Resigned'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema); 