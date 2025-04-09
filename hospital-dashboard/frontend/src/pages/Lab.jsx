import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./Lab.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const Lab = () => {
  const [labTests, setLabTests] = useState([]);
  const [newPatient, setNewPatient] = useState({
    patientId: "",
    name: "",
    age: "",
    gender: "",
    testName: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [searchData, setSearchData] = useState({ patientId: "", testName: "" });
  const [filteredStatus, setFilteredStatus] = useState(null);
  const [testStatistics, setTestStatistics] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTests, setFilteredTests] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableLabTests = [
    "Blood Test", "MRI Scan", "X-Ray", "CT Scan", "Urine Test", "COVID-19 Test", "ECG", "Ultrasound"
  ];

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const getRandomStatus = () => (Math.random() > 0.5 ? "Successfully Completed" : "In Process");

  // Fetch all lab tests on component mount
  useEffect(() => {
    fetchLabTests();
  }, []);

  // Fetch all lab tests
  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/labs');
      setLabTests(response.data);
      setFilteredTests(response.data);
    } catch (err) {
      setError('Failed to fetch lab tests');
      console.error('Error fetching lab tests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      if (!searchQuery.trim()) {
        setFilteredTests(labTests);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/labs/search?query=${searchQuery}`);
      setFilteredTests(response.data);
    } catch (err) {
      setError('Search failed');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Add new lab test
  const handleAddTest = async (testData) => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/labs', testData);
      await fetchLabTests(); // Refresh the list
      alert('Test added successfully!');
    } catch (err) {
      setError('Failed to add test');
      console.error('Error adding test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = () => {
    setLabTests([...labTests, { id: labTests.length + 1, ...newPatient, status: getRandomStatus() }]);
    setNewPatient({ patientId: "", name: "", age: "", gender: "", testName: "", date: new Date().toISOString().split('T')[0] });
  };

  const generateReport = (test) => {
    // Generate mock report data based on test type
    const mockResults = {
      "Blood Test": {
        "Hemoglobin": "14.2 g/dL",
        "WBC Count": "7.5 x 10^9/L",
        "RBC Count": "5.2 x 10^12/L",
        "Platelets": "250 x 10^9/L"
      },
      "MRI Scan": {
        "Findings": "No abnormalities detected",
        "Region": "Brain",
        "Contrast Used": "Yes"
      },
      "X-Ray": {
        "Findings": "No fractures detected",
        "Region": "Chest",
        "Additional Notes": "Normal lung fields"
      },
      "CT Scan": {
        "Findings": "Normal scan",
        "Region": "Abdomen",
        "Additional Notes": "No signs of inflammation"
      },
      "Urine Test": {
        "Color": "Pale Yellow",
        "pH": "6.5",
        "Protein": "Negative",
        "Glucose": "Negative"
      },
      "COVID-19 Test": {
        "Result": "Negative",
        "Test Type": "PCR",
        "Viral Load": "Not detected"
      },
      "ECG": {
        "Heart Rate": "72 bpm",
        "Rhythm": "Normal sinus rhythm",
        "QT Interval": "420 ms"
      },
      "Ultrasound": {
        "Findings": "Normal examination",
        "Region": "Gallbladder",
        "Additional Notes": "No stones or sludge"
      }
    };

    const report = {
      ...test,
      reportId: `R-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedOn: new Date().toLocaleString(),
      results: mockResults[test.testName],
      conclusion: "No abnormal findings detected. Patient is in good health.",
      doctorName: "Dr. John Smith",
      doctorId: "DOC-001"
    };

    setReportData(report);
    setShowReport(true);
  };

  // Calculate test statistics whenever labTests changes
  useEffect(() => {
    const stats = availableLabTests.map(test => {
      const totalTests = labTests.filter(t => t.testName === test).length;
      const pendingTests = labTests.filter(t => t.testName === test && t.status === "In Process").length;
      return { name: test, total: totalTests, pending: pendingTests };
    }).filter(stat => stat.total > 0); // Only include tests with at least one test

    setTestStatistics(stats);
  }, [labTests]);

  // Initialize filteredTests with all tests
  useEffect(() => {
    setFilteredTests(labTests);
  }, [labTests]);

  return (
    <div className="lab-management-page">
      <h2>Lab Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Patient ID, Name, or Test"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="search-button" 
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="table-container" style={{ marginBottom: "30px" }}>
        <h3>Enter Patient Details</h3>
        <div className="form-row">
          <input type="text" placeholder="Patient ID" value={newPatient.patientId} onChange={(e) => setNewPatient({ ...newPatient, patientId: e.target.value })} />
          <input type="text" placeholder="Name" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} />
          <input type="number" placeholder="Age" value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} />
          <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select value={newPatient.testName} onChange={(e) => setNewPatient({ ...newPatient, testName: e.target.value })}>
            <option value="">Select Test</option>
            {availableLabTests.map((test, index) => (
              <option key={index} value={test}>{test}</option>
            ))}
          </select>
          <input type="text" value={newPatient.date} readOnly />
          <button onClick={handleAddPatient}>Add</button>
        </div>
      </div>

      <div className="table-container" style={{ marginBottom: "30px" }}>
        <h3>Check Test Status</h3>
        <div className="form-row">
          <input type="text" placeholder="Enter Patient ID" value={searchData.patientId} onChange={(e) => setSearchData({ ...searchData, patientId: e.target.value })} />
          <select value={searchData.testName} onChange={(e) => setSearchData({ ...searchData, testName: e.target.value })}>
            <option value="">Select Test</option>
            {availableLabTests.map((test, index) => (
              <option key={index} value={test}>{test}</option>
            ))}
          </select>
          <button onClick={handleSearch}>Check Status</button>
        </div>
        {filteredStatus && (
          <div className="status-container" style={{ marginTop: "20px" }}>
            <h3>Test Status</h3>
            <p>Status: <span style={{ fontWeight: "bold", color: filteredStatus.status === "Successfully Completed" ? "green" : "orange" }}>
              {filteredStatus.status}
            </span></p>
            {filteredStatus.status === "Successfully Completed" && (
              <button 
                onClick={() => generateReport(filteredStatus)}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Generate Report
              </button>
            )}
          </div>
        )}

        {showReport && reportData && (
          <div className="report-container" style={{ marginTop: "20px", border: "1px solid #ddd", padding: "15px", borderRadius: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Test Report</h3>
              <button onClick={() => window.print()} style={{ padding: "5px 10px" }}>Print Report</button>
            </div>
            <div className="report-header" style={{ marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              <p><strong>Report ID:</strong> {reportData.reportId}</p>
              <p><strong>Generated On:</strong> {reportData.generatedOn}</p>
              <p><strong>Patient ID:</strong> {reportData.patientId}</p>
              <p><strong>Patient Name:</strong> {reportData.name}</p>
              <p><strong>Age:</strong> {reportData.age} | <strong>Gender:</strong> {reportData.gender}</p>
              <p><strong>Test:</strong> {reportData.testName}</p>
              <p><strong>Test Date:</strong> {reportData.date}</p>
            </div>
            <div className="report-results" style={{ marginBottom: "15px" }}>
              <h4>Test Results</h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Parameter</th>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.results).map(([key, value], index) => (
                    <tr key={index}>
                      <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{key}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-conclusion" style={{ marginBottom: "15px" }}>
              <h4>Conclusion</h4>
              <p>{reportData.conclusion}</p>
            </div>
            <div className="report-signature" style={{ marginTop: "30px", textAlign: "right" }}>
              <p><strong>{reportData.doctorName}</strong></p>
              <p>Doctor ID: {reportData.doctorId}</p>
            </div>
          </div>
        )}
      </div>

      <div className="table-container" style={{ marginBottom: "30px" }}>
        <h3>All Entered Tests</h3>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : filteredTests.length === 0 ? (
          <p className="no-results">No matching tests found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Test Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => (
                <tr key={test._id}>
                  <td>{test.id}</td>
                  <td>{test.patientId}</td>
                  <td>{test.name}</td>
                  <td>{test.age}</td>
                  <td>{test.gender}</td>
                  <td>{test.testName}</td>
                  <td>{test.date}</td>
                  <td style={{ 
                    color: test.status === "Successfully Completed" ? "green" : "orange",
                    fontWeight: "bold" 
                  }}>
                    {test.status}
                  </td>
                  <td>
                    {test.status === "Successfully Completed" && (
                      <button 
                        onClick={() => generateReport(test)}
                        className="view-report-btn"
                      >
                        View Report
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-container">
        <h3>Test Statistics</h3>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: "1" }}>
            <table>
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Tests Pending Today</th>
                </tr>
              </thead>
              <tbody>
                {availableLabTests.map((test, index) => {
                  const pendingTests = labTests.filter(t => t.testName === test && t.status === "In Process").length;
                  return (
                    <tr key={index}>
                      <td>{test}</td>
                      <td>{pendingTests}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ flex: "1", minHeight: "300px" }}>
            <h4 style={{ textAlign: "center" }}>Total Tests by Type</h4>
            {testStatistics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={testStatistics}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {testStatistics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`Total: ${value}`, props.payload.name]} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <p>No test data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lab;