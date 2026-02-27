import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function KasirLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem('user') || '{"id": 1, "name":"Kasir","role":"kasir"}');
  const [time, setTime]         = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // --- STATE UNTUK STATUS ABSENSI GLOBAL ---
  const [attendance, setAttendance] = useState(null);

  // Jam berjalan
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Tutup menu mobile saat ganti halaman
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  // Cek Status Absensi setiap kali ganti halaman (agar navbar selalu update)
  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:5000/api/hr/attendance/today/${user.id}`)
        .then(res => setAttendance(res.data))
        .catch(err => console.error("Gagal load status header", err));
    }
  }, [user.id, location.pathname]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

const navItems = [
    { path: '/kasir/pos',     label: 'Menu Utama',        icon: POSIcon     },
    { path: '/kasir/history', label: 'Riwayat Transaksi', icon: HistoryIcon },
    { path: '/kasir/absen',   label: 'Absen & Gaji',      icon: AbsenIcon   }, 
    { path: '/kasir/profile', label: 'Profil Saya',       icon: ProfileIcon },
  ];

  const formatTime = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

  // --- LOGIKA WARNA DOT STATUS ---
  let dotColor = '#95a5a6'; // Default: Abu-abu (Belum absen / Pulang)
  let pulseAnim = 'none';
  let statusText = 'Belum Absen';

  if (attendance && !attendance.clock_out) {
    if (attendance.status === 'late') {
      dotColor = '#e74c3c'; // Merah (Telat)
      pulseAnim = 'pulse-red 2s infinite';
      statusText = 'Aktif (Terlambat)';
    } else if (attendance.status === 'sick' || attendance.status === 'leave') {
      dotColor = '#f39c12'; // Kuning (Izin)
      statusText = attendance.status === 'sick' ? 'Sedang Sakit' : 'Sedang Izin';
    } else {
      dotColor = '#27ae60'; // Hijau (Tepat Waktu)
      pulseAnim = 'pulse-green 2s infinite';
      statusText = 'Aktif Bekerja';
    }
  } else if (attendance?.clock_out) {
    statusText = 'Shift Selesai';
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e;
          --latte:#e8d5b7; --foam:#faf6f0; --milk:#f5ede0;
          --accent:#c97b3a; --accent-h:#e8913f; --text-dim:#8b7355;
          --navbar-h: 64px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }

        .kasir-root {
          display: flex; flex-direction: column;
          height: 100dvh; overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          background: var(--foam);
        }

        /* ─── NAVBAR ─────────────────────────────────────── */
        .navbar {
          height: var(--navbar-h);
          background: var(--espresso);
          display: flex; align-items: center;
          padding: 0 20px; gap: 16px; flex-shrink: 0; z-index: 50;
          position: relative; box-shadow: 0 2px 16px rgba(0,0,0,0.25);
        }
        .navbar::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* ─── BRAND ──────────────────────────────────────── */
        .brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0; position: relative; z-index: 1;
        }
        .brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent), var(--crema));
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          font-size: 18px; box-shadow: 0 3px 8px rgba(201,123,58,0.35); flex-shrink: 0;
        }
        .brand-text h1 {
          font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700;
          color: var(--latte); letter-spacing: 0.04em; line-height: 1;
        }
        .brand-text span {
          font-size: 9px; color: var(--text-dim); letter-spacing: 0.18em; text-transform: uppercase;
        }

        .nav-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.1); flex-shrink: 0; position: relative; z-index: 1; }

        /* ─── DESKTOP NAV LINKS ──────────────────────────── */
        .desktop-nav { display: flex; align-items: center; gap: 4px; flex: 1; position: relative; z-index: 1; }
        @media (max-width: 720px) { .desktop-nav { display: none; } }

        .nav-link {
          display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 9px;
          text-decoration: none; font-size: 13.5px; font-weight: 600; color: rgba(200,169,126,0.6);
          transition: all 0.2s; position: relative;
        }
        .nav-link:hover { background: rgba(255,255,255,0.07); color: var(--latte); }
        .nav-link.active { background: rgba(201,123,58,0.2); color: var(--crema); border: 1px solid rgba(201,123,58,0.25); }
        .nav-link svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
        .nav-link.active::after {
          content: ''; position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%; background: var(--accent);
        }

        /* ─── RIGHT SECTION ──────────────────────────────── */
        .navbar-right { display: flex; align-items: center; gap: 12px; margin-left: auto; flex-shrink: 0; position: relative; z-index: 1; }
        .nav-clock { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
        .nav-clock .clock-time { font-size: 14px; font-weight: 700; color: var(--crema); letter-spacing: 0.08em; line-height: 1; }
        .nav-clock .clock-date { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
        @media (max-width: 900px) { .nav-clock { display: none; } }

        .user-pill {
          display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; padding: 5px 12px 5px 5px; cursor: help;
        }
        .user-av {
          width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--crema));
          display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: var(--espresso); flex-shrink: 0;
        }
        .user-pill-name { font-size: 12.5px; font-weight: 600; color: var(--latte); max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        @media (max-width: 620px) { .user-pill-name { display: none; } }

        /* Dynamic Online Dot */
        .online-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; transition: background 0.3s;
        }
        @keyframes pulse-green {
          0%,100%{ box-shadow:0 0 0 2px rgba(39,174,96,0.25); } 50%{ box-shadow:0 0 0 5px rgba(39,174,96,0.1); }
        }
        @keyframes pulse-red {
          0%,100%{ box-shadow:0 0 0 2px rgba(231,76,60,0.25); } 50%{ box-shadow:0 0 0 5px rgba(231,76,60,0.1); }
        }

        .logout-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9px;
          background: rgba(192,57,43,0.15); border: 1px solid rgba(192,57,43,0.25); color: #e74c3c; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; flex-shrink: 0;
        }
        .logout-btn:hover { background: rgba(192,57,43,0.28); }
        .logout-btn svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; }
        @media (max-width: 520px) { .logout-btn span { display: none; } .logout-btn { padding: 8px 10px; } }

        .hamburger { display: none; width: 36px; height: 36px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; align-items: center; justify-content: center; cursor: pointer; }
        .hamburger svg { width: 18px; height: 18px; stroke: var(--crema); fill: none; stroke-width: 2; stroke-linecap: round; }
        @media (max-width: 720px) { .hamburger { display: flex; } }

        /* Mobile Nav & Layout ... */
        .mobile-nav { display: none; position: absolute; top: var(--navbar-h); left: 0; right: 0; background: var(--espresso); border-top: 1px solid rgba(255,255,255,0.07); padding: 10px 14px 14px; z-index: 49; box-shadow: 0 8px 24px rgba(0,0,0,0.3); animation: slideDown 0.2s ease; }
        .mobile-nav.open { display: block; }
        @keyframes slideDown { from{ opacity:0; transform:translateY(-8px); } to{ opacity:1; transform:translateY(0); } }
        .mob-nav-link { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; color: rgba(200,169,126,0.6); transition: all 0.18s; margin-bottom: 4px; }
        .mob-nav-link:last-child { margin-bottom: 0; }
        .mob-nav-link:hover { background: rgba(255,255,255,0.06); color: var(--latte); }
        .mob-nav-link.active { background: rgba(201,123,58,0.18); color: var(--crema); border: 1px solid rgba(201,123,58,0.2); }
        .mob-nav-link svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; flex-shrink: 0; }
        .mob-overlay { display: none; position: fixed; inset: 0; top: var(--navbar-h); background: rgba(0,0,0,0.4); z-index: 48; }
        .mob-overlay.show { display: block; }
        .kasir-main { flex: 1; overflow: hidden; position: relative; }
        .page-wrapper { height: 100%; overflow: hidden; animation: fadeUp 0.22s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="kasir-root">

        {/* Navbar */}
        <header className="navbar">
          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">☕</div>
            <div className="brand-text">
              <h1>Kaffe POS</h1>
              <span>Kasir</span>
            </div>
          </div>

          <div className="nav-divider" />

          {/* Desktop nav */}
          <nav className="desktop-nav">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} className={`nav-link ${location.pathname === path ? 'active' : ''}`}>
                <Icon />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="navbar-right">
            {/* Clock */}
            <div className="nav-clock">
              <span className="clock-time">{formatTime(time)}</span>
              <span className="clock-date">{formatDate(time)}</span>
            </div>

            {/* User pill - Berubah warna sesuai status absensi */}
            <div className="user-pill" title={`Status: ${statusText}`}>
              <div className="user-av">{(user?.name || 'K')[0].toUpperCase()}</div>
              <span className="user-pill-name">{user?.name}</span>
              <span 
                className="online-dot" 
                style={{ background: dotColor, animation: pulseAnim }} 
              />
            </div>

            {/* Logout */}
            <button className="logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Keluar</span>
            </button>

            {/* Hamburger (mobile) */}
            <button className="hamburger" onClick={() => setMobileMenuOpen(p => !p)} aria-label="Menu">
              {mobileMenuOpen
                ? <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
              }
            </button>
          </div>
        </header>

        {/* Mobile nav dropdown */}
        <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} className={`mob-nav-link ${location.pathname === path ? 'active' : ''}`}>
              <Icon /> {label}
            </Link>
          ))}
        </div>
        <div className={`mob-overlay ${mobileMenuOpen ? 'show' : ''}`} onClick={() => setMobileMenuOpen(false)} />

        {/* Main */}
        <main className="kasir-main">
          <div className="page-wrapper" key={location.pathname}>
            <Outlet />
          </div>
        </main>

      </div>
    </>
  );
}

/* ── SVG ICONS ──────────────────────────────────────────── */
const POSIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const AbsenIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);