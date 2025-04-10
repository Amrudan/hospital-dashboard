const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
    trim: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  conductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  results: {
    type: String
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  cost: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema); 