const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// Create appointment
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    
    // Validate required fields
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new appointment
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date: new Date(date),
      time,
      reason,
      status: 'pending'
    });

    // Save appointment to database
    const savedAppointment = await appointment.save();
    
    // Populate doctor and patient details
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('doctorId', 'name')
      .populate('patientId', 'name');

    res.status(201).json(populatedAppointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get patient's appointments
router.get('/patient', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name')
      .populate('patientId', 'name')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all appointments (for admin/doctor view)
router.get('/doctor', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update appointment status
router.patch('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('patientId', 'name')
     .populate('doctorId', 'name');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Cancel (delete) an appointment by patient
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only allow the patient who booked the appointment to delete it
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    await appointment.deleteOne();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 