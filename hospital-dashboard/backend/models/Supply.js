const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Supply', supplySchema); 