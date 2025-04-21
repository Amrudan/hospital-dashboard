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
  nic: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{9}[A-Za-z]$/.test(v);
      },
      message: props => `${props.value} is not a valid NIC number! Must be 9 numbers followed by 1 alphabet.`
    }
  },
  contact: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Must be 10 digits.`
    }
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
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);