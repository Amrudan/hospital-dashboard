import { useEffect, useState } from "react";
import axios from "axios";

const StatCards = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stat-cards")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stat cards:", err));
  }, []);

  return (
    <div className="stat-cards">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="icon" dangerouslySetInnerHTML={{ __html: stat.icon }}></div>
          <div className="content">
            <p className="title">{stat.title}</p>
            <h3 className="count">{stat.count}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
