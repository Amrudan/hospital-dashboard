import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Lab.css';

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

  useEffect(() => {
    fetchTests();
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  return (
    <div className="lab-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
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
            <input
              type="time"
              name="testTime"
              value={formData.testTime}
              onChange={handleChange}
              required
            />
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
              {tests.map(test => (
                <tr key={test._id}>
                  <td>{test.patientName}</td>
                  <td>{test.patientId}</td>
                  <td>{test.testName}</td>
                  <td>{new Date(test.testDate).toLocaleDateString()}</td>
                  <td>{test.testTime}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Lab;