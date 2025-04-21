const bcrypt = require('bcrypt');
const Staff = require('./models/staff');

const authController = {
  login: async (req, res) => {
    // Implementation of login logic
  },

  signup: async (req, res) => {
    try {
      const { username, name, contact, age, password, role } = req.body;

      // Check if username or contact already exists
      const existingStaff = await Staff.findOne({
        $or: [{ username }, { contact }]
      });

      if (existingStaff) {
        return res.status(400).json({
          message: 'Username or contact number already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new staff member
      const newStaff = new Staff({
        username,
        name,
        contact,
        age,
        password: hashedPassword,
        role
      });

      await newStaff.save();

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully'
      });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Error during signup' });
    }
  },
};

module.exports = authController; 