import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin","role":"admin"}');
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!isDesktop && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [sidebarOpen, isDesktop]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // ─── MENU TERURUT & TERGRUP ───────────────────────────
  const menuGroups = [
    {
      label: 'Operasional',
      items: [
        { path: '/admin/dashboard',    label: 'Dashboard',         icon: DashboardIcon },
        { path: '/admin/categories',   label: 'Kategori Menu',     icon: CategoryIcon },
        { path: '/admin/products',     label: 'Data Produk',       icon: ProductIcon },
        { path: '/admin/stock',        label: 'Manajemen Stok',    icon: StockIcon },
      ]
    },
    {
      label: 'Transaksi & Laporan',
      items: [
        { path: '/admin/transactions', label: 'Riwayat Transaksi', icon: TransactionIcon },
        { path: '/admin/reports',      label: 'Laporan Penjualan', icon: ReportIcon },
      ]
    },
    {
      label: 'SDM & Penggajian',
      items: [
        { path: '/admin/employees',          label: 'Manajemen SDM',     icon: EmployeeIcon },
        { path: '/admin/shifts',             label: 'Manajemen Shift',   icon: ShiftIcon },
        { path: '/admin/attendance-history', label: 'Riwayat Kehadiran', icon: AttendanceIcon },
        { path: '/admin/payrolls',           label: 'Manajemen Gaji',    icon: PayrollsIcon },
      ]
    },
    {
      label: 'Sistem',
      items: [
        { path: '/admin/users',   label: 'Manajemen User', icon: UserIcon },
        { path: '/admin/profile', label: 'Profil Admin',   icon: AdminProfileIcon },
      ]
    },
  ];

  const formatTime = (d) =>
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) =>
    d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  const showOverlay = !isDesktop && sidebarOpen;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --espresso:  #1a0f0a;
          --roast:     #2d1a10;
          --crema:     #c8a97e;
          --latte:     #e8d5b7;
          --foam:      #faf6f0;
          --milk:      #f5ede0;
          --accent:    #c97b3a;
          --text-dim:  #8b7355;
          --danger-bg: rgba(192,57,43,0.12);
          --sidebar-w: 260px;
          --topbar-h:  60px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }

        .layout-root {
          display: flex;
          height: 100dvh;
          background: var(--foam);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(10,5,2,0.55);
          backdrop-filter: blur(2px);
          z-index: 30;
          animation: fadeOverlay 0.22s ease;
        }
        .sidebar-overlay.show { display: block; }
        @keyframes fadeOverlay { from { opacity:0; } to { opacity:1; } }

        .sidebar {
          width: var(--sidebar-w);
          min-width: var(--sidebar-w);
          background: var(--espresso);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 40;
          flex-shrink: 0;
          position: relative;
        }

        @media (max-width: 1023px) {
          .sidebar {
            position: fixed;
            top: 0; left: 0;
            height: 100dvh;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
            box-shadow: 4px 0 32px rgba(0,0,0,0.4);
          }
          .sidebar.open { transform: translateX(0); }
        }

        .sidebar::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .sidebar::after {
          content: '';
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(201,123,58,0.16) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand {
          padding: 22px 18px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: relative; z-index: 1;
        }
        .brand-logo { display: flex; align-items: center; gap: 11px; margin-bottom: 14px; }
        .brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--accent), var(--crema));
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(201,123,58,0.35);
          flex-shrink: 0;
        }
        .brand-text h1 {
          font-family: 'Playfair Display', serif;
          font-size: 19px; font-weight: 700;
          color: var(--latte); letter-spacing: 0.04em; line-height: 1;
        }
        .brand-text span {
          font-size: 9px; font-weight: 500;
          color: var(--text-dim); letter-spacing: 0.2em; text-transform: uppercase;
        }
        .brand-clock {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 8px 12px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .clock-time { font-size: 15px; font-weight: 600; color: var(--crema); letter-spacing: 0.08em; }
        .clock-date { font-size: 9.5px; color: var(--text-dim); text-align: right; line-height: 1.5; }

        .sidebar-close {
          display: none;
          position: absolute; top: 16px; right: 14px;
          width: 30px; height: 30px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: var(--text-dim); cursor: pointer;
          align-items: center; justify-content: center;
          font-size: 14px; z-index: 2; transition: all 0.2s;
        }
        .sidebar-close:hover { background: rgba(255,255,255,0.15); color: var(--latte); }
        @media (max-width: 1023px) { .sidebar-close { display: flex; } }

        /* ─── NAV WITH GROUPS ───────────────────────── */
        .nav-section {
          flex: 1; overflow-y: auto;
          padding: 12px 12px;
          position: relative; z-index: 1;
        }
        .nav-section::-webkit-scrollbar { width: 3px; }
        .nav-section::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .nav-group { margin-bottom: 6px; }
        .nav-group:last-child { margin-bottom: 0; }

        .nav-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--text-dim); padding: 0 10px;
          margin-bottom: 5px; margin-top: 10px;
          display: block;
        }
        .nav-group:first-child .nav-label { margin-top: 0; }

        .nav-separator {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 8px 10px;
        }

        .nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 9px 13px; border-radius: 10px;
          text-decoration: none; font-size: 13px; font-weight: 500;
          color: rgba(200,169,126,0.6);
          transition: all 0.2s; position: relative;
          margin-bottom: 2px; border: 1px solid transparent;
        }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: var(--latte); }
        .nav-item.active {
          background: linear-gradient(135deg, rgba(201,123,58,0.22), rgba(201,123,58,0.08));
          color: var(--crema); border-color: rgba(201,123,58,0.2);
        }
        .nav-item.active::before {
          content: '';
          position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 60%;
          background: var(--accent); border-radius: 0 3px 3px 0;
        }
        .nav-icon {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; background: rgba(255,255,255,0.05);
          flex-shrink: 0; transition: background 0.2s;
        }
        .nav-item.active .nav-icon { background: rgba(201,123,58,0.25); }
        .nav-icon svg {
          width: 14px; height: 14px;
          stroke: currentColor; fill: none;
          stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
        }

        .sidebar-footer {
          padding: 14px 12px;
          border-top: 1px solid rgba(255,255,255,0.07);
          position: relative; z-index: 1;
        }
        .user-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 11px;
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 10px;
        }
        .avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--crema));
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          color: var(--espresso); flex-shrink: 0;
        }
        .user-info p:first-child {
          font-size: 12.5px; font-weight: 600; color: var(--latte);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;
        }
        .user-info p:last-child { font-size: 10.5px; color: var(--text-dim); text-transform: capitalize; }
        .online-dot {
          width: 7px; height: 7px; background: #27ae60;
          border-radius: 50%; margin-left: auto; flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(39,174,96,0.25);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 2px rgba(39,174,96,0.25); }
          50% { box-shadow: 0 0 0 4px rgba(39,174,96,0.1); }
        }
        .logout-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 9px; border-radius: 10px;
          background: var(--danger-bg); border: 1px solid rgba(192,57,43,0.2);
          color: #e74c3c; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .logout-btn:hover { background: rgba(192,57,43,0.22); border-color: rgba(192,57,43,0.35); }
        .logout-btn svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; }

        .right-side { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

        .topbar {
          display: none;
          height: var(--topbar-h);
          background: #fff;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          padding: 0 16px;
          align-items: center; gap: 12px;
          flex-shrink: 0;
          box-shadow: 0 1px 8px rgba(0,0,0,0.05);
          z-index: 10;
        }
        @media (max-width: 1023px) { .topbar { display: flex; } }

        .hamburger {
          width: 38px; height: 38px;
          background: var(--foam); border: 1px solid rgba(0,0,0,0.09);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all 0.2s;
        }
        .hamburger:hover { background: var(--milk); }
        .hamburger svg { width: 18px; height: 18px; stroke: var(--roast); fill: none; stroke-width: 2; stroke-linecap: round; }
        .topbar-brand { display: flex; align-items: center; gap: 9px; flex: 1; }
        .topbar-icon {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, var(--accent), var(--crema));
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          font-size: 15px; box-shadow: 0 2px 8px rgba(201,123,58,0.3);
        }
        .topbar-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: var(--roast); }
        .topbar-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--crema));
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: var(--espresso); flex-shrink: 0;
        }

        .main-content {
          flex: 1; overflow-y: auto; background: var(--foam);
          -webkit-overflow-scrolling: touch;
        }
        .main-content::-webkit-scrollbar { width: 5px; }
        .main-content::-webkit-scrollbar-track { background: var(--milk); }
        .main-content::-webkit-scrollbar-thumb { background: var(--crema); border-radius: 3px; }

        .page-wrapper { animation: fadeUp 0.25s ease forwards; min-height: 100%; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="layout-root">

        <div className={`sidebar-overlay ${showOverlay ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* ── SIDEBAR ── */}
        <aside ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

          <div className="brand">
            <div className="brand-logo">
              <div className="brand-icon">☕</div>
              <div className="brand-text">
                <h1>Kaffe POS</h1>
                <span>Admin Panel</span>
              </div>
            </div>
            <div className="brand-clock">
              <span className="clock-time">{formatTime(time)}</span>
              <span className="clock-date">{formatDate(time)}</span>
            </div>
          </div>

          <nav className="nav-section">
            {menuGroups.map((group, gi) => (
              <div key={gi} className="nav-group">
                {gi > 0 && <div className="nav-separator" />}
                <span className="nav-label">{group.label}</span>
                {group.items.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path;
                  return (
                    <Link key={path} to={path} className={`nav-item ${isActive ? 'active' : ''}`}>
                      <span className="nav-icon"><Icon /></span>
                      {label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="user-card">
              <div className="avatar">{(user?.name || 'A')[0].toUpperCase()}</div>
              <div className="user-info">
                <p>{user?.name || 'Admin'}</p>
                <p>{user?.role || 'admin'}</p>
              </div>
              <span className="online-dot" />
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogoutIcon /> Keluar
            </button>
          </div>
        </aside>

        {/* ── RIGHT SIDE ── */}
        <div className="right-side">
          <header className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
              <svg viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="topbar-brand">
              <div className="topbar-icon">☕</div>
              <span className="topbar-name">Kaffe POS</span>
            </div>
            <div className="topbar-avatar">{(user?.name || 'A')[0].toUpperCase()}</div>
          </header>

          <main className="main-content">
            <div className="page-wrapper" key={location.pathname}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════
   SVG ICONS — masing-masing unik & tepat
══════════════════════════════════════ */

// Operasional
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const CategoryIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h10M4 18h7"/>
  </svg>
);
const ProductIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <path d="M3 6h18"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const StockIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

// Transaksi & Laporan
const TransactionIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const ReportIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
);

// SDM & Penggajian
const EmployeeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const ShiftIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const AttendanceIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
    <polyline points="9 16 11 18 15 14"/>
  </svg>
);
const PayrollsIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
    <circle cx="12" cy="15" r="2"/>
  </svg>
);

// Sistem
const UserIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const AdminProfileIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);