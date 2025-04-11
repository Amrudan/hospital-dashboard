const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  labNumber: {
    type: String,
    required: true,
    unique: true
  },
  labType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Maintenance'],
    default: 'Available'
  },
  equipment: [{
    name: String,
    status: String,
    lastMaintenance: Date,
    nextMaintenance: Date
  }],
  technicianInCharge: {
    type: String,
    required: true
  },
  operatingHours: {
    start: String,
    end: String
  },
  tests: [{
    testName: String,
    testType: String,
    price: Number,
    duration: String
  }],
  description: String,
  lastMaintenance: Date,
  nextMaintenance: Date,
  specialNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema); 