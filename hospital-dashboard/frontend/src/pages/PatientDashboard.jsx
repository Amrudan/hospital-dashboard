import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientDashboard.css';

const PatientDashboard = () => {
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
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again to book an appointment');
        return;
      }

      // Format the date to ensure it's in the correct format
      const formattedDate = new Date(appointmentForm.date).toISOString();

      const appointmentData = {
        doctorId: appointmentForm.doctor,
        date: formattedDate,
        time: appointmentForm.time,
        reason: appointmentForm.reason,
        status: 'pending'
      };

      console.log('Sending appointment data:', appointmentData); // Debug log

      const response = await axios.post(
        'http://localhost:5000/api/appointments',
        appointmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        alert('Appointment request submitted successfully! The doctor will review and accept it.');
        // Reset form
      setAppointmentForm({
        doctor: '',
        date: '',
        time: '',
        reason: ''
      });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Failed to book appointment. Please try again.');
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
    <div className="appointment-form">
      <h3>Book an Appointment</h3>
      <form onSubmit={handleAppointmentSubmit}>
        <div className="form-group">
          <label>
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
  );
};

export default PatientDashboard;