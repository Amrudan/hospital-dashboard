const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['General', 'ICU', 'Emergency', 'Pediatric', 'Maternity', 'Surgery']
  },
  capacity: {
    type: Number,
    required: true
  },
  occupiedBeds: {
    type: Number,
    default: 0
  },
  floorNumber: {
    type: Number,
    required: true
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  status: {
    type: String,
    enum: ['Operational', 'Under Maintenance', 'Full'],
    default: 'Operational'
  }
}, { timestamps: true });

module.exports = mongoose.model('Ward', wardSchema); 