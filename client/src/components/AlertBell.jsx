import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AlertBell = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // In a full implementation, we'd fetch historical alerts here
    // For this MVP, we'll just listen to new ones
    if (socket) {
      socket.on('alert:new', (alert) => {
        setAlerts((prev) => [alert, ...prev]);
      });
    }
  }, [socket]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-full hover:bg-gray-100 relative text-gray-600 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-sm text-gray-700">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No new alerts</div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className={`p-3 border-b border-gray-50 text-sm ${alert.severity === 'high' ? 'bg-red-50/30' : 'hover:bg-gray-50/50'}`}>
                  <p className="text-gray-800">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertBell;
