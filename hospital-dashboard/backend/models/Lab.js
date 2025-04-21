const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  testTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Lab', labSchema); 