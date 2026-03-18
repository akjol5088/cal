import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';


// Light OpenStreetMap tiles (Carto Voyager — looks like Yandex)
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const CITY = [40.5133, 72.8161];
const getAngle = (oldPos, newPos) => {
  if (!oldPos || !newPos) return 0;
  const dy = newPos.lat - oldPos.lat;
  const dx = Math.cos(Math.PI / 180 * oldPos.lat) * (newPos.lng - oldPos.lng);
  if (Math.abs(dx) < 0.00001 && Math.abs(dy) < 0.00001) return null;
  return (Math.atan2(dx, dy) * 180) / Math.PI;
};

const CarSVG = ({ color, heading, isBusy }) => (
  <div style={{ 
    transform: `rotate(${heading}deg)`, 
    transition: 'transform 0.4s ease-out',
    width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative'
  }}>
    <svg width="24" height="42" viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="38" rx="5" fill={color} stroke="#000" strokeWidth={isBusy ? 2 : 1} strokeOpacity={0.2} />
      <rect x="4" y="10" width="16" height="12" rx="2" fill="rgba(0,0,0,0.2)" />
      {/* Lights highlight if busy */}
      {isBusy && <circle cx="12" cy="5" r="3" fill="#FF3B30" opacity="0.6" />}
    </svg>
  </div>
);


const getTariffColor = (tariff, status) => {
  if (status === 'offline') return '#9E9E9E';
  if (status === 'on_trip') return '#FF9500';  
  if (tariff === 'business') return '#1A1A1A';  
  if (tariff === 'comfort')  return '#007AFF';  
  return '#FFD60A'; 
};


const MapView = ({ drivers, orders, filterIdle }) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({}); 
  const orderMarkersRef = useRef({});
  const lastPosRef   = useRef({});

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = L.map(containerRef.current, {
      center: CITY,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer(TILE_URL, { attribution: '© CartoDB' }).addTo(mapRef.current);
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update car markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentIds = new Set();
    const visible = filterIdle ? drivers.filter(d => d.status === 'idle') : drivers;

    visible.forEach(driver => {
      if (!driver.lat || !driver.lng) return; // SKIP if no coords
      currentIds.add(driver._id);
      const prev = lastPosRef.current[driver._id];
      const newAngle = getAngle(prev, { lat: driver.lat, lng: driver.lng });
      const heading = newAngle !== null ? newAngle : (prev?.heading || 0);
      lastPosRef.current[driver._id] = { lat: driver.lat, lng: driver.lng, heading };

      const color = getTariffColor(driver.tariff, driver.status);
      const isBusy = driver.status === 'on_trip';
      const html = renderToStaticMarkup(<CarSVG color={color} heading={heading} isBusy={isBusy} />);

      const icon = L.divIcon({
        html,
        className: 'car-marker-wrap',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Show Driver name + Passenger if trip
      const passenger = orders.find(o => o.driverId === driver._id)?.customerName;
      const label = isBusy ? `🚕 ${driver.name} → 👤 ${passenger || '...'}` : `🚕 ${driver.name}`;

      if (markersRef.current[driver._id]) {
        const m = markersRef.current[driver._id];
        m.setLatLng([driver.lat, driver.lng]);
        m.setIcon(icon);
        m.setTooltipContent(label);
      } else {
        const m = L.marker([driver.lat, driver.lng], { icon })
          .addTo(map)
          .bindTooltip(label, { permanent: true, direction: 'top', className: 'driver-tooltip' });
        markersRef.current[driver._id] = m;
      }

    });

    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [drivers, filterIdle]);

  // Update order (person) markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    // RED PASSENGER MARKERS REMOVED PER USER REQUEST
    Object.keys(orderMarkersRef.current).forEach(id => {
      orderMarkersRef.current[id].remove();
      delete orderMarkersRef.current[id];
    });


  }, [orders]);

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
  );
};

export default MapView;
