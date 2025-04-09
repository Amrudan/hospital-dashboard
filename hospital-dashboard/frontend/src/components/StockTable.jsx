import { useEffect, useState } from "react";
import axios from "axios";

const StockTable = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stocks")
      .then((res) => setStocks(res.data))
      .catch((err) => console.error("Error fetching stocks:", err));
  }, []);

  return (
    <div className="stock-table">
      <h2>Out of Stock</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Drug Name</th>
            <th>Expire Date</th>
            <th>Manufacture Date</th>
            <th>Price</th>
            <th>QTY</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td>{stock.id}</td>
              <td>{stock.name}</td>
              <td>{stock.expireDate}</td>
              <td>{stock.manufactureDate}</td>
              <td>{stock.price}</td>
              <td>{stock.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
