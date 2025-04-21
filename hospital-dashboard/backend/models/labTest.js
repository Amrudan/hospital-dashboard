const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['In Process', 'Successfully Completed'],
    default: 'In Process'
  },
  results: {
    type: Object,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabTest', labTestSchema); 