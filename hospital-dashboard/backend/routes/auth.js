const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use the same secret key as in auth middleware
const JWT_SECRET = 'hms_2024_secure_jwt_secret_key_987654321';

// Register new user (admin or patient)
router.post('/register', async (req, res) => {
  try {
    const { name, phoneNumber, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      phoneNumber,
      password: hashedPassword,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password, role } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber, role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let staffId = null;
    if (user.role === 'admin' || user.role === 'Doctor' || user.role === 'doctor') {
      // Try to find the staff record for this doctor/admin by name
      const Staff = require('../models/Staff');
      const staff = await Staff.findOne({ name: user.name });
      if (staff) {
        staffId = staff._id;
        user.staffId = staffId;
        await user.save();
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { user: { id: user._id, role: user.role, staffId } },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        staffId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router; 