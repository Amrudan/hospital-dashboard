import { useState, useEffect } from 'react';
import './Staff.css';


const Staff = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    specialization: '',
    department: '',
    yearsOfExperience: '',
    gender: '',
    email: '',
    mobile: '',
    address: '',
    nic: '',
    dob: '',
    status: 'Online',
    isEmergencyDoctor: false
  });

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [nicVerification, setNicVerification] = useState({
    isVerified: false,
    message: '',
    status: '',
    details: null
  });
  const [searchNic, setSearchNic] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/src/data/staff.json');
      const data = await response.json();
      setStaff(data.staff);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch staff data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const mockVerifyNIC = async (nic) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // More detailed validation with console logs
        console.log('Checking NIC:', nic); // Debug log
        
        const oldFormat = /^[0-9]{9}[vVxX]$/;
        const newFormat = /^[0-9]{12}$/;
        
        // Check each format separately
        const isOldFormat = oldFormat.test(nic);
        const isNewFormat = newFormat.test(nic);
        
        console.log('Old format valid:', isOldFormat); // Debug log
        console.log('New format valid:', isNewFormat); // Debug log
        
        const isValid = isOldFormat || isNewFormat;

        if (!isValid) {
          resolve({
            status: 'unverified',
            message: `Invalid NIC format. Please enter either:
              - Old format: 9 digits followed by V/X (e.g., 891234567V)
              - New format: 12 digits (e.g., 199123456789)`,
            details: null
          });
        } else {
          resolve({
            status: 'verified',
            message: 'NIC verified successfully',
            details: {
              issuedDate: '2015-01-01',
              expiryDate: '2025-01-01',
              issuingAuthority: 'Department of Registration of Persons',
              format: isOldFormat ? 'old' : 'new'
            }
          });
        }
      }, 1000);
    });
  };

  const verifyNIC = async () => {
    if (!formData.nic) {
      setNicVerification({
        isVerified: false,
        message: 'Please enter NIC number',
        status: 'error'
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await mockVerifyNIC(formData.nic);
      console.log('Verification response:', response); // Debug log
      
      setNicVerification({
        isVerified: response.status === 'verified',
        message: response.message,
        status: response.status,
        details: response.details
      });
    } catch (error) {
      console.error('Verification error:', error); // Debug log
      setNicVerification({
        isVerified: false,
        message: 'Verification failed. Please try again.',
        status: 'error'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (!formData.firstName || !formData.lastName || !formData.nic) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Staff registered successfully!');
        // Refresh staff list
        fetchStaffData();
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          role: 'Doctor',
          specialization: '',
          gender: 'Male',
          email: '',
          mobile: '',
          address: '',
          nic: '',
          dob: '',
          status: 'Online'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register staff. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      alert('Please select a staff member to update');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Staff updated successfully!');
        // Refresh staff list
        fetchStaffData();
        setSelectedStaff(null);
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          role: 'Doctor',
          specialization: '',
          gender: 'Male',
          email: '',
          mobile: '',
          address: '',
          nic: '',
          dob: '',
          status: 'Online'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update staff. Please try again.');
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Group and sort best doctors by specialization, considering both age and experience
  const getBestDoctorsBySpecialization = () => {
    const doctorsBySpecialization = staff
      .filter(member => member.role === 'Doctor')
      .reduce((acc, doctor) => {
        if (!acc[doctor.specialization]) {
          acc[doctor.specialization] = [];
        }
        // Calculate age for the doctor
        const age = doctor.dob ? calculateAge(doctor.dob) : 0;
        acc[doctor.specialization].push({
          ...doctor,
          age: age
        });
        return acc;
      }, {});

    // Sort doctors within each specialization by experience and age
    Object.keys(doctorsBySpecialization).forEach(specialization => {
      doctorsBySpecialization[specialization].sort((a, b) => {
        // First sort by experience
        const experienceDiff = b.yearsOfExperience - a.yearsOfExperience;
        if (experienceDiff !== 0) return experienceDiff;
        // If experience is the same, sort by age
        return b.age - a.age;
      });
    });

    return doctorsBySpecialization;
  };

  // Group best nurses by department
  const bestNursesByDepartment = staff
    .filter(member => member.role === 'Nurse')
    .reduce((acc, nurse) => {
      if (!acc[nurse.department]) {
        acc[nurse.department] = [];
      }
      acc[nurse.department].push(nurse);
      return acc;
    }, {});

  // Sort nurses within each department by experience
  Object.keys(bestNursesByDepartment).forEach(department => {
    bestNursesByDepartment[department].sort((a, b) => 
      b.yearsOfExperience - a.yearsOfExperience
    );
  });

  // Get unique specializations for dropdown
  const specializations = ['All', ...new Set(staff
    .filter(member => member.role === 'Doctor' && member.isEmergencyDoctor)
    .map(doctor => doctor.specialization))];

  // Get top 3 emergency doctors based on selected specialization
  const getTop3EmergencyDoctors = () => {
    return staff
      .filter(member => 
        member.role === 'Doctor' && 
        member.isEmergencyDoctor &&
        (selectedSpecialization === 'All' || member.specialization === selectedSpecialization)
      )
      .sort((a, b) => b.yearsOfExperience - a.yearsOfExperience)
      .slice(0, 3);
  };

  // Verification Modal Component
  const VerificationModal = ({ doctor, onClose }) => {
    if (!doctor) return null;

    return (
      <div className="modal-overlay">
        <div className="verification-modal">
          <h3>Doctor NIC Verification</h3>
          
          <div className="verification-info">
            <div className="doctor-basic-info">
              <p><strong>Name:</strong> {doctor.firstName} {doctor.lastName}</p>
              <p><strong>NIC:</strong> {doctor.nic}</p>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
            </div>

            <div className="verification-status-section">
              {isVerifying ? (
                <div className="verifying-indicator">
                  <div className="spinner"></div>
                  <p>Verifying NIC...</p>
                </div>
              ) : verificationResult ? (
                <div className={`verification-result ${verificationResult.status}`}>
                  <span className="verification-icon">
                    {verificationResult.status === 'verified' ? '✓' : '✗'}
                  </span>
                  <div className="verification-details">
                    <p className="verification-message">{verificationResult.message}</p>
                    {verificationResult.details && (
                      <div className="verification-additional-info">
                        <p><strong>Issued Date:</strong> {verificationResult.details.issuedDate}</p>
                        <p><strong>Expiry Date:</strong> {verificationResult.details.expiryDate}</p>
                        <p><strong>Issuing Authority:</strong> {verificationResult.details.issuingAuthority}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="verification-actions">
              <button 
                className="verify-btn" 
                onClick={() => verifyNIC(doctor)}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify NIC'}
              </button>
              <button className="close-btn" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Search function to find doctor by NIC
  const searchDoctorByNIC = async () => {
    if (!searchNic) {
      alert('Please enter NIC number to search');
      return;
    }

    setIsSearching(true);
    try {
      // In real implementation, this would be an API call
      const foundDoctor = staff.find(member => member.nic === searchNic);
      
      if (foundDoctor) {
        setSearchResult({
          status: 'found',
          data: foundDoctor
        });
      } else {
        setSearchResult({
          status: 'not_found',
          message: 'No doctor found with this NIC'
        });
      }
    } catch (error) {
      setSearchResult({
        status: 'error',
        message: 'Error searching for doctor'
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="staff-page">
      <h2 className="page-title">Staff Management</h2>

      {/* Keep only this search section at the top */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter NIC to search doctor"
            value={searchNic}
            onChange={(e) => setSearchNic(e.target.value)}
            className="search-input"
          />
          <button 
            className="search-btn"
            onClick={searchDoctorByNIC}
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className={`search-result ${searchResult.status}`}>
            {searchResult.status === 'found' ? (
              <div className="doctor-details">
                <h3>Doctor Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{searchResult.data.firstName} {searchResult.data.lastName}</span>
                  </div>
                  <div className="detail-item">
                    <label>NIC:</label>
                    <span>{searchResult.data.nic}</span>
                  </div>
                  <div className="detail-item">
                    <label>Specialization:</label>
                    <span>{searchResult.data.specialization}</span>
                  </div>
                  <div className="detail-item">
                    <label>Experience:</label>
                    <span>{searchResult.data.yearsOfExperience} years</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact:</label>
                    <span>{searchResult.data.mobile}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{searchResult.data.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status ${searchResult.data.status.toLowerCase()}`}>
                      {searchResult.data.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-result">
                <p>{searchResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registration Form */}
      <div className="staff-form-container">
        <div className="header-section">
        </div>

        <form onSubmit={handleRegister}>
          <div className="input-grid"> 
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
            />
            
            <div className="nic-verification-container">
              <input
                type="text"
                name="nic"
                placeholder='NIC'
                value={formData.nic}
                onChange={(e) => {
                  setFormData({...formData, nic: e.target.value});
                  setNicVerification({ isVerified: false, message: '', status: '' });
                }}
              />
              <button 
                type="button"
                className={`verify-nic-btn ${isVerifying ? 'verifying' : ''}`}
                onClick={verifyNIC}
                disabled={isVerifying || !formData.nic}
              >
                {isVerifying ? 'Verifying...' : 'Verify NIC'}
              </button>
            </div>

            {nicVerification.message && (
              <div className={`verification-message ${nicVerification.status}`}>
                <span className="verification-icon">
                  {nicVerification.status === 'verified' ? '✓' : '✗'}
                </span>
                <p>{nicVerification.message}</p>
                {nicVerification.details && (
                  <div className="verification-details">
                    <p>Issued: {nicVerification.details.issuedDate}</p>
                    <p>Expires: {nicVerification.details.expiryDate}</p>
                  </div>
                )}
              </div>
            )}

            <select name="role" value={formData.role} onChange={handleInputChange}>
              <option value="">Select Role</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
            </select>
            
            <select name="gender" value={formData.gender} onChange={handleInputChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Mobile Number"
            />
            
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="full-width"
            ></textarea>
            
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              placeholder="Date of Birth"
            />

            <div className="button-group">
              <button type="submit" className="register-btn" disabled={!nicVerification.isVerified}>Register</button>
              <button type="button" className="update-btn">Update</button>
              <button type="button" className="delete-btn">Delete</button>
            </div>
          </div>
        </form>
      </div>

      {/* Staff Lists Section */}
      <div className="staff-lists">
        {/* Best Doctors Section */}
        <div className="staff-section">
          <h3>Best Doctors</h3>
          {Object.entries(getBestDoctorsBySpecialization()).map(([specialization, doctors]) => (
            <div key={specialization} className="specialization-group">
              <h4>{specialization}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Experience</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.slice(0, 3).map(doctor => (
                    <tr key={doctor.id}>
                      <td>{doctor.firstName} {doctor.lastName}</td>
                      <td>{doctor.age} years</td>
                      <td>{doctor.yearsOfExperience} years</td>
                      <td>{doctor.mobile}</td>
                      <td>
                        <span className={`status ${doctor.status.toLowerCase()}`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td>
                        <div className="doctor-rating">
                          {'★'.repeat(Math.min(5, Math.ceil(doctor.yearsOfExperience/5)))}
                          {'☆'.repeat(Math.max(0, 5 - Math.ceil(doctor.yearsOfExperience/5)))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Best Nurses Section */}
        <div className="staff-section">
          <h3>Best Nurses</h3>
          {Object.entries(bestNursesByDepartment).map(([department, nurses]) => (
            <div key={department} className="specialization-group">
              <h4>{department}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Experience</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {nurses.slice(0, 3).map(nurse => (
                    <tr key={nurse.id}>
                      <td>{nurse.firstName} {nurse.lastName}</td>
                      <td>{nurse.yearsOfExperience} years</td>
                      <td>{nurse.mobile}</td>
                      <td>
                        <span className={`status ${nurse.status.toLowerCase()}`}>
                          {nurse.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Emergency Doctors Section */}
        <div className="staff-section">
          <div className="section-header">
            <h3>Emergency Doctors</h3>
            <select 
              className="specialization-dropdown"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="emergency-doctors-container">
            {getTop3EmergencyDoctors().map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-info">
                  <h4>{doctor.firstName} {doctor.lastName}</h4>
                  <p className="specialization">{doctor.specialization}</p>
                  <p className="experience">{doctor.yearsOfExperience} years experience</p>
                  <p className="contact">{doctor.mobile}</p>
                  <span className={`status ${doctor.status.toLowerCase()}`}>
                    {doctor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <VerificationModal 
          doctor={selectedDoctor} 
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationResult(null);
          }} 
        />
      )}
    </div>
  );
};

export default Staff;