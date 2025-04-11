import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Pharmacy.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Pharmacy = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [experiencedMedicines, setExperiencedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showEditPrescription, setShowEditPrescription] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);

  const [prescriptionForm, setPrescriptionForm] = useState({
    patient: '',
    prescribedBy: '',
    medications: [
      {
        name: '',
        dosage: '',
        quantity: '',
        frequency: '',
        duration: ''
      }
    ],
    notes: '',
    totalCost: 0
  });

  const [stockData, setStockData] = useState({
    labels: [],
    datasets: [{
      label: 'Prescription Count',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.5)'
    }]
  });

  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)'
      ]
    }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get prescriptions, patients, and staff data
      const [prescriptionsRes, patientsRes, staffRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pharmacy'),
        axios.get('http://localhost:5000/api/patients'),
        axios.get('http://localhost:5000/api/staff')
      ]);
      
      setPrescriptions(prescriptionsRes.data);
      setFilteredPrescriptions(prescriptionsRes.data);
      setPatients(patientsRes.data);
      setStaff(staffRes.data);

      // Generate experienced medicines (most frequently prescribed)
      const medicationCounts = {};
      prescriptionsRes.data.forEach(prescription => {
        prescription.medications.forEach(med => {
          if (medicationCounts[med.name]) {
            medicationCounts[med.name].count += 1;
            medicationCounts[med.name].dosages.add(med.dosage);
          } else {
            medicationCounts[med.name] = { 
              count: 1, 
              dosages: new Set([med.dosage]),
              name: med.name
            };
          }
        });
      });

      // Convert to array and sort by count (descending)
      const experiencedMeds = Object.values(medicationCounts)
        .map(med => ({
          name: med.name,
          count: med.count,
          dosages: Array.from(med.dosages)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 medicines
      
      setExperiencedMedicines(experiencedMeds);

      // Process data for charts
      const statuses = prescriptionsRes.data.map(p => p.status);
      const uniqueStatuses = [...new Set(statuses)];
      const statusCounts = uniqueStatuses.map(status => 
        statuses.filter(s => s === status).length
      );

      // Get patients with prescriptions 
      const patientsWithRx = prescriptionsRes.data.map(p => {
        const patient = patientsRes.data.find(pat => pat._id === p.patient);
        return patient ? patient.name : 'Unknown';
      });
      
      const topPatients = [...new Set(patientsWithRx)].slice(0, 8);
      const patientCounts = topPatients.map(patient => 
        patientsWithRx.filter(p => p === patient).length
      );

      setStockData({
        labels: topPatients,
        datasets: [{
          label: 'Prescription Count',
          data: patientCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      });

      setCategoryData({
        labels: uniqueStatuses,
        datasets: [{
          data: statusCounts,
          backgroundColor: [
            'rgba(255, 206, 86, 0.5)', // Pending
            'rgba(75, 192, 192, 0.5)', // Dispensed
            'rgba(255, 99, 132, 0.5)'  // Cancelled
          ]
        }]
      });

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredPrescriptions(prescriptions);
      return;
    }
    
    const filtered = prescriptions.filter(prescription => {
      const patient = patients.find(p => p._id === prescription.patient);
      const patientName = patient ? patient.name.toLowerCase() : '';
      
      const medicineMatch = prescription.medications.some(med => 
        med.name.toLowerCase().includes(query)
      );
      
      return patientName.includes(query) || medicineMatch;
    });
    
    setFilteredPrescriptions(filtered);
  };

  const handleAddMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [
        ...prescriptionForm.medications,
        { name: '', dosage: '', quantity: '', frequency: '', duration: '' }
      ]
    });
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = [...prescriptionForm.medications];
    updatedMedications.splice(index, 1);
    setPrescriptionForm({
      ...prescriptionForm,
      medications: updatedMedications
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...prescriptionForm.medications];
    updatedMedications[index][field] = value;
    setPrescriptionForm({
      ...prescriptionForm,
      medications: updatedMedications
    });
  };

  const calculateTotalCost = () => {
    // Simple cost calculation based on quantity
    const totalCost = prescriptionForm.medications.reduce((sum, med) => {
      const quantity = parseInt(med.quantity) || 0;
      // Assume a base price of $10 per unit
      return sum + (quantity * 10);
    }, 0);
    
    setPrescriptionForm({
      ...prescriptionForm,
      totalCost
    });
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!prescriptionForm.patient || !prescriptionForm.prescribedBy || 
          prescriptionForm.medications.length === 0) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Calculate total cost before submission
      calculateTotalCost();
      
      const response = await axios.post('http://localhost:5000/api/pharmacy', prescriptionForm);
      
      if (response.data) {
        console.log('Successfully added prescription:', response.data);
        setShowAddPrescription(false);
        // Reset form
        setPrescriptionForm({
          patient: '',
          prescribedBy: '',
          medications: [
            {
              name: '',
              dosage: '',
              quantity: '',
              frequency: '',
              duration: ''
            }
          ],
          notes: '',
          totalCost: 0
        });
        fetchData(); // Refresh the data
      }
    } catch (err) {
      console.error('Error adding prescription:', err.response?.data || err.message);
      alert(`Failed to add prescription: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionForm(prescription);
    setShowEditPrescription(true);
  };

  const handleUpdatePrescription = async (e) => {
    e.preventDefault();
    try {
      calculateTotalCost();
      await axios.put(`http://localhost:5000/api/pharmacy/${selectedPrescription._id}`, prescriptionForm);
      setShowEditPrescription(false);
      fetchData();
    } catch (err) {
      console.error('Error updating prescription:', err);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await axios.delete(`http://localhost:5000/api/pharmacy/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting prescription:', err);
      }
    }
  };

  const handleDispenseMedication = async (id) => {
    try {
      // Find a pharmacist from staff list
      const pharmacist = staff.find(s => s.role === 'Pharmacist');
      
      if (!pharmacist) {
        alert('No pharmacist found in staff list');
        return;
      }
      
      await axios.post(`http://localhost:5000/api/pharmacy/${id}/dispense`, {
        dispensedBy: pharmacist._id
      });
      
      fetchData();
    } catch (err) {
      console.error('Error dispensing medication:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading pharmacy data...</div>;
  }

  return (
    <div className="pharmacy-container">
      <div className="pharmacy-header">
        <h2>Pharmacy Management</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="action-buttons">
          <button 
            className="add-button"
            onClick={() => setShowAddPrescription(true)}
          >
            Add Prescription
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Patient Prescription Count</h3>
          <Bar 
            data={stockData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
        <div className="chart-card">
          <h3>Prescription Status</h3>
          <Pie 
            data={categoryData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                }
              }
            }}
          />
        </div>
      </div>

      {/* Experienced Medicines Section */}
      <div className="experienced-medicines-section">
        <h3>Frequently Prescribed Medicines</h3>
        <div className="medicine-cards">
          {experiencedMedicines.map((medicine, index) => (
            <div className="medicine-card" key={index}>
              <h4>{medicine.name}</h4>
              <p>Prescribed {medicine.count} times</p>
              <p>Common dosages:</p>
              <ul>
                {medicine.dosages.map((dosage, i) => (
                  <li key={i}>{dosage}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="table-section">
        <h3>Prescriptions List</h3>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Medications</th>
              <th>Status</th>
              <th>Total Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.map(prescription => {
              const patient = patients.find(p => p._id === prescription.patient);
              const patientName = patient ? patient.name : 'Unknown';
              
              return (
                <tr key={prescription._id}>
                  <td>{patientName}</td>
                  <td>{new Date(prescription.prescriptionDate).toLocaleDateString()}</td>
                  <td>
                    <ul className="medication-list">
                      {prescription.medications.map((med, index) => (
                        <li key={index}>{med.name} ({med.dosage})</li>
                      ))}
                    </ul>
                  </td>
                  <td>{prescription.status}</td>
                  <td>${prescription.totalCost}</td>
                  <td>
                    <div className="action-buttons-cell">
                      {prescription.status === 'Pending' && (
                        <button onClick={() => handleDispenseMedication(prescription._id)}>Dispense</button>
                      )}
                      <button onClick={() => handleEditPrescription(prescription)}>Edit</button>
                      <button onClick={() => handleDeletePrescription(prescription._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Prescription Modal */}
      {showAddPrescription && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Prescription</h3>
              <form onSubmit={handleAddPrescription}>
                <div className="form-group">
                  <label>Patient</label>
                  <select
                    value={prescriptionForm.patient}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, patient: e.target.value})}
                    required
                    className="select-dropdown"
                  >
                    <option value="">Select Patient</option>
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No patients available</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prescribed By</label>
                  <select
                    value={prescriptionForm.prescribedBy}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, prescribedBy: e.target.value})}
                    required
                    className="select-dropdown"
                  >
                    <option value="">Select Doctor</option>
                    {staff.length > 0 ? (
                      staff.filter(s => s.role === 'Doctor').map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No doctors available</option>
                    )}
                  </select>
                </div>
                
                <h4>Medications</h4>
                {prescriptionForm.medications.map((med, index) => (
                  <div key={index} className="medication-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          required
                          placeholder="e.g., 500mg"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={med.quantity}
                          onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Frequency</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                          placeholder="e.g., 3 times daily"
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          required
                          placeholder="e.g., 7 days"
                        />
                      </div>
                    </div>
                    {prescriptionForm.medications.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-med-button"
                        onClick={() => handleRemoveMedication(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="add-med-button"
                  onClick={handleAddMedication}
                >
                  + Add Another Medication
                </button>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                  />
                </div>
                
                <div className="modal-buttons">
                  <button 
                    type="button" 
                    className="calculate-button"
                    onClick={calculateTotalCost}
                  >
                    Calculate Cost
                  </button>
                  <p className="total-cost">Total Cost: ${prescriptionForm.totalCost}</p>
                  <button type="submit" className="submit-button">Create Prescription</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowAddPrescription(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prescription Modal */}
      {showEditPrescription && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Prescription</h3>
              <form onSubmit={handleUpdatePrescription}>
                <div className="form-group">
                  <label>Patient</label>
                  <select
                    value={prescriptionForm.patient}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, patient: e.target.value})}
                    required
                    className="select-dropdown"
                  >
                    <option value="">Select Patient</option>
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No patients available</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prescribed By</label>
                  <select
                    value={prescriptionForm.prescribedBy}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, prescribedBy: e.target.value})}
                    required
                    className="select-dropdown"
                  >
                    <option value="">Select Doctor</option>
                    {staff.length > 0 ? (
                      staff.filter(s => s.role === 'Doctor').map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No doctors available</option>
                    )}
                  </select>
                </div>
                
                <h4>Medications</h4>
                {prescriptionForm.medications.map((med, index) => (
                  <div key={index} className="medication-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={med.quantity}
                          onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Frequency</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    {prescriptionForm.medications.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-med-button"
                        onClick={() => handleRemoveMedication(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="add-med-button"
                  onClick={handleAddMedication}
                >
                  + Add Another Medication
                </button>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={prescriptionForm.status}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, status: e.target.value})}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Dispensed">Dispensed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="modal-buttons">
                  <button 
                    type="button" 
                    className="calculate-button"
                    onClick={calculateTotalCost}
                  >
                    Recalculate Cost
                  </button>
                  <p className="total-cost">Total Cost: ${prescriptionForm.totalCost}</p>
                  <button type="submit" className="submit-button">Update Prescription</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowEditPrescription(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;