import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import './Lab.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Lab = () => {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    testName: '',
    testDate: '',
    testTime: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Add test types array
  const testTypes = [
    "Blood Test",
    "MRI Scan",
    "X-Ray",
    "CT Scan",
    "Urine Test",
    "COVID-19 Test",
    "ECG",
    "Ultrasound"
  ];

  // Add chart data states
  const [testDistribution, setTestDistribution] = useState({
    labels: [],
    datasets: [{
      label: 'Number of Tests',
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
    }]
  });

  const [statusDistribution, setStatusDistribution] = useState({
    labels: ['Pending', 'Completed', 'Cancelled'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
      ],
    }]
  });

  // Helper to convert 12-hour time to 24-hour format
  const to24HourTime = (hour, minute, ampm) => {
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minute}`;
  };

  // State for 12-hour time picker
  const [time12, setTime12] = useState({ hour: '12', minute: '00', ampm: 'AM' });

  // Update formData.testTime when time12 changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      testTime: to24HourTime(time12.hour, time12.minute, time12.ampm)
    }));
    // eslint-disable-next-line
  }, [time12]);

  useEffect(() => {
    fetchTests();
    fetchPatients();
  }, []);

  // Update chart data when tests change
  useEffect(() => {
    if (tests.length > 0) {
      // Calculate test distribution
      const testCounts = {};
      tests.forEach(test => {
        testCounts[test.testName] = (testCounts[test.testName] || 0) + 1;
      });

      setTestDistribution({
        labels: Object.keys(testCounts),
        datasets: [{
          ...testDistribution.datasets[0],
          data: Object.values(testCounts)
        }]
      });

      // Calculate status distribution
      const statusCounts = {
        'pending': tests.filter(t => t.status === 'pending').length,
        'completed': tests.filter(t => t.status === 'completed').length,
        'cancelled': tests.filter(t => t.status === 'cancelled').length
      };

      setStatusDistribution({
        ...statusDistribution,
        datasets: [{
          ...statusDistribution.datasets[0],
          data: Object.values(statusCounts)
        }]
      });
    }
  }, [tests]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowSearchResults(!!e.target.value && filteredPatients.length > 0);
  };

  const handleSearchResultClick = (patient) => {
    setFormData({
      ...formData,
      patientName: patient.name,
      patientId: patient._id
    });
    setSearchTerm(patient.name);
    setShowSearchResults(false);
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/lab');
      setTests(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch lab tests');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/list');
      console.log('Patients data:', response.data);
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to fetch patients list');
    }
  };

  const handlePatientSelect = (e) => {
    const selectedPatient = patients.find(p => p._id === e.target.value);
    console.log('Selected patient:', selectedPatient);
    if (selectedPatient) {
      setFormData({
        ...formData,
        patientName: selectedPatient.name,
        patientId: selectedPatient._id
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/lab', formData);
      setSuccess('Lab test added successfully');
      setFormData({
        patientName: '',
        patientId: '',
        testName: '',
        testDate: '',
        testTime: '',
        notes: ''
      });
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/lab/${id}`);
      setSuccess('Lab test deleted successfully');
      fetchTests();
    } catch (err) {
      setError('Failed to delete lab test');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/lab/${id}`, { status: newStatus });
      setSuccess('Status updated successfully');
      fetchTests();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to generate the formatted patient ID
  const generatePatientId = (patient) => {
    if (!patient || !patient.name || !patient.age || !patient.gender) {
      return 'N/A';
    }
    const ageStr = patient.age.toString().padStart(2, '0').substring(0, 2);
    const namePrefix = patient.name.substring(0, 3).toUpperCase();
    const genderChar = patient.gender.toLowerCase().startsWith('m') ? 'm' : 'f';
    return `${ageStr}${namePrefix}${genderChar}`;
  };

  // Helper to format time to 12-hour format with AM/PM
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <div className="lab-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="search-container" style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
          onFocus={() => setShowSearchResults(!!searchTerm && filteredPatients.length > 0)}
          onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        />
        {showSearchResults && (
          <div className="search-results-lab" style={{
            position: 'absolute',
            left: 'calc(100% + 10px)',
            top: 0,
            width: '260px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: 100,
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '0.5rem 0',
          }}>
            {filteredPatients.length === 0 ? (
              <div style={{ padding: '1rem', color: '#888' }}>No results found</div>
            ) : (
              filteredPatients.map(patient => (
                <div
                  key={patient._id}
                  style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f1f1' }}
                  onMouseDown={() => handleSearchResultClick(patient)}
                >
                  <div style={{ fontWeight: 600 }}>{patient.name}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>ID: {generatePatientId(patient)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="lab-form">
        <div className="form-row">
          <div className="form-group">
            <label>Select Patient</label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handlePatientSelect}
              required
            >
              <option value="">Select a patient</option>
              {filteredPatients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              readOnly
              required
            />
          </div>

          <div className="form-group">
            <label>Patient ID</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              readOnly
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Test Name</label>
            <select
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              required
            >
              <option value="">Select a test</option>
              {testTypes.map((test, index) => (
                <option key={index} value={test}>
                  {test}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Test Date</label>
            <input
              type="date"
              name="testDate"
              value={formData.testDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Test Time</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={time12.hour}
                onChange={e => setTime12({ ...time12, hour: e.target.value })}
                style={{ width: '60px' }}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const val = (i + 1).toString().padStart(2, '0');
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              :
              <select
                value={time12.minute}
                onChange={e => setTime12({ ...time12, minute: e.target.value })}
                style={{ width: '60px' }}
              >
                {Array.from({ length: 60 }, (_, i) => {
                  const val = i.toString().padStart(2, '0');
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
              <select
                value={time12.ampm}
                onChange={e => setTime12({ ...time12, ampm: e.target.value })}
                style={{ width: '60px' }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="submit-button-container">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Adding...' : 'Add Test'}
          </button>
        </div>
      </form>

      <div className="visualization-container">
        <div className="chart-container">
          <h3>Test Distribution</h3>
          <Bar
            data={testDistribution}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    precision: 0
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: 10
                    }
                  }
                },
                title: {
                  display: true,
                  text: 'Number of Tests by Type',
                  font: {
                    size: 12
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return context.raw.toFixed(0);
                    }
                  }
                }
              }
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Test Status</h3>
          <Pie
            data={statusDistribution}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 12,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="lab-tests">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Test Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => {
                // Find the patient object for this test
                const patient = patients.find(p => p._id === test.patientId);
                return (
                  <tr key={test._id}>
                    <td>{test.patientName}</td>
                    <td>{patient ? generatePatientId(patient) : test.patientId}</td>
                    <td>{test.testName}</td>
                    <td>{new Date(test.testDate).toLocaleDateString()}</td>
                    <td>{formatTime12Hour(test.testTime)}</td>
                    <td>
                      <select
                        value={test.status}
                        onChange={(e) => handleStatusUpdate(test._id, e.target.value)}
                        disabled={loading}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(test._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Lab;