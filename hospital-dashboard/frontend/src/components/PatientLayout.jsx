import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { FaCalendarAlt, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './PatientLayout.css';

const PatientLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const menuItems = [
    { path: '/patient-dashboard', icon: <FaCalendarAlt />, label: 'Book Appointment' },
    { path: '/patient-dashboard/profile', icon: <FaUserCircle />, label: 'My Profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/patient-login');
  };

  return (
    <div className="patient-layout">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}> 
        <div className="sidebar-header">
          <h2>Hospital Patient</h2>
          {/* <button 
            className="toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button> */}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {isSidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="main-content">
        <div className="patient-header-bar">
          <div className="header-title">Patient Dashboard</div>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt style={{ marginRight: 8 }} /> Logout
          </button>
        </div>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout; 