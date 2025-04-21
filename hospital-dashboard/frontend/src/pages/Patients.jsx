import React, { useState, useEffect } from 'react';
import { patientApi } from '../services/api';
import axios from 'axios';
import '../styles/management.css';
import './Patients.css';
import { useNotification } from '../contexts/NotificationContext';

// Add TableStyle component to fix alignment
const TableStyle = () => (
  <style jsx="true">{`
    .data-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
    }
    
    .data-table th,
    .data-table td {
      padding: 12px 8px;
      text-align: center;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-bottom: 1px solid #ddd;
    }
    
    .data-table th {
      background-color: #f8f9fa;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .data-table th:first-child,
    .data-table td:first-child {
      width: 100px; /* Patient ID */
    }
    
    .data-table th:nth-child(2),
    .data-table td:nth-child(2) {
      width: 150px; /* Name */
      text-align: left;
    }
    
    .data-table th:nth-child(3),
    .data-table td:nth-child(3) {
      width: 70px; /* Age */
    }
    
    .data-table th:nth-child(4),
    .data-table td:nth-child(4) {
      width: 100px; /* Gender */
    }
    
    .data-table th:nth-child(5),
    .data-table td:nth-child(5) {
      width: 150px; /* Contact */
    }
    
    .data-table th:nth-child(6),
    .data-table td:nth-child(6) {
      width: 120px; /* Type */
    }
    
    .data-table th:nth-child(7),
    .data-table td:nth-child(7) {
      width: 150px; /* Ward/Bed */
    }
    
    .data-table th:nth-child(8),
    .data-table td:nth-child(8) {
      width: 120px; /* Status */
    }
    
    .data-table th:nth-child(9),
    .data-table td:nth-child(9) {
      width: 140px; /* Actions */
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 8px;
    }
  `}</style>
);

