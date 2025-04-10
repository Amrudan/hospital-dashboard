import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FaChartPie, 
  FaUserMd, 
  FaFlask, 
  FaProcedures, 
  FaPills, 
  FaUserInjured, 
  FaFileInvoiceDollar,
  FaHospitalAlt 
} from 'react-icons/fa';

const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const menuItems = [
    { path: "/", icon: <FaChartPie />, label: "Dashboard" },
    { path: "/staff", icon: <FaUserMd />, label: "Staff" },
    { path: "/lab", icon: <FaFlask />, label: "Laboratory" },
    { path: "/ward", icon: <FaProcedures />, label: "Wards" },
    { path: "/pharmacy", icon: <FaPills />, label: "Pharmacy" },
    { path: "/patient", icon: <FaUserInjured />, label: "Patients" },
    { path: "/invoice", icon: <FaFileInvoiceDollar />, label: "Invoices" }
  ];

  // Set active menu item based on current path
  useEffect(() => {
    const currentPath = window.location.pathname;
    const index = menuItems.findIndex(item => item.path === currentPath);
    setActiveIndex(index >= 0 ? index : 0);
  }, []);

  return (
    <div className="sidebar">
      <div className="logo">
        <span className="logo-icon"><FaHospitalAlt /></span>
        <span className="logo-text">HMS</span>
      </div>
      <nav>
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path}
            className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }
            style={{ 
              animationDelay: `${index * 0.05}s`,
              animation: 'fadeIn 0.5s ease forwards'
            }}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          Hospital Management System
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 