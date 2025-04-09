import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const Invoice = () => {
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
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

  // Government schemes with coverage percentage
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

  // Add payment details
  const paymentDetails = {
    gpay: "hospital@upi",  // Replace with your actual GPay UPI ID
    phonepay: "hospital@ybl", // Replace with your actual PhonePe UPI ID
    merchantName: "Hospital Management System",
    merchantId: "HMS001"
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/invoices');
      setRecentInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const calculateDiscountedAmount = (originalAmount, scheme) => {
    const coverage = governmentSchemes[scheme] || 0;
    return (originalAmount * (1 - coverage / 100)).toFixed(2);
  };

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
          patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
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

  const handleSave = async () => {
    if (!invoiceData.patientId || !invoiceData.doctorName || !invoiceData.labName || !invoiceData.treatment || !invoiceData.totalAmount) {
      alert("Please fill in all fields before saving.");
      return;
    }

    try {
      if (editingIndex !== null) {
        await axios.put(`http://localhost:5000/invoices/${recentInvoices[editingIndex]._id}`, invoiceData);
      } else {
        await axios.post('http://localhost:5000/invoices', invoiceData);
      }
      fetchInvoices();
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
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleEdit = (index) => {
    setInvoiceData(recentInvoices[index]);
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    try {
      await axios.delete(`http://localhost:5000/invoices/${recentInvoices[index]._id}`);
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const generateReport = async (invoice = null) => {
    try {
      // If downloading a specific invoice, update claims
      if (invoice && invoice._id) {
        await axios.post(`http://localhost:5000/api/invoices/${invoice._id}/download`);
      }

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
      pdf.text("Invoice Report", 105, 42, { align: 'center' });
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(127, 140, 141);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 190, 42, { align: 'right' });

      if (recentInvoices.length === 0) {
        pdf.setTextColor(231, 76, 60);
        pdf.setFontSize(14);
        pdf.text("No invoices available.", 105, 70, { align: 'center' });
      } else {
        // Add table header
        pdf.setFillColor(52, 152, 219);
        pdf.rect(10, 60, 190, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text("Invoice Details", 105, 66, { align: 'center' });

        // Generate QR code and details for each invoice
        for (let i = 0; i < recentInvoices.length; i++) {
          const invoice = recentInvoices[i];
          const yPosition = 80 + (i * 50);
          
          // Add alternating background colors for rows
          if (i % 2 === 0) {
            pdf.setFillColor(236, 240, 241);
          } else {
            pdf.setFillColor(255, 255, 255);
          }
          pdf.rect(10, yPosition, 190, 40, 'F');
          
          // Enhanced QR code data with payment information
          const qrData = {
            id: invoice._id,
            patient: invoice.patientName,
            amount: invoice.totalAmount,
            date: new Date().toISOString(),
            payment: {
              amount: invoice.totalAmount,
              merchantName: paymentDetails.merchantName,
              merchantId: paymentDetails.merchantId,
              description: `Invoice #${invoice._id.slice(-6)} for ${invoice.treatment}`,
              options: {
                gpay: paymentDetails.gpay,
                phonepay: paymentDetails.phonepay
              }
            }
          };
          
          try {
            // Generate payment URL for UPI
            const upiUrl = `upi://pay?pa=${paymentDetails.gpay}&pn=${encodeURIComponent(paymentDetails.merchantName)}&am=${invoice.totalAmount}&tn=${encodeURIComponent(`Invoice #${invoice._id.slice(-6)}`)}&cu=INR`;
            
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
            
            // Add invoice details with better formatting
            pdf.setTextColor(44, 62, 80);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(`Invoice #${invoice._id.slice(-6)}`, 50, yPosition + 10);
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(`Patient: ${invoice.patientName}`, 50, yPosition + 20);
            pdf.text(`Treatment: ${invoice.treatment}`, 50, yPosition + 30);
            
            // Add amount with currency symbol and styling
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(46, 204, 113);
            pdf.setFontSize(14);
            pdf.text(`₹${invoice.totalAmount}`, 170, yPosition + 20, { align: 'right' });
            
            // Add payment instructions
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(127, 140, 141);
            pdf.text("Scan QR to pay via GPay/PhonePe", 15, yPosition + 38);
            
            // Add a subtle border
            pdf.setDrawColor(189, 195, 199);
            pdf.rect(10, yPosition, 190, 40);
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }
        
        // Add footer with total amount in INR
        const totalAmount = recentInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount), 0);
        pdf.setFillColor(44, 62, 80);
        pdf.rect(10, 80 + (recentInvoices.length * 50), 190, 20, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`Total Invoices: ${recentInvoices.length}`, 20, 90 + (recentInvoices.length * 50));
        pdf.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 190, 90 + (recentInvoices.length * 50), { align: 'right' });
      }

      // Instead of directly saving, open in a new tab for preview
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const previewWindow = window.open(pdfUrl, '_blank');
      
      // Add a download button to the preview window
      previewWindow.onload = () => {
        const downloadButton = document.createElement('button');
        downloadButton.innerHTML = 'Download PDF';
        downloadButton.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          z-index: 9999;
        `;
        downloadButton.onclick = () => {
          pdf.save("invoice_report.pdf");
        };
        previewWindow.document.body.appendChild(downloadButton);
      };
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating invoice report. Please try again.");
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      await generateReport(invoice);
      // Refresh the invoices and patients list to show updated claim count
      fetchInvoices();
      fetchPatients();
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Error downloading invoice. Please try again.");
    }
  };

  const handlePreviewAndDownload = () => {
    generateReport();
  };

  return (
    <div className="invoice-page">
      <h2>Invoice Management</h2>

      <div className="invoice-form">
        <div className="form-header">
          <button className="generate-report" onClick={handlePreviewAndDownload}>
            👁️ Preview & Download Report
          </button>
          <div className="search-box">
            <input type="text" placeholder="Invoice ID" />
            <button className="search-btn">Search</button>
          </div>
        </div>

        <div className="form-body">
          <div className="form-row">
            <select 
              name="patientId" 
              value={invoiceData.patientId} 
              onChange={handleChange}
              className="patient-select"
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.firstName} {patient.lastName} - {patient.governmentScheme || 'No Scheme'}
                </option>
              ))}
            </select>
            <input type="text" name="doctorName" value={invoiceData.doctorName} onChange={handleChange} placeholder="Doctor Name" />
          </div>

          <div className="form-row">
            <input type="text" name="labName" value={invoiceData.labName} onChange={handleChange} placeholder="Lab Name" />
            <select 
              name="treatment" 
              value={invoiceData.treatment} 
              onChange={handleChange}
              className="patient-select"
            >
              {treatments.map((treatment) => (
                <option key={treatment} value={treatment}>
                  {treatment}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <input type="text" name="wardNumber" value={invoiceData.wardNumber} onChange={handleChange} placeholder="Ward Number" />
            <input 
              type="text" 
              name="totalAmount" 
              value={invoiceData.totalAmount ? `₹${invoiceData.totalAmount}` : ''}
              readOnly
              placeholder="Total Amount" 
              className="amount-input"
            />
          </div>

          {invoiceData.governmentScheme && invoiceData.governmentScheme !== 'None' && (
            <div className="scheme-info">
              <p>
                <strong>Applied Scheme:</strong> {invoiceData.governmentScheme} 
                <span className="coverage-text">
                  (Coverage: {governmentSchemes[invoiceData.governmentScheme]}%)
                </span>
              </p>
              {invoiceData.treatment && (
                <p className="discount-info">
                  Original Amount: ₹{treatmentCosts[invoiceData.treatment]} → 
                  Discounted Amount: ₹{invoiceData.totalAmount}
                </p>
              )}
            </div>
          )}
        </div>

        <button className="generate-bill" onClick={handleSave}>
          {editingIndex !== null ? "Update Invoice" : "Add Invoice"}
        </button>
      </div>

      <div className="recent-invoices">
        <h3>Recent Invoices</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Lab Name</th>
              <th>Ward Number</th>
              <th>Doctor Name</th>
              <th>Treatment</th>
              <th>Scheme</th>
              <th>Original Amount</th>
              <th>Final Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((invoice, index) => (
              <tr key={invoice._id}>
                <td>{invoice._id}</td>
                <td>{invoice.patientName}</td>
                <td>{invoice.labName}</td>
                <td>{invoice.wardNumber}</td>
                <td>{invoice.doctorName}</td>
                <td>{invoice.treatment}</td>
                <td>
                  {invoice.governmentScheme || 'None'}
                  {invoice.governmentScheme && invoice.governmentScheme !== 'None' && (
                    <span className="coverage-badge">
                      {governmentSchemes[invoice.governmentScheme]}%
                    </span>
                  )}
                </td>
                <td>₹{treatmentCosts[invoice.treatment] || 0}</td>
                <td>₹{invoice.totalAmount}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(index)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(index)}>🗑️</button>
                    <button className="download-btn" onClick={() => handleDownloadInvoice(invoice)}>📥</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoice;