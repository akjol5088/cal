import { useState, useEffect, useCallback } from 'react';
import { initialFleet, TARIFFS, REGIONS } from '../data/mockData';

export function useSimulator() {
  const [fleet, setFleet] = useState(initialFleet);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    tripsCompleted: 0,
    activeDrivers: initialFleet.length,
    rating: 4.8
  });

  const cityNames = Object.keys(REGIONS);

  const getRandomLoc = (center, offset = 0.05) => [
    center[0] + (Math.random() - 0.5) * offset,
    center[1] + (Math.random() - 0.5) * offset
  ];

  const moveTowards = (current, target, speed = 0.003) => {
    const dLat = target[0] - current[0];
    const dLng = target[1] - current[1];
    const distance = Math.sqrt(dLat * dLat + dLng * dLng);
    if (distance < speed * 1.5) return target;
    
    return [
      current[0] + (dLat / distance) * speed,
      current[1] + (dLng / distance) * speed
    ];
  };

  // 1. Order Generator (Across Kyrgyzstan)
  useEffect(() => {
    const timer = setInterval(() => {
      if (orders.length < 8 && Math.random() > 0.4) {
        const fromCity = cityNames[Math.floor(Math.random() * cityNames.length)];
        const toCity   = cityNames.filter(c => c !== fromCity)[Math.floor(Math.random() * (cityNames.length - 1))];
        
        const tariffKeys = Object.keys(TARIFFS);
        const tariff = tariffKeys[Math.floor(Math.random() * tariffKeys.length)];
        
        const pickup = getRandomLoc(REGIONS[fromCity], 0.1);
        const destination = getRandomLoc(REGIONS[toCity], 0.1);
        
        // Dynamic distance based on coordinates (roughly 111km per degree)
        const dLat = destination[0] - pickup[0];
        const dLng = destination[1] - pickup[1];
        const degDist = Math.sqrt(dLat*dLat + dLng*dLng);
        const dist = parseFloat((degDist * 111).toFixed(1));
        
        const price = Math.round(TARIFFS[tariff].base + dist * TARIFFS[tariff].perKm);

        const newOrder = {
          id: `osh-ord-${Date.now()}`,
          customerName: ['Азамат', 'Айпери', 'Нурбек', 'Бегимай', 'Саламат', 'Гүлнара'][Math.floor(Math.random()*6)],
          phone: '+996 700 ' + Math.floor(100000 + Math.random() * 900000),
          fromAddress: fromCity,
          toAddress: toCity,
          pickup,
          destination,
          dist,
          price,
          tariff,
          status: 'pending'
        };
        setOrders(prev => [...prev, newOrder]);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [orders]);

  // 2. Movement Loop (Inter-city)
  useEffect(() => {
    const simTimer = setInterval(() => {
      setFleet(prevFleet => {
        return prevFleet.map(car => {
          let newPos = [...car.pos];
          let newStatus = car.status;
          let target = car.target;

          // If idle, occasionally pick a new city to roam to
          if (newStatus === 'idle') {
            if (!target || (newPos[0] === target[0] && newPos[1] === target[1])) {
              const nextCity = cityNames[Math.floor(Math.random() * cityNames.length)];
              target = getRandomLoc(REGIONS[nextCity], 0.1);
            }
            newPos = moveTowards(car.pos, target, 0.005); // Faster roaming
            return { ...car, pos: newPos, target };
          }

          const { currentOrder } = car;
          if (car.status === 'en-route') {
            newPos = moveTowards(car.pos, currentOrder.pickup, 0.015);
            if (newPos[0] === currentOrder.pickup[0] && newPos[1] === currentOrder.pickup[1]) {
              newStatus = 'on-trip';
            }
          } else if (car.status === 'on-trip') {
            newPos = moveTowards(car.pos, currentOrder.destination, 0.015);
            if (newPos[0] === currentOrder.destination[0] && newPos[1] === currentOrder.destination[1]) {
              setStats(s => ({
                ...s,
                totalEarnings: s.totalEarnings + currentOrder.price,
                tripsCompleted: s.tripsCompleted + 1
              }));
              return { ...car, status: 'idle', pos: newPos, currentOrder: null, target: null };
            }
          }

          return { ...car, pos: newPos, status: newStatus };
        });
      });
    }, 100);
    return () => clearInterval(simTimer);
  }, []);

  const handleAcceptOrder = useCallback((order) => {
    setFleet(prev => {
      const idleCars = prev.filter(c => c.status === 'idle');
      // Find car of same tariff, or just any idle car
      const car = idleCars.find(c => c.tariff === order.tariff) || idleCars[0];
      
      if (!car) return prev;

      setOrders(o => o.filter(ord => ord.id !== order.id));
      
      return prev.map(c => 
        c.id === car.id ? { ...c, status: 'en-route', currentOrder: order } : c
      );
    });
  }, [orders]);

  return { fleet, orders, stats, handleAcceptOrder };
}
