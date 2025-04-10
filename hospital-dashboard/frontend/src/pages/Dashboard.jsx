import React, { useState, useEffect } from 'react';
import { FaUserInjured, FaUserMd, FaBed, FaFlask } from 'react-icons/fa';
import './Dashboard.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { patientApi, staffApi, wardApi, labApi } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalWards: 0,
    totalLabs: 0
  });

  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('week');
  const [allPatients, setAllPatients] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [wardOccupancyData, setWardOccupancyData] = useState([]);
  const [staffOnDuty, setStaffOnDuty] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
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
        condition: patient.diagnosis || 'Not specified',
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
      
      // Set chart data based on selected time range
      updateTimeRange(activeTab);
      
      setPatientsLoading(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setPatientsLoading(false);
    }
  };

  const updateTimeRange = (range) => {
    setActiveTab(range);
    // In a real app, this would fetch different data based on the time range
    let data = [];
    
    switch(range) {
      case 'day':
        data = [
          { time: '8am', visits: 12 },
          { time: '10am', visits: 18 },
          { time: '12pm', visits: 22 },
          { time: '2pm', visits: 25 },
          { time: '4pm', visits: 20 },
          { time: '6pm', visits: 15 },
        ];
        break;
      case 'month':
        data = [
          { time: 'Week 1', visits: 280 },
          { time: 'Week 2', visits: 320 },
          { time: 'Week 3', visits: 305 },
          { time: 'Week 4', visits: 350 },
        ];
        break;
      case 'year':
        data = [
          { time: 'Jan', visits: 1250 },
          { time: 'Feb', visits: 1100 },
          { time: 'Mar', visits: 1350 },
          { time: 'Apr', visits: 1200 },
          { time: 'May', visits: 1400 },
          { time: 'Jun', visits: 1500 },
          { time: 'Jul', visits: 1300 },
          { time: 'Aug', visits: 1450 },
          { time: 'Sep', visits: 1600 },
          { time: 'Oct', visits: 1550 },
          { time: 'Nov', visits: 1700 },
          { time: 'Dec', visits: 1800 },
        ];
        break;
      default: // week
        data = [
          { name: 'Mon', visits: 45 },
          { name: 'Tue', visits: 52 },
          { name: 'Wed', visits: 49 },
          { name: 'Thu', visits: 63 },
          { name: 'Fri', visits: 58 },
          { name: 'Sat', visits: 48 },
          { name: 'Sun', visits: 42 },
        ];
    }
    
    setChartData(data);
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

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Hospital Dashboard</h1>
      
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
        <div className="charts-row">
          {/* Patient Visits Chart */}
          <div className="chart-container half-width animate-in" style={{animationDelay: '0.1s'}}>
            <div className="chart-header">
              <h3>Patient Visits</h3>
              <div className="chart-tabs">
                <button 
                  className={`chart-tab ${activeTab === 'day' ? 'active' : ''}`}
                  onClick={() => updateTimeRange('day')}
                >
                  Day
                </button>
                <button 
                  className={`chart-tab ${activeTab === 'week' ? 'active' : ''}`}
                  onClick={() => updateTimeRange('week')}
                >
                  Week
                </button>
                <button 
                  className={`chart-tab ${activeTab === 'month' ? 'active' : ''}`}
                  onClick={() => updateTimeRange('month')}
                >
                  Month
                </button>
                <button 
                  className={`chart-tab ${activeTab === 'year' ? 'active' : ''}`}
                  onClick={() => updateTimeRange('year')}
                >
                  Year
                </button>
              </div>
            </div>
            
            <div className="chart-content">
              {loading ? (
                <div className="chart-loading">
                  <div className="chart-loader"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                    <XAxis 
                      dataKey={activeTab === 'day' ? 'time' : activeTab === 'year' ? 'time' : activeTab === 'month' ? 'time' : 'name'} 
                      tick={{fontSize: 12}} 
                      axisLine={{stroke: '#CBD5E0'}}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{fontSize: 12}} 
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(237, 242, 247, 0.5)'}}
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="circle" 
                      wrapperStyle={{paddingTop: '10px'}}
                    />
                    <Bar 
                      dataKey="visits" 
                      name="Patient Visits" 
                      fill="url(#colorVisits)" 
                      barSize={activeTab === 'year' ? 20 : 30} 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5B86E5" stopOpacity={1} />
                        <stop offset="100%" stopColor="#36D1DC" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          {/* Ward Occupancy Chart */}
          <div className="chart-container half-width animate-in" style={{animationDelay: '0.2s'}}>
            <div className="chart-header">
              <h3>Ward Occupancy</h3>
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
        </div>
        
        <div className="chart-container animate-in" style={{animationDelay: '0.3s'}}>
          <div className="chart-header">
            <h3>Monthly Patient Trends</h3>
          </div>
          
          <div className="chart-content">
            {loading ? (
              <div className="chart-loading">
                <div className="chart-loader"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={[
                    { date: '01', admissions: 12 },
                    { date: '05', admissions: 19 },
                    { date: '10', admissions: 15 },
                    { date: '15', admissions: 22 },
                    { date: '20', admissions: 17 },
                    { date: '25', admissions: 24 },
                    { date: '30', admissions: 18 },
                  ]}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12}} 
                    axisLine={{stroke: '#CBD5E0'}}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{fontSize: 12}} 
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="admissions" 
                    name="Daily Admissions"
                    stroke="#5B86E5" 
                    fill="url(#colorAdmissions)" 
                    activeDot={{ r: 6 }}
                  />
                  <defs>
                    <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B86E5" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#36D1DC" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      {/* Tables Section */}
      <div className="dashboard-tables">
        <div className="table-section animate-in" style={{animationDelay: '0.4s'}}>
          <h3>Recent Patients</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Condition</th>
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
                    <td>{patient.condition}</td>
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
        
        <div className="table-section animate-in" style={{animationDelay: '0.5s'}}>
          <h3>Staff on Duty</h3>
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
      
      {/* All Patients Table */}
      <div className="all-patients-section animate-in" style={{animationDelay: '0.6s'}}>
        <h3>All Patients</h3>
        <div className="table-container">
          <table className="data-table full-width">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Patient Type</th>
                <th>Status</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {patientsLoading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">Loading patients...</td>
                </tr>
              ) : allPatients.length > 0 ? (
                allPatients.map(patient => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.contactNumber || 'N/A'}</td>
                    <td>{patient.patientType || 'Outpatient'}</td>
                    <td>
                      <span className={`status-badge status-${(patient.status || 'registered').toLowerCase()}`}>
                        {patient.status || 'Registered'}
                      </span>
                    </td>
                    <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-cell">No patients in the system</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 