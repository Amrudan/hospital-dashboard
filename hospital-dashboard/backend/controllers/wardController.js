const Ward = require('../models/Ward');

// Get all wards
exports.getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find().populate('assignedStaff', 'name role');
    
    // Transform wards data to match frontend expectations
    const transformedWards = wards.map(ward => {
      // Find the nurse from assigned staff
      const nurse = ward.assignedStaff.find(staff => staff.role === 'Nurse');
      
      return {
        _id: ward._id,
        wardNumber: ward.name,
        wardType: ward.type,
        capacity: ward.capacity,
        currentOccupancy: ward.occupiedBeds,
        nurseInCharge: nurse ? nurse.name : 'Not Assigned',
        status: ward.status === 'Operational' ? 'Active' : ward.status === 'Under Maintenance' ? 'Maintenance' : ward.status,
        floor: `${ward.floorNumber}${getOrdinalSuffix(ward.floorNumber)} Floor`,
        description: '',
        equipment: '',
        lastMaintenance: '',
        nextMaintenance: '',
        specialNotes: ''
      };
    });
    
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
      assignedStaff: req.body.nurseInCharge ? [req.body.nurseInCharge] : [] // Add nurse to assignedStaff
    };
    
    const newWard = new Ward(wardData);
    const savedWard = await newWard.save();
    
    // Populate the staff data before sending response
    const populatedWard = await Ward.findById(savedWard._id).populate('assignedStaff', 'name role');
    
    // Transform the response to match frontend expectations
    const transformedWard = {
      _id: populatedWard._id,
      wardNumber: populatedWard.name,
      wardType: populatedWard.type,
      capacity: populatedWard.capacity,
      currentOccupancy: populatedWard.occupiedBeds,
      nurseInCharge: populatedWard.assignedStaff.find(staff => staff.role === 'Nurse')?.name || 'Not Assigned',
      status: populatedWard.status === 'Operational' ? 'Active' : populatedWard.status === 'Under Maintenance' ? 'Maintenance' : populatedWard.status,
      floor: `${populatedWard.floorNumber}${getOrdinalSuffix(populatedWard.floorNumber)} Floor`,
      description: '',
      equipment: '',
      lastMaintenance: '',
      nextMaintenance: '',
      specialNotes: ''
    };
    
    res.status(201).json(transformedWard);
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
      assignedStaff: req.body.nurseInCharge ? [req.body.nurseInCharge] : [] // Update nurse in assignedStaff
    };
    
    const updatedWard = await Ward.findByIdAndUpdate(
      req.params.id,
      wardData,
      { new: true, runValidators: true }
    ).populate('assignedStaff', 'name role');
    
    if (!updatedWard) {
      return res.status(404).json({ message: 'Ward not found' });
    }
    
    // Transform the response to match frontend expectations
    const transformedWard = {
      _id: updatedWard._id,
      wardNumber: updatedWard.name,
      wardType: updatedWard.type,
      capacity: updatedWard.capacity,
      currentOccupancy: updatedWard.occupiedBeds,
      nurseInCharge: updatedWard.assignedStaff.find(staff => staff.role === 'Nurse')?.name || 'Not Assigned',
      status: updatedWard.status === 'Operational' ? 'Active' : updatedWard.status === 'Under Maintenance' ? 'Maintenance' : updatedWard.status,
      floor: `${updatedWard.floorNumber}${getOrdinalSuffix(updatedWard.floorNumber)} Floor`,
      description: '',
      equipment: '',
      lastMaintenance: '',
      nextMaintenance: '',
      specialNotes: ''
    };
    
    res.status(200).json(transformedWard);
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