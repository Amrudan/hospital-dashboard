import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import "./Pharmacy.css";

export default function Pharmacy() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [inventory, setInventory] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [showStockForm, setShowStockForm] = useState(false);
    const [purchaseData, setPurchaseData] = useState([]);
    const [stockData, setStockData] = useState([]);

    // Fetch initial data
    useEffect(() => {
        axios.get("/api/categories")
            .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
            .catch(() => setCategories([]));

        axios.get("/api/purchase-reports")
            .then((res) => setPurchaseData(Array.isArray(res.data) ? res.data : []))
            .catch(() => setPurchaseData([]));

        axios.get("/api/stock-summary")
            .then((res) => setStockData(Array.isArray(res.data) ? res.data : []))
            .catch(() => setStockData([]));

        axios.get("/api/prescriptions")
            .then((res) => setPrescriptions(Array.isArray(res.data) ? res.data : []))
            .catch(() => setPrescriptions([]));
    }, []);

    // Fetch inventory when category changes
    useEffect(() => {
        if (selectedCategory) {
            axios
                .get(`/api/inventory?category=${selectedCategory}`)
                .then((res) => setInventory(Array.isArray(res.data) ? res.data : []))
                .catch(() => setInventory([]));
        }
    }, [selectedCategory]);

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

    const isExpired = (expiryDate) => new Date(expiryDate) < new Date();
    const isOutOfStock = (quantity) => quantity <= 0;

    return (
        <div className="management-page">
            <h1 className="page-header">Pharmacy Management</h1>

            {/* Charts Section */}
            <div className="charts-container">
                <div className="chart-box">
                    <h3>Purchase Reports</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={purchaseData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-box">
                    <h3>Medicine Stock</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={stockData} cx="50%" cy="50%" outerRadius={100} label>
                                {stockData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Inventory Section */}
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Pharmacy Inventory</h2>

                <select
                    className="p-2 border rounded w-full mb-4"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Select a Category</option>
                    {Array.isArray(categories) && categories.map((cat, index) => (
                        <option key={index} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                {selectedCategory && (
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Drug/Product Name</th>
                                <th className="border p-2">Manufacture Date</th>
                                <th className="border p-2">Expiry Date</th>
                                <th className="border p-2">Quantity</th>
                                <th className="border p-2">Unit Price ($)</th>
                                <th className="border p-2">Stock Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`border ${isExpired(item.expiryDate) || isOutOfStock(item.quantity) ? "bg-red-500 text-white" : ""}`}
                                >
                                    <td className="border p-2 text-center">{item.id}</td>
                                    <td className="border p-2">{item.name}</td>
                                    <td className="border p-2 text-center">{item.manufactureDate}</td>
                                    <td className="border p-2 text-center">{item.expiryDate}</td>
                                    <td className="border p-2 text-center">{item.quantity}</td>
                                    <td className="border p-2 text-center">${item.price.toFixed(2)}</td>
                                    <td className="border p-2 text-center">
                                        {isExpired(item.expiryDate) ? "Expired" : isOutOfStock(item.quantity) ? "Out of Stock" : "Available"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Stock Form */}
            <div className="stock-table">
                <div className="section-header">
                    <h3>Stock Details</h3>
                    <button className="add-button" onClick={() => setShowStockForm(!showStockForm)}>
                        {showStockForm ? "Cancel" : "Add New Stock"}
                    </button>
                </div>

                {showStockForm && (
                    <div className="management-form">
                        <div className="form-row">
                            <input type="text" placeholder="Drug Name" />
                            <input type="date" placeholder="Manufacture Date" />
                            <input type="date" placeholder="Expiry Date" />
                        </div>
                        <div className="form-row">
                            <input type="number" placeholder="Quantity" />
                            <input type="number" placeholder="Unit Price" />
                        </div>
                        <div className="button-group">
                            <button className="submit">Save Stock</button>
                            <button className="delete">Delete</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Prescription Section */}
            <div className="prescription-section">
                <h2 className="text-xl font-bold mb-4">Patient Prescriptions</h2>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">Patient Name</th>
                            <th className="border p-2">Drug Name</th>
                            <th className="border p-2">Dosage</th>
                            <th className="border p-2">Prescribed Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptions.map((prescription, index) => (
                            <tr key={index} className="border">
                                <td className="border p-2 text-center">{prescription.patientName}</td>
                                <td className="border p-2">{prescription.drugName}</td>
                                <td className="border p-2 text-center">{prescription.dosage}</td>
                                <td className="border p-2 text-center">{prescription.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
