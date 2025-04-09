import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Staff from './pages/Staff';
import Lab from './pages/Lab';
import Ward from './pages/Ward';
import Pharmacy from './pages/Pharmacy';
import Patients from './pages/Patients';
import Invoice from './pages/Invoice';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar/>
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
    </Router>
  );
}

export default App; 