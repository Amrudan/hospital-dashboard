import React, { useState, useEffect } from 'react';
import './PatientDashboard.css';
import axios from 'axios';

const PatientProfile = () => {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  // For demo: get password from localStorage (not secure for production)
  const storedPassword = localStorage.getItem('plainPassword') || '';
  const [showPassword, setShowPassword] = useState(false);

  // Appointment history state
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAppointmentsError('No token found. Please log in again.');
          setAppointmentsLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/appointments/patient', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(response.data);
      } catch (err) {
        setAppointmentsError('Failed to load appointments.');
      } finally {
        setAppointmentsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="patient-profile">
      <h3>My Profile</h3>
      <div className="profile-content">
        {user ? (
          <>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
            <p>
              <strong>Password:</strong>
              {showPassword ? (
                <span style={{ marginLeft: 8 }}>{storedPassword}</span>
              ) : (
                <span style={{ marginLeft: 8 }}>{'*'.repeat(storedPassword.length || 8)}</span>
              )}
              <button
                style={{ marginLeft: 12 }}
                onClick={() => setShowPassword((prev) => !prev)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </p>
            <h4 style={{ marginTop: '2rem' }}>Appointment History</h4>
            <div className="history-content">
              {appointmentsLoading ? (
                <div className="loading-text">Loading appointments...</div>
              ) : appointmentsError ? (
                <div className="error-text">{appointmentsError}</div>
              ) : appointments.length > 0 ? (
                <div className="appointments-list">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-card">
                      <div className="appointment-header">
                        <h4>Dr. {appointment.doctorId?.name || 'Unknown Doctor'}</h4>
                        <span className={`status ${appointment.status?.toLowerCase()}`}>{appointment.status}</span>
                      </div>
                      <div className="appointment-details">
                        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {appointment.time}</p>
                        <p><strong>Reason:</strong> {appointment.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-appointments">No previous appointments found.</p>
              )}
            </div>
          </>
        ) : (
          <p>No profile data found. Please log in again.</p>
        )}
      </div>
    </div>
  );
};

export default PatientProfile; 