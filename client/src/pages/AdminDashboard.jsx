import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

/* ─── HELPERS ─────────────────────────────── */
const formatRp = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');
const formatRpShort = (v) => {
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000)     return `Rp ${(v / 1_000).toFixed(0)}rb`;
  return `Rp ${v}`;
};

const Skeleton = ({ w = '100%', h = 16, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a0f0a', border: '1px solid rgba(201,123,58,0.3)',
      borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <p style={{ color: '#c8a97e', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#e8d5b7', fontSize: 15, fontWeight: 700 }}>{formatRp(payload[0].value)}</p>
    </div>
  );
};

const rankStyle = [
  { bg: '#fef3c7', color: '#92400e', medal: '🥇' },
  { bg: '#f1f5f9', color: '#475569', medal: '🥈' },
  { bg: '#fff7ed', color: '#c2410c', medal: '🥉' },
  { bg: '#f0fdf4', color: '#166534', medal: null },
  { bg: '#eff6ff', color: '#1d4ed8', medal: null },
];

/* ── STAT CARD ─────────────────────────────── */
const StatCard = ({ label, value, sub, icon, accentColor, bgColor, loading }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: '20px 22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', gap: 16,
    borderLeft: `4px solid ${accentColor}`,
    animation: 'fadeUp 0.3s ease',
  }}>
    <div style={{
      width: 50, height: 50, borderRadius: 14, background: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
        {label}
      </p>
      {loading
        ? <><Skeleton w="80%" h={22} /><div style={{marginTop:6}}><Skeleton w="50%" h={11} /></div></>
        : <>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#1a0f0a', lineHeight: 1.1, wordBreak: 'break-all' }}>{value}</p>
            {sub && <p style={{ fontSize: 11, color: '#bba890', marginTop: 3 }}>{sub}</p>}
          </>
      }
    </div>
  </div>
);

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function AdminDashboard() {
  const [data, setData]           = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/api/dashboard');
      setData(res.data);
      const formatted = (res.data.sales_data || []).map(item => ({
        label: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        value: Number(item.daily_revenue),
      }));
      setSalesData(formatted);
    } catch {
      toast.error('Gagal mengambil data dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const maxVal = Math.max(...(salesData.length ? salesData.map(d => d.value) : [1]), 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e; --latte:#e8d5b7;
          --foam:#faf6f0; --milk:#f5ede0; --accent:#c97b3a; --text-dim:#8b7355;
        }
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-live{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes pulse-ring{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.4)}70%{box-shadow:0 0 0 6px rgba(37,99,235,0)}}
        @keyframes breathe{0%,100%{opacity:1}50%{opacity:0.5}}

        /* ─── ROOT ─── */
        .dash-root{
          min-height:100%; background:var(--foam); padding:26px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.3s ease;
        }
        @media(max-width:640px){.dash-root{padding:14px}}

        /* ─── HEADER ─── */
        .dash-header{
          display:flex; align-items:center; justify-content:space-between;
          gap:12px; margin-bottom:20px; flex-wrap:wrap;
        }
        .dash-header h1{
          font-family:'Playfair Display',serif;
          font-size:25px; font-weight:700; color:var(--espresso);
        }
        .dash-header p{ font-size:13px; color:var(--text-dim); margin-top:3px; }
        .header-right{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

        .date-pill{
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(201,123,58,0.08); border:1px solid rgba(201,123,58,0.18);
          color:var(--accent); font-size:12px; font-weight:600;
          padding:7px 13px; border-radius:20px; white-space:nowrap;
        }
        .date-pill svg{ width:13px; height:13px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; }

        .refresh-btn{
          display:flex; align-items:center; gap:7px;
          padding:8px 16px; border-radius:10px;
          background:var(--espresso); color:var(--crema);
          border:none; cursor:pointer; font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; transition:opacity 0.2s; white-space:nowrap;
        }
        .refresh-btn:hover{ opacity:0.85; }
        .refresh-btn svg{ width:13px; height:13px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; }

        /* ─── STAT GRID ─── */
        .stat-grid{
          display:grid; grid-template-columns:repeat(4,1fr);
          gap:14px; margin-bottom:20px;
        }
        @media(max-width:1100px){ .stat-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:520px){ .stat-grid{ grid-template-columns:1fr; } }

        /* ─── MAIN GRID ─── */
        .main-grid{
          display:grid;
          grid-template-columns:1fr 300px;
          gap:18px; align-items:start;
        }
        @media(max-width:1000px){ .main-grid{ grid-template-columns:1fr; } }

        /* ─── LEFT COLUMN ─── */
        .left-col{ display:flex; flex-direction:column; gap:18px; }

        /* ─── CARD ─── */
        .card{
          background:#fff; border-radius:16px;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.05);
          padding:22px;
        }
        .card-head{
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:18px; gap:8px;
        }
        .card-title{
          display:flex; align-items:center; gap:8px;
          font-size:14px; font-weight:700; color:var(--espresso);
        }
        .card-dot{ width:8px; height:8px; border-radius:50%; background:var(--accent); flex-shrink:0; }
        .card-badge{
          font-size:11px; font-weight:700;
          background:rgba(201,123,58,0.1); color:var(--accent);
          padding:3px 10px; border-radius:20px;
        }
        .live-badge{
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2);
          color:#2563eb; font-size:10px; font-weight:700;
          padding:3px 10px; border-radius:20px; letter-spacing:0.06em; text-transform:uppercase;
        }
        .live-badge-dot{
          width:6px; height:6px; border-radius:50%; background:#2563eb;
          animation:breathe 1.5s infinite;
        }

        /* ─── CHART ─── */
        .chart-wrap{ height:252px; width:100%; }

        /* ─── BOTTOM ROW: Products + ... ─── */
        .bottom-row{
          display:grid; grid-template-columns:1fr 1fr;
          gap:18px;
        }
        @media(max-width:780px){ .bottom-row{ grid-template-columns:1fr; } }

        /* ─── PRODUCT LIST ─── */
        .product-item{
          display:flex; align-items:center; justify-content:space-between;
          padding:9px 10px; border-radius:10px; transition:background 0.15s; gap:10px;
        }
        .product-item:hover{ background:var(--foam); }
        .rank-badge{
          width:28px; height:28px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:800; flex-shrink:0;
        }
        .sold-pill{
          font-size:11px; font-weight:700; padding:3px 9px;
          border-radius:20px; white-space:nowrap; flex-shrink:0;
          background:rgba(201,123,58,0.1); color:var(--accent);
        }

        /* ─── STAFF CARD ─── */
        .staff-scroll{
          display:flex; flex-direction:column; gap:9px;
          max-height:200px; overflow-y:auto; padding-right:2px;
        }
        .staff-scroll::-webkit-scrollbar{ width:3px; }
        .staff-scroll::-webkit-scrollbar-thumb{ background:var(--latte); border-radius:2px; }

        .staff-item{
          padding:11px 14px; border-radius:12px;
          background:var(--foam);
          border:1px solid rgba(0,0,0,0.05);
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          transition:border-color 0.2s;
        }
        .staff-item.working{
          background:rgba(37,99,235,0.04);
          border-left:3px solid #2563eb;
        }
        .staff-name{ font-size:13px; font-weight:700; color:var(--espresso); margin-bottom:4px; }
        .staff-meta{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
        .shift-tag{
          font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;
          background:#fef3c7; color:#92400e; padding:2px 7px; border-radius:4px;
        }
        .clock-text{ font-size:11px; color:var(--text-dim); }

        .status-out{
          font-size:10px; font-weight:700; padding:4px 9px; border-radius:6px;
          background:#f1f5f9; color:#475569; white-space:nowrap;
        }
        .status-sick{
          font-size:10px; font-weight:700; padding:4px 9px; border-radius:6px;
          background:#fef3c7; color:#92400e; white-space:nowrap;
        }
        .status-leave{
          font-size:10px; font-weight:700; padding:4px 9px; border-radius:6px;
          background:#ede9fe; color:#5b21b6; white-space:nowrap;
        }
        .status-working{
          display:flex; align-items:center; gap:5px;
          font-size:11px; font-weight:700; color:#2563eb; font-style:italic;
          animation:breathe 2s infinite; white-space:nowrap;
        }
        .status-working-dot{
          width:6px; height:6px; border-radius:50%; background:#2563eb;
          flex-shrink:0;
        }
        .late-tag{
          font-size:9px; font-weight:700;
          background:#fee2e2; color:#dc2626; padding:2px 7px; border-radius:4px;
        }

        /* ─── EMPTY ─── */
        .empty-box{
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:32px 0; gap:8px; color:var(--text-dim); font-size:13px;
        }
        .empty-box svg{ width:34px; height:34px; stroke:var(--crema); fill:none; stroke-width:1.5; stroke-linecap:round; }
      `}</style>

      <div className="dash-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily:'DM Sans', fontSize:13 } }} />

        {/* ── HEADER ── */}
        <div className="dash-header">
          <div>
            <h1>Command Center</h1>
            <p>
              Selamat datang, <strong style={{ color:'var(--accent)' }}>{user?.name}</strong>
              {' '}— performa kafe Anda hari ini.
            </p>
          </div>
          <div className="header-right">
            <span className="date-pill">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
              {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </span>
            <button className="refresh-btn" onClick={() => { setIsLoading(true); fetchDashboardData(); }}>
              <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── 4 STAT CARDS ── */}
        <div className="stat-grid">
          <StatCard label="Pendapatan Hari Ini" value={formatRp(data?.stats.total_revenue ?? 0)}                         sub="Total bersih"       icon="💰" accentColor="#c97b3a" bgColor="rgba(201,123,58,0.1)" loading={isLoading && !data} />
          <StatCard label="Transaksi Hari Ini"  value={`${data?.stats.total_orders ?? 0} Struk`}                         sub="Order masuk"       icon="🧾" accentColor="#27ae60" bgColor="rgba(39,174,96,0.1)"  loading={isLoading && !data} />
          <StatCard label="Kehadiran Karyawan"  value={`${data?.stats.staff_present ?? 0} / ${data?.stats.staff_total ?? 0}`} sub="Aktif hari ini" icon="👥" accentColor="#2980b9" bgColor="rgba(41,128,185,0.1)" loading={isLoading && !data} />
          <StatCard label="Stok Kritis"         value={`${data?.stats.low_stock_count ?? 0} Menu`}                       sub="Sisa ≤ 10 porsi"   icon="⚠️" accentColor="#c0392b" bgColor="rgba(192,57,43,0.1)" loading={isLoading && !data} />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="main-grid">

          {/* LEFT: Chart + Bottom Row */}
          <div className="left-col">

            {/* CHART */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <span className="card-dot" />
                  Grafik Penjualan 7 Hari Terakhir
                </div>
              </div>
              {isLoading && !data ? (
                <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:252, padding:'0 4px' }}>
                  {[55,80,42,68,100,52,75].map((h,i) => <Skeleton key={i} w="100%" h={`${h}%`} r={6} />)}
                </div>
              ) : salesData.length === 0 ? (
                <div className="empty-box" style={{ height:252 }}>
                  <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                  Belum ada data penjualan
                </div>
              ) : (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%" debounce={80}>
                    <BarChart data={salesData} margin={{ top:4, right:8, left:0, bottom:4 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#8b7355', fontFamily:'DM Sans' }} />
                      <YAxis axisLine={false} tickLine={false} width={72} tick={{ fontSize:10, fill:'#8b7355', fontFamily:'DM Sans' }} tickFormatter={formatRpShort} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(201,123,58,0.06)', radius:6 }} />
                      <Bar dataKey="value" radius={[6,6,0,0]} maxBarSize={52} isAnimationActive={false}>
                        {salesData.map((entry, i) => (
                          <Cell key={i} fill={entry.value === maxVal
                            ? '#c97b3a'
                            : `rgba(201,123,58,${0.28 + (entry.value / maxVal) * 0.5})`
                          } />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* BOTTOM ROW: Top Products + (spare for future widget) */}
            <div className="bottom-row">

              {/* TOP PRODUCTS */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="card-dot" style={{ background:'#e8913f' }} />
                    Top 5 Menu
                  </div>
                  <span className="card-badge">Hari Ini</span>
                </div>
                {isLoading && !data ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Skeleton w={28} h={28} r={50} />
                        <Skeleton w={`${45+i*12}%`} h={13} />
                        <Skeleton w={44} h={22} r={20} />
                      </div>
                    ))}
                  </div>
                ) : !data?.top_products?.length ? (
                  <div className="empty-box">
                    <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/></svg>
                    Belum ada penjualan
                  </div>
                ) : (
                  <ul style={{ display:'flex', flexDirection:'column', gap:3 }}>
                    {data.top_products.map((product, i) => {
                      const rs = rankStyle[i] || rankStyle[4];
                      return (
                        <li key={i} className="product-item">
                          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                            <span className="rank-badge" style={{ background:rs.bg, color:rs.color }}>
                              {rs.medal || `#${i+1}`}
                            </span>
                            <span style={{ fontSize:13, fontWeight:500, color:'#1a0f0a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {product.product_name}
                            </span>
                          </div>
                          <span className="sold-pill">{product.total_sold}×</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* RINGKASAN METODE BAYAR */}
              <div className="card">
                <div className="card-head">
                  <div className="card-title">
                    <span className="card-dot" style={{ background:'#7c3aed' }} />
                    Metode Pembayaran
                  </div>
                  <span className="card-badge">Hari Ini</span>
                </div>
                {isLoading && !data ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <Skeleton w="100%" h={56} r={12} />
                    <Skeleton w="100%" h={56} r={12} />
                  </div>
                ) : (
                  <>
                    {/* Cash */}
                    {(() => {
                      const cashOrders = data?.payment_summary?.cash ?? 0;
                      const qrisOrders = data?.payment_summary?.qris ?? 0;
                      const total      = cashOrders + qrisOrders || 1;
                      const cashPct    = Math.round((cashOrders / total) * 100);
                      const qrisPct    = 100 - cashPct;
                      return (
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                          {[
                            { label:'Cash', count:cashOrders, pct:cashPct, color:'#27ae60', bg:'rgba(39,174,96,0.1)', icon:'💵' },
                            { label:'QRIS / Transfer', count:qrisOrders, pct:qrisPct, color:'#7c3aed', bg:'rgba(124,58,237,0.1)', icon:'📱' },
                          ].map(m => (
                            <div key={m.label} style={{ background:m.bg, borderRadius:12, padding:'12px 14px' }}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                                <span style={{ fontSize:13, fontWeight:700, color:'#1a0f0a' }}>{m.icon} {m.label}</span>
                                <span style={{ fontSize:12, fontWeight:800, color:m.color }}>{m.count} Trx</span>
                              </div>
                              <div style={{ background:'rgba(0,0,0,0.08)', borderRadius:99, height:6, overflow:'hidden' }}>
                                <div style={{ width:`${m.pct}%`, height:'100%', background:m.color, borderRadius:99, transition:'width 0.5s ease' }} />
                              </div>
                              <p style={{ fontSize:10, color:'#8b7355', marginTop:4, textAlign:'right', fontWeight:600 }}>{m.pct}%</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT: Live Staff Monitor */}
          <div className="card" style={{ position:'sticky', top:20 }}>
            <div className="card-head">
              <div className="card-title">
                <span className="card-dot" style={{ background:'#2563eb' }} />
                Monitor Absensi
              </div>
              <span className="live-badge">
                <span className="live-badge-dot" />
                LIVE
              </span>
            </div>

            {isLoading && !data ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ padding:12, borderRadius:12, background:'var(--foam)' }}>
                    <Skeleton w="65%" h={13} />
                    <div style={{ marginTop:7, display:'flex', gap:6 }}>
                      <Skeleton w={50} h={18} r={4} />
                      <Skeleton w={70} h={18} r={4} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.live_staff?.length ? (
              <div className="empty-box">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                Belum ada staf aktif
              </div>
            ) : (
              <div className="staff-scroll" style={{ maxHeight:520 }}>
                {data.live_staff.map((staff, i) => {
                  const isWorking = !staff.clock_out && (staff.status === 'ontime' || staff.status === 'late');
                  return (
                    <div key={i} className={`staff-item ${isWorking ? 'working' : ''}`}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p className="staff-name">{staff.name}</p>
                        <div className="staff-meta">
                          <span className="shift-tag">{staff.shift_name || 'No Shift'}</span>
                          <span className="clock-text">
                            Masuk {new Date(staff.clock_in).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                          </span>
                          {isWorking && staff.status === 'late' && (
                            <span className="late-tag">Terlambat</span>
                          )}
                        </div>
                      </div>
                      <div style={{ flexShrink:0 }}>
                        {staff.status === 'sick' && <span className="status-sick">SAKIT</span>}
                        {staff.status === 'leave' && <span className="status-leave">IZIN</span>}
                        {staff.clock_out && (
                          <span className="status-out">
                            Pulang {new Date(staff.clock_out).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                          </span>
                        )}
                        {isWorking && (
                          <span className="status-working">
                            <span className="status-working-dot" />
                            Bekerja
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}