import { Routes, Route } from 'react-router-dom';
import { useState, useEffect, Component } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Lab from './pages/Lab';
import Ward from './pages/Ward';
import Pharmacy from './pages/Pharmacy';
import Patients from './pages/Patients';
import Invoice from './pages/Invoice';
import './App.css';

// Error Boundary to catch rendering errors
class ErrorBoundary extends Component {
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
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/ward" element={<Ward />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/patient" element={<Patients />} />
            <Route path="/invoice" element={<Invoice />} />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App; 