import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useSimulator } from '../hooks/useSimulator';

const SocketContext = createContext(null);

import { SERVER_URL as SERVER } from '../utils/api';


export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  
  // Real-time data from server
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState(() => {
    try {
      const saved = localStorage.getItem('taxi_stats');
      return saved ? JSON.parse(saved) : { totalEarnings: 0, tripsCompleted: 0 };
    } catch { return { totalEarnings: 0, tripsCompleted: 0 }; }
  });
  const [connected, setConnected] = useState(false);
  const [isDemo, setIsDemo]       = useState(!SERVER); // instant demo if no server
  const connectedRef = useRef(false);

  // Simulator fallback for offline/demo mode
  const sim = useSimulator();

  useEffect(() => {
    // No server URL means cloud/Vercel deployment — run in demo mode only
    if (!SERVER) {
      console.log('No server URL — running in DEMO mode');
      setIsDemo(true);
      return;
    }

    console.log('Connecting to:', SERVER);

    // Connection timeout — switch to demo if not connected in 3s
    const connectionTimeout = setTimeout(() => {
      if (!connectedRef.current) {
        console.log('Not connected after 3s — entering DEMO mode');
        setIsDemo(true);
      }
    }, 3000);

    const socket = io(SERVER, {
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      clearTimeout(connectionTimeout);
      connectedRef.current = true;
      setConnected(true);
      setIsDemo(false);
    });

    socket.on('disconnect', () => {
      connectedRef.current = false;
      setConnected(false);
    });

    socket.on('connect_error', () => {
      if (!connectedRef.current) {
        setIsDemo(true);
      }
    });

    socket.on('drivers:update', setDrivers);
    socket.on('orders:current', setOrders);
    socket.on('stats:update', (newStats) => {
      setStats(newStats);
      localStorage.setItem('taxi_stats', JSON.stringify(newStats));
    });

    socket.on('order:new', (order) => {
      setOrders(prev => [order, ...prev.filter(o => o._id !== order._id)]);
    });

    socket.on('order:update', (updated) => {
      if (updated.status === 'completed' || updated.status === 'cancelled') {
        setOrders(prev => prev.filter(o => o._id !== updated._id));
      } else {
        setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      }
    });

    return () => {
      clearTimeout(connectionTimeout);
      socket.disconnect();
    };
  }, [user]);

  // Unified actions
  const acceptOrder = useCallback((orderId, driverId) => {
    if (isDemo) {
      const order = sim.orders.find(o => o.id === orderId) || orders.find(o => o.id === orderId);
      if (order) sim.handleAcceptOrder(order);
    } else {
      socketRef.current?.emit('order:accept', { orderId, driverId });
      setOrders(prev => prev.filter(o => o._id !== orderId));
    }
  }, [isDemo, sim, orders]);

  const cancelOrder = useCallback((orderId) => {
    if (isDemo) {
      // Simulator cancel logic if needed
    } else {
      socketRef.current?.emit('order:cancel', { orderId });
      setOrders(prev => prev.filter(o => o._id !== orderId));
    }
  }, [isDemo]);


  // Normalize drivers (Simulator uses .pos, Server uses .lat/.lng)
  const normalizedDrivers = (isDemo ? sim.fleet : drivers).map(d => ({
    _id: d._id || d.id,
    name: d.name || d.driver,
    car: d.car || d.model,
    plate: d.plate || d.number,
    tariff: d.tariff,
    status: d.status,
    rating: d.rating,
    lat: d.lat || d.pos?.[0],
    lng: d.lng || d.pos?.[1],
  }));

  // Normalize orders
  const normalizedOrders = (isDemo ? sim.orders : orders).map(o => ({
    _id: o._id || o.id,
    customerName: o.customerName || 'Клиент',
    phone: o.phone || '+996 ...',
    fromAddress: o.fromAddress || 'Аныкталган жок',
    toAddress: o.toAddress || 'Аныкталган жок',
    fromLat: o.fromLat || o.pickup?.[0],
    fromLng: o.fromLng || o.pickup?.[1],
    toLat: o.toLat || o.destination?.[0],
    toLng: o.toLng || o.destination?.[1],
    distance: o.distance || o.dist,
    price: o.price,
    tariff: o.tariff,
    status: o.status,
  }));

  // Provide either server data or simulator data
  const value = {
    drivers: normalizedDrivers,
    orders:  normalizedOrders,
    stats:   isDemo ? sim.stats  : stats,
    connected,
    isDemo,
    acceptOrder,
    cancelOrder
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

