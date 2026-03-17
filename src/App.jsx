import React, { useState, useEffect } from 'react';
import { LayoutGrid, Car, FileText, Users, BarChart3, Settings, LogOut, Wifi, WifiOff } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FleetPage from './components/pages/FleetPage';
import DriversPage from './components/pages/DriversPage';
import FinancePage from './components/pages/FinancePage';
import StatsPage from './components/pages/StatsPage';
import SettingsPage from './components/pages/SettingsPage';
import './index.css';

const NAV = [
  { id: 'dashboard', Icon: LayoutGrid, label: 'Башкаруу' },
  { id: 'fleet',     Icon: Car,        label: 'Флот' },
  { id: 'drivers',   Icon: Users,      label: 'Айдоочулар' },
  { id: 'finance',   Icon: FileText,   label: 'Финансы' },
  { id: 'stats',     Icon: BarChart3,  label: 'Статистика' },
  { id: 'settings',  Icon: Settings,   label: 'Орнотуулар' },
];




const translations = {
  kg: {
    dashboard: 'Башкаруу', fleet: 'Флот', drivers: 'Айдоочулар', finance: 'Финансы',
    car: 'Машина', free: 'Бош', busy: 'Заказда', earnings: 'Киреше', logout: 'Чыгуу',
    live: 'Live', connecting: 'Туташууда...', all: 'Бардыгы', only_free: 'Бош гана',
    active_fleet: 'Активдүү флот', new_orders: 'Жаңы заказдар', 
    no_orders: 'Жаңы заказ жок — күтүп жатат...', no_free_cars: 'Бош машина жок!',
    accept: 'Принять', som: 'сом', economy: 'Эконом', comfort: 'Комфорт', business: 'Бизнес',
    settings: 'Орнотуулар', stats: 'Статистика', income_today: 'Бүгүнкү киреше',
    total_orders: 'Жалпы заказдар', active_orders: 'Активдүү', 
    about_system: 'Система жөнүндө', version: 'Версия', tech_stack: 'Технологиялар',
    lang_select: 'Тилди тандаңыз', tariff_split: 'Тарифтер боюнча бөлүштүрүү'
  },
  ru: {
    dashboard: 'Управление', fleet: 'Флот', drivers: 'Водители', finance: 'Финансы',
    car: 'Машин', free: 'Свободно', busy: 'В заказе', earnings: 'Доход', logout: 'Выйти',
    live: 'Live', connecting: 'Подключение...', all: 'Все', only_free: 'Свободные',
    active_fleet: 'Активный флот', new_orders: 'Новые заказы',
    no_orders: 'Заказов нет — ожидание...', no_free_cars: 'Нет свободных машин!',
    accept: 'Принять', som: 'сом', economy: 'Эконом', comfort: 'Комфорт', business: 'Бизнес',
    settings: 'Настройки', stats: 'Статистика', income_today: 'Доход сегодня',
    total_orders: 'Всего заказов', active_orders: 'Активные',
    about_system: 'О системе', version: 'Версия', tech_stack: 'Технологии',
    lang_select: 'Выберите язык', tariff_split: 'Разбивка по тарифам'
  },
  en: {
    dashboard: 'Dashboard', fleet: 'Fleet', drivers: 'Drivers', finance: 'Finance',
    car: 'Cars', free: 'Free', busy: 'Busy', earnings: 'Earnings', logout: 'Logout',
    live: 'Live', connecting: 'Connecting...', all: 'All', only_free: 'Free Only',
    active_fleet: 'Active Fleet', new_orders: 'New Orders',
    no_orders: 'No orders yet — waiting...', no_free_cars: 'No free cars!',
    accept: 'Accept', som: 'som', economy: 'Economy', comfort: 'Comfort', business: 'Business',
    settings: 'Settings', stats: 'Statistics', income_today: 'Income Today',
    total_orders: 'Total Orders', active_orders: 'Active',
    about_system: 'About System', version: 'Version', tech_stack: 'Technologies',
    lang_select: 'Select Language', tariff_split: 'Tariff Breakdown'
  },
  tr: {
    dashboard: 'Panel', fleet: 'Filo', drivers: 'Sürücüler', finance: 'Finans',
    car: 'Araç', free: 'Boş', busy: 'Yolda', earnings: 'Kazanç', logout: 'Çıkış',
    live: 'Canlı', connecting: 'Bağlanıyor...', all: 'Tümü', only_free: 'Boşlar',
    active_fleet: 'Aktif Filo', new_orders: 'Yeni İşler',
    no_orders: 'Yeni iş yok — bekleniyor...', no_free_cars: 'Boş araç yok!',
    accept: 'Kabul Et', som: 'som', economy: 'Ekonomik', comfort: 'Konfor', business: 'Business',
    settings: 'Ayarlar', stats: 'İstatistikler', income_today: 'Bugünkü Kazanç',
    total_orders: 'Toplam Sipariş', active_orders: 'Aktif',
    about_system: 'Sistem Hakkında', version: 'Versiyon', tech_stack: 'Teknolojiler',
    lang_select: 'Dil Seçin', tariff_split: 'Tarife Dağılımı'
  },
  uz: {
    dashboard: 'Boshqaruv', fleet: 'Flot', drivers: 'Haydovchilar', finance: 'Moliya',
    car: 'Mashina', free: 'Bo\'sh', busy: 'Band', earnings: 'Daromad', logout: 'Chiqish',
    live: 'Jonli', connecting: 'Ulanmoqda...', all: 'Hammasi', only_free: 'Bo\'shlar',
    active_fleet: 'Faol flot', new_orders: 'Yangi buyurtmalar',
    no_orders: 'Yangi buyurtma yo\'q...', no_free_cars: 'Bo\'sh mashina yo\'q!',
    accept: 'Qabul', som: 'som', economy: 'Ekonom', comfort: 'Komfort', business: 'Biznes',
    settings: 'Sozlamalar', stats: 'Statistika', income_today: 'Bugungi foyda',
    total_orders: 'Jami buyurtmalar', active_orders: 'Faol',
    about_system: 'Tizim haqida', version: 'Versiya', tech_stack: 'Texnologiyalar',
    lang_select: 'Tilni tanlang', tariff_split: 'Tariflar bo\'yicha taqsimot'
  }
};


