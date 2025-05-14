import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';
import axios from 'axios';
import { FaUser, FaPhone, FaIdCard, FaUserMd } from 'react-icons/fa';

const AdminProfile = () => {
  // Get admin info from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  // State for admin details
  const [adminDetails, setAdminDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pending appointments that need admin attention
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

  useEffect(() => {
    // Fetch admin details if we have more info in the backend
    const fetchAdminDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in again.');
          setLoading(false);
          return;
        }
        
        // If you have an API endpoint for fetching admin details, use it here
        // For now, we'll use the user data from localStorage
        setAdminDetails(user || {});
      } catch (err) {
        setError('Failed to load admin details.');
      } finally {
        setLoading(false);
      }
    };

    // Fetch pending appointments that need admin attention
    const fetchPendingAppointments = async () => {
      setAppointmentsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAppointmentsError('No token found. Please log in again.');
          setAppointmentsLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/appointments/doctor', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter only pending appointments
        const pending = response.data.filter(app => app.status === 'pending');
        setPendingAppointments(pending);
      } catch (err) {
        setAppointmentsError('Failed to load appointments.');
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAdminDetails();
    fetchPendingAppointments();
  }, []);

  return (
    <div className="admin-profile">
      <h3>Admin Profile</h3>
      <div className="profile-content">
        {loading ? (
          <div className="loading-text">Loading profile...</div>
        ) : error ? (
          <div className="error-text">{error}</div>
        ) : (
          <div className="profile-info">
            <div className="profile-header">
              <div className="profile-avatar">
                <FaUserMd size={50} />
              </div>
              <h4>{adminDetails.name || 'Admin User'}</h4>
            </div>
            
            <div className="profile-details">
              <div className="profile-detail-item">
                <FaUser className="profile-icon" />
                <div className="detail-content">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{adminDetails.name || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="profile-detail-item">
                <FaPhone className="profile-icon" />
                <div className="detail-content">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{adminDetails.phoneNumber || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="profile-detail-item">
                <FaIdCard className="profile-icon" />
                <div className="detail-content">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{adminDetails.role || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="appointments-section">
          <h4>Pending Appointments</h4>
          {appointmentsLoading ? (
            <div className="loading-text">Loading appointments...</div>
          ) : appointmentsError ? (
            <div className="error-text">{appointmentsError}</div>
          ) : pendingAppointments.length > 0 ? (
            <div className="appointments-list">
              {pendingAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <div className="appointment-header">
                    <h4>Patient: {appointment.patientId?.name || 'Unknown Patient'}</h4>
                    <span className={`status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <p><strong>Doctor:</strong> {appointment.doctorId?.name || 'Unknown Doctor'}</p>
                    <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointment.time}</p>
                    <p><strong>Reason:</strong> {appointment.reason}</p>
                  </div>
                  <a href="/appointments" className="manage-btn">Manage Appointments</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-appointments">No pending appointments require attention.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 