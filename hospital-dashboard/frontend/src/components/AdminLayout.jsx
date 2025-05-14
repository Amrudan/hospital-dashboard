import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';
import { FaUserMd, FaUsers, FaProcedures, FaFlask, FaPills, FaFileInvoiceDollar, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  const menuItems = [
    { path: '/admin-dashboard', icon: <FaUserMd />, label: 'Dashboard' },
    { path: '/patients', icon: <FaUsers />, label: 'Patients' },
    { path: '/staff', icon: <FaUserMd />, label: 'Staff' },
    { path: '/ward', icon: <FaProcedures />, label: 'Wards' },
    { path: '/lab', icon: <FaFlask />, label: 'Lab' },
    { path: '/pharmacy', icon: <FaPills />, label: 'Pharmacy' },
    { path: '/invoice', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
    { path: '/appointments', icon: <FaCalendarAlt />, label: 'Appointments' }
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
          {/* <button 
            className="toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
        {/* Header bar with user info */}
        <div className="admin-header-bar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #eee' }}>
          <Link to="/admin-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: '#1a2980', textDecoration: 'none' }}>
            <FaUserCircle style={{ fontSize: '1.3rem' }} />
            {user?.name ? user.name : 'Admin'}
          </Link>
        </div>
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 