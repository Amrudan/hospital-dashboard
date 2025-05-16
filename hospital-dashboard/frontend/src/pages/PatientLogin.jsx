import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const PatientLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        ...formData,
        role: 'patient'
      });

      if (response.data.token) {
        // Store the token
        localStorage.setItem('token', response.data.token);
        
        // Store the user data
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Store the patient ID specifically
        if (userData._id) {
          localStorage.setItem('patientId', userData._id);
        }

        // Set the authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Navigate to dashboard
        navigate('/patient-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Patient Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="switch-form">
            Don't have an account?{' '}
            <Link to="/patient-signup" className="link-button">
              Sign up here
            </Link>
          </p>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/admin-login" className="link-button">
            Go to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin; 