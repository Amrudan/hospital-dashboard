import { useState, useEffect } from 'react';
import axios from 'axios';
import StatCards from '../components/StatCards';
import { LineChart, PieChart } from '../components/charts';
import PatientGraph from '../components/PatientsGraph';
import AppointmentsTable from '../components/AppointmentsTable';
import DoctorsTable from '../components/DoctorsTable';
import StockTable from '../components/StockTable';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalWards: 0,
    totalLabs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        patientsRes,
        doctorsRes,
        wardsRes,
        labsRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/patients/count'),
        axios.get('http://localhost:5000/api/doctors/count'),
        axios.get('http://localhost:5000/api/wards/count'),
        axios.get('http://localhost:5000/api/labs/count')
      ]);

      setStats({
        totalPatients: patientsRes.data.count,
        totalDoctors: doctorsRes.data.count,
        totalWards: wardsRes.data.count,
        totalLabs: labsRes.data.count
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      icon: "👥", 
      title: "Total Patients", 
      count: stats.totalPatients,
      bgColor: "#ffffff"
    },
    { 
      icon: "💉", 
      title: "Total Doctors", 
      count: stats.totalDoctors,
      bgColor: "#ffffff"
    },
    { 
      icon: "🏥", 
      title: "Total Wards", 
      count: stats.totalWards,
      bgColor: "#ffffff"
    },
    { 
      icon: "🔬", 
      title: "Total Labs", 
      count: stats.totalLabs,
      bgColor: "#ffffff"
    }
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-tile">
            <div className="stat-icon">
              <span>{stat.icon}</span>
            </div>
            <div className="stat-info">
              <p className="stat-title">{stat.title}</p>
              <h2 className="stat-count">{stat.count}</h2>
            </div>
          </div>
        ))}
      </div>
      <PatientGraph />
      <div className="tables-section">
        <AppointmentsTable />
        <DoctorsTable />
        <StockTable />
      </div>
    </div>
  );
};

export default Dashboard; 