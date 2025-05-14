const Supply = require('../models/Supply');

// Get all supplies
exports.getAllSupplies = async (req, res) => {
    try {
        const supplies = await Supply.find().populate('soldTo', 'name');
        res.json(supplies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add new supply
exports.addSupply = async (req, res) => {
    const supply = new Supply({
        name: req.body.name,
        category: req.body.category,
        quantity: req.body.quantity,
        unit: req.body.unit,
        price: req.body.price,
        soldTo: req.body.soldTo || null
    });

    try {
        const newSupply = await supply.save();
        await newSupply.populate('soldTo', 'name');
        res.status(201).json(newSupply);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete supply
exports.deleteSupply = async (req, res) => {
    try {
        const supply = await Supply.findByIdAndDelete(req.params.id);
        if (!supply) {
            return res.status(404).json({ message: 'Supply not found' });
        }
        res.json({ message: 'Supply deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 