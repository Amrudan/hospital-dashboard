const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET all invoices
router.get('/', invoiceController.getAllInvoices);

// GET invoices by patient
router.get('/patient/:patientId', invoiceController.getInvoicesByPatient);

// GET invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// POST create new invoice
router.post('/', invoiceController.createInvoice);

// PUT update invoice
router.put('/:id', invoiceController.updateInvoice);

// DELETE invoice
router.delete('/:id', invoiceController.deleteInvoice);

// POST update payment status
router.post('/:id/payment', invoiceController.updatePaymentStatus);

module.exports = router; 