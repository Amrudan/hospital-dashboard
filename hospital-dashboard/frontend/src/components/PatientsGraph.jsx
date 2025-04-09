import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const PatientGraph = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // Fetch patient graph data
    axios.get("http://localhost:5000/api/patient-graph")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching patient graph data:", err));

    // Fetch patient stats
    axios.get("http://localhost:5000/api/patient-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching patient stats:", err));
  }, []);

  return (
    <div className="patient-graph">
      <div className="graph-header">
        <h2>Patients</h2>
        <select>
          <option>7 days</option>
          <option>30 days</option>
          <option>All time</option>
        </select>
      </div>
      <div className="graph-container" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="patients" 
              stroke="#6c5ce7" 
              strokeWidth={2}
              dot={{ fill: "#6c5ce7", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <p className="label">{stat.label}</p>
            <h3 className="value">{stat.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientGraph;