const Patients = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [showExistingPatients, setShowExistingPatients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [allWards, setAllWards] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    address: '',
    medicalHistory: '',
    status: 'Admitted',
    patientType: 'Outpatient',
    wardId: '',
    bedNumber: ''
  });
  const [availableBeds, setAvailableBeds] = useState([]);
  // Add new state for bed assignment modal
  const [showBedAssignModal, setShowBedAssignModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bedAssignFormData, setBedAssignFormData] = useState({
    wardId: '',
    bedNumber: ''
  });

  // Government schemes list
  const governmentSchemes = {
    "Ayushman Bharat": "Covers up to ₹5 lakhs per family per year",
    "CGHS": "Central Government Health Scheme for government employees",
    "ESI": "Employees State Insurance for workers",
    "PM-JAY": "Pradhan Mantri Jan Arogya Yojana for poor families",
    "ECHS": "Ex-Servicemen Contributory Health Scheme",
    "State Government": "State-specific health coverage",
    "Railway": "Railway employees health scheme",
    "Other": "Other government scheme"
  };

  useEffect(() => {
    // Fetch all wards first, then patients
    const loadData = async () => {
      try {
        // First get all wards
        const wardsResponse = await axios.get('http://localhost:5000/api/wards');
        const allWardsData = wardsResponse.data;
        
        // Set all wards for lookup
        setAllWards(allWardsData);
        console.log("All wards loaded:", allWardsData);
        
        // Filter wards with available beds for the form
        const wardsWithBeds = allWardsData.filter(ward => 
          ward.capacity > ward.currentOccupancy
        );
        setAvailableWards(wardsWithBeds);
        
        // Then get all patients and attach ward info
        const patientsResponse = await patientApi.getAllPatients();
        
        // Process the data to ensure patientType and ward info are set correctly
        const processedPatients = patientsResponse.data.map(patient => {
          // Make a copy to avoid modifying the original
          const processedPatient = {...patient};
          
          // Set patient type
          if (!processedPatient.patientType) {
            processedPatient.patientType = processedPatient.wardId ? 'Inpatient' : 'Outpatient';
          }
          
          // Add ward information for display purposes
          if (processedPatient.patientType === 'Inpatient') {
            // Find matching ward
            if (processedPatient.wardId) {
              const matchingWard = allWardsData.find(w => w._id === processedPatient.wardId);
              if (matchingWard) {
                console.log(`Found ward match for patient ${processedPatient.name}:`, matchingWard.wardNumber);
                processedPatient.wardNumber = matchingWard.wardNumber;
                processedPatient.wardType = matchingWard.wardType;
              } else {
                console.log(`No ward match found for patient ${processedPatient.name} with ward ID:`, processedPatient.wardId);
              }
            }
          }
          
          return processedPatient;
        });
        
        console.log("Processed patients with ward info:", processedPatients);
        setPatients(processedPatients);
        setFilteredPatients(processedPatients);
      } catch (error) {
        console.error("Error loading initial data:", error);
        showError("Failed to load data. Please refresh the page.");
      }
    };
    
    loadData();
  }, []);

  // Update filtered patients whenever patients or search term changes
  useEffect(() => {
    const filtered = patients.filter(patient => 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact?.includes(searchTerm) ||
      (patient.age && patient.age.toString().includes(searchTerm))
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchAvailableBedsForWard = async (wardId) => {
    if (!wardId) return;
    
    try {
      // Get the ward details first
      const response = await axios.get(`http://localhost:5000/api/wards/${wardId}`);
      const ward = response.data;
      
      // Get all patients assigned to this ward
      const patientsResponse = await axios.get('http://localhost:5000/api/patients');
      const patients = patientsResponse.data;
      
      // Filter patients in this ward
      const patientsInWard = patients.filter(patient => 
        patient.wardId === wardId && patient.patientType === 'Inpatient'
      );
      
      // Get occupied bed numbers
      const occupiedBeds = patientsInWard.map(patient => patient.bedNumber);
      
      // Generate all bed numbers from 1 to ward capacity
      const allBeds = Array.from({length: ward.capacity}, (_, i) => i + 1);
      
      // Filter out occupied beds
      const availableBedNumbers = allBeds.filter(bed => !occupiedBeds.includes(bed));
      
      // Create bed objects with useful information
      const beds = availableBedNumbers.map(bedNumber => ({
        id: bedNumber,
        number: bedNumber,
        status: 'Available'
      }));
      
      setAvailableBeds(beds);
    } catch (error) {
      console.error('Error fetching available beds:', error);
      showError('Failed to fetch available beds');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'patientType' && value === 'Outpatient') {
      // Reset ward and bed info if outpatient is selected
      setFormData(prev => ({
        ...prev,
        [name]: value,
        wardId: '',
        bedNumber: ''
      }));
      setSelectedWard('');
      setAvailableBeds([]);
    } else if (name === 'wardId') {
      // When a ward is selected, fetch available beds
      setSelectedWard(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        bedNumber: '' // Reset bed selection when ward changes
      }));
      
      // Fetch available beds for this ward
      fetchAvailableBedsForWard(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAdd = async () => {
    try {
      // Validate form if patient is inpatient
      if (formData.patientType === 'Inpatient' && (!formData.wardId || !formData.bedNumber)) {
        showError('Please select a ward and bed number for inpatient');
        return;
      }

      // Make sure patientType is explicitly set
      const patientData = {
        ...formData,
        patientType: formData.patientType || 'Outpatient' // Default to Outpatient if not set
      };

      // Using the new API service
      const response = await patientApi.createPatient(patientData);
      
      // If patient is inpatient, update the ward's occupancy
      if (formData.patientType === 'Inpatient' && formData.wardId) {
        try {
          // Get the current ward data
          const wardResponse = await axios.get(`http://localhost:5000/api/wards/${formData.wardId}`);
          const currentWard = wardResponse.data;
          
          // Update the ward's occupancy
          const updatedWard = {
            ...currentWard,
            currentOccupancy: currentWard.currentOccupancy + 1
          };
          
          await axios.put(`http://localhost:5000/api/wards/${formData.wardId}`, updatedWard);
          
          // Refresh available wards
          fetchAvailableWards();
        } catch (wardError) {
          console.error('Error updating ward occupancy:', wardError);
          showError('Patient added but failed to update ward occupancy');
        }
      }
      
      // Update patients list with the new patient
      const newPatient = {
        ...response.data,
        patientType: patientData.patientType // Ensure patientType is included
      };
      setPatients([...patients, newPatient]);
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        contact: '',
        address: '',
        medicalHistory: '',
        status: 'Admitted',
        patientType: 'Outpatient',
        wardId: '',
        bedNumber: ''
      });
      setSelectedWard('');
      
      setShowForm(false);
      setShowExistingPatients(true);
      showSuccess(`Patient ${formData.name} added successfully!`);
    } catch (error) {
      console.error('Error adding patient:', error);
      showError('Error adding patient: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdate = async (id) => {
    try {
      // Validate form if patient is inpatient
      if (formData.patientType === 'Inpatient' && (!formData.wardId || !formData.bedNumber)) {
        showError('Please select a ward and bed number for inpatient');
        return;
      }

      // Make sure patientType is explicitly set
      const patientData = {
        ...formData,
        patientType: formData.patientType || 'Outpatient' // Default to Outpatient if not set
      };

      // Using the new API service
      const response = await patientApi.updatePatient(id, patientData);
      
      // Process the updated patient to ensure it has patientType
      const updatedPatient = {
        ...response.data,
        patientType: patientData.patientType
      };
      
      // Update the patients list
      setPatients(patients.map(patient => patient._id === id ? updatedPatient : patient));
      
      // Reset form and editing state
      setFormData({
        name: '',
        age: '',
        gender: '',
        contact: '',
        address: '',
        medicalHistory: '',
        status: 'Admitted',
        patientType: 'Outpatient',
        wardId: '',
        bedNumber: ''
      });
      setSelectedWard('');
      setIsEditing(false);
      setEditingPatientId(null);
      
      // Show success message and switch to patients list
      setShowForm(false);
      setShowExistingPatients(true);
      showSuccess('Patient updated successfully!');
    } catch (error) {
      console.error('Error updating patient:', error);
      showError('Failed to update patient: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      // Using the new API service
      await patientApi.deletePatient(id);
      setPatients(patients.filter(patient => patient._id !== id));
      showSuccess('Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      showError('Failed to delete patient');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to refresh patient data
  const refreshPatients = async () => {
    try {
      // Get all patients and attach ward info
      const patientsResponse = await patientApi.getAllPatients();
      
      // Process the data to ensure patientType and ward info are set correctly
      const processedPatients = patientsResponse.data.map(patient => {
        // Make a copy to avoid modifying the original
        const processedPatient = {...patient};
        
        // Set patient type
        if (!processedPatient.patientType) {
          processedPatient.patientType = processedPatient.wardId ? 'Inpatient' : 'Outpatient';
        }
        
        // Add ward information for display purposes
        if (processedPatient.patientType === 'Inpatient') {
          // Find matching ward
          if (processedPatient.wardId) {
            const matchingWard = allWards.find(w => w._id === processedPatient.wardId);
            if (matchingWard) {
              console.log(`Found ward match for patient ${processedPatient.name}:`, matchingWard.wardNumber);
              processedPatient.wardNumber = matchingWard.wardNumber;
              processedPatient.wardType = matchingWard.wardType;
            } else {
              console.log(`No ward match found for patient ${processedPatient.name} with ward ID:`, processedPatient.wardId);
            }
          }
        }
        
        return processedPatient;
      });
      
      console.log("Refreshed patients with ward info:", processedPatients);
      setPatients(processedPatients);
      setFilteredPatients(processedPatients);
    } catch (error) {
      console.error("Error refreshing patients:", error);
      showError("Failed to refresh patient data");
    }
  };

  const fetchAvailableWards = async () => {
    try {
      const wardsResponse = await axios.get('http://localhost:5000/api/wards');
      const allWardsData = wardsResponse.data;
      
      // Filter wards with available beds
      const wardsWithBeds = allWardsData.filter(ward => 
        ward.capacity > ward.currentOccupancy
      );
      setAvailableWards(wardsWithBeds);
    } catch (error) {
      console.error('Error fetching available wards:', error);
      showError('Failed to fetch available wards');
    }
  };

  // Add new function to handle bed assignment
  const handleAssignBed = (patient) => {
    setSelectedPatient(patient);
    setBedAssignFormData({
      wardId: '',
      bedNumber: ''
    });
    fetchAvailableWards();
    setShowBedAssignModal(true);
  };

  // Add function to handle ward selection in the bed assignment modal
  const handleBedAssignInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'wardId') {
      setBedAssignFormData(prev => ({
        ...prev,
        [name]: value,
        bedNumber: '' // Reset bed selection when ward changes
      }));
      
      // Fetch available beds for this ward
      fetchAvailableBedsForWard(value);
    } else {
      setBedAssignFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add function to save the bed assignment
  const saveBedAssignment = async () => {
    if (!selectedPatient || !bedAssignFormData.wardId || !bedAssignFormData.bedNumber) {
      showError('Please select both ward and bed number');
      return;
    }

    try {
      // Update the patient with new ward and bed information
      const updatedPatientData = {
        ...selectedPatient,
        patientType: 'Inpatient',
        wardId: bedAssignFormData.wardId,
        bedNumber: bedAssignFormData.bedNumber
      };

      const response = await patientApi.updatePatient(selectedPatient._id, updatedPatientData);
      
      // Process the updated patient
      const updatedPatient = {
        ...response.data,
        patientType: 'Inpatient'
      };
      
      // Update the patients list
      setPatients(patients.map(patient => 
        patient._id === selectedPatient._id ? updatedPatient : patient
      ));
      
      // Update the ward's occupancy
      try {
        // Get the current ward data
        const wardResponse = await axios.get(`http://localhost:5000/api/wards/${bedAssignFormData.wardId}`);
        const currentWard = wardResponse.data;
        
        // Update the ward's occupancy
        const updatedWard = {
          ...currentWard,
          currentOccupancy: currentWard.currentOccupancy + 1
        };
        
        await axios.put(`http://localhost:5000/api/wards/${bedAssignFormData.wardId}`, updatedWard);
      } catch (wardError) {
        console.error('Error updating ward occupancy:', wardError);
        showError('Bed assigned but failed to update ward occupancy');
      }

      // Close modal and reset
      setShowBedAssignModal(false);
      setSelectedPatient(null);
      refreshPatients(); // Refresh the patient list to show updated data
      showSuccess('Bed assigned successfully!');
    } catch (error) {
      console.error('Error assigning bed:', error);
      showError('Failed to assign bed: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add this function somewhere after the component declaration, but before the return statement
  const generatePatientId = (patient) => {
    if (!patient || !patient.name || !patient.age || !patient.gender) {
      return 'N/A';
    }
    
    // Get first 2 digits of age (padded with 0 if needed)
    const ageStr = patient.age.toString().padStart(2, '0').substring(0, 2);
    
    // Get first 3 characters of name (uppercase)
    const namePrefix = patient.name.substring(0, 3).toUpperCase();
    
    // Get first character of gender (lowercase)
    const genderChar = patient.gender.toLowerCase().startsWith('m') ? 'm' : 'f';
    
    // Combine to form the 6-character ID
    return `${ageStr}${namePrefix}${genderChar}`;
  };

  return (
    <div className="management-page">
      
      <div className="patient-actions">
        <button 
          className={`action-btn ${showForm ? 'active' : ''}`}
          onClick={() => {
            setShowForm(true);
            setShowExistingPatients(false);
            setIsEditing(false);
            setEditingPatientId(null);
            setFormData({
              name: '',
              age: '',
              gender: '',
              contact: '',
              address: '',
              medicalHistory: '',
              status: 'Admitted',
              patientType: 'Outpatient',
              wardId: '',
              bedNumber: ''
            });
          }}
        >
          New Patient
        </button>
        <button 
          className={`action-btn ${showExistingPatients ? 'active' : ''}`}
          onClick={() => {
            setShowExistingPatients(true);
            setShowForm(false);
            // Refresh patient data when viewing existing patients
            refreshPatients();
          }}
        >
          Existing Patients
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="contact"
              placeholder="Contact"
              value={formData.contact}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleInputChange}
              min="0"
              max="120"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-row">
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
            ></textarea>
            <textarea
              name="medicalHistory"
              placeholder="Medical History"
              value={formData.medicalHistory}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Patient Type</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="patientType"
                    value="Outpatient"
                    checked={formData.patientType === 'Outpatient'}
                    onChange={handleInputChange}
                  />
                  Outpatient
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="patientType"
                    value="Inpatient"
                    checked={formData.patientType === 'Inpatient'}
                    onChange={handleInputChange}
                  />
                  Stay in Hospital (Inpatient)
                </label>
              </div>
            </div>
          </div>

          {formData.patientType === 'Inpatient' && (
            <div className="form-row bed-allocation">
              <div className="form-group">
                <label>Select Ward</label>
                <select
                  name="wardId"
                  value={formData.wardId}
                  onChange={handleInputChange}
                  required={formData.patientType === 'Inpatient'}
                >
                  <option value="">-- Select Ward --</option>
                  {availableWards.map(ward => {
                    const availableBedCount = ward.capacity - ward.currentOccupancy;
                    let availabilityClass = 'many';
                    
                    if (availableBedCount === 0) {
                      availabilityClass = 'none';
                    } else if (availableBedCount <= 2) {
                      availabilityClass = 'few';
                    }
                    
                    return (
                      <option key={ward._id} value={ward._id}>
                        {ward.wardNumber} - {ward.wardType} 
                        {availableBedCount > 0 ? (
                          <span> (Available: {availableBedCount} beds)</span>
                        ) : (
                          <span> (Full)</span>
                        )}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label>Available Beds</label>
                <select
                  name="bedNumber"
                  value={formData.bedNumber}
                  onChange={handleInputChange}
                  disabled={!formData.wardId || availableBeds.length === 0}
                  required={formData.patientType === 'Inpatient'}
                >
                  <option value="">-- Select Bed --</option>
                  {availableBeds.map(bed => (
                    <option key={bed.id} value={bed.number}>
                      Bed #{bed.number}
                    </option>
                  ))}
                </select>
                {formData.wardId && availableBeds.length === 0 && (
                  <div className="no-beds-warning">
                    No beds available in this ward
                  </div>
                )}
                {!formData.wardId && (
                  <div className="select-ward-first">
                    Please select a ward first
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="form-button submit-btn" 
              onClick={isEditing ? () => handleUpdate(editingPatientId) : handleAdd}
            >
              {isEditing ? 'Update Patient' : 'Add Patient'}
            </button>
            <button 
              type="button" 
              className="form-button cancel-btn" 
              onClick={() => {
                setFormData({
                  name: '',
                  age: '',
                  gender: '',
                  contact: '',
                  address: '',
                  medicalHistory: '',
                  status: 'Admitted',
                  patientType: 'Outpatient',
                  wardId: '',
                  bedNumber: ''
                });
                setSelectedWard('');
                if (isEditing) {
                  setIsEditing(false);
                  setEditingPatientId(null);
                }
              }}
            >
              {isEditing ? 'Cancel' : 'Reset'}
            </button>
          </div>
        </div>
      )}

      {showExistingPatients && (
        <div className="existing-patients">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="table-container">
            <TableStyle />
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Ward/Bed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data">No patients found</td>
                  </tr>
                ) : (
                  filteredPatients.map(patient => (
                    <tr key={patient._id}>
                      <td>
                        <span className="patient-id">{generatePatientId(patient)}</span>
                      </td>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.contact && patient.contact.match(/^[0-9]{10}$/) ? patient.contact : '-'}</td>
                      <td>
                        <span className={`patient-type-badge ${patient.patientType === 'Inpatient' ? 'inpatient' : 'outpatient'}`}>
                          {patient.patientType === 'Inpatient' ? 'Inpatient' : 'Outpatient'}
                        </span>
                      </td>
                      <td>
                        {patient.patientType === 'Inpatient' ? (
                          <div className="ward-bed-display">
                            {patient.wardId ? (
                              <>
                                <div className="ward-display">
                                  <span className="info-label">Ward:</span> 
                                  <span className="info-value">
                                    {patient.wardNumber || 
                                     (allWards.find(w => w._id === patient.wardId)?.wardNumber) || 
                                     'Unknown'}
                                  </span>
                                </div>
                                <div className="bed-display">
                                  <span className="info-label">Bed:</span> 
                                  <span className="info-value">
                                    {patient.bedNumber ? (
                                      isNaN(patient.bedNumber) ? patient.bedNumber : `#${patient.bedNumber}`
                                    ) : (
                                      'Not assigned'
                                    )}
                                  </span>
                                </div>
                                {(!patient.wardNumber && patient.wardId) && (
                                  <div className="debug-info">
                                    Ward ID: {patient.wardId.substring(0, 8)}...
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="not-assigned">Not assigned</span>
                            )}
                          </div>
                        ) : (
                          <span className="not-applicable">N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${patient.status?.toLowerCase()}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn"
                            onClick={() => {
                              setFormData({
                                ...patient,
                                patientType: patient.patientType || 'Outpatient'
                              });
                              setSelectedWard(patient.wardId || '');
                              setIsEditing(true);
                              setEditingPatientId(patient._id);
                              setShowForm(true);
                              setShowExistingPatients(false);
                              
                              // If patient is inpatient and has a ward, fetch available beds
                              if (patient.patientType === 'Inpatient' && patient.wardId) {
                                fetchAvailableBedsForWard(patient.wardId);
                              }
                            }}
                          >
                            Edit
                          </button>
                          {/* Add Assign Bed button for inpatients with no assigned beds */}
                          {patient.patientType === 'Inpatient' && 
                           (!patient.bedNumber || !patient.wardId) && (
                            <button 
                              className="assign-bed-btn"
                              onClick={() => handleAssignBed(patient)}
                            >
                              Assign Bed
                            </button>
                          )}
                          <button 
                            className="delete-btn"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this patient?')) {
                                handleDelete(patient._id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bed Assignment Modal */}
      {showBedAssignModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="bed-assignment-modal">
            <h3>Assign Bed for {selectedPatient.name}</h3>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Select Ward</label>
                <select
                  name="wardId"
                  value={bedAssignFormData.wardId}
                  onChange={handleBedAssignInputChange}
                  required
                >
                  <option value="">-- Select Ward --</option>
                  {availableWards.map(ward => {
                    const availableBedCount = ward.capacity - ward.currentOccupancy;
                    
                    return (
                      <option key={ward._id} value={ward._id} disabled={availableBedCount === 0}>
                        {ward.wardNumber} - {ward.wardType} 
                        {availableBedCount > 0 ? (
                          <span> (Available: {availableBedCount} beds)</span>
                        ) : (
                          <span> (Full)</span>
                        )}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label>Select Bed</label>
                <select
                  name="bedNumber"
                  value={bedAssignFormData.bedNumber}
                  onChange={handleBedAssignInputChange}
                  disabled={!bedAssignFormData.wardId || availableBeds.length === 0}
                  required
                >
                  <option value="">-- Select Bed --</option>
                  {availableBeds.map(bed => (
                    <option key={bed.id} value={bed.number}>
                      Bed #{bed.number}
                    </option>
                  ))}
                </select>
                {bedAssignFormData.wardId && availableBeds.length === 0 && (
                  <div className="no-beds-warning">
                    No beds available in this ward
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="save-btn"
                  onClick={saveBedAssignment}
                  disabled={!bedAssignFormData.wardId || !bedAssignFormData.bedNumber}
                >
                  Assign Bed
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowBedAssignModal(false);
                    setSelectedPatient(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;