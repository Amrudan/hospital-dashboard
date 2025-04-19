import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import "./Invoice.css";
import { 
  FaSearch, 
  FaFilePdf, 
  FaEdit, 
  FaTrash, 
  FaDownload, 
  FaShieldAlt, 
  FaFileInvoice 
} from "react-icons/fa";

const Invoice = () => {
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    patientId: "",
    patientName: "",
    doctorName: "",
    labName: "",
    treatment: "",
    wardNumber: "",
    totalAmount: "",
    governmentScheme: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All Invoices");

  const treatments = [
    'Select Treatment',
    'General Checkup',
    'Blood Test',
    'X-Ray',
    'MRI',
    'Surgery',
    'Dental Treatment',
    'Eye Checkup',
    'Physical Therapy',
    'Emergency Care',
    'Laboratory Tests'
  ];

  const treatmentCosts = {
    'General Checkup': 50,
    'Blood Test': 100,
    'X-Ray': 150,
    'MRI': 500,
    'Surgery': 2000,
    'Dental Treatment': 300,
    'Eye Checkup': 80,
    'Physical Therapy': 120,
    'Emergency Care': 400,
    'Laboratory Tests': 200
  };

  const governmentSchemes = {
    "Ayushman Bharat": 100,
    "CGHS": 80,
    "ESI": 90,
    "PM-JAY": 100,
    "ECHS": 85,
    "State Government": 75,
    "Railway": 80,
    "None": 0
  };

  const paymentDetails = {
    gpay: "hospital@upi",
    phonepay: "hospital@ybl",
    merchantName: "Hospital Management System",
    merchantId: "HMS001"
  };

  // Initial data load
  useEffect(() => {
    // Load patients first, then invoices to ensure proper patient data is available
    const loadData = async () => {
      await fetchPatients();
      await fetchDoctors();
      await fetchInvoices();
    };
    loadData();
  }, []);

  // Fetch patients data
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      console.log("Fetched patients:", response.data);
      setPatients(response.data);
      return response.data; // Return for use in other functions
    } catch (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
  };

  // Fetch doctors data
  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/staff');
      const doctors = response.data.filter(staff => staff.role === 'Doctor');
      setDoctors(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  // Fetch invoices data
  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices');
      console.log("Raw invoices from API:", response.data);
      
      // Get the latest patients data to ensure we have the most up-to-date information
      const currentPatients = patients.length > 0 ? patients : await fetchPatients();
      
      // Fix to properly process patient and doctor names
      const processedInvoices = response.data.map(invoice => {
        // Create a new object to avoid mutation issues
        const processedInvoice = { ...invoice };
        
        // Ensure patient name is available - first check if it's directly present
        if (!processedInvoice.patientName || processedInvoice.patientName === 'N/A') {
          // If patient name is missing but we have patient ID reference
          if (processedInvoice.patient) {
            const foundPatient = currentPatients.find(p => p._id === processedInvoice.patient);
            if (foundPatient && foundPatient.name) {
              processedInvoice.patientName = foundPatient.name;
            }
          }
        }
        
        // Make sure names are properly formatted and have fallbacks
        if (!processedInvoice.patientName || processedInvoice.patientName === undefined || processedInvoice.patientName === null) {
          processedInvoice.patientName = 'N/A';
        }
        
        if (!processedInvoice.doctorName || processedInvoice.doctorName === undefined || processedInvoice.doctorName === null) {
          processedInvoice.doctorName = 'N/A';
        }
        
        return processedInvoice;
      });
      
      console.log("Processed invoices with patient/doctor names:", processedInvoices);
      setRecentInvoices(processedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      alert("Failed to fetch invoices. Please try again.");
    }
  };

  // Calculate discounted amount based on government scheme
  const calculateDiscountedAmount = (originalAmount, scheme) => {
    const coverage = governmentSchemes[scheme] || 0;
    return (originalAmount * (1 - coverage / 100)).toFixed(2);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "patientId") {
      const selectedPatient = patients.find(patient => patient._id === value);
      if (selectedPatient) {
        const originalAmount = invoiceData.treatment ? treatmentCosts[invoiceData.treatment] : 0;
        const discountedAmount = calculateDiscountedAmount(originalAmount, selectedPatient.governmentScheme);
        
        setInvoiceData({
          ...invoiceData,
          [name]: value,
          patientName: selectedPatient.name,
          governmentScheme: selectedPatient.governmentScheme || 'None',
          totalAmount: discountedAmount
        });
      }
    } else if (name === "treatment") {
      const originalAmount = treatmentCosts[value] || 0;
      const discountedAmount = calculateDiscountedAmount(originalAmount, invoiceData.governmentScheme);
      
      setInvoiceData({
        ...invoiceData,
        [name]: value,
        totalAmount: discountedAmount
      });
    } else {
      setInvoiceData({ ...invoiceData, [name]: value });
    }
  };

  // Save or update invoice
  const handleSave = async () => {
    // Enhanced form validation with better feedback
    let missingFields = [];
    if (!invoiceData.patientId) missingFields.push("Patient");
    if (!invoiceData.doctorName) missingFields.push("Doctor");
    if (!invoiceData.labName) missingFields.push("Lab");
    if (!invoiceData.treatment || invoiceData.treatment === 'Select Treatment') missingFields.push("Treatment");
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      const selectedPatient = patients.find(patient => patient._id === invoiceData.patientId);
      
      // Get patient name from selection or form data, ensure it's never missing
      const patientName = selectedPatient?.name || invoiceData.patientName || 'Unknown';
      
      // Make sure all fields have valid values with fallbacks
      const invoiceToSave = {
        patient: invoiceData.patientId,
        patientName: patientName, // Ensure this is always set
        doctorName: invoiceData.doctorName || 'N/A',
        labName: invoiceData.labName || 'N/A',
        treatment: invoiceData.treatment || 'General Checkup',
        wardNumber: invoiceData.wardNumber || '',
        governmentScheme: invoiceData.governmentScheme || 'None',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30*24*60*60*1000),
        items: [
          {
            description: invoiceData.treatment || 'Medical Service',
            quantity: 1,
            unitPrice: treatmentCosts[invoiceData.treatment] || 0,
            amount: parseFloat(invoiceData.totalAmount || 0),
            type: 'Consultation'
          }
        ],
        subtotal: treatmentCosts[invoiceData.treatment] || 0,
        discount: treatmentCosts[invoiceData.treatment] - parseFloat(invoiceData.totalAmount || 0) || 0,
        total: parseFloat(invoiceData.totalAmount || 0),
        paymentStatus: 'Unpaid'
      };

      console.log("Saving invoice with data:", invoiceToSave);

      let response;
      if (editingIndex !== null) {
        response = await axios.put(`http://localhost:5000/api/invoices/${recentInvoices[editingIndex]._id}`, invoiceToSave);
        console.log("Invoice update response:", response.data);
        alert("Invoice updated successfully!");
      } else {
        response = await axios.post('http://localhost:5000/api/invoices', invoiceToSave);
        console.log("Invoice creation response:", response.data);
        alert("Invoice added successfully!");
      }
      
      // Refresh the invoices list - important to do this after saving
      await fetchInvoices();
      
      // Reset form data
      resetForm();
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(`Failed to save invoice: ${error.response?.data?.message || error.message}`);
    }
  };

  // Edit an existing invoice
  const handleEdit = (index) => {
    const invoice = recentInvoices[index];
    const treatment = invoice.treatment || (invoice.items?.[0]?.description) || '';
    
    setInvoiceData({
      patientId: invoice.patient || '',
      patientName: invoice.patientName || '',
      doctorName: invoice.doctorName || '',
      labName: invoice.labName || '',
      treatment: treatment,
      wardNumber: invoice.wardNumber || '',
      totalAmount: invoice.total || invoice.totalAmount || '0',
      governmentScheme: invoice.governmentScheme || 'None'
    });
    
    setEditingIndex(index);
  };

  // Delete an invoice
  const handleDelete = async (index) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/invoices/${recentInvoices[index]._id}`);
      fetchInvoices();
      alert("Invoice deleted successfully!");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice. Please try again.");
    }
  };

  // Reset the form
  const resetForm = () => {
    setInvoiceData({
      patientId: "",
      patientName: "",
      doctorName: "",
      labName: "",
      treatment: "",
      wardNumber: "",
      totalAmount: "",
      governmentScheme: ""
    });
    setEditingIndex(null);
  };

  // Generate PDF report - fix this function
  const generateReport = async (invoice = null) => {
    try {
      const pdf = new jsPDF();
      
      // Add hospital logo/header
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, 210, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("Hospital Management System", 105, 15, { align: 'center' });
      
      // Add report title
      pdf.setFillColor(236, 240, 241);
      pdf.rect(0, 30, 210, 20, 'F');
      pdf.setTextColor(44, 62, 80);
      pdf.setFontSize(16);
      
      // Safely get invoice ID for title (with more checks)
      let invoiceId = 'New';
      if (invoice) {
        if (invoice._id) {
          invoiceId = typeof invoice._id === 'string' ? invoice._id.slice(-6) : String(invoice._id).slice(-6);
        } else if (invoice.invoiceNumber) {
          invoiceId = invoice.invoiceNumber.slice(-6);
        }
      }
            
      pdf.text(invoice ? `Invoice #${invoiceId}` : "Invoice Report", 105, 42, { align: 'center' });
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(127, 140, 141);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 190, 42, { align: 'right' });

      // Handle different report types with better error handling
      if ((recentInvoices.length === 0 || !recentInvoices) && !invoice) {
        pdf.setTextColor(231, 76, 60);
        pdf.setFontSize(14);
        pdf.text("No invoices available.", 105, 70, { align: 'center' });
      } else {
        if (invoice) {
          try {
            // Single invoice view with robust error handling
            const yPosition = 60;
            
            // Safely get total amount with better validation
            const totalAmount = parseFloat(invoice.totalAmount || invoice.total || 0).toFixed(2);
            
            // Only generate QR code if we have valid payment details
            if (paymentDetails && paymentDetails.gpay) {
              try {
                // Enhanced QR code data with payment information and better error handling
                const upiUrl = `upi://pay?pa=${paymentDetails.gpay}&pn=${encodeURIComponent(paymentDetails.merchantName || 'Hospital')}&am=${totalAmount}&tn=${encodeURIComponent(`Invoice #${invoiceId}`)}&cu=INR`;
                
                // Generate QR code with UPI payment URL
                const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
                  color: {
                    dark: '#2C3E50',
                    light: '#FFFFFF'
                  },
                  errorCorrectionLevel: 'H',
                  margin: 2,
                  width: 200
                });
                
                // Add QR code to PDF
                pdf.addImage(qrCodeDataUrl, 'PNG', 15, yPosition + 5, 30, 30);
                
                // Add payment instructions
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(8);
                pdf.setTextColor(127, 140, 141);
                pdf.text("Scan QR to pay via GPay/PhonePe", 15, yPosition + 38);
              } catch (qrError) {
                console.error("QR code generation error:", qrError);
                // Continue without QR code
              }
            }
            
            // Add invoice details
            pdf.setTextColor(44, 62, 80);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(`Invoice #${invoiceId}`, 50, yPosition + 10);
            
            // Safely display invoice details
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            
            // Ensure patientName is a string
            const patientName = typeof invoice.patientName === 'string' ? invoice.patientName : 'N/A';
            pdf.text(`Patient: ${patientName || 'N/A'}`, 50, yPosition + 20);
            
            // Ensure treatment is a string
            const treatment = typeof invoice.treatment === 'string' ? 
              invoice.treatment : 
              (invoice.items && invoice.items[0] && invoice.items[0].description) || 'N/A';
            pdf.text(`Treatment: ${treatment}`, 50, yPosition + 30);
            
            // Ensure doctorName is a string
            const doctorName = typeof invoice.doctorName === 'string' ? invoice.doctorName : 'N/A';
            pdf.text(`Doctor: ${doctorName || 'N/A'}`, 50, yPosition + 40);
            
            const wardNumber = typeof invoice.wardNumber === 'string' ? invoice.wardNumber : 'N/A';
            pdf.text(`Ward Number: ${wardNumber || 'N/A'}`, 50, yPosition + 50);
            
            // Add amount with currency symbol and styling
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(46, 204, 113);
            pdf.setFontSize(14);
            pdf.text(`₹${totalAmount}`, 170, yPosition + 30, { align: 'right' });
          } catch (detailsError) {
            console.error('Error in invoice details generation:', detailsError);
            
            // Fallback content if details fail
            pdf.setTextColor(231, 76, 60);
            pdf.setFontSize(14);
            pdf.text("Error generating invoice details.", 105, 70, { align: 'center' });
          }
        } else {
          // All invoices report
          try {
            // Add table header
            pdf.setFillColor(52, 152, 219);
            pdf.rect(10, 60, 190, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.text("Invoice Details", 105, 66, { align: 'center' });

            // Generate summary table for all invoices with better error handling
            const tableData = recentInvoices.map((invoice, i) => {
              // Enhanced parsing with safety checks
              let id = 'N/A';
              if (invoice._id) {
                id = typeof invoice._id === 'string' ? invoice._id.slice(-6) : String(invoice._id).slice(-6);
              } else if (invoice.invoiceNumber) {
                id = invoice.invoiceNumber;
              }
              
              const patientName = typeof invoice.patientName === 'string' ? invoice.patientName : 'N/A';
              
              const treatment = typeof invoice.treatment === 'string' ? 
                invoice.treatment : 
                (invoice.items && invoice.items[0] && invoice.items[0].description) || 'N/A';
              
              let total = 0;
              try {
                total = parseFloat(invoice.total || invoice.totalAmount || 0);
                if (isNaN(total)) total = 0;
              } catch (e) {
                total = 0;
              }
              
              const status = invoice.paymentStatus || 'Unpaid';
              
              return [id, patientName, treatment, `₹${total.toFixed(2)}`, status];
            });
            
            autoTable(pdf, {
              startY: 75,
              head: [['ID', 'Patient', 'Treatment', 'Amount', 'Status']],
              body: tableData,
              theme: 'striped',
              styles: { fontSize: 8 },
              headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
              alternateRowStyles: { fillColor: [240, 245, 250] }
            });
            
            // Add footer with total amount
            const totalAmount = recentInvoices.reduce((sum, invoice) => {
              let amount = 0;
              try {
                amount = parseFloat(invoice.totalAmount || invoice.total || 0);
                if (isNaN(amount)) amount = 0;
              } catch (e) {
                amount = 0;
              }
              return sum + amount;
            }, 0);
            
            const finalY = pdf.lastAutoTable.finalY + 10;
            
            pdf.setFillColor(44, 62, 80);
            pdf.rect(10, finalY, 190, 20, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.text(`Total Invoices: ${recentInvoices.length}`, 20, finalY + 10);
            pdf.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 190, finalY + 10, { align: 'right' });
          } catch (tableError) {
            console.error('Error in report table generation:', tableError);
            
            // Fallback content if table fails
            pdf.setTextColor(231, 76, 60);
            pdf.setFontSize(14);
            pdf.text("Error generating invoice table.", 105, 70, { align: 'center' });
          }
        }
      }

      // Open PDF in new tab for preview
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating invoice report. Please try again.");
    }
  };

  // Download a specific invoice
  const handleDownloadInvoice = async (invoice) => {
    try {
      await generateReport(invoice);
      fetchInvoices();
      fetchPatients();
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Error downloading invoice. Please try again.");
    }
  };

  // Filter invoices based on search and filter
  const filteredInvoices = recentInvoices.filter(invoice => {
    const matchesSearch = 
      !searchQuery || 
      invoice.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.treatment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice._id?.includes(searchQuery);
    
    if (filter === "All Invoices") return matchesSearch;
    if (filter === "Paid") return matchesSearch && invoice.paymentStatus === "Paid";
    if (filter === "Unpaid") return matchesSearch && invoice.paymentStatus === "Unpaid";
    
    return matchesSearch;
  });

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h1>Invoice Management</h1>
        <div className="header-actions">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
          <button 
            className="report-btn" 
            onClick={() => generateReport()}
          >
            <FaFilePdf className="btn-icon" /> Generate Report
          </button>
        </div>
      </div>

      <div className="invoice-layout">
        {/* Left section - Create/Edit Invoice Form */}
        <div className="invoice-form-card">
          <div className="card-header">
            <h2>{editingIndex !== null ? "Edit Invoice" : "Create New Invoice"}</h2>
          </div>
          <div className="form-content">
            <div className="form-row">
              <div className="form-group">
                <label>Patient</label>
                <select
                  name="patientId"
                  value={invoiceData.patientId}
                  onChange={handleChange}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} - {patient.contactNumber || patient.contact}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Doctor</label>
                <select
                  name="doctorName"
                  value={invoiceData.doctorName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor.name}>
                      {doctor.name} - {doctor.specialization || 'General'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Treatment</label>
                <select
                  name="treatment"
                  value={invoiceData.treatment}
                  onChange={handleChange}
                >
                  {treatments.map(treatment => (
                    <option key={treatment} value={treatment}>
                      {treatment}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Lab</label>
                <input
                  type="text"
                  name="labName"
                  placeholder="Lab Name"
                  value={invoiceData.labName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Ward Number</label>
                <input
                  type="text"
                  name="wardNumber"
                  placeholder="Ward Number"
                  value={invoiceData.wardNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <div className="amount-display">
                  ₹{invoiceData.totalAmount ? parseFloat(invoiceData.totalAmount).toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
            
            {invoiceData.governmentScheme && invoiceData.governmentScheme !== 'None' && (
              <div className="scheme-info">
                <div className="scheme-header">
                  <FaShieldAlt className="scheme-icon" />
                  <span>{invoiceData.governmentScheme} Scheme Applied</span>
                </div>
                <div className="scheme-details">
                  <p>Coverage: {governmentSchemes[invoiceData.governmentScheme]}%</p>
                  {invoiceData.treatment && (
                    <div className="price-comparison">
                      <span className="original">₹{treatmentCosts[invoiceData.treatment]}</span>
                      <span className="arrow">→</span>
                      <span className="discounted">₹{invoiceData.totalAmount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                className="cancel-btn" 
                onClick={resetForm}
              >
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={handleSave}
              >
                {editingIndex !== null ? "Update" : "Save"} Invoice
              </button>
            </div>
          </div>
        </div>
        
        {/* Right section - Invoices Table */}
        <div className="invoices-table-card">
          <div className="card-header">
            <h2>Recent Invoices</h2>
            <select 
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All Invoices</option>
              <option>Paid</option>
              <option>Unpaid</option>
            </select>
          </div>
          
          <div className="table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Patient</th>
                  <th>Treatment</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      <div>
                        <FaFileInvoice className="empty-icon" />
                        <p>No invoices found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice, index) => {
                    const displayId = invoice.invoiceNumber || (invoice._id ? invoice._id.slice(-6) : 'N/A');
                    const finalAmount = parseFloat(invoice.total || invoice.totalAmount || 0).toFixed(2);
                    
                    // Make sure we always have values to display
                    const patientName = invoice.patientName || 'N/A';
                    const doctorName = invoice.doctorName || 'N/A';
                    const treatment = invoice.treatment || (invoice.items && invoice.items[0] && invoice.items[0].description) || 'N/A';
                    
                    console.log(`Invoice ${index} patient:`, patientName, "doctor:", doctorName);
                    
                    return (
                      <tr key={invoice._id || index}>
                        <td>
                          <span className="id-badge">{displayId}</span>
                        </td>
                        <td>{patientName}</td>
                        <td>{treatment}</td>
                        <td>{doctorName}</td>
                        <td className="amount">₹{finalAmount}</td>
                        <td>
                          <span className={`status ${(invoice.paymentStatus || 'unpaid').toLowerCase()}`}>
                            {invoice.paymentStatus || 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button 
                              className="edit-btn" 
                              onClick={() => handleEdit(index)} 
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDelete(index)} 
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                            <button 
                              className="download-btn" 
                              onClick={() => handleDownloadInvoice(invoice)} 
                              title="Download"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice; 