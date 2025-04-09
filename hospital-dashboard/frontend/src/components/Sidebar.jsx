import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { path: "/", icon: "📊", label: "Dashboard" },
    { path: "/staff", icon: "👥", label: "Staff" },
    { path: "/lab", icon: "🔬", label: "Lab" },
    { path: "/ward", icon: "🏥", label: "Ward" },
    { path: "/pharmacy", icon: "💊", label: "Pharmacy" },
    { path: "/patient", icon: "🧑", label: "Patient" },
    { path: "/invoice", icon: "💵", label: "Invoice" }
  ];

  return (
    <div className="sidebar">
      <div className="logo"></div>
      <nav>
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path}
            className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 