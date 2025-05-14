import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
// import PatientLogin from './components/PatientLayout';
import PatientDashboard from './pages/PatientDashboard';
// import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Staff from './pages/Staff';
import Ward from './pages/Ward';
import Lab from './pages/Lab';
import Pharmacy from './pages/Pharmacy';
import Invoice from './pages/Invoice';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/Adminlogin';
import PatientLogin from './pages/PatientLogin';
import PatientSignup from './pages/PatientSignup';
import AdminDashboard from './pages/AdminDashboard';
import AdminSignup from './pages/AdminSignup';
import DoctorAppointments from './pages/DoctorAppointments';
import './App.css';
import PatientLayout from './components/PatientLayout';
import PatientProfile from './pages/PatientProfile';
import AdminProfile from './pages/AdminProfile';

// Error Boundary to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()} 
            className="reload-btn"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [loading, setLoading] = useState(true);

  // Simulate loading time for initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-content">
          <div className="pulse-loader"></div>
          <h2>Hospital Management System</h2>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/patient-login" />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          <Route path="/patient-signup" element={<PatientSignup />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/patient-dashboard/*" element={<PatientLayout />}>
            <Route index element={<PatientDashboard />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>
          
          {/* Admin Routes in correct order */}
          <Route path="/admin-profile" element={
            <AdminLayout>
              <AdminProfile />
            </AdminLayout>
          } />
          <Route path="/patients" element={
            <AdminLayout>
              <Patients />
            </AdminLayout>
          } />
          <Route path="/staff" element={
            <AdminLayout>
              <Staff />
            </AdminLayout>
          } />
          <Route path="/ward" element={
            <AdminLayout>
              <Ward />
            </AdminLayout>
          } />
          <Route path="/lab" element={
            <AdminLayout>
              <Lab />
            </AdminLayout>
          } />
          <Route path="/pharmacy" element={
            <AdminLayout>
              <Pharmacy />
            </AdminLayout>
          } />
          <Route path="/invoice" element={
            <AdminLayout>
              <Invoice />
            </AdminLayout>
          } />
          <Route path="/appointments" element={
            <AdminLayout>
              <DoctorAppointments />
            </AdminLayout>
          } />
          
          <Route path="/admin-signup" element={<AdminSignup />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;