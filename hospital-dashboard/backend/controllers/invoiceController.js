const Invoice = require('../models/Invoice');

// Helper function to generate invoice number
const generateInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  
  // Get count of invoices this month to create sequential number
  const count = await Invoice.countDocuments({
    issueDate: {
      $gte: new Date(date.getFullYear(), date.getMonth(), 1),
      $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
    }
  });
  
  return `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('patient', 'name');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get invoices by patient ID
exports.getInvoicesByPatient = async (req, res) => {
  try {
    const invoices = await Invoice.find({ patient: req.params.patientId }).populate('patient', 'name');
    
    if (invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found for this patient' });
    }
    
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single invoice
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('patient', 'name');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    
    // Generate invoice number if not provided
    if (!newInvoice.invoiceNumber) {
      newInvoice.invoiceNumber = await generateInvoiceNumber();
    }
    
    // Calculate the subtotal, total if not provided
    if (!newInvoice.subtotal && newInvoice.items && newInvoice.items.length > 0) {
      newInvoice.subtotal = newInvoice.items.reduce((sum, item) => sum + item.amount, 0);
    }
    
    if (!newInvoice.total) {
      newInvoice.total = newInvoice.subtotal + (newInvoice.tax || 0) - (newInvoice.discount || 0);
    }
    
    const savedInvoice = await newInvoice.save();
    
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an invoice
exports.updateInvoice = async (req, res) => {
  try {
    // Don't allow changes to invoice number
    if (req.body.invoiceNumber) {
      delete req.body.invoiceNumber;
    }
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, paymentDate } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({ message: 'Payment status is required' });
    }
    
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    invoice.paymentStatus = paymentStatus;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentDate) invoice.paymentDate = paymentDate;
    
    const updatedInvoice = await invoice.save();
    
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 