import React, { useState, useEffect } from 'react';
import { patientApi } from '../services/api';
import axios from 'axios';
import '../styles/management.css';
import './Patients.css';
import { useNotification } from '../contexts/NotificationContext';

const Patients = () => {
  const { showSuccess, showError, showInfo } = useNotification();
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [showExistingPatients, setShowExistingPatients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
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
    fetchPatients();
    fetchAvailableWards();
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

  const fetchPatients = async () => {
    try {
      // Using the new API service
      const response = await patientApi.getAllPatients();
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showError('Failed to fetch patients data');
    }
  };

  const fetchAvailableWards = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/wards');
      // Filter wards that have available beds
      const wardsWithBeds = response.data.filter(ward => 
        ward.capacity > ward.currentOccupancy
      );
      setAvailableWards(wardsWithBeds);
    } catch (error) {
      console.error('Error fetching wards:', error);
      showError('Failed to fetch available wards');
    }
  };

  // Update to fetch the available beds for a selected ward
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

      // Using the new API service
      const response = await patientApi.createPatient(formData);
      
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
      setPatients([...patients, response.data]);
      
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
      // Using the new API service
      const response = await patientApi.updatePatient(id, formData);
      setPatients(patients.map(patient => patient._id === id ? response.data : patient));
      showSuccess('Patient updated successfully!');
    } catch (error) {
      console.error('Error updating patient:', error);
      showError('Failed to update patient');
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

  return (
    <div className="management-page">
      <h2>Patient Management</h2>
      
      <div className="patient-actions">
        <button 
          className={`action-btn ${showForm ? 'active' : ''}`}
          onClick={() => {
            setShowForm(true);
            setShowExistingPatients(false);
          }}
        >
          New Patient
        </button>
        <button 
          className={`action-btn ${showExistingPatients ? 'active' : ''}`}
          onClick={() => {
            setShowExistingPatients(true);
            setShowForm(false);
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
            <input
              type="text"
              name="gender"
              placeholder="Gender"
              value={formData.gender}
              onChange={handleInputChange}
            />
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
              onClick={handleAdd}
            >
              Add Patient
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
              }}
            >
              Reset
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
                        <span className="patient-id">{patient._id?.substring(0, 8)}</span>
                      </td>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.contact}</td>
                      <td>{patient.patientType || 'Outpatient'}</td>
                      <td>
                        {patient.patientType === 'Inpatient' ? 
                          (patient.wardId ? `Ward: ${availableWards.find(w => w._id === patient.wardId)?.wardNumber || 'Unknown'}, Bed: ${patient.bedNumber}` : 'Not assigned') : 
                          'N/A'}
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
                              setShowForm(true);
                              setShowExistingPatients(false);
                            }}
                          >
                            Edit
                          </button>
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
    </div>
  );
};

export default Patients;