import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, onTaskUpdate }) => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws'),
      reconnectDelay: 10000,
      onConnect: () => {
        console.log('✅ WebSocket connected to Spring Boot backend!');
        setConnected(true);

        // Real-time task updates from Kafka
        client.subscribe('/topic/tasks', (msg) => {
          const body = JSON.parse(msg.body);
          if (onTaskUpdate) onTaskUpdate(body);
        });

        // Real-time notifications
        client.subscribe('/topic/notifications', (msg) => {
          const body = JSON.parse(msg.body);
          setNotifications(prev => [body, ...prev].slice(0, 20)); // keep last 20
        });

        // Activity logs
        client.subscribe('/topic/activity', (msg) => {
          const body = JSON.parse(msg.body);
          setActivityLogs(prev => [body, ...prev].slice(0, 50));
        });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.warn('WebSocket unavailable (backend may be offline):', frame.headers?.message);
        setConnected(false);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [onTaskUpdate]);

  return (
    <SocketContext.Provider value={{ connected, notifications, activityLogs, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() { return useContext(SocketContext); }
