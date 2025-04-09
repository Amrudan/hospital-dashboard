import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/management.css';
import './Patients.css';

const patients = () => {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [showExistingPatients, setShowExistingPatients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    age: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    governmentScheme: '',
    otherScheme: '',
    password: '',
    confirmPassword: ''
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
    fetchPatients();
  }, []);

  // Update filtered patients whenever patients or search term changes
  useEffect(() => {
    const filtered = patients.filter(patient => 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobileNumber.includes(searchTerm) ||
      (patient.age && patient.age.toString().includes(searchTerm))
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      // Calculate age when date of birth changes
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age: age.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAdd = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/patients', formData);
      // Update patients list with the new patient (including patientId)
      setPatients([...patients, response.data]);
      // Show the patients list after adding a new patient
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        age: '',
        dateOfBirth: '',
        address: '',
        gender: '',
        governmentScheme: '',
        otherScheme: '',
        password: '',
        confirmPassword: ''
      });
      setShowForm(false);
      setShowExistingPatients(true);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Error adding patient: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/patients/${id}`, formData);
      setPatients(patients.map(patient => patient._id === id ? response.data : patient));
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`);
      setPatients(patients.filter(patient => patient._id !== id));
    } catch (error) {
      console.error('Error deleting patient:', error);
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
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="for-row">
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
              type="date"
              name="dateOfBirth"
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <div className="form-row">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            > 
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <div className="scheme-select-container">
              <select
                name="governmentScheme"
                value={formData.governmentScheme}
                onChange={handleInputChange}
                className="scheme-select"
              >
                <option value="">Select Government Scheme</option>
                {Object.entries(governmentSchemes).map(([scheme, description]) => (
                  <option key={scheme} value={scheme}>
                    {scheme}
                  </option>
                ))}
              </select>
              {formData.governmentScheme === "Other" && (
                <input
                  type="text"
                  name="otherScheme"
                  placeholder="Enter other scheme name"
                  value={formData.otherScheme}
                  onChange={handleInputChange}
                  className="other-scheme-input"
                />
              )}
            </div>
          </div>

          {formData.governmentScheme && (
            <div className="scheme-info">
              <p>
                {formData.governmentScheme === "Other" 
                  ? `Custom Scheme: ${formData.otherScheme}`
                  : governmentSchemes[formData.governmentScheme]}
              </p>
            </div>
          )}

          <div className="form-row">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>

          <div className="button-group">
            <button className="add-btn" onClick={handleAdd}>Add Patient</button>
            <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showExistingPatients && (
        <div className="existing-patients">
          <div className="search-section">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search Patient"
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Age</th>
                  <th>Email</th>
                  <th>Mobile number</th>
                  <th>Date of birth</th>
                  <th>Gender</th>
                  <th>Government Scheme</th>
                  <th>Claims Used</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient._id}>
                    <td>
                      <span className="patient-id">{patient.patientId}</span>
                    </td>
                    <td>{patient.firstName}</td>
                    <td>{patient.lastName}</td>
                    <td>{patient.age}</td>
                    <td>{patient.email}</td>
                    <td>{patient.mobileNumber}</td>
                    <td>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}</td>
                    <td>{patient.gender}</td>
                    <td>
                      {patient.governmentScheme === 'Other' ? patient.otherScheme : patient.governmentScheme || 'None'}
                    </td>
                    <td>
                      <span className={`claims-badge ${patient.schemeClaims >= 2 ? 'claims-max' : ''}`}>
                        {patient.schemeClaims}/2
                        {patient.schemeClaims >= 2 && 
                          <span className="claims-warning"> (Max reached)</span>
                        }
                      </span>
                    </td>
                    <td>{patient.address}</td>
                    <td>
                      <button className="edit-btn" onClick={() => {
                        setFormData(patient);
                        setShowForm(true);
                        setShowExistingPatients(false);
                      }}>✎</button>
                      <button className="delete-btn" onClick={() => handleDelete(patient._id)}>✖</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default patients;