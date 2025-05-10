import React from 'react';
import './PatientDashboard.css';

const AppointmentHistory = ({ appointments, appointmentsLoading, appointmentsError }) => (
  <div className="appointment-history">
    <h3>Appointment History</h3>
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
                <h4>Dr. {appointment.doctor?.name || 'Unknown Doctor'}</h4>
                <span className={`status ${appointment.status.toLowerCase()}`}>
                  {appointment.status}
                </span>
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
  </div>
);

export default AppointmentHistory; 