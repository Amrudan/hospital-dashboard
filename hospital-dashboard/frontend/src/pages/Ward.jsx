import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Ward.css';
import { Link } from 'react-router-dom';
import { FaBed, FaUserAlt, FaSearch, FaFileExport } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Ward = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWards, setFilteredWards] = useState([]);
  const [stats, setStats] = useState({
    totalWards: 0,
    availableBeds: 0,
    occupancyRate: 0
  });

  const [wardPatients, setWardPatients] = useState({});
  
  const [formData, setFormData] = useState({
    wardNumber: '',
    wardType: '',
    capacity: '',
    currentOccupancy: '',
    nurseInCharge: '',
    status: '',
    floor: '',
    description: '',
    equipment: '',
    lastMaintenance: '',
    nextMaintenance: '',
    specialNotes: ''
  });

  // Fetch wards data
  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/wards');
      console.log('Fetched wards:', response.data);  // Debug log
      
      if (Array.isArray(response.data)) {
        const wardsData = response.data;
        setWards(wardsData);
        
        const totalWards = wardsData.length;
        const availableBeds = wardsData.reduce(
          (acc, ward) => acc + (ward.capacity - (ward.currentOccupancy || 0)), 
          0
        );
        const occupancyRate = Math.round(
          (wardsData.reduce((acc, ward) => acc + (ward.currentOccupancy || 0), 0) / 
           wardsData.reduce((acc, ward) => acc + ward.capacity, 0)) * 100
        );
        
        setStats({
          totalWards,
          availableBeds,
          occupancyRate: isNaN(occupancyRate) ? 0 : occupancyRate
        });
        
        // After wards are loaded, fetch patients and bed allocations
        await Promise.all([
          fetchWardPatients(),
          fetchBedAllocationData(wardsData)
        ]);
      } else if (response.data.wards && Array.isArray(response.data.wards)) {
        setWards(response.data.wards);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error('Error fetching wards:', err);  // Debug log
      setError('Failed to fetch wards');
    } finally {
      setLoading(false);
    }
  };

  const fetchWardPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      const patients = response.data;
      
      // Group patients by ward
      const patientsByWard = {};
      
      patients.forEach(patient => {
        if (patient.patientType === 'Inpatient') {
          if (patient.wardId && patient.bedNumber) {
            // Allocated patient (has both ward and bed)
            if (!patientsByWard[patient.wardId]) {
              patientsByWard[patient.wardId] = [];
            }
            patientsByWard[patient.wardId].push(patient);
          }
        }
      });
      
      console.log('Ward patients data:', patientsByWard);
      setWardPatients(patientsByWard);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form input changed:', name, value);  // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (ward) => {
    console.log('Editing ward:', ward);  // Debug log
    setSelectedWard(ward);
    setFormData(ward);
    setIsEditing(true);
  };

  const handleDelete = async (wardId) => {
    if (window.confirm('Are you sure you want to delete this ward?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/wards/${wardId}`);
        console.log('Deleted ward:', wardId);  // Debug log
        alert('Ward deleted successfully!');
        fetchWards(); // Refresh the list
        if (selectedWard?._id === wardId) {
          handleCancel();
        }
      } catch (err) {
        console.error('Error deleting ward:', err);  // Debug log
        setError('Failed to delete ward');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);  // Debug log
    setError(null); // Clear any previous errors
    
    try {
      setLoading(true);
      // Validation
      if (!formData.wardNumber || !formData.wardType || !formData.capacity || !formData.floor) {
        setError('Please fill in all required fields');
        return;
      }

      // Convert capacity and occupancy to numbers
      const wardData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        currentOccupancy: formData.currentOccupancy ? parseInt(formData.currentOccupancy) : 0
      };

      // Validate occupancy doesn't exceed capacity
      if (wardData.currentOccupancy > wardData.capacity) {
        setError('Current occupancy cannot exceed ward capacity');
        return;
      }

      let response;
      if (isEditing) {
        // Update existing ward
        response = await axios.put(`http://localhost:5000/api/wards/${selectedWard._id}`, wardData);
        console.log('Updated ward:', response.data);  // Debug log
        alert('Ward updated successfully!');
      } else {
        // Add new ward
        response = await axios.post('http://localhost:5000/api/wards', wardData);
        console.log('Added new ward:', response.data);  // Debug log
        alert(`New ward ${response.data.wardNumber} added successfully!`);
      }

      await fetchWards(); // Refresh the list
      handleCancel(); // Reset form
    } catch (err) {
      console.error('Error saving ward:', err);  // Debug log
      const errorMessage = err.response?.data?.message || 'Failed to save ward. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedWard(null);
    setIsEditing(false);
    setFormData({
      wardNumber: '',
      wardType: '',
      capacity: '',
      currentOccupancy: '',
      nurseInCharge: '',
      status: '',
      floor: '',
      description: '',
      equipment: '',
      lastMaintenance: '',
      nextMaintenance: '',
      specialNotes: ''
    });
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredWards([]);
      return;
    }

    // Filter wards based on ward number
    const results = wards.filter(ward => 
      ward.wardNumber.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredWards(results);

    if (results.length === 0) {
      alert('No wards found with this number');
    }
  };

  const fetchBedAllocationData = async (wardsData = null) => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      const patients = response.data;
      
      const bedAllocations = {};
      
      // Use passed wards data or current state
      const wardsToProcess = wardsData || wards;
      
      wardsToProcess.forEach(ward => {
        const wardId = ward._id;
        
        bedAllocations[wardId] = {
          wardNumber: ward.wardNumber,
          wardType: ward.wardType,
          capacity: ward.capacity,
          beds: []
        };
        
        for (let i = 1; i <= ward.capacity; i++) {
          bedAllocations[wardId].beds.push({
            bedNumber: i,
            status: 'Available',
            patient: null
          });
        }
      });
      
      // Filter only inpatients with ward/bed assignments
      const activeInpatients = patients.filter(patient => {
        // Check patient type and status
        const isInpatient = patient.patientType === 'Inpatient';
        const isNotDischarged = patient.status !== 'Discharged';
        
        // Check various possible ward ID fields (handle different data structures)
        const hasWardId = patient.wardId || patient.assignedWard;
        
        // Check if bed number exists
        const hasBedNumber = patient.bedNumber && parseInt(patient.bedNumber) > 0;
        
        return isInpatient && isNotDischarged && hasWardId && hasBedNumber;
      });
      
      console.log('Active inpatients for bed allocation:', activeInpatients.length);
      
      // Process each qualifying patient
      activeInpatients.forEach(patient => {
        // Get wardId from either wardId or assignedWard field
        const wardId = patient.wardId || (patient.assignedWard ? patient.assignedWard._id || patient.assignedWard : null);
        const bedNumber = parseInt(patient.bedNumber);
        
        if (wardId && bedAllocations[wardId] && bedNumber && bedNumber <= bedAllocations[wardId].capacity) {
          const bedIndex = bedNumber - 1;
          bedAllocations[wardId].beds[bedIndex] = {
            bedNumber,
            status: 'Occupied',
            patient: {
              id: patient._id,
              name: patient.name,
              age: patient.age,
              gender: patient.gender,
              admissionDate: patient.createdAt || patient.dateAdmitted || new Date(),
              status: patient.status || 'Admitted',
              type: patient.patientType || 'Inpatient'
            }
          };
        }
      });
      
      // Debug output
      Object.keys(bedAllocations).forEach(wardId => {
        const occupiedCount = bedAllocations[wardId].beds.filter(bed => bed.status === 'Occupied').length;
        console.log(`Ward ${bedAllocations[wardId].wardNumber}: ${occupiedCount} occupied beds`);
      });
      
      setWardBedAllocations(bedAllocations);
    } catch (error) {
      console.error('Error fetching bed allocation data:', error);
      setError('Failed to fetch bed allocation data');
    }
  };

  const [wardBedAllocations, setWardBedAllocations] = useState({});

  const togglePatientsList = (wardId) => {
    // If opening the ward, refresh the patient data
    if (!showPatients[wardId]) {
      // Refresh patient data for this specific ward
      Promise.all([
        fetchWardPatients(),
        fetchBedAllocationData()
      ]).then(() => {
        console.log(`Refreshed data for ward ${wardId}`);
      }).catch(err => {
        console.error('Error refreshing ward data:', err);
      });
    }
    
    setShowPatients(prev => ({
      ...prev,
      [wardId]: !prev[wardId]
    }));
  };

  const [showPatients, setShowPatients] = useState({});

  const exportToCSV = (wardId) => {
    const ward = wardBedAllocations[wardId];
    
    if (!ward) {
      toast.error('Ward data not available');
      return;
    }
    
    // Get only occupied beds
    const occupiedBeds = ward.beds.filter(bed => bed.status === 'Occupied');
    
    if (occupiedBeds.length === 0) {
      toast.info('No occupied beds to export');
      return;
    }
    
    // Create CSV content
    let csvContent = 'Bed Number,Patient Name,Age,Gender,Admission Date,Status\n';
    
    // Sort occupied beds by bed number
    occupiedBeds.sort((a, b) => a.bedNumber - b.bedNumber)
      .forEach(bed => {
        const patientData = bed.patient;
        const row = [
          bed.bedNumber,
          patientData.name,
          patientData.age,
          patientData.gender,
          new Date(patientData.admissionDate).toLocaleDateString(),
          patientData.status
        ].join(',');
        
        csvContent += row + '\n';
      });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${ward.wardNumber}-Occupied-Beds.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Exported occupied beds data to CSV');
  };

  return (
    <div className="ward-management-page">
      <h2>Ward Management</h2>
      
      <div className="search-section">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by Ward Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            className="search-btn"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      <div className="ward-stats">
        <div className="stat-card">
          <h4>Total Wards</h4>
          <p>{stats.totalWards}</p>
        </div>
        <div className="stat-card">
          <h4>Available Beds</h4>
          <p>{stats.availableBeds}</p>
        </div>
        <div className="stat-card">
          <h4>Occupancy Rate</h4>
          <p>{stats.occupancyRate}%</p>
        </div>
      </div>

      <div className="ward-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Ward Number*</label>
              <input
                type="text"
                name="wardNumber"
                value={formData.wardNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ward Type*</label>
              <select
                name="wardType"
                value={formData.wardType}
                onChange={handleChange}
                required
              >
                <option value="">Select Ward Type</option>
                <option value="General">General</option>
                <option value="ICU">ICU</option>
                <option value="Emergency">Emergency</option>
                <option value="Pediatric">Pediatric</option>
                <option value="Maternity">Maternity</option>
                <option value="Surgery">Surgery</option>
                <option value="Psychiatric">Psychiatric</option>
              </select>
            </div>

            <div className="form-group">
              <label>Capacity*</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Current Occupancy</label>
              <input
                type="number"
                name="currentOccupancy"
                value={formData.currentOccupancy}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Nurse In Charge</label>
              <input
                type="text"
                name="nurseInCharge"
                value={formData.nurseInCharge}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Full">Full</option>
                <option value="Reserved">Reserved</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>

            <div className="form-group">
              <label>Floor</label>
              <select
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                required
              >
                <option value="">Select Floor</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Last Maintenance</label>
              <input
                type="date"
                name="lastMaintenance"
                value={formData.lastMaintenance}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Next Maintenance</label>
              <input
                type="date"
                name="nextMaintenance"
                value={formData.nextMaintenance}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Equipment</label>
              <textarea
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                placeholder="List major equipment in the ward"
              />
            </div>

            <div className="form-group full-width">
              <label>Special Notes</label>
              <textarea
                name="specialNotes"
                value={formData.specialNotes}
                onChange={handleChange}
                placeholder="Any special requirements or notes"
              />
            </div>
          </div>

          <div className="button-container">
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  className="btn btn-delete" 
                  onClick={() => handleDelete(formData._id)}
                  disabled={loading}
                >
                  Delete Ward
                </button>
                <button 
                  type="submit" 
                  className="btn btn-update"
                  disabled={loading}
                >
                  Update Ward
                </button>
                <button 
                  type="button" 
                  className="btn btn-add"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                type="submit" 
                className="btn btn-add"
                disabled={loading}
              >
                Add Ward
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="ward-list">
        <h3>Ward List</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Ward Number</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Occupancy</th>
                  <th>Nurse In Charge</th>
                  <th>Status</th>
                  <th>Floor</th>
                  <th>Next Maintenance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredWards.length > 0 ? filteredWards : wards).map(ward => (
                  <React.Fragment key={ward._id}>
                    <tr>
                      <td>{ward.wardNumber}</td>
                      <td>{ward.wardType}</td>
                      <td>{ward.capacity}</td>
                      <td>
                        <div className="occupancy-bar">
                          <div 
                            className="occupancy-fill"
                            style={{
                              width: `${(ward.currentOccupancy / ward.capacity) * 100}%`,
                              backgroundColor: ward.currentOccupancy === ward.capacity ? '#e74c3c' : '#2ecc71'
                            }}
                          />
                          <span>{ward.currentOccupancy}/{ward.capacity}</span>
                        </div>
                      </td>
                      <td>{ward.nurseInCharge}</td>
                      <td>
                        <span className={`status-badge ${ward.status?.toLowerCase()}`}>
                          {ward.status}
                        </span>
                      </td>
                      <td>{ward.floor}</td>
                      <td>{ward.nextMaintenance ? new Date(ward.nextMaintenance).toLocaleDateString() : '-'}</td>
                      <td className="actions">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEdit(ward)}
                          title="Edit"
                          disabled={loading}
                        >
                          ✎
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDelete(ward._id)}
                          title="Delete"
                          disabled={loading}
                        >
                          ✖
                        </button>
                        <button 
                          className="patients-btn" 
                          onClick={() => togglePatientsList(ward._id)}
                          title="View Patients"
                          disabled={loading}
                        >
                          {showPatients[ward._id] ? '▲' : '▼'}
                        </button>
                      </td>
                    </tr>
                    {showPatients[ward._id] && (
                      <tr className="patients-row">
                        <td colSpan="9">
                          <div className="ward-patients">
                            <h4>
                              Patients in {ward.wardNumber} - {ward.wardType}
                              <span className="patient-count">
                                {wardBedAllocations[ward._id] ? 
                                  `${wardBedAllocations[ward._id].beds.filter(bed => bed.status === 'Occupied').length} / ${ward.capacity} beds occupied` : 
                                  'Loading...'}
                              </span>
                            </h4>
                            
                            {/* Always show this section, but with appropriate loading state */}
                            <div className="allocated-beds-section">
                              <h5>Allocated Beds</h5>
                              <div className="allocated-beds-list">
                                {wardBedAllocations[ward._id] ? (
                                  wardBedAllocations[ward._id].beds.some(bed => bed.status === 'Occupied') ? (
                                    <div className="allocated-beds-grid">
                                      {wardBedAllocations[ward._id].beds
                                        .filter(bed => bed.status === 'Occupied' && bed.patient)
                                        .sort((a, b) => a.bedNumber - b.bedNumber)
                                        .map(bed => (
                                          <div key={`allocated-${bed.bedNumber}`} className="allocated-bed-card">
                                            <div className="allocated-bed-header">
                                              <span className="bed-number-badge">Bed #{bed.bedNumber}</span>
                                              <span className={`status-badge ${bed.patient.status.toLowerCase()}`}>
                                                {bed.patient.status}
                                              </span>
                                            </div>
                                            <div className="allocated-bed-body">
                                              <div className="patient-name">{bed.patient.name}</div>
                                              <div className="patient-details">
                                                <span>{bed.patient.age}y, {bed.patient.gender}</span>
                                              </div>
                                              <div className="patient-type">
                                                Type: {bed.patient.type || 'Inpatient'}
                                              </div>
                                              <div className="admission-date">
                                                Admitted: {new Date(bed.patient.admissionDate).toLocaleDateString()}
                                              </div>
                                            </div>
                                            <div className="allocated-bed-footer">
                                              <Link to={`/patients/view/${bed.patient.id}`} className="view-link">
                                                View Details
                                              </Link>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="no-allocated-beds">No beds currently allocated in this ward</p>
                                  )
                                ) : (
                                  <div className="beds-loading">
                                    <span className="loading-spinner"></span>
                                    Loading allocated beds...
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Occupied beds table - only shown if there are occupied beds */}
                            {wardBedAllocations[ward._id].beds.some(bed => bed.status === 'Occupied') && (
                              <div className="occupied-beds-table-container">
                                <div className="table-header-actions">
                                  <h5>Allocated Patients</h5>
                                  <button 
                                    className="export-button" 
                                    onClick={() => exportToCSV(ward._id)}
                                    title="Export to CSV"
                                  >
                                    <FaFileExport /> Export
                                  </button>
                                </div>
                                <table className="occupied-beds-table">
                                  <thead>
                                    <tr>
                                      <th>Bed #</th>
                                      <th>Patient Name</th>
                                      <th>Age/Gender</th>
                                      <th>Admission Date</th>
                                      <th>Status</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {wardBedAllocations[ward._id].beds
                                      .filter(bed => bed.status === 'Occupied' && bed.patient)
                                      .sort((a, b) => a.bedNumber - b.bedNumber)
                                      .map(bed => (
                                        <tr key={`occupied-${bed.bedNumber}`}>
                                          <td className="bed-number-cell">{bed.bedNumber}</td>
                                          <td>{bed.patient.name}</td>
                                          <td>{bed.patient.age} / {bed.patient.gender}</td>
                                          <td>{new Date(bed.patient.admissionDate).toLocaleDateString()}</td>
                                          <td>
                                            <span className={`status-badge ${bed.patient.status.toLowerCase()}`}>
                                              {bed.patient.status}
                                            </span>
                                          </td>
                                          <td>
                                            <Link to={`/patients/view/${bed.patient.id}`} className="view-link">
                                              View Details
                                            </Link>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            <div className="bed-allocation-visual">
                              <h5>Bed Map</h5>
                              <div className="beds-grid">
                                {wardBedAllocations[ward._id].beds
                                  .sort((a, b) => a.bedNumber - b.bedNumber)
                                  .map((bed, index) => (
                                    <div 
                                      key={bed.bedNumber} 
                                      className={`bed-box ${bed.status.toLowerCase()}`}
                                      style={{ '--index': index }}
                                    >
                                      <div className="bed-number">Bed #{bed.bedNumber}</div>
                                      {bed.status === 'Occupied' && bed.patient ? (
                                        <div className="patient-info">
                                          <div className="patient-name">{bed.patient.name}</div>
                                          <div className="patient-details">
                                            <span>{bed.patient.age}y, {bed.patient.gender}</span>
                                            <span className={`patient-status status-${bed.patient.status?.toLowerCase()}`}>
                                              {bed.patient.status}
                                            </span>
                                          </div>
                                          <div className="patient-type">
                                            {bed.patient.type || 'Inpatient'}
                                          </div>
                                          <Link to={`/patients/view/${bed.patient.id}`} className="view-link">
                                            View Details
                                          </Link>
                                        </div>
                                      ) : (
                                        <div className="bed-available">Available</div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                            
                            {(!wardPatients[ward._id] || wardPatients[ward._id].length === 0) && 
                             (!wardBedAllocations[ward._id] || wardBedAllocations[ward._id].beds.every(bed => bed.status === 'Available')) && (
                              <p className="no-patients">No patients currently assigned to this ward</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ward; 