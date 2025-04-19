import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would make an API call to your backend
      console.log('Login attempt:', formData);
      if (loginType === 'patient') {
        navigate('/patient-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="hospital-logo">
          <h1>Hospital Management</h1>
          <p>Welcome to our healthcare system</p>
        </div>
        <div className="login-type-selector">
          <button
            className={loginType === 'patient' ? 'active' : ''}
            onClick={() => setLoginType('patient')}
          >
            Patient Login
          </button>
          <button
            className={loginType === 'admin' ? 'active' : ''}
            onClick={() => setLoginType('admin')}
          >
            Admin Login
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          <div className="login-links">
            <a href="#" className="forgot-password">Forgot Password?</a>
            <div className="signup-link">
              Don't have an account? <a href="#">Sign Up</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 