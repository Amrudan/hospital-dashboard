import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ notifications, removeNotification }) => {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification ${notification.type}`}
        >
          <div className="notification-content">
            <p>{notification.message}</p>
          </div>
          <button 
            className="notification-close" 
            onClick={() => removeNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notification; 