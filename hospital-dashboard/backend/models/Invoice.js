const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Consultation', 'Medicine', 'Lab Test', 'Bed Charges', 'Surgery', 'Miscellaneous'],
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partial'],
    default: 'Unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Insurance', 'Bank Transfer','UPI','Debit Card']
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String
  },
  labStatus: {
    type: String,
    enum: ['Completed', 'Not Completed'],
    default: 'Not Completed'
  },
  doctorName: {
    type: String
  },
  patientName: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema); 