const LANGS = ['EN','RU','KG','TR','UZ'];



/* ─── MOBILE BOTTOM NAV ──────────────────── */
const BottomNav = ({ page, setPage, t }) => (
  <nav className="bottom-nav">
    {NAV.map(({ id, Icon, label }) => (
      <div key={id} className={`bottom-nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>
        <Icon size={18} strokeWidth={1.8} />
        <span>{t[id] || label}</span>
      </div>
    ))}

  </nav>
);


/* ─── TOPBAR (inner, has access to contexts) ─ */
const Topbar = ({ lang, setLang, t, page, setPage }) => {

  const { user, logout } = useAuth();
  const { drivers, stats, connected, isDemo } = useSocket();



  const idleCount = drivers.filter(d => d.status === 'idle').length;
  const busyCount = drivers.filter(d => d.status === 'on_trip').length;

  return (
    <header className="topbar">
      <div className="topbar-brand">OSH <em>TAXI</em> PARK</div>
      <div className="topbar-div" />
      
      {/* Integrated Navigation in Topbar (Desktop only) */}
      <nav className="topbar-nav">
        {NAV.map(({ id, Icon, label }) => (
          <button 
            key={id} 
            className={`top-nav-btn ${page === id ? 'active' : ''}`} 
            onClick={() => setPage(id)}
          >
            <Icon size={14} />
            <span>{t[id] || label}</span>
          </button>
        ))}
      </nav>



      <div className="topbar-div" />

      <div className="kpi-strip">
        <div className="kpi">
          <span className="label">{t.car}</span>
          <span className="val b">{drivers.length}</span>
        </div>
        <div className="kpi">
          <span className="label">{t.free}</span>
          <span className="val g">{idleCount}</span>
        </div>
        <div className="kpi">
          <span className="label">{t.busy}</span>
          <span className="val y">{busyCount}</span>
        </div>
        <div className="topbar-div" />
        <div className="kpi">
          <span className="label">💰 {t.earnings}</span>
          <span className="val g" style={{ fontSize: '1.2rem', color: '#34C759' }}>{stats.totalEarnings.toLocaleString()} {t.som}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div
          className={`conn-dot ${(connected || isDemo) ? 'heartbeat' : ''}`}
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: isDemo ? '#ff9500' : (connected ? '#34C759' : '#aeaeb2'),
            boxShadow: connected || isDemo ? `0 0 0 3px ${isDemo ? 'rgba(255,149,0,0.2)' : 'rgba(52,199,89,0.2)'}` : 'none',
            transition: 'background 0.3s',
          }}
          title={isDemo ? 'Demo Mode' : (connected ? 'Online' : 'Offline')}
        />

        {isDemo && <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#ff9500' }}>DEMO</span>}

        <div className="lang-bar">
          {LANGS.map(l => (
            <button key={l} className={lang === l.toLowerCase() ? 'on' : ''} onClick={() => setLang(l.toLowerCase())}>
              {l}
            </button>
          ))}
        </div>
        <div className="avatar">{user?.name?.[0] || 'A'}</div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={12} style={{ marginRight: 4 }} />{t.logout}
        </button>
      </div>
    </header>
  );
};


/* ─── MAIN APP SHELL (authenticated) ─────── */
const AppShell = () => {
  const [page, setPage] = useState(() => localStorage.getItem('taxi_active_page') || 'dashboard');
  const [lang, setLang] = useState(() => localStorage.getItem('taxi_lang') || 'ru');
  const { drivers, stats } = useSocket();

  useEffect(() => {
    localStorage.setItem('taxi_active_page', page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem('taxi_lang', lang);
  }, [lang]);

  const t = translations[lang] || translations.ru;


  const renderPage = () => {
    switch (page) {
      case 'fleet':    return <FleetPage fleet={drivers} t={t} />;
      case 'drivers':  return <DriversPage fleet={drivers} t={t} />;
      case 'finance':  return <FinancePage stats={stats} fleet={drivers} t={t} />;
      case 'stats':    return <StatsPage stats={stats} fleet={drivers} t={t} />;
      case 'settings': return <SettingsPage lang={lang} setLang={setLang} t={t} />;
      default:         return <DashboardPage t={t} />;
    }


  };

  return (
    <div className="layout">
      {/* Topbar only (integrated nav) */}
      <Topbar lang={lang} setLang={setLang} t={t} page={page} setPage={setPage} />

      {/* Page content */}
      <div className="content">
        {renderPage()}
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav page={page} setPage={setPage} t={t} />
    </div>
  );
};


/* ─── ROOT ───────────────────────────────── */
const AuthGate = () => {
  const { user } = useAuth();
  return user ? <AppShell /> : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AuthGate />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
