import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUserMd, FaHistory, FaUserCircle } from 'react-icons/fa';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentForm, setAppointmentForm] = useState({
    doctor: '',
    date: '',
    time: '',
    reason: '',
  });

  // Fixed time slots for all doctors
  const fixedTimeSlots = [
    { time: '09:00 AM', status: 'available' },
    { time: '02:00 PM', status: 'available' },
    { time: '04:00 PM', status: 'available' }
  ];

  // Fetch doctors from staff API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/staff');
        const doctorsList = response.data.filter(staff => staff.role === 'Doctor');
        setDoctors(doctorsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Appointment booked:', appointmentForm);
      alert('Appointment booked successfully!');
      // Reset form after successful booking
      setAppointmentForm({
        doctor: '',
        date: '',
        time: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm({
      ...appointmentForm,
      [name]: value,
    });
  };

  const handleTimeSlotSelect = (time) => {
    setAppointmentForm({
      ...appointmentForm,
      time: time
    });
  };

  return (
    <div className="patient-dashboard">
      <nav className="dashboard-nav">
        <h2>Patient Dashboard</h2>
        <button onClick={() => navigate('/')} className="logout-button">
          Logout
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="sidebar">
          <button
            className={activeTab === 'appointments' ? 'active' : ''}
            onClick={() => setActiveTab('appointments')}
          >
            <FaCalendarAlt className="sidebar-icon" />
            Book Appointment
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory className="sidebar-icon" />
            Appointment History
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUserCircle className="sidebar-icon" />
            My Profile
          </button>
        </div>

        <div className="main-content">
          {activeTab === 'appointments' && (
            <div className="appointment-form">
              <h3>Book an Appointment</h3>
              <form onSubmit={handleAppointmentSubmit}>
                <div className="form-group">
                  <label>
                    <FaUserMd className="form-icon" />
                    Select Doctor
                  </label>
                  <select
                    name="doctor"
                    value={appointmentForm.doctor}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialization || 'General Medicine'}
                      </option>
                    ))}
                  </select>
                  {loading && <div className="loading-text">Loading doctors...</div>}
                </div>

                <div className="form-group">
                  <label>
                    <FaCalendarAlt className="form-icon" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={appointmentForm.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {appointmentForm.doctor && appointmentForm.date && (
                  <div className="form-group">
                    <label>Available Time Slots</label>
                    <div className="time-slots-grid">
                      {fixedTimeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={`time-slot ${appointmentForm.time === slot.time ? 'selected' : ''}`}
                          onClick={() => handleTimeSlotSelect(slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Reason for Visit</label>
                  <textarea
                    name="reason"
                    value={appointmentForm.reason}
                    onChange={handleChange}
                    required
                    placeholder="Please describe your symptoms or reason for visit..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!appointmentForm.doctor || !appointmentForm.date || !appointmentForm.time || !appointmentForm.reason}
                >
                  Book Appointment
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="appointment-history">
              <h3>Appointment History</h3>
              <div className="history-content">
                <p>No previous appointments found.</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="patient-profile">
              <h3>My Profile</h3>
              <div className="profile-content">
                <p>Profile information will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;