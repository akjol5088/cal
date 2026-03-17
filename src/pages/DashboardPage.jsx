import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Wifi, WifiOff, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

// Sub-components
const OrderCard = ({ order, onAccept, onReject, t }) => (
  <motion.div
    layout
    initial={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -20, opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
    transition={{ duration: 0.2 }}
    className="order-card"
  >
    <div className="order-head">
      <div className="customer-info">
        <div className="c-name">{order.customerName}</div>
        <div className="c-phone">{order.phone}</div>
      </div>
      <div className="order-price">{order.price} {t.som}</div>
    </div>

    <div className={`tariff-pill ${order.tariff}`}>{
      order.tariff === 'economy' ? `🟢 ${t.economy}` :
      order.tariff === 'comfort' ? `🟡 ${t.comfort}` : `🔵 ${t.business}`
    }</div>

    <div className="order-route">
      <div className="route-row from">
        <span className="dot" />
        <span>{order.fromAddress}</span>
      </div>
      <div className="route-row to">
        <span className="dot" />
        <span>{order.toAddress}</span>
      </div>
    </div>

    <div className="order-meta">
      📏 {order.distance} км • ⏱ ~{Math.round(order.distance * 2.5)} мин
    </div>

    <div className="order-btns">
      <button className="btn-accept" onClick={() => onAccept(order._id)}>
        <CheckCircle size={14} strokeWidth={2.5} />
        {t.accept}
      </button>
      <button className="btn-reject" onClick={() => onReject(order._id)}>
        <XCircle size={14} strokeWidth={2.5} />
      </button>
    </div>
  </motion.div>
);


const DashboardPage = ({ t }) => {
  const { drivers, orders, stats, connected, isDemo, acceptOrder, cancelOrder } = useSocket();

  const { user, logout } = useAuth();
  const [filterIdle, setFilterIdle] = useState(false);

  const handleAccept = (id) => {
    const order = orders.find(o => o._id === id || o.id === id);
    if (!order) return;

    const idleDrivers = drivers.filter(d => d.status === 'idle');
    if (idleDrivers.length === 0) {
      alert(t.no_free_cars);
      return;
    }
    
    let nearest = idleDrivers[0];
    let minDist = Infinity;

    idleDrivers.forEach(d => {
      const dLat = d.lat || d.pos?.[0];
      const dLng = d.lng || d.pos?.[1];
      const oLat = order.fromLat || order.pickup?.[0];
      const oLng = order.fromLng || order.pickup?.[1];

      if (dLat && oLat) {
        const dist = Math.sqrt((dLat - oLat) ** 2 + (dLng - oLng) ** 2);
        if (dist < minDist) {
          minDist = dist;
          nearest = d;
        }
      }
    });

    acceptOrder(id, nearest._id || nearest.id);
  };



  const idleCount   = drivers.filter(d => d.status === 'idle').length;
  const busyCount   = drivers.filter(d => d.status === 'on_trip').length;
  const totalEarned = stats.totalEarnings;


  const pendingOrders = orders.filter(o => o.status === 'pending');
  
  return (
    <div className="dash-layout">
      {/* TOP METRICS (Desktop/Mobile) */}
      <div className="dash-metrics-row">
        <div className="metric-mini-card">
          <div className="label">{t.income_today}</div>
          <div className="val">{stats.totalEarnings?.toLocaleString()} <small>{t.som}</small></div>
        </div>
        <div className="metric-mini-card">
          <div className="label">{t.total_orders}</div>
          <div className="val">{stats.tripsCompleted}</div>
        </div>
        <div className="metric-mini-card">
          <div className="label">{t.active_fleet}</div>
          <div className="val">{drivers.length}</div>
        </div>
      </div>

      <div className="dash-main-area">

      <div className="map-wrapper">
        <MapView drivers={drivers} orders={orders} filterIdle={filterIdle} />


        {/* Overlay top bar */}
        <div className="map-top">
          <div className={`map-chip ${connected || isDemo ? 'live' : 'conn'}`}>
            <span className={connected || isDemo ? 'heartbeat' : ''}>
              {isDemo ? <Wifi size={12} color="#ff9500" /> : (connected ? <Wifi size={12} color="#34C759" /> : <WifiOff size={12} color="#aeaeb2" />)}
            </span>
            {isDemo ? ' DEMO' : (connected ? ` ${t.live} · ${drivers.length} ${t.car}` : ` ${t.connecting}`)}
          </div>


          <div className="map-chip">
            <span style={{ color: '#34C759', fontWeight: 800 }}>●</span>
            {t.free}: {idleCount}
            <span style={{ margin: '0 4px', color: '#aeaeb2' }}>·</span>
            <span style={{ color: '#FF9500', fontWeight: 800 }}>●</span>
            {t.busy}: {busyCount}
          </div>
          <button
            className={`map-chip filter-toggle ${filterIdle ? 'on' : ''}`}
            onClick={() => setFilterIdle(f => !f)}
          >
            <Filter size={11} />
            {filterIdle ? t.only_free : t.all}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        {/* Fleet strip */}
        <div className="panel-section">
          <div className="panel-title">{t.active_fleet}</div>
          <div className="fleet-scroll">
            {drivers.map(d => (
              <div key={d._id || d.id} className="fleet-chip">
                <div className="fc-num">{d.plate}</div>
                <div className="fc-car">{d.car}</div>
                <div className={`fc-st ${d.status}`}>
                  {d.status === 'idle' ? `● ${t.free}` : d.status === 'on_trip' ? `● ${t.busy}` : '○ Offline'}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Orders */}
        <div className="orders-scroll">
          <div className="panel-title">
            {t.new_orders}
            {orders.length > 0 && (
              <span style={{ marginLeft: 6, background: '#FFD60A', color: '#000', borderRadius: 6, padding: '1px 7px', fontSize: '0.6rem', fontWeight: 900 }}>
                {orders.length}
              </span>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {pendingOrders.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                <Clock size={40} strokeWidth={1} color="var(--text-3)" />
                <p>{t.no_orders}</p>
              </motion.div>
            ) : (
              pendingOrders.map(order => (
                <OrderCard
                  key={order._id || order.id}
                  order={order}
                  onAccept={() => handleAccept(order._id || order.id)}
                  onReject={() => cancelOrder(order._id || order.id)}
                  t={t}
                />
              ))
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  </div>


  );
};



export default DashboardPage;
