import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view appointments');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/appointments/doctor', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Debug: log the fetched data
      console.log('Fetched appointments:', response.data);

      // Filter appointments for the logged-in doctor
      const user = JSON.parse(localStorage.getItem('user'));
      const doctorIdToMatch = user.staffId || user._id;
      const doctorAppointments = response.data.filter(
        appointment => appointment.doctorId && appointment.doctorId._id === doctorIdToMatch
      );

      setAppointments(doctorAppointments);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch appointments');
      setLoading(false);
      // Debug: log the error
      console.error('Error fetching appointments:', err);
    }
  };

  const handleAppointmentStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the appointments list with the new status
      setAppointments(appointments.map(appointment => 
        appointment._id === appointmentId ? response.data : appointment
      ));
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    filter === 'all' ? true : appointment.status === filter
  );

  if (loading) return <div className="loading">Loading appointments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-appointments">
      <div className="appointments-header">
        <h2>My Appointments</h2>
        <div className="filter-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-appointments">
                  No appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map(appointment => (
                <tr key={appointment._id}>
                  <td>{appointment.patientId?.name || 'Unknown Patient'}</td>
                  <td>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <span className={`status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.status === 'pending' && (
                      <div className="action-buttons">
                        <button
                          className="accept-btn"
                          onClick={() => handleAppointmentStatus(appointment._id, 'accepted')}
                          title="Accept Appointment"
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleAppointmentStatus(appointment._id, 'rejected')}
                          title="Reject Appointment"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorAppointments; 