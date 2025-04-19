const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const qrcode = require('qrcode');

// Create payment
router.post('/', auth, async (req, res) => {
  try {
    const { appointmentId, amount, paymentMethod, upiId } = req.body;
    
    let payment = new Payment({
      appointmentId,
      amount,
      paymentMethod,
      status: 'pending'
    });

    if (paymentMethod === 'upi') {
      // Generate QR code for UPI payment
      const upiString = `upi://pay?pa=${upiId}&pn=Hospital&am=${amount}&cu=INR`;
      const qrCode = await qrcode.toDataURL(upiString);
      
      payment.upiDetails = {
        qrCode,
        upiId
      };
    }

    await payment.save();
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get payment status
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 