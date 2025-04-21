const Ward = require('../models/Ward');

// Get all wards
exports.getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find().populate('assignedStaff', 'name role');
    
    // Transform wards data to match frontend expectations
    const transformedWards = wards.map(ward => ({
      _id: ward._id,
      wardNumber: ward.name,
      wardType: ward.type,
      capacity: ward.capacity,
      currentOccupancy: ward.occupiedBeds,
      nurseInCharge: ward.assignedStaff && ward.assignedStaff.length > 0 
        ? ward.assignedStaff.find(staff => staff.role.toLowerCase === 'Nurse')?.name 
        : 'Not Assigned',
      status: ward.status === 'Operational' ? 'Active' : ward.status === 'Under Maintenance' ? 'Maintenance' : ward.status,
      floor: `${ward.floorNumber}${getOrdinalSuffix(ward.floorNumber)} Floor`,
      description: '',
      equipment: '',
      lastMaintenance: '',
      nextMaintenance: '',
      specialNotes: ''
    }));
    
    res.status(200).json(transformedWards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get ordinal suffix
function getOrdinalSuffix(number) {
  const j = number % 10;
  const k = number % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

// Get a single ward
exports.getWardById = async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id).populate('assignedStaff', 'name role');
    
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    // Transform ward data to match frontend expectations
    const transformedWard = {
      _id: ward._id,
      wardNumber: ward.name,
      wardType: ward.type,
      capacity: ward.capacity,
      currentOccupancy: ward.occupiedBeds,
      nurseInCharge: ward.assignedStaff.length > 0 ? ward.assignedStaff[0].name : '',
      status: ward.status === 'Operational' ? 'Active' : ward.status === 'Under Maintenance' ? 'Maintenance' : ward.status,
      floor: `${ward.floorNumber}${getOrdinalSuffix(ward.floorNumber)} Floor`,
      description: '',
      equipment: '',
      lastMaintenance: '',
      nextMaintenance: '',
      specialNotes: ''
    };
    
    res.status(200).json(transformedWard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new ward
exports.createWard = async (req, res) => {
  try {
    // Map frontend fields to backend schema
    const wardData = {
      name: req.body.wardNumber, // Map wardNumber to name
      type: req.body.wardType, // Map wardType to type
      capacity: req.body.capacity,
      occupiedBeds: req.body.currentOccupancy || 0,
      floorNumber: parseInt(req.body.floor.split(' ')[0]) || 1, // Extract number from floor string
      status: req.body.status === 'Active' ? 'Operational' : req.body.status === 'Maintenance' ? 'Under Maintenance' : req.body.status === 'Full' ? 'Full' : 'Operational',
      // Additional fields as needed
      assignedStaff: []
    };
    
    const newWard = new Ward(wardData);
    const savedWard = await newWard.save();
    
    res.status(201).json(savedWard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a ward
exports.updateWard = async (req, res) => {
  try {
    // Map frontend fields to backend schema
    const wardData = {
      name: req.body.wardNumber, // Map wardNumber to name
      type: req.body.wardType, // Map wardType to type
      capacity: req.body.capacity,
      occupiedBeds: req.body.currentOccupancy || 0,
      floorNumber: parseInt(req.body.floor.split(' ')[0]) || 1, // Extract number from floor string
      status: req.body.status === 'Active' ? 'Operational' : req.body.status === 'Maintenance' ? 'Under Maintenance' : req.body.status === 'Full' ? 'Full' : 'Operational',
      // Preserve existing assignedStaff
    };
    
    const updatedWard = await Ward.findByIdAndUpdate(
      req.params.id,
      wardData,
      { new: true, runValidators: true }
    );
    
    if (!updatedWard) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    res.status(200).json(updatedWard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a ward
exports.deleteWard = async (req, res) => {
  try {
    const ward = await Ward.findByIdAndDelete(req.params.id);
    
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    res.status(200).json({ message: 'Ward deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign staff to ward
exports.assignStaffToWard = async (req, res) => {
  try {
    const { staffId } = req.body;
    
    if (!staffId) {
      return res.status(400).json({ message: 'Staff ID is required' });
    }
    
    const ward = await Ward.findById(req.params.id);
    
    if (!ward) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    // Check if staff is already assigned
    if (ward.assignedStaff.includes(staffId)) {
      return res.status(400).json({ message: 'Staff already assigned to this ward' });
    }
    
    ward.assignedStaff.push(staffId);
    const updatedWard = await ward.save();
    
    res.status(200).json(updatedWard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 