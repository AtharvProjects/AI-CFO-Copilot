import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket;
    if (user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5105';
      newSocket = io(socketUrl);

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('join_room', user.id);
      });

      newSocket.on('alert:new', (alertData) => {
        // Display toast for new alert based on severity
        if (alertData.severity === 'high') {
          toast.error(alertData.message, { duration: 5000 });
        } else {
          toast.success(alertData.message);
        }
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
