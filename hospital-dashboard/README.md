# Hospital Management System

A comprehensive hospital management system built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Patient management
- Staff management
- Ward management
- Lab test management
- Pharmacy/Medication management
- Invoicing system
- Dashboard with statistics

## Technology Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (planned)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hospital-dashboard
   ```

2. Install dependencies for frontend, backend, and root project:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add the following:
     ```
     MONGODB_URI=your_mongodb_connection_string
     PORT=5000
     ```

4. Run the application:
   ```
   npm run dev
   ```
   This will start both the backend server (on port 5000) and the frontend development server.

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

- Patients: `/api/patients`
- Staff: `/api/staff`
- Wards: `/api/wards`
- Lab Tests: `/api/lab`
- Pharmacy: `/api/pharmacy`
- Invoices: `/api/invoices`

## Project Structure

```
hospital-dashboard/
├── backend/              # Backend server
│   ├── controllers/      # API controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── server.js         # Server entry point
├── frontend/             # React frontend
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── styles/       # CSS styles
│   └── index.html        # HTML entry point
└── package.json          # Project configuration
``` 