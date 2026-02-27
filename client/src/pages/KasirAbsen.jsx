import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const formatRp = (v) => 'Rp ' + Math.round(Number(v)).toLocaleString('id-ID');
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0j 0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}j ${m}m`;
};
const formatLateDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `Telat ${h}j ${m}m` : `Telat ${m}m`;
};

const Skeleton = ({ w = '100%', h = 14, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

/* ─── SVG ICONS ─────────────────────────── */
const IconClock  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCalendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconList   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconSlip   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconWallet = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4z"/></svg>;
const IconPause  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IconPlay   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IconAlert  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const TOTAL_TARGET_SECONDS = 26 * 8 * 3600;

export default function KasirAbsen() {
  const user = JSON.parse(localStorage.getItem('user') || '{"id":1,"name":"Kasir","role":"kasir"}');
  const [stats, setStats]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Live salary ticks locally between server refreshes
  const [localWorked, setLocalWorked] = useState(0);
  const tickRef = useRef(null);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/hr/my-stats/${user.id}`);
      setStats(res.data);
      setLocalWorked(Number(res.data?.attendance?.total_worked_seconds || 0));
    } catch (e) {
      console.error('Gagal mengambil data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchStats();
    const fetchInterval = setInterval(fetchStats, 5000);
    return () => clearInterval(fetchInterval);
  }, [user.id]);

  // Determine if salary is actively ticking
  const isLive = stats?.attendance_history?.some(
    l => l.clock_in && !l.clock_out && (l.status === 'ontime' || l.status === 'late')
  );

  // Local tick every second only when live
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (isLive) {
      tickRef.current = setInterval(() => {
        setLocalWorked(p => p + 1);
      }, 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [isLive, stats]);

  const baseSalary  = Number(stats?.shift?.base_salary || 0);
  const liveSalary  = Math.round(localWorked * (baseSalary / TOTAL_TARGET_SECONDS));
  const progressPct = Math.min((localWorked / TOTAL_TARGET_SECONDS) * 100, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root{
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e;
          --latte:#e8d5b7; --foam:#faf6f0; --milk:#f5ede0;
          --accent:#c97b3a; --text-dim:#8b7355;
        }
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        /* live animations */
        @keyframes pulse-ring{
          0%{box-shadow:0 0 0 0 rgba(39,174,96,0.5)}
          70%{box-shadow:0 0 0 10px rgba(39,174,96,0)}
          100%{box-shadow:0 0 0 0 rgba(39,174,96,0)}
        }
        @keyframes breathe{
          0%,100%{opacity:1} 50%{opacity:0.35}
        }
        @keyframes tick-up{
          0%{transform:translateY(4px);opacity:0}
          20%{transform:translateY(0);opacity:1}
          80%{transform:translateY(0);opacity:1}
          100%{transform:translateY(-4px);opacity:0}
        }
        @keyframes scan-line{
          0%{transform:translateY(-100%)}
          100%{transform:translateY(100%)}
        }
        @keyframes bar-grow{
          from{width:0}
          to{width:var(--bar-w)}
        }

        .absen-root{
          min-height:100%; background:var(--foam); padding:26px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
          overflow-y:auto;
        }
        @media(max-width:640px){.absen-root{padding:14px}}

        /* header */
        .page-header{margin-bottom:22px;}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-dim);margin-bottom:10px;}
        .breadcrumb span{color:var(--accent);font-weight:600;}
        .breadcrumb svg{width:12px;height:12px;}
        .page-header h1{font-family:'Playfair Display',serif;font-size:25px;font-weight:700;color:var(--espresso);}
        .page-header p{font-size:13px;color:var(--text-dim);margin-top:4px;}

        /* ── SALARY HERO ────────────────────────── */
        .salary-hero{
          border-radius:20px;padding:28px;margin-bottom:20px;
          position:relative;overflow:hidden;
          transition:all 0.5s ease;
        }
        .salary-hero.live{
          background:linear-gradient(135deg,#0f4c2a 0%,#1a7a4a 60%,#22a15f 100%);
          box-shadow:0 12px 40px rgba(26,122,74,0.3);
        }
        .salary-hero.paused{
          background:linear-gradient(135deg,var(--espresso) 0%,var(--roast) 100%);
          box-shadow:0 8px 28px rgba(26,15,10,0.25);
        }

        /* scan line effect when live */
        .salary-hero.live::after{
          content:'';
          position:absolute;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
          animation:scan-line 3s linear infinite;
          pointer-events:none;
        }
        /* noise texture */
        .salary-hero::before{
          content:'';position:absolute;inset:0;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events:none;
        }

        .hero-inner{position:relative;z-index:1;}
        .hero-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;}

        .hero-label{
          font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;
        }
        .salary-hero.live .hero-label{color:rgba(255,255,255,0.6);}
        .salary-hero.paused .hero-label{color:var(--text-dim);}

        /* live / paused badge */
        .status-badge{
          display:inline-flex;align-items:center;gap:7px;
          padding:6px 13px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.06em;
          text-transform:uppercase;
        }
        .badge-live{
          background:rgba(255,255,255,0.15);
          border:1px solid rgba(255,255,255,0.25);
          color:#fff;
          animation:pulse-ring 2s infinite;
        }
        .badge-live-dot{
          width:7px;height:7px;border-radius:50%;background:#6ee7b7;
          animation:breathe 1.2s infinite;
        }
        .badge-paused{
          background:rgba(255,255,255,0.07);
          border:1px solid rgba(255,255,255,0.1);
          color:var(--text-dim);
        }
        .badge-icon{width:13px;height:13px;flex-shrink:0;}
        .badge-icon svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

        /* salary value */
        .salary-value{
          font-family:'Playfair Display',serif;
          font-size:clamp(28px,5vw,44px);font-weight:700;line-height:1;
          margin-bottom:8px;letter-spacing:-0.01em;
        }
        .salary-hero.live .salary-value{color:#fff;}
        .salary-hero.paused .salary-value{color:var(--crema);}

        /* ticker flash */
        .ticker-wrap{
          display:inline-flex;align-items:baseline;gap:2px;
          overflow:hidden;
        }
        .ticker-flash{
          animation:tick-up 0.4s ease;
        }

        /* hero sub */
        .hero-sub{
          font-size:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;
        }
        .salary-hero.live .hero-sub{color:rgba(255,255,255,0.6);}
        .salary-hero.paused .hero-sub{color:var(--text-dim);}

        .hero-dur{
          font-weight:700;padding:3px 9px;border-radius:6px;font-size:12px;
        }
        .salary-hero.live .hero-dur{background:rgba(0,0,0,0.2);color:#a7f3d0;}
        .salary-hero.paused .hero-dur{background:rgba(255,255,255,0.08);color:var(--crema);}

        .hero-pause-msg{
          margin-top:10px;font-size:12px;
          display:flex;align-items:center;gap:6px;
        }
        .hero-pause-msg svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}
        .salary-hero.paused .hero-pause-msg{color:rgba(200,169,126,0.6);}

        /* progress bar */
        .progress-wrap{
          margin-top:18px;
        }
        .progress-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;}
        .progress-label{font-size:10.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;}
        .salary-hero.live .progress-label{color:rgba(255,255,255,0.5);}
        .salary-hero.paused .progress-label{color:var(--text-dim);}
        .progress-pct{font-size:12px;font-weight:800;}
        .salary-hero.live .progress-pct{color:rgba(255,255,255,0.8);}
        .salary-hero.paused .progress-pct{color:var(--crema);}
        .progress-track{
          height:8px;border-radius:99px;overflow:hidden;
        }
        .salary-hero.live .progress-track{background:rgba(0,0,0,0.2);}
        .salary-hero.paused .progress-track{background:rgba(255,255,255,0.08);}
        .progress-bar{
          height:100%;border-radius:99px;transition:width 1s linear;
        }
        .salary-hero.live .progress-bar{background:linear-gradient(90deg,#34d399,#6ee7b7);}
        .salary-hero.paused .progress-bar{background:linear-gradient(90deg,var(--accent),var(--crema));}

        /* ── INFO GRID ──────────────────────────── */
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
        @media(max-width:640px){.info-grid{grid-template-columns:1fr;}}

        .card{
          background:#fff;border-radius:16px;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.05);
          padding:20px;
        }
        .card-head{
          display:flex;align-items:center;gap:8px;
          margin-bottom:16px;
          font-size:14px;font-weight:700;color:var(--espresso);
        }
        .card-head-icon{
          width:32px;height:32px;border-radius:9px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
        }
        .card-head-icon svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

        /* shift info */
        .shift-box{
          background:var(--milk);border:1px solid var(--latte);
          border-radius:12px;padding:14px 16px;
        }
        .shift-name{
          font-family:'Playfair Display',serif;
          font-size:17px;font-weight:700;color:var(--espresso);margin-bottom:10px;
        }
        .shift-times{display:flex;align-items:center;gap:8px;}
        .time-chip{
          background:#fff;border:1px solid var(--latte);
          border-radius:8px;padding:6px 12px;
          font-size:14px;font-weight:700;color:var(--accent);
        }
        .time-sep{color:var(--text-dim);font-size:13px;}
        .salary-chip{
          margin-top:10px;display:inline-flex;align-items:center;gap:6px;
          background:rgba(201,123,58,0.1);border:1px solid rgba(201,123,58,0.15);
          border-radius:8px;padding:6px 12px;
          font-size:12px;font-weight:700;color:var(--accent);
        }
        .salary-chip svg{width:13px;height:13px;}

        .no-shift-box{
          background:rgba(192,57,43,0.06);border:1px solid rgba(192,57,43,0.15);
          border-radius:12px;padding:14px 16px;
          display:flex;align-items:flex-start;gap:10px;
          color:#c0392b;font-size:13px;font-weight:500;
        }
        .no-shift-box svg{width:16px;height:16px;flex-shrink:0;margin-top:1px;}

        /* presence summary */
        .presence-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .presence-box{border-radius:12px;padding:14px;text-align:center;}
        .presence-val{font-size:28px;font-weight:800;line-height:1;margin-bottom:4px;}
        .presence-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;}

        /* ── TABLES ─────────────────────────────── */
        .tables-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:900px){.tables-grid{grid-template-columns:1fr;}}

        .tbl-scroll{overflow-x:auto;max-height:320px;overflow-y:auto;}
        .tbl-scroll::-webkit-scrollbar{width:3px;height:3px;}
        .tbl-scroll::-webkit-scrollbar-thumb{background:var(--latte);border-radius:2px;}

        table{width:100%;border-collapse:collapse;}
        thead th{
          padding:9px 12px;font-size:10.5px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.09em;
          border-bottom:1px solid rgba(0,0,0,0.07);
          background:#fff;position:sticky;top:0;text-align:left;
          white-space:nowrap;
        }
        tbody tr{border-bottom:1px solid rgba(0,0,0,0.05);transition:background 0.15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--foam);}
        td{padding:10px 12px;font-size:12.5px;vertical-align:middle;}

        .status-ontime{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;background:rgba(39,174,96,0.1);color:#1a7a4a;}
        .status-late{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;background:rgba(192,57,43,0.1);color:#c0392b;}
        .status-sick{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;background:rgba(230,126,34,0.1);color:#a04000;}
        .status-leave{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;background:rgba(108,75,202,0.1);color:#5a3fac;}
        .active-text{font-size:10px;font-style:italic;color:#2563eb;font-weight:600;animation:breathe 2s infinite;}
        .s-dot{width:5px;height:5px;border-radius:50%;}

        .salary-pos{font-size:13px;font-weight:800;color:#1a7a4a;}
        .bonus-line{font-size:10px;font-weight:700;color:#2563eb;}
        .deduct-line{font-size:10px;font-weight:700;color:#c0392b;}
        .pill-paid{display:inline-block;padding:3px 8px;border-radius:6px;font-size:9.5px;font-weight:700;background:rgba(39,174,96,0.1);color:#1a7a4a;}
        .pill-pending{display:inline-block;padding:3px 8px;border-radius:6px;font-size:9.5px;font-weight:700;background:rgba(230,126,34,0.1);color:#a04000;}

        .empty-row td{padding:36px 12px;text-align:center;color:var(--text-dim);font-size:13px;}

        .count-badge{font-size:11px;font-weight:700;background:rgba(201,123,58,0.1);color:var(--accent);padding:2px 9px;border-radius:20px;margin-left:auto;}
      `}</style>

      <div className="absen-root">

        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width:12, height:12 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Kasir
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width:12, height:12 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span>Absensi & Gaji</span>
          </div>
          <h1>Absensi & Gaji Saya</h1>
          <p>Pantau kehadiran dan estimasi gaji berjalan secara real-time</p>
        </div>

        {/* ── SALARY HERO ── */}
        {isLoading && !stats ? (
          <div style={{ borderRadius:20, overflow:'hidden', marginBottom:20 }}>
            <Skeleton w="100%" h={200} r={20} />
          </div>
        ) : (
          <div className={`salary-hero ${isLive ? 'live' : 'paused'}`}>
            <div className="hero-inner">
              <div className="hero-top">
                <p className="hero-label">Estimasi Gaji Berjalan — Bulan Ini</p>
                {isLive ? (
                  <span className="status-badge badge-live">
                    <span className="badge-live-dot" />
                    Live Updating
                  </span>
                ) : (
                  <span className="status-badge badge-paused">
                    <span className="badge-icon"><IconPause /></span>
                    Berhenti
                  </span>
                )}
              </div>

              <div className="ticker-wrap">
                <p className="salary-value" key={Math.floor(liveSalary / 100)}>
                  {formatRp(liveSalary)}
                </p>
              </div>

              <div className="hero-sub">
                <span>Terkumpul dari durasi kerja</span>
                <span className="hero-dur">{formatDuration(localWorked)}</span>
                <span>dari target 208 jam</span>
              </div>

              {!isLive && (
                <p className="hero-pause-msg">
                  <IconPause />
                  Penghitung berhenti — Anda belum absen masuk atau sudah absen keluar hari ini
                </p>
              )}

              <div className="progress-wrap">
                <div className="progress-top">
                  <span className="progress-label">Progress Target Jam Kerja</span>
                  <span className="progress-pct">{progressPct.toFixed(1)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INFO GRID ── */}
        <div className="info-grid">

          {/* Shift */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-icon" style={{ background:'rgba(201,123,58,0.1)', color:'var(--accent)' }}>
                <IconClock />
              </div>
              Jadwal Shift Aktif
            </div>
            {isLoading && !stats ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <Skeleton w="60%" h={20} />
                <Skeleton w="100%" h={42} r={12} />
              </div>
            ) : stats?.shift ? (
              <div className="shift-box">
                <p className="shift-name">{stats.shift.name}</p>
                <div className="shift-times">
                  <span className="time-chip">{stats.shift.start_time}</span>
                  <span className="time-sep">—</span>
                  <span className="time-chip">{stats.shift.end_time}</span>
                </div>
                <div className="salary-chip">
                  <IconWallet />
                  Gaji Pokok: {formatRp(baseSalary)} / Bulan
                </div>
              </div>
            ) : (
              <div className="no-shift-box">
                <IconAlert />
                Anda belum ditempatkan pada shift kerja. Hubungi Admin.
              </div>
            )}
          </div>

          {/* Presence Summary */}
          <div className="card">
            <div className="card-head">
              <div className="card-head-icon" style={{ background:'rgba(37,99,235,0.1)', color:'#2563eb' }}>
                <IconCalendar />
              </div>
              Kehadiran Bulan Ini
            </div>
            {isLoading && !stats ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Skeleton w="100%" h={80} r={12} />
                <Skeleton w="100%" h={80} r={12} />
              </div>
            ) : (
              <div className="presence-grid">
                <div className="presence-box" style={{ background:'rgba(39,174,96,0.08)', border:'1px solid rgba(39,174,96,0.15)' }}>
                  <p className="presence-val" style={{ color:'#1a7a4a' }}>{stats?.attendance?.total_hadir || 0}</p>
                  <p className="presence-label" style={{ color:'#1a7a4a' }}>Hari Hadir</p>
                </div>
                <div className="presence-box" style={{ background:'rgba(37,99,235,0.06)', border:'1px solid rgba(37,99,235,0.12)' }}>
                  <p className="presence-val" style={{ color:'#2563eb' }}>26</p>
                  <p className="presence-label" style={{ color:'#2563eb' }}>Target Hari</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── TABLES ── */}
        <div className="tables-grid">

          {/* Attendance History */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:8 }}>
              <div className="card-head-icon" style={{ background:'rgba(201,123,58,0.1)', color:'var(--accent)', width:30, height:30, borderRadius:8 }}>
                <IconList />
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--espresso)' }}>Detail Absensi Bulan Ini</span>
              {!isLoading && stats && (
                <span className="count-badge">{stats.attendance_history?.length || 0} Hari</span>
              )}
            </div>
            <div className="tbl-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Masuk</th>
                    <th>Keluar</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && !stats ? (
                    [0,1,2,3].map(i => (
                      <tr key={i}>
                        <td><Skeleton w={60} h={12} /></td>
                        <td><Skeleton w={40} h={12} /></td>
                        <td><Skeleton w={40} h={12} /></td>
                        <td><Skeleton w={70} h={22} r={6} /></td>
                      </tr>
                    ))
                  ) : !stats?.attendance_history?.length ? (
                    <tr className="empty-row"><td colSpan="4">Belum ada riwayat absen</td></tr>
                  ) : stats.attendance_history.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight:600, color:'var(--espresso)' }}>
                        {new Date(log.date).toLocaleDateString('id-ID', { day:'numeric', month:'short' })}
                      </td>
                      <td style={{ color:'var(--text-dim)' }}>
                        {log.clock_in ? new Date(log.clock_in).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '—'}
                      </td>
                      <td>
                        {log.clock_out
                          ? <span style={{ color:'var(--text-dim)' }}>{new Date(log.clock_out).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span>
                          : <span className="active-text">Aktif...</span>
                        }
                      </td>
                      <td>
                        {log.status === 'ontime' && <span className="status-ontime"><span className="s-dot" style={{ background:'#27ae60' }}/>Tepat</span>}
                        {log.status === 'late' && (
                          <div>
                            <span className="status-late"><span className="s-dot" style={{ background:'#c0392b' }}/>Terlambat</span>
                            {log.late_seconds > 0 && <div style={{ fontSize:10, color:'#c0392b', marginTop:3, fontWeight:600 }}>{formatLateDuration(log.late_seconds)}</div>}
                          </div>
                        )}
                        {log.status === 'sick'  && <span className="status-sick"><span className="s-dot" style={{ background:'#e67e22' }}/>Sakit</span>}
                        {log.status === 'leave' && <span className="status-leave"><span className="s-dot" style={{ background:'#7c3aed' }}/>Izin</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payroll History */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:8 }}>
              <div className="card-head-icon" style={{ background:'rgba(39,174,96,0.1)', color:'#1a7a4a', width:30, height:30, borderRadius:8 }}>
                <IconSlip />
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--espresso)' }}>Riwayat Slip Gaji</span>
              {!isLoading && stats && (
                <span className="count-badge">{stats.payrolls?.length || 0} Bulan</span>
              )}
            </div>
            <div className="tbl-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th>Gaji Bersih</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign:'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && !stats ? (
                    [0,1,2].map(i => (
                      <tr key={i}>
                        <td><Skeleton w={70} h={12} /></td>
                        <td><Skeleton w={90} h={12} /></td>
                        <td><Skeleton w={80} h={12} /></td>
                        <td><Skeleton w={60} h={22} r={6} /></td>
                      </tr>
                    ))
                  ) : !stats?.payrolls?.length ? (
                    <tr className="empty-row"><td colSpan="4">Belum ada slip gaji</td></tr>
                  ) : stats.payrolls.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight:700, color:'var(--espresso)', whiteSpace:'nowrap' }}>{p.period_month}</td>
                      <td>
                        <p className="salary-pos">{formatRp(p.net_salary)}</p>
                        {Number(p.bonus) > 0 && <p className="bonus-line">+Bonus {formatRp(p.bonus)}</p>}
                        {Number(p.deductions) > 0 && <p className="deduct-line">-Potongan {formatRp(p.deductions)}</p>}
                      </td>
                      <td style={{ fontSize:11.5, color:' var(--text-dim)', fontStyle: p.notes ? 'italic' : 'normal' }}>
                        {p.notes ? `"${p.notes}"` : '—'}
                      </td>
                      <td style={{ textAlign:'center' }}>
                        {p.status === 'paid'
                          ? <span className="pill-paid">Lunas</span>
                          : <span className="pill-pending">Diproses</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}