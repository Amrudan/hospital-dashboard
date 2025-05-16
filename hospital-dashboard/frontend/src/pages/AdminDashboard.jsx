import React, { useState, useEffect } from 'react';
import { FaUserInjured, FaUserMd, FaBed, FaFlask, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { patientApi, staffApi, wardApi, labApi } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalWards: 0,
    totalLabs: 0
  });

  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [allPatients, setAllPatients] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [wardOccupancyData, setWardOccupancyData] = useState([]);
  const [staffOnDuty, setStaffOnDuty] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [doctorsBySpecialization, setDoctorsBySpecialization] = useState({});
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [staffDistributionData, setStaffDistributionData] = useState([]);
  const [labTestsData, setLabTestsData] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
    fetchLabTestsData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setPatientsLoading(true);
      
      // Fetch patients
      const patientsResponse = await patientApi.getAllPatients();
      const patients = patientsResponse.data;
      setAllPatients(patients);
      
      // Set recent patients (last 5 patients)
      const sortedPatients = [...patients].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentPatients(sortedPatients.slice(0, 5).map(patient => ({
        id: patient._id,
        name: patient.name,
        age: patient.age,
        reason: patient.medicalHistory || 'Not specified',
        status: patient.status || 'admitted'
      })));
      
      // Fetch staff
      const staffResponse = await staffApi.getAllStaff();
      const staff = staffResponse.data;
      
      // Fetch wards
      const wardsResponse = await wardApi.getAllWards();
      const wards = wardsResponse.data;
      
      // Fetch labs
      const labsResponse = await labApi.getAllLabTests();
      const labs = labsResponse.data;
      
      // Calculate statistics
      const totalPatients = patients.length;
      const doctors = staff.filter(s => s.role === 'Doctor');
      const totalDoctors = doctors.length;
      const totalWards = wards.length;
      const totalLabs = labs ? labs.length : 0;
      
      // Set stats
      setStats({
        totalPatients,
        totalDoctors,
        totalWards,
        totalLabs
      });
      
      // Calculate bed occupancy
      const totalBeds = wards.reduce((acc, ward) => acc + ward.capacity, 0);
      const occupiedBeds = wards.reduce((acc, ward) => acc + ward.currentOccupancy, 0);
      const availableBeds = totalBeds - occupiedBeds;
      
      setWardOccupancyData([
        { name: 'Available', value: availableBeds, color: '#36D1DC' },
        { name: 'Occupied', value: occupiedBeds, color: '#5B86E5' },
      ]);
      
      // Set staff on duty (first 5 doctors)
      setStaffOnDuty(doctors.slice(0, 5).map(doctor => ({
        id: doctor._id,
        name: doctor.name,
        department: doctor.department || 'General',
        shift: doctor.shift || 'Morning'
      })));
      
      // Fetch top doctors
      const topDoctorsResponse = await staffApi.getAllStaff();
      const topDoctorsData = topDoctorsResponse.data;
      const sortedTopDoctors = topDoctorsData
        .sort((a, b) => (b.experience || 0) - (a.experience || 0))
        .slice(0, 3);
      setTopDoctors(sortedTopDoctors);
      
      // Group doctors by specialization
      const groupedDoctors = topDoctorsData.reduce((acc, doctor) => {
        const specialization = doctor.specialization || 'General Medicine';
        if (!acc[specialization]) {
          acc[specialization] = [];
        }
        acc[specialization].push(doctor);
        return acc;
      }, {});

      // Sort each specialization group by experience and take top 3
      Object.keys(groupedDoctors).forEach(specialization => {
        groupedDoctors[specialization] = groupedDoctors[specialization]
          .sort((a, b) => (b.experience || 0) - (a.experience || 0))
          .slice(0, 3);
      });

      setDoctorsBySpecialization(groupedDoctors);
      setSelectedSpecialization(Object.keys(groupedDoctors)[0]);
      
      // Process staff data for the chart
      const staffDistributionData = processStaffData(staff);
      setStaffDistributionData(staffDistributionData);
      
      setPatientsLoading(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setPatientsLoading(false);
    }
  };

  const fetchLabTestsData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/lab');
      // Group by date (assume testDate or createdAt)
      const tests = res.data;
      const grouped = {};
      tests.forEach(test => {
        const date = (test.testDate || test.createdAt || '').slice(0, 10);
        if (!grouped[date]) grouped[date] = 0;
        grouped[date]++;
      });
      // Convert to array for chart
      const chartArr = Object.keys(grouped).sort().map(date => ({ date, count: grouped[date] }));
      setLabTestsData(chartArr);
    } catch (err) {
      console.error('Error fetching lab tests data:', err);
    }
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Add this function to process staff data
  const processStaffData = (staff) => {
    const doctors = staff.filter(s => s.role === 'Doctor').length;
    const nurses = staff.filter(s => s.role === 'Nurse').length;
    const otherStaff = staff.filter(s => s.role !== 'Doctor' && s.role !== 'Nurse').length;

    return [
      { name: 'Doctors', value: doctors, color: '#4299e1' },
      { name: 'Nurses', value: nurses, color: '#48bb78' },
      { name: 'Other Staff', value: otherStaff, color: '#ed8936' }
    ];
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const patientTypeColors = ['#5B86E5', '#36D1DC'];
  const patientTypeData = [
    { name: 'Inpatient', value: allPatients.filter(p => p.patientType === 'Inpatient').length },
    { name: 'Outpatient', value: allPatients.filter(p => p.patientType === 'Outpatient' || !p.patientType).length }
  ];

  return (
    <AdminLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-tile" style={{ background: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)' }}>
            <span className="stat-icon"><FaUserInjured /></span>
            <div className="stat-count">{loading ? '...' : stats.totalPatients.toLocaleString()}</div>
            <div className="stat-title">Total Patients</div>
            <span className="stat-increase">Current count</span>
          </div>
          <div className="stat-tile" style={{ background: 'linear-gradient(135deg, #A6C1EE 0%, #86A8E7 100%)' }}>
            <span className="stat-icon"><FaUserMd /></span>
            <div className="stat-count">{loading ? '...' : stats.totalDoctors}</div>
            <div className="stat-title">Total Doctors</div>
            <span className="stat-increase">Current count</span>
          </div>
          <div className="stat-tile" style={{ background: 'linear-gradient(135deg, #FCEABB 0%, #F8B500 100%)' }}>
            <span className="stat-icon"><FaBed /></span>
            <div className="stat-count">{loading ? '...' : stats.totalWards}</div>
            <div className="stat-title">Total Wards</div>
            <span className="stat-increase">Current count</span>
          </div>
          <div className="stat-tile" style={{ background: 'linear-gradient(135deg, #A1FFCE 0%, #FAFFD1 100%)' }}>
            <span className="stat-icon"><FaFlask /></span>
            <div className="stat-count">{loading ? '...' : stats.totalLabs}</div>
            <div className="stat-title">Total Labs</div>
            <span className="stat-increase">Current count</span>
          </div>
        </div>
        
        {/* Charts */}
        <div className="dashboard-charts">
          {/* First row of charts */}
          <div className="charts-row">
            <div className="chart-container half-width animate-in" style={{animationDelay: '0.2s'}}>
              <div className="chart-header">
                <h3>Ward Occupancy</h3>
              </div>
              <div className="chart-content ward-occupancy-chart">
                {loading ? (
                  <div className="chart-loading">
                    <div className="chart-loader"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={wardOccupancyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={120}
                        innerRadius={60}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={200}
                      >
                        {wardOccupancyData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} beds`, null]}
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle" 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="chart-summary">
                  <div className="summary-item">
                    <h4>Total Beds</h4>
                    <p>{wardOccupancyData.reduce((sum, item) => sum + item.value, 0)}</p>
                  </div>
                  <div className="summary-item">
                    <h4>Occupancy Rate</h4>
                    <p>
                      {wardOccupancyData.length ? 
                        `${Math.round((wardOccupancyData[1]?.value / wardOccupancyData.reduce((sum, item) => sum + item.value, 0)) * 100)}%` 
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-container half-width animate-in" style={{animationDelay: '0.3s'}}>
              <div className="chart-header">
                <h3>Patient Type Distribution</h3>
              </div>
              <div className="chart-content">
                {loading ? (
                  <div className="chart-loading">
                    <div className="chart-loader"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={patientTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {patientTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={patientTypeColors[index % patientTypeColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Second row of charts */}
          <div className="charts-row">
            <div className="chart-container half-width animate-in" style={{animationDelay: '0.4s'}}>
              <div className="chart-header">
                <h3>Lab Tests</h3>
              </div>
              <div className="chart-content">
                {loading ? (
                  <div className="chart-loading">
                    <div className="chart-loader"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={labTestsData} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                      <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={{stroke: '#CBD5E0'}} tickLine={false} />
                      <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} width={40} />
                      <Tooltip cursor={{fill: 'rgba(237, 242, 247, 0.5)'}} contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{paddingTop: '10px'}} />
                      <Bar dataKey="count" name="Lab Tests" fill="url(#colorLabTests)" barSize={30} radius={[4, 4, 0, 0]} animationDuration={1500} />
                      <defs>
                        <linearGradient id="colorLabTests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5B86E5" stopOpacity={1} />
                          <stop offset="100%" stopColor="#36D1DC" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="chart-container half-width animate-in" style={{animationDelay: '0.5s'}}>
              <div className="chart-header">
                <h3>Staff Distribution</h3>
              </div>
              <div className="chart-content">
                {loading ? (
                  <div className="chart-loading">
                    <div className="chart-loader"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={staffDistributionData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} staff members`, null]}
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#4299e1"
                        radius={[4, 4, 0, 0]}
                      >
                        {staffDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tables Section */}
        <div className="dashboard-tables">
          <div className="table-section animate-in" style={{animationDelay: '0.6s'}}>
            <h3>Recent Patients</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patientsLoading ? (
                  <tr>
                    <td colSpan="4" className="loading-cell">Loading patients...</td>
                  </tr>
                ) : recentPatients.length > 0 ? (
                  recentPatients.map(patient => (
                    <tr key={patient.id}>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.reason}</td>
                      <td>
                        <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-cell">No recent patients</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="table-section animate-in" style={{animationDelay: '0.7s'}}>
            <h3>Staff on Duty(Doctors)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Shift</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="loading-cell">Loading staff data...</td>
                  </tr>
                ) : staffOnDuty.length > 0 ? (
                  staffOnDuty.map(staff => (
                    <tr key={staff.id}>
                      <td>{staff.name}</td>
                      <td>{staff.department}</td>
                      <td>{staff.shift}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="empty-cell">No staff on duty</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Top Doctors by Specialization Section */}
        <div className="dashboard-section">
          <h2>Top Doctors by Specialization</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="specialization-container">
              <div className="specialization-selector">
                <select 
                  value={selectedSpecialization || ''}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="specialization-dropdown"
                >
                  {Object.keys(doctorsBySpecialization).map(specialization => (
                    <option key={specialization} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSpecialization && (
                <div className="doctors-cards-container">
                  {doctorsBySpecialization[selectedSpecialization].map((doctor, index) => (
                    <div key={doctor._id || index} className="doctor-card">
                      <div className="rank-badge">#{index + 1}</div>
                      <div className="doctor-info">
                        <h3>{doctor.name}</h3>
                        <p className="specialization">{selectedSpecialization}</p>
                        <p className="experience">{doctor.experience || 0} years of experience</p>
                        <p className="status">
                          Status: <span className={`status-badge ${doctor.status?.toLowerCase()}`}>
                            {doctor.status || 'Active'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 