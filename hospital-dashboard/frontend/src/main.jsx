import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
// import { NotificationProvider } from 'react-notifications-component';
import { NotificationProvider } from './contexts/NotificationContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <NotificationProvider>
      <App />
    </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
