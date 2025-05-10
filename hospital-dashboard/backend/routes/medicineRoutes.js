const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// Get all medicine prices
router.get('/prices', async (req, res) => {
    try {
        const medicines = await Medicine.find({}, 'name price');
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new medicine
router.post('/', async (req, res) => {
    const medicine = new Medicine({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category
    });

    try {
        const newMedicine = await medicine.save();
        res.status(201).json(newMedicine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update medicine price
router.patch('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (req.body.price) medicine.price = req.body.price;
        if (req.body.name) medicine.name = req.body.name;
        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 