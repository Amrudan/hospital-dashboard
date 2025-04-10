import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Patient API
export const patientApi = {
  getAllPatients: () => apiClient.get('/patients'),
  getPatientById: (id) => apiClient.get(`/patients/${id}`),
  createPatient: (data) => apiClient.post('/patients', data),
  updatePatient: (id, data) => apiClient.put(`/patients/${id}`, data),
  deletePatient: (id) => apiClient.delete(`/patients/${id}`)
};

// Staff API
export const staffApi = {
  getAllStaff: () => apiClient.get('/staff'),
  getStaffByRole: (role) => apiClient.get(`/staff/role/${role}`),
  getStaffById: (id) => apiClient.get(`/staff/${id}`),
  createStaff: (data) => apiClient.post('/staff', data),
  updateStaff: (id, data) => apiClient.put(`/staff/${id}`, data),
  deleteStaff: (id) => apiClient.delete(`/staff/${id}`)
};

// Ward API
export const wardApi = {
  getAllWards: () => apiClient.get('/wards'),
  getWardById: (id) => apiClient.get(`/wards/${id}`),
  createWard: (data) => apiClient.post('/wards', data),
  updateWard: (id, data) => apiClient.put(`/wards/${id}`, data),
  deleteWard: (id) => apiClient.delete(`/wards/${id}`),
  assignStaffToWard: (id, staffId) => apiClient.post(`/wards/${id}/assign-staff`, { staffId })
};

// Lab API
export const labApi = {
  getAllLabTests: () => apiClient.get('/lab'),
  getLabTestsByPatient: (patientId) => apiClient.get(`/lab/patient/${patientId}`),
  getLabTestById: (id) => apiClient.get(`/lab/${id}`),
  createLabTest: (data) => apiClient.post('/lab', data),
  updateLabTest: (id, data) => apiClient.put(`/lab/${id}`, data),
  deleteLabTest: (id) => apiClient.delete(`/lab/${id}`),
  addTestResults: (id, data) => apiClient.post(`/lab/${id}/add-results`, data)
};

// Pharmacy API
export const pharmacyApi = {
  getAllPrescriptions: () => apiClient.get('/pharmacy'),
  getPrescriptionsByPatient: (patientId) => apiClient.get(`/pharmacy/patient/${patientId}`),
  getPrescriptionById: (id) => apiClient.get(`/pharmacy/${id}`),
  createPrescription: (data) => apiClient.post('/pharmacy', data),
  updatePrescription: (id, data) => apiClient.put(`/pharmacy/${id}`, data),
  deletePrescription: (id) => apiClient.delete(`/pharmacy/${id}`),
  dispenseMedication: (id, data) => apiClient.post(`/pharmacy/${id}/dispense`, data)
};

// Invoice API
export const invoiceApi = {
  getAllInvoices: () => apiClient.get('/invoices'),
  getInvoicesByPatient: (patientId) => apiClient.get(`/invoices/patient/${patientId}`),
  getInvoiceById: (id) => apiClient.get(`/invoices/${id}`),
  createInvoice: (data) => apiClient.post('/invoices', data),
  updateInvoice: (id, data) => apiClient.put(`/invoices/${id}`, data),
  deleteInvoice: (id) => apiClient.delete(`/invoices/${id}`),
  updatePaymentStatus: (id, data) => apiClient.post(`/invoices/${id}/payment`, data)
}; 