import { useState, useEffect } from 'react';
import { staffApi } from '../services/api';
import './Staff.css';
import { useNotification } from '../contexts/NotificationContext';

const Staff = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    role: 'Doctor',
    specialization: '',
    department: '',
    contact: '',
    email: '',
    status: 'Active',
    salary: '',
    shift: 'Morning'
  });

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedRole, setSelectedRole] = useState('All');
  const [showForm, setShowForm] = useState(true);
  const [showStaffList, setShowStaffList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStaff, setFilteredStaff] = useState([]);

  useEffect(() => {
    fetchStaffData();
  }, []);

  useEffect(() => {
    // Filter staff based on role and search term
    let filtered = staff;
    
    if (selectedRole !== 'All') {
      filtered = filtered.filter(s => s.role === selectedRole);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.department?.toLowerCase().includes(term) ||
        s.specialization?.toLowerCase().includes(term)
      );
    }
    
    setFilteredStaff(filtered);
  }, [staff, selectedRole, searchTerm]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getAllStaff();
      setStaff(response.data);
      setFilteredStaff(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch staff data');
      showError('Failed to fetch staff data');
      setLoading(false);
      console.error('Error fetching staff:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.department || !formData.contact) {
        showWarning('Please fill in all required fields');
        return;
      }

      const response = await staffApi.createStaff(formData);
      
      // Update staff list with new staff member
      setStaff([...staff, response.data]);
      
      // Clear form
      setFormData({
        name: '',
        role: 'Doctor',
        specialization: '',
        department: '',
        contact: '',
        email: '',
        status: 'Active',
        salary: '',
        shift: 'Morning'
      });
      
      showSuccess('Staff registered successfully!');
      setShowForm(false);
      setShowStaffList(true);
    } catch (error) {
      console.error('Registration error:', error);
      showError('Failed to register staff: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      showWarning('Please select a staff member to update');
      return;
    }

    try {
      const response = await staffApi.updateStaff(selectedStaff._id, formData);
      
      // Update staff list
      setStaff(staff.map(s => s._id === selectedStaff._id ? response.data : s));
      
      // Clear selection and form
      setSelectedStaff(null);
      setFormData({
        name: '',
        role: 'Doctor',
        specialization: '',
        department: '',
        contact: '',
        email: '',
        status: 'Active',
        salary: '',
        shift: 'Morning'
      });
      
      showSuccess('Staff updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      showError('Failed to update staff: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await staffApi.deleteStaff(id);
      setStaff(staff.filter(s => s._id !== id));
      showSuccess('Staff deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete staff: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      role: staffMember.role,
      specialization: staffMember.specialization || '',
      department: staffMember.department,
      contact: staffMember.contact,
      email: staffMember.email,
      status: staffMember.status,
      salary: staffMember.salary || '',
      shift: staffMember.shift || 'Morning'
    });
    setShowForm(true);
    setShowStaffList(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'Doctor',
      specialization: '',
      department: '',
      contact: '',
      email: '',
      status: 'Active',
      salary: '',
      shift: 'Morning',
    });
    setSelectedStaff(null);
  };

  return (
    <div className="staff-page">
      <h2>Staff Management</h2>
      
      <div className="staff-actions">
        <button 
          className={`action-btn ${showForm ? 'active' : ''}`}
          onClick={() => {
            setShowForm(true);
            setShowStaffList(false);
            resetForm();
          }}
        >
          {selectedStaff ? 'Edit Staff' : 'Add New Staff'}
        </button>
          <button 
          className={`action-btn ${showStaffList ? 'active' : ''}`}
          onClick={() => {
            setShowStaffList(true);
            setShowForm(false);
          }}
        >
          Staff List
          </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={selectedStaff ? handleUpdate : handleRegister}>
            <div className="form-row">
            <input
              type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
              onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Admin">Admin</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            <input
              type="text"
                name="specialization"
                placeholder="Specialization (for doctors)"
                value={formData.specialization}
              onChange={handleInputChange}
                disabled={formData.role !== 'Doctor'}
            />
            </div>
            
            <div className="form-row">
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={formData.salary}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="shift">Shift:</label>
                <select
                  id="shift"
                  name="shift"
                  value={formData.shift}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="form-button submit-btn">
                {selectedStaff ? 'Update Staff' : 'Add Staff'}
              </button>
              <button 
                type="button"
                className="form-button cancel-btn"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
              </div>
            )}

      {showStaffList && (
        <div className="staff-list-container">
          <div className="filter-container">
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-filter"
            >
              <option value="All">All Roles</option>
              <option value="Doctor">Doctors</option>
              <option value="Nurse">Nurses</option>
              <option value="Admin">Admin</option>
              <option value="Lab Technician">Lab Technicians</option>
              <option value="Pharmacist">Pharmacists</option>
              <option value="Receptionist">Receptionists</option>
            </select>
      </div>

          {loading ? (
            <p>Loading staff data...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Specialization</th>
                    <th>Department</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Shift</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">No staff found</td>
                    </tr>
                  ) : (
                    filteredStaff.map(staffMember => (
                      <tr key={staffMember._id}>
                        <td>{staffMember.name}</td>
                        <td>{staffMember.role}</td>
                        <td>{staffMember.specialization || '-'}</td>
                        <td>{staffMember.department}</td>
                        <td>{staffMember.contact}</td>
                        <td>{staffMember.email}</td>
                        <td>
                          <span className={`status-badge status-${staffMember.status?.toLowerCase().replace(' ', '-')}`}>
                            {staffMember.status}
                        </span>
                      </td>
                      <td>
                        <span className={`shift-badge ${staffMember.shift ? staffMember.shift.toLowerCase() : 'morning'}`}>
                          {staffMember.shift || 'Morning'}
                        </span>
                      </td>
                      <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() => handleEdit(staffMember)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this staff member?')) {
                                  handleDelete(staffMember._id);
                                }
                              }}
                            >
                              Delete
                            </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Staff;