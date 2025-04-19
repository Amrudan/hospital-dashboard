import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin-dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/patients', icon: '👥', label: 'Patients' },
    { path: '/staff', icon: '👨‍⚕️', label: 'Staff' },
    { path: '/ward', icon: '🏥', label: 'Ward' },
    { path: '/lab', icon: '🔬', label: 'Laboratory' },
    { path: '/pharmacy', icon: '💊', label: 'Pharmacy' },
    { path: '/invoice', icon: '💰', label: 'Invoice' },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Hospital Admin</h2>
          <button 
            className="toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
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
        <header className="admin-header">
          <div className="header-left">
            <h1>{menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">Admin User</span>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 