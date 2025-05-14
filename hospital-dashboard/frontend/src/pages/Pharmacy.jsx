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
import { Modal } from 'react-bootstrap';

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
  const [showEditPrescription, setShowEditPrescription] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState(null);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [medicinePrices, setMedicinePrices] = useState([]);

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
      label: 'Stock Count',
      data: [],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
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
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 1
    }]
  });

  const [topMedicinesData, setTopMedicinesData] = useState({
    labels: [],
    datasets: [{
      label: 'Prescribed Count',
      data: [],
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1
    }]
  });

  // Medication catalog with detailed information
  const medicationCatalog = [
    { name: 'Paracetamol', price: 5, category: 'Pain Relief' },
    { name: 'Ibuprofen', price: 8, category: 'Pain Relief' },
    { name: 'Amoxicillin', price: 12, category: 'Antibiotic' },
    { name: 'Omeprazole', price: 15, category: 'Antacid' },
    { name: 'Atorvastatin', price: 20, category: 'Cholesterol' },
    { name: 'Metformin', price: 10, category: 'Diabetes' },
    { name: 'Lisinopril', price: 18, category: 'Blood Pressure' },
    { name: 'Levothyroxine', price: 25, category: 'Thyroid' },
    { name: 'Amlodipine', price: 22, category: 'Blood Pressure' },
    { name: 'Simvastatin', price: 30, category: 'Cholesterol' }
  ];

  // Medical supplies catalog
  const medicalSuppliesCatalog = [
    { name: 'Diapers', category: 'Personal Care', price: 25, unit: 'pack' },
    { name: 'Napkins', category: 'Personal Care', price: 15, unit: 'pack' },
    { name: 'Gloves', category: 'Medical Supplies', price: 10, unit: 'pair' },
    { name: 'Masks', category: 'Medical Supplies', price: 5, unit: 'piece' },
    { name: 'Bandages', category: 'Medical Supplies', price: 8, unit: 'pack' },
    { name: 'Cotton Swabs', category: 'Medical Supplies', price: 12, unit: 'pack' },
    { name: 'Syringes', category: 'Injections', price: 15, unit: 'piece' },
    { name: 'Needles', category: 'Injections', price: 8, unit: 'piece' },
    { name: 'IV Sets', category: 'Medical Supplies', price: 30, unit: 'set' },
    { name: 'Catheters', category: 'Medical Supplies', price: 45, unit: 'piece' }
  ];

  const [medicalSupplies, setMedicalSupplies] = useState([]);
  const [showAddSupply, setShowAddSupply] = useState(false);
  const [supplyForm, setSupplyForm] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    unit: '',
    soldTo: ''
  });

  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setPatientsLoading(true);

      // Fetch all data in parallel
      const [prescriptionsRes, patientsRes, staffRes, medicinePricesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pharmacy'),
        axios.get('http://localhost:5000/api/patients'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/medicines/prices')
      ]);

      const patientsData = patientsRes.data;
      const prescriptionsData = prescriptionsRes.data;

      // Process prescriptions with patient names if not already present
      const processedPrescriptions = prescriptionsData.map(prescription => {
        if (prescription.patientName) {
          return prescription;
        }
        const patient = patientsData.find(p => p._id === prescription.patient);
        return {
          ...prescription,
          patientName: patient ? patient.name : 'Unknown'
        };
      });

      setPrescriptions(processedPrescriptions);
      setFilteredPrescriptions(processedPrescriptions);
      setPatients(patientsData);
      setStaff(staffRes.data);
      setMedicinePrices(medicinePricesRes.data);

      // Update charts data
      updateChartsData(processedPrescriptions);

      // Fetch medical supplies
      try {
        const suppliesRes = await axios.get('http://localhost:5000/api/pharmacy/supplies');
        if (suppliesRes.data && Array.isArray(suppliesRes.data)) {
          setMedicalSupplies(suppliesRes.data);
        }
      } catch (suppliesError) {
        console.error('Error fetching supplies:', suppliesError);
        setMedicalSupplies([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setPatientsLoading(false);
    }
  };

  const updateChartsData = (prescriptionsData) => {
    // Update stock data
    const patientCounts = {};
    prescriptionsData.forEach(prescription => {
      const patient = patients.find(p => p._id === prescription.patient);
      const patientName = patient ? patient.name : 'Unknown';
      patientCounts[patientName] = (patientCounts[patientName] || 0) + 1;
    });

    setStockData({
      labels: Object.keys(patientCounts),
      datasets: [{
        label: 'Prescription Count',
        data: Object.values(patientCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    });

    // Update category data
    const statusCounts = {};
    prescriptionsData.forEach(prescription => {
      statusCounts[prescription.status] = (statusCounts[prescription.status] || 0) + 1;
    });

    setCategoryData({
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    });

    // Update experienced medicines
    const medicineStats = {};
    prescriptionsData.forEach(prescription => {
      prescription.medications.forEach(med => {
        if (!medicineStats[med.name]) {
          medicineStats[med.name] = {
            count: 0,
            dosages: new Set()
          };
        }
        medicineStats[med.name].count++;
        medicineStats[med.name].dosages.add(med.dosage);
      });
    });

    const experiencedMedsData = Object.entries(medicineStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        dosages: Array.from(stats.dosages)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setExperiencedMedicines(experiencedMedsData);

    // New: Top Medicines Bar Chart
    setTopMedicinesData({
      labels: experiencedMedsData.map(med => med.name),
      datasets: [{
        label: 'Prescribed Count',
        data: experiencedMedsData.map(med => med.count),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (prescriptions.length > 0 && patients.length > 0) {
      updateChartsData(prescriptions);
    }
  }, [patients]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredPrescriptions(prescriptions);
      return;
    }

    const filtered = prescriptions.filter(prescription => {
      // Search by patient name
      const patientNameMatch = prescription.patientName.toLowerCase().includes(query);

      // Search by medicine names
      const medicineMatch = prescription.medications.some(med =>
        med.name.toLowerCase().includes(query)
      );

      // Search by status
      const statusMatch = prescription.status.toLowerCase().includes(query);

      // Search by date
      const dateMatch = new Date(prescription.prescriptionDate)
        .toLocaleDateString()
        .toLowerCase()
        .includes(query);

      return patientNameMatch || medicineMatch || statusMatch || dateMatch;
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

    if (field === 'name') {
      const selectedMed = medicationCatalog.find(med => med.name === value);
      if (selectedMed) {
        updatedMedications[index].price = selectedMed.price;
      }
    }

    setPrescriptionForm({
      ...prescriptionForm,
      medications: updatedMedications
    });

    if (field === 'name' || field === 'quantity') {
      calculateTotalCost();
    }
  };

  const calculateTotalCost = () => {
    const totalCost = prescriptionForm.medications.reduce((sum, med) => {
      const quantity = parseInt(med.quantity) || 0;
      const price = med.price || 0;
      return sum + (quantity * price);
    }, 0);

    setPrescriptionForm({
      ...prescriptionForm,
      totalCost
    });
  };

  const handleCreatePrescription = async () => {
    try {
      // Validate required fields
      if (!prescriptionForm.patient || !prescriptionForm.prescribedBy) {
        alert('Please select both patient and doctor');
        return;
      }

      if (!prescriptionForm.medications || prescriptionForm.medications.length === 0) {
        alert('Please add at least one medication');
        return;
      }

      // Validate medication details
      const invalidMedication = prescriptionForm.medications.find(med =>
        !med.name || !med.dosage || !med.quantity || !med.frequency || !med.duration
      );

      if (invalidMedication) {
        alert('Please fill in all medication details');
        return;
      }

      // Get patient name
      const selectedPatient = patients.find(p => p._id === prescriptionForm.patient);
      if (!selectedPatient) {
        alert('Selected patient not found');
        return;
      }

      // Get doctor name
      const selectedDoctor = staff.find(s => s._id === prescriptionForm.prescribedBy);
      if (!selectedDoctor) {
        alert('Selected doctor not found');
        return;
      }

      // Calculate total cost
      const totalCost = prescriptionForm.medications.reduce((sum, med) => {
        const medicine = medicationCatalog.find(m => m.name === med.name);
        return sum + (medicine ? medicine.price * parseInt(med.quantity) : 0);
      }, 0);

      // Prepare prescription data
      const prescriptionData = {
        ...prescriptionForm,
        patientName: selectedPatient.name,
        doctorName: selectedDoctor.name,
        prescriptionDate: new Date().toISOString(),
        status: 'Pending',
        totalCost: totalCost
      };

      // Send to backend
      const response = await axios.post('http://localhost:5000/api/pharmacy', prescriptionData);

      if (response.data) {
        // Update local state with new prescription
        const newPrescription = {
          ...response.data,
          patientName: selectedPatient.name,
          doctorName: selectedDoctor.name,
          medications: prescriptionForm.medications,
          totalCost: totalCost
        };

        // Update both prescriptions and filteredPrescriptions
        setPrescriptions(prevPrescriptions => [newPrescription, ...prevPrescriptions]);
        setFilteredPrescriptions(prevFiltered => [newPrescription, ...prevFiltered]);

        // Reset form and close modal
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
        setShowAddPrescription(false);
        alert('Prescription created successfully!');
      }
    } catch (err) {
      console.error('Error adding prescription:', err);
      alert('Failed to add prescription. Please try again.');
    }
  };

  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setPrescriptionForm({
      ...prescription,
      patient: prescription.patient._id,
      prescribedBy: prescription.prescribedBy._id
    });
    setShowEditPrescription(true);
  };

  const handleUpdatePrescription = async (e) => {
    e.preventDefault();
    try {
      calculateTotalCost();

      const selectedPatient = patients.find(p => p._id === prescriptionForm.patient);
      if (!selectedPatient) {
        alert('Selected patient not found');
        return;
      }

      const updatedPrescriptionData = {
        ...prescriptionForm,
        patientName: selectedPatient.name
      };

      await axios.put(`http://localhost:5000/api/pharmacy/${selectedPrescription._id}`, updatedPrescriptionData);
      setShowEditPrescription(false);
      fetchData();
    } catch (err) {
      console.error('Error updating prescription:', err);
      alert('Failed to update prescription. Please try again.');
    }
  };

  const handleDeletePrescription = async (id) => {
    try {
      if (!id) {
        alert('Invalid prescription ID');
        return;
      }

      if (window.confirm('Are you sure you want to delete this prescription?')) {
        const response = await axios.delete(`http://localhost:5000/api/pharmacy/${id}`);

        if (response.status === 200) {
          // Update the prescriptions list immediately
          setPrescriptions(prevPrescriptions =>
            prevPrescriptions.filter(prescription => prescription._id !== id)
          );
          setFilteredPrescriptions(prevFiltered =>
            prevFiltered.filter(prescription => prescription._id !== id)
          );
          alert('Prescription deleted successfully');
        }
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription. Please try again.');
    }
  };

  const handleDispenseMedication = async (id) => {
    try {
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
      alert('Failed to dispense medication. Please try again.');
    }
  };

  const handleAddSupply = async (e) => {
    e.preventDefault();
    try {
      if (!supplyForm.name || !supplyForm.quantity) {
        alert('Please fill in all required fields');
        return;
      }
      const supplyData = {
        name: supplyForm.name,
        category: supplyForm.category,
        quantity: parseInt(supplyForm.quantity),
        unit: supplyForm.unit,
        price: parseFloat(supplyForm.price),
        soldTo: supplyForm.soldTo || null
      };
      const response = await axios.post('http://localhost:5000/api/pharmacy/supplies', supplyData);
      if (response.data) {
        setMedicalSupplies(prevSupplies => [response.data, ...prevSupplies]);
        setSupplyForm({
          name: '',
          category: '',
          quantity: '',
          price: '',
          unit: '',
          soldTo: ''
        });
        setShowAddSupply(false);
        alert('Supply added successfully!');
      }
    } catch (err) {
      console.error('Error adding supply:', err);
      alert('Failed to add supply. Please try again.');
    }
  };

  const handleSupplySelect = (e) => {
    const selectedSupply = medicalSuppliesCatalog.find(s => s.name === e.target.value);
    if (selectedSupply) {
      setSupplyForm({
        ...supplyForm,
        name: selectedSupply.name,
        category: selectedSupply.category,
        price: selectedSupply.price,
        unit: selectedSupply.unit,
        quantity: ''
      });
    }
  };

  const handleDeleteSupply = async (id) => {
    if (window.confirm('Are you sure you want to delete this supply?')) {
      try {
        await axios.delete(`http://localhost:5000/api/pharmacy/supplies/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting supply:', err);
        alert('Failed to delete supply. Please try again.');
      }
    }
  };

  const handleAddPrescriptionClick = () => {
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
    setShowAddPrescription(true);
  };

  const handleCloseModal = () => {
    setShowAddPrescription(false);
    setShowEditPrescription(false);
    setShowAddSupply(false);
    setSelectedPrescription(null);
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
  };

  const handleAddMedicationClick = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          quantity: '',
          frequency: '',
          duration: ''
        }
      ]
    }));
  };

  const handleRemoveMedicationClick = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleCalculateTotalClick = () => {
    calculateTotalCost();
  };

  const handleCancelPrescriptionClick = () => {
    handleCloseModal();
  };

  const handleSubmitPrescriptionClick = (e) => {
    e.preventDefault();
    handleCreatePrescription();
  };

  if (loading) {
    return <div className="loading">Loading pharmacy data...</div>;
  }

  return (
    <div className="pharmacy-container">
      {/* Centered Search Bar */}
      <div className="pharmacy-search-center">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by patient name, medicine, status, or date..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          {searchQuery && (
            <span className="search-results">
              Found {filteredPrescriptions.length} prescriptions
            </span>
          )}
        </div>
      </div>
      <div className="pharmacy-header-actions">
        <div className="action-buttons">
          <button className="add-button" onClick={handleAddPrescriptionClick}>
            Add Prescription
          </button>
          <button className="add-button" onClick={() => setShowAddSupply(true)}>
            Add Supply
          </button>
        </div>
      </div>
      {/* Charts Section */}
      <div className="charts-section pharmacy-charts-grid">
        <div className="chart-card pharmacy-chart-card">
          <h3>Top Medicines Prescribed</h3>
          <Bar
            data={topMedicinesData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: 'Top 5 Medicines by Prescriptions'
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Count' }
                },
                x: {
                  title: { display: true, text: 'Medicine' }
                }
              }
            }}
          />
        </div>
        <div className="chart-card pharmacy-chart-card">
          <h3>Prescription Status Distribution</h3>
          <Pie
            data={categoryData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' },
                title: {
                  display: true,
                  text: 'Prescription Status Overview'
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
        <div className="section-header">
          <h3>Prescriptions List</h3>
          <button className="add-button" onClick={() => setShowAddPrescription(true)}>
            Create Prescription
          </button>
        </div>
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
            {filteredPrescriptions.map(prescription => (
              <tr key={prescription._id}>
                <td data-label="Patient">
                  {prescription.patientName || 'Unknown'}
                </td>
                <td data-label="Date">
                  {new Date(prescription.prescriptionDate).toLocaleDateString()}
                </td>
                <td data-label="Medications">
                  <ul className="medication-list">
                    {prescription.medications.map((med, index) => (
                      <li key={index}>
                        {med.name} ({med.dosage}) - {med.quantity} units
                      </li>
                    ))}
                  </ul>
                </td>
                <td data-label="Status">{prescription.status}</td>
                <td data-label="Total Cost">Rs.{prescription.totalCost}</td>
                <td data-label="Actions">
                  <div className="action-buttons-cell">
                    {prescription.status === 'Pending' && (
                      <button
                        onClick={() => handleDispenseMedication(prescription._id)}
                        className="action-button"
                      >
                        Dispense
                      </button>
                    )}
                    <button
                      onClick={() => handleEditPrescription(prescription)}
                      className="action-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePrescription(prescription._id)}
                      className="action-button delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Prescription Modal */}
      <Modal show={showAddPrescription} onHide={() => setShowAddPrescription(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitPrescriptionClick}>
            <div className="form-group">
              <label>Patient *</label>
              <select
                className="select-dropdown"
                value={prescriptionForm.patient}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patient: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Prescribed By *</label>
              <select
                className="select-dropdown"
                value={prescriptionForm.prescribedBy}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescribedBy: e.target.value })}
                required
              >
                <option value="">Select Doctor</option>
                {staff.filter(s => s.role === 'Doctor').map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="medications-section mb-3">
              <h4>Medications *</h4>
              {prescriptionForm.medications.map((medication, index) => (
                <div key={index} className="medication-form">
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>Medication Name *</label>
                      <select
                        className="select-dropdown"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        required
                      >
                        <option value="">Select Medication</option>
                        {medicationCatalog.map(med => (
                          <option key={med.name} value={med.name}>
                            {med.name} - {med.category} (Rs.{med.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-6">
                      <label>Dosage *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={medication.quantity}
                        onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label>Frequency *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        placeholder="e.g., 3 times daily"
                        required
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label>Duration *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>Price per Unit</label>
                      <input
                        type="text"
                        className="form-control"
                        value={medication.price ? `Rs.${medication.price}` : 'Select medication'}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label>Total for this Medication</label>
                      <input
                        type="text"
                        className="form-control"
                        value={medication.price && medication.quantity ? `Rs.${medication.price * parseInt(medication.quantity)}` : '0'}
                        readOnly
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
                Add Another Medication
              </button>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                className="form-control"
                value={prescriptionForm.notes}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                placeholder="Additional notes about the prescription"
                rows="3"
              />
            </div>

            <div className="modal-buttons">
              <div>
                <button
                  type="button"
                  className="calculate-button"
                  onClick={calculateTotalCost}
                >
                  Calculate Total
                </button>
                <span className="total-cost ms-3">Total Cost: Rs.{prescriptionForm.totalCost}</span>
              </div>
              <div>
                <button
                  type="button"
                  className="cancel-button me-2"
                  onClick={() => setShowAddPrescription(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Create Prescription
                </button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Prescription Modal */}
      <Modal show={showEditPrescription} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdatePrescription}>
            <div className="form-group">
              <label>Patient</label>
              <select
                value={prescriptionForm.patient}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, patient: e.target.value })}
                required
                className="select-dropdown"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Prescribed By</label>
              <select
                value={prescriptionForm.prescribedBy}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescribedBy: e.target.value })}
                required
                className="select-dropdown"
              >
                <option value="">Select Doctor</option>
                {staff.filter(s => s.role === 'Doctor').map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <h4>Medications</h4>
            {prescriptionForm.medications.map((medication, index) => (
              <div key={index} className="medication-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Medication Name</label>
                    <select
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      required
                      className="select-dropdown"
                    >
                      <option value="">Select Medication</option>
                      {medicationCatalog.map((med) => (
                        <option key={med.name} value={med.name}>
                          {med.name} - {med.category} (Rs.{med.price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      value={medication.dosage}
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
                      value={medication.quantity}
                      onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      required
                      placeholder="e.g., 3 times daily"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      required
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price per Unit</label>
                    <input
                      type="text"
                      value={medication.price ? `Rs.${medication.price}` : 'Select medication'}
                      readOnly
                      className="price-display"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total for this Medication</label>
                    <input
                      type="text"
                      value={medication.price && medication.quantity ? `Rs.${medication.price * parseInt(medication.quantity)}` : '0'}
                      readOnly
                      className="medication-total"
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
              onClick={handleAddMedicationClick}
            >
              Add Medication
            </button>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={prescriptionForm.notes}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={prescriptionForm.status}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, status: e.target.value })}
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
                onClick={handleCalculateTotalClick}
              >
                Calculate Total
              </button>
              <p className="total-cost">Total Cost: Rs.{prescriptionForm.totalCost}</p>
              <button type="submit" className="submit-button">
                Update Prescription
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelPrescriptionClick}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Add Supply Modal */}
      <Modal show={showAddSupply} onHide={() => setShowAddSupply(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Supply</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddSupply}>
            <div className="form-group">
              <label>Supply Name *</label>
              <select
                className="select-dropdown"
                value={supplyForm.name}
                onChange={handleSupplySelect}
                required
              >
                <option value="">Select Supply</option>
                {medicalSuppliesCatalog.map((supply, index) => (
                  <option key={index} value={supply.name}>
                    {supply.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                className="form-control"
                value={supplyForm.category}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                className="form-control"
                value={supplyForm.quantity}
                onChange={(e) => setSupplyForm({ ...supplyForm, quantity: e.target.value })}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                className="form-control"
                value={supplyForm.unit}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Price per Unit</label>
              <input
                type="number"
                className="form-control"
                value={supplyForm.price}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Sold To (Patient)</label>
              <select
                className="select-dropdown"
                value={supplyForm.soldTo}
                onChange={e => setSupplyForm({ ...supplyForm, soldTo: e.target.value })}
              >
                <option value="">Select Patient (optional)</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>{patient.name}</option>
                ))}
              </select>
            </div>
            <div className="modal-buttons">
              <button type="button" className="cancel-button" onClick={() => setShowAddSupply(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Add Supply
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Medical Supplies Table */}
      <div className="table-section">
        <div className="section-header">
          <h3>Medical Supplies List</h3>
          <button className="add-button" onClick={() => setShowAddSupply(true)}>
            Add Supply
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Sold To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicalSupplies.length === 0 ? (
              <tr><td colSpan="7">No supplies found</td></tr>
            ) : (
              medicalSupplies.map(supply => (
                <tr key={supply._id}>
                  <td>{supply.name}</td>
                  <td>{supply.category}</td>
                  <td>{supply.quantity}</td>
                  <td>{supply.unit}</td>
                  <td>Rs.{supply.price}</td>
                  <td>{
                    supply.soldTo && typeof supply.soldTo === 'object' && supply.soldTo.name
                      ? supply.soldTo.name
                      : '-'
                  }</td>
                  <td>
                    <button className="delete" onClick={() => handleDeleteSupply(supply._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pharmacy;