const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const patientRoutes = require('./routes/patients');
const staffRoutes = require('./routes/staff');
const wardRoutes = require('./routes/wards');
const labRoutes = require('./routes/lab');
const pharmacyRoutes = require('./routes/pharmacy');
const invoiceRoutes = require('./routes/invoices');

app.use('/api/patients', patientRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/invoices', invoiceRoutes);

// Root route for API check
app.get('/api', (req, res) => {
  res.send('Hospital Management System API is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  }); 