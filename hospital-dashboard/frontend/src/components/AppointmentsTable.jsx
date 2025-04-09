import { useEffect, useState } from "react";
import axios from "axios";

const AppointmentsTable = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments") // later you can replace URL
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Error fetching appointments:", err));
  }, []);

  return (
    <div className="appointments-section">
      <div className="appointments-header">
        <h2>Appointments</h2>
        <div className="appointments-filters">
          <select>
            <option>7 days</option>
            <option>30 days</option>
            <option>All time</option>
          </select>
          <select>
            <option>Two tab</option>
          </select>
        </div>
      </div>

      <table className="appointments-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, index) => (
            <tr key={index}>
              <td>{appointment.name}</td>
              <td>{appointment.date}</td>
              <td>
                <span className={`status ${appointment.status?.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="accept-btn">Accept</button>
                  <button className="reject-btn">Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button>←</button>
        <button className="active">1</button>
        <button>2</button>
        <button>3</button>
        <span>...</span>
        <button>13</button>
        <button>→</button>
      </div>
    </div>
  );
};

export default AppointmentsTable;
