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
  const [medicines, setMedicines] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showEditMedicine, setShowEditMedicine] = useState(false);
  const [showEditEquipment, setShowEditEquipment] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    price: '',
    quantity: '',
    expiryDate: '',
    batchNumber: '',
    description: '',
    dosage: '',
    sideEffects: '',
    storageConditions: ''
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category: '',
    manufacturer: '',
    purchaseDate: '',
    lastMaintenance: '',
    nextMaintenance: '',
    status: '',
    location: '',
    notes: ''
  });

  const [stockData, setStockData] = useState({
    labels: [],
    datasets: [{
      label: 'Stock Level',
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
      const [medicinesRes, equipmentRes] = await Promise.all([
        // axios.get('http://localhost:5000/api/pharmacy/medicines'),
        // axios.get('http://localhost:5000/api/pharmacy/equipment')
      ]);
      setMedicines(medicinesRes.data);
      setEquipment(equipmentRes.data);

      // Process data for charts
      const medicineNames = medicinesRes.data.map(m => m.name);
      const stockLevels = medicinesRes.data.map(m => m.quantity);

      const categories = medicinesRes.data.map(m => m.category);
      const uniqueCategories = [...new Set(categories)];
      const categoryCounts = uniqueCategories.map(category => 
        categories.filter(c => c === category).length
      );

      setStockData({
        labels: medicineNames,
        datasets: [{
          label: 'Stock Level',
          data: stockLevels,
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      });

      setCategoryData({
        labels: uniqueCategories,
        datasets: [{
          data: categoryCounts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)'
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
    const filtered = medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(query) ||
      medicine.category.toLowerCase().includes(query)
    );
    setFilteredMedicines(filtered);
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      // Log the data being sent
      console.log('Attempting to add medicine with data:', medicineForm);

      // Validate required fields
      if (!medicineForm.name || !medicineForm.category || !medicineForm.manufacturer || 
          !medicineForm.price || !medicineForm.quantity || !medicineForm.expiryDate) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/pharmacy/medicines', medicineForm);
      
      if (response.data) {
        console.log('Successfully added medicine:', response.data);
        setShowAddMedicine(false);
        // Reset form
        setMedicineForm({
          name: '',
          genericName: '',
          category: '',
          manufacturer: '',
          price: '',
          quantity: '',
          expiryDate: '',
          batchNumber: '',
          description: '',
          dosage: '',
          sideEffects: '',
          storageConditions: ''
        });
        fetchData(); // Refresh the data
      }
    } catch (err) {
      console.error('Error adding medicine:', err.response?.data || err.message);
      alert(`Failed to add medicine: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      // Log the data being sent
      console.log('Attempting to add equipment with data:', equipmentForm);

      // Validate required fields
      if (!equipmentForm.name || !equipmentForm.category || !equipmentForm.manufacturer || 
          !equipmentForm.purchaseDate || !equipmentForm.status || !equipmentForm.location) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/pharmacy/equipment', equipmentForm);
      
      if (response.data) {
        console.log('Successfully added equipment:', response.data);
        setShowAddEquipment(false);
        // Reset form
        setEquipmentForm({
          name: '',
          category: '',
          manufacturer: '',
          purchaseDate: '',
          lastMaintenance: '',
          nextMaintenance: '',
          status: '',
          location: '',
          notes: ''
        });
        fetchData(); // Refresh the data
      }
    } catch (err) {
      console.error('Error adding equipment:', err.response?.data || err.message);
      alert(`Failed to add equipment: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setMedicineForm(medicine);
    setShowEditMedicine(true);
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setEquipmentForm(equipment);
    setShowEditEquipment(true);
  };

  const handleUpdateMedicine = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/pharmacy/medicines/${selectedMedicine._id}`, medicineForm);
      setShowEditMedicine(false);
      fetchData();
    } catch (err) {
      console.error('Error updating medicine:', err);
    }
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/pharmacy/equipment/${selectedEquipment._id}`, equipmentForm);
      setShowEditEquipment(false);
      fetchData();
    } catch (err) {
      console.error('Error updating equipment:', err);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await axios.delete(`http://localhost:5000/api/pharmacy/medicines/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting medicine:', err);
      }
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/pharmacy/equipment/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting equipment:', err);
      }
    }
  };

  return (
    <div className="pharmacy-container">
      <div className="pharmacy-header">
        <h2>Pharmacy Management</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="action-buttons">
          <button 
            className="add-button"
            onClick={() => setShowAddMedicine(true)}
          >
            Add Medicine
          </button>
          <button 
            className="add-button"
            onClick={() => setShowAddEquipment(true)}
          >
            Add Equipment
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Medicine Stock Levels</h3>
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
          <h3>Medicine Categories</h3>
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

      {/* Medicines Table */}
      <div className="table-section">
        <h3>Medicines List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map(medicine => (
              <tr key={medicine._id}>
                <td>{medicine.name}</td>
                <td>{medicine.category}</td>
                <td>{medicine.quantity}</td>
                <td>${medicine.price}</td>
                <td>{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEditMedicine(medicine)}>Edit</button>
                  <button onClick={() => handleDeleteMedicine(medicine._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equipment Table */}
      <div className="table-section">
        <h3>Equipment List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Last Maintenance</th>
              <th>Next Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.status}</td>
                <td>{new Date(item.lastMaintenance).toLocaleDateString()}</td>
                <td>{new Date(item.nextMaintenance).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEditEquipment(item)}>Edit</button>
                  <button onClick={() => handleDeleteEquipment(item._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Medicine</h3>
              <form onSubmit={handleAddMedicine}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={medicineForm.name}
                    onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Generic Name</label>
                  <input
                    type="text"
                    value={medicineForm.genericName}
                    onChange={(e) => setMedicineForm({...medicineForm, genericName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={medicineForm.category}
                    onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    value={medicineForm.manufacturer}
                    onChange={(e) => setMedicineForm({...medicineForm, manufacturer: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    value={medicineForm.price}
                    onChange={(e) => setMedicineForm({...medicineForm, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={medicineForm.quantity}
                    onChange={(e) => setMedicineForm({...medicineForm, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={medicineForm.expiryDate}
                    onChange={(e) => setMedicineForm({...medicineForm, expiryDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Batch Number</label>
                  <input
                    type="text"
                    value={medicineForm.batchNumber}
                    onChange={(e) => setMedicineForm({...medicineForm, batchNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={medicineForm.description}
                    onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={medicineForm.dosage}
                    onChange={(e) => setMedicineForm({...medicineForm, dosage: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Side Effects</label>
                  <textarea
                    value={medicineForm.sideEffects}
                    onChange={(e) => setMedicineForm({...medicineForm, sideEffects: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Storage Conditions</label>
                  <textarea
                    value={medicineForm.storageConditions}
                    onChange={(e) => setMedicineForm({...medicineForm, storageConditions: e.target.value})}
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">Add Medicine</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowAddMedicine(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddEquipment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Equipment</h3>
              <form onSubmit={handleAddEquipment}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={equipmentForm.category}
                    onChange={(e) => setEquipmentForm({...equipmentForm, category: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    value={equipmentForm.manufacturer}
                    onChange={(e) => setEquipmentForm({...equipmentForm, manufacturer: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={equipmentForm.purchaseDate}
                    onChange={(e) => setEquipmentForm({...equipmentForm, purchaseDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Maintenance</label>
                  <input
                    type="date"
                    value={equipmentForm.lastMaintenance}
                    onChange={(e) => setEquipmentForm({...equipmentForm, lastMaintenance: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Next Maintenance</label>
                  <input
                    type="date"
                    value={equipmentForm.nextMaintenance}
                    onChange={(e) => setEquipmentForm({...equipmentForm, nextMaintenance: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={equipmentForm.status}
                    onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value})}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Operational">Operational</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={equipmentForm.location}
                    onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={equipmentForm.notes}
                    onChange={(e) => setEquipmentForm({...equipmentForm, notes: e.target.value})}
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">Add Equipment</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowAddEquipment(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {showEditMedicine && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Medicine</h3>
            <form onSubmit={handleUpdateMedicine}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={medicineForm.name}
                  onChange={(e) => setMedicineForm({...medicineForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Generic Name</label>
                <input
                  type="text"
                  value={medicineForm.genericName}
                  onChange={(e) => setMedicineForm({...medicineForm, genericName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={medicineForm.category}
                  onChange={(e) => setMedicineForm({...medicineForm, category: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input
                  type="text"
                  value={medicineForm.manufacturer}
                  onChange={(e) => setMedicineForm({...medicineForm, manufacturer: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={medicineForm.price}
                  onChange={(e) => setMedicineForm({...medicineForm, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={medicineForm.quantity}
                  onChange={(e) => setMedicineForm({...medicineForm, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={medicineForm.expiryDate}
                  onChange={(e) => setMedicineForm({...medicineForm, expiryDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Batch Number</label>
                <input
                  type="text"
                  value={medicineForm.batchNumber}
                  onChange={(e) => setMedicineForm({...medicineForm, batchNumber: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={medicineForm.description}
                  onChange={(e) => setMedicineForm({...medicineForm, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  value={medicineForm.dosage}
                  onChange={(e) => setMedicineForm({...medicineForm, dosage: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Side Effects</label>
                <textarea
                  value={medicineForm.sideEffects}
                  onChange={(e) => setMedicineForm({...medicineForm, sideEffects: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Storage Conditions</label>
                <textarea
                  value={medicineForm.storageConditions}
                  onChange={(e) => setMedicineForm({...medicineForm, storageConditions: e.target.value})}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit">Update Medicine</button>
                <button type="button" onClick={() => setShowEditMedicine(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipment && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Equipment</h3>
            <form onSubmit={handleUpdateEquipment}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm({...equipmentForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={equipmentForm.category}
                  onChange={(e) => setEquipmentForm({...equipmentForm, category: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input
                  type="text"
                  value={equipmentForm.manufacturer}
                  onChange={(e) => setEquipmentForm({...equipmentForm, manufacturer: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  value={equipmentForm.purchaseDate}
                  onChange={(e) => setEquipmentForm({...equipmentForm, purchaseDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Maintenance</label>
                <input
                  type="date"
                  value={equipmentForm.lastMaintenance}
                  onChange={(e) => setEquipmentForm({...equipmentForm, lastMaintenance: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Next Maintenance</label>
                <input
                  type="date"
                  value={equipmentForm.nextMaintenance}
                  onChange={(e) => setEquipmentForm({...equipmentForm, nextMaintenance: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={equipmentForm.status}
                  onChange={(e) => setEquipmentForm({...equipmentForm, status: e.target.value})}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={equipmentForm.location}
                  onChange={(e) => setEquipmentForm({...equipmentForm, location: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={equipmentForm.notes}
                  onChange={(e) => setEquipmentForm({...equipmentForm, notes: e.target.value})}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit">Update Equipment</button>
                <button type="button" onClick={() => setShowEditEquipment(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;