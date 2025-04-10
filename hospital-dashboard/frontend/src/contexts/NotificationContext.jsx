import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Generate a unique ID for each notification
  const generateId = () => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Add a new notification
  const addNotification = useCallback((message, type = 'info', timeout = 5000) => {
    const id = generateId();
    
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Automatically remove notification after timeout
    if (timeout !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }
    
    return id; // Return the ID in case it's needed to manually remove the notification
  }, []);

  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Helper methods for different notification types
  const showSuccess = useCallback((message, timeout) => 
    addNotification(message, 'success', timeout), [addNotification]);
    
  const showError = useCallback((message, timeout) => 
    addNotification(message, 'error', timeout), [addNotification]);
    
  const showWarning = useCallback((message, timeout) => 
    addNotification(message, 'warning', timeout), [addNotification]);
    
  const showInfo = useCallback((message, timeout) => 
    addNotification(message, 'info', timeout), [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}
      <Notification 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 