import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api';
import toast, { Toaster } from 'react-hot-toast';

const TOTAL_TARGET_SECONDS = 26 * 8 * 3600;

/* ─── HELPERS ─── */
const Skeleton = ({ w = '100%', h = 14, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#ede4d9 25%,#f5ede3 50%,#ede4d9 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  }} />
);

const AVATAR_COLORS = [
  ['#7c4a1e','#fde8ce'], ['#1a5c38','#d4f0e2'], ['#1e3a8a','#dbeafe'],
  ['#581c87','#ede9fe'], ['#881337','#ffe4e6'], ['#0e7490','#cffafe'],
];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];
const formatRp = (v) => 'Rp\u00a0' + Math.floor(Number(v || 0)).toLocaleString('id-ID');
const formatDur = (sec) => {
  if (!sec || sec <= 0) return '0j 0m';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return `${h}j ${m}m ${s}d`;
};
const formatDurShort = (sec) => {
  if (!sec || sec <= 0) return '0j 0m';
  return `${Math.floor(sec / 3600)}j ${Math.floor((sec % 3600) / 60)}m`;
};

/* ─── ANIMATED NUMBER COMPONENT ─── */
function AnimatedNumber({ value, prefix = 'Rp\u00a0', className = '', style = {} }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value), raf = useRef(null);
  
  useEffect(() => {
    const start = prev.current, diff = value - start;
    const duration = 380, startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(start + diff * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = value;
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  
  return <span className={className} style={style}>{prefix}{Math.floor(display).toLocaleString('id-ID')}</span>;
}

/* ─── SVG ICONS COMPONENT ─── */
const Icons = {
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Money: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>,
  Empty: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48" style={{color:'#c9a87c'}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Lightning: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Chart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
};

export default function AdminPayroll() {
  const [payrolls, setPayrolls]           = useState([]);
  const [isFirstLoad, setIsFirstLoad]     = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [selectedEmp, setSelectedEmp]     = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [searchTerm, setSearchTerm]       = useState('');
  const [tick, setTick]                   = useState(0);
  const [formData, setFormData]           = useState({ bonus: 0, deductions: 0, notes: '', status: 'pending' });
  
  const fetchedAtRef    = useRef(Date.now());
  const tickIntervalRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const fetchPayrollData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setIsFirstLoad(true);
    try {
      const res = await api.get(`/api/hr/payrolls?month=${selectedMonth}`);
      setPayrolls(res.data);
      fetchedAtRef.current = Date.now();
    } catch { /* silent */ }
    finally { if (showSkeleton) setIsFirstLoad(false); }
  }, [selectedMonth]);

  useEffect(() => {
    fetchPayrollData(true);
    pollIntervalRef.current = setInterval(() => fetchPayrollData(false), 5000);
    tickIntervalRef.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => { clearInterval(pollIntervalRef.current); clearInterval(tickIntervalRef.current); };
  }, [fetchPayrollData]);

  const elapsed = () => (Date.now() - fetchedAtRef.current) / 1000;
  
  const getLiveWorked = (emp) => Number(emp.total_worked_seconds || 0) + (Number(emp.is_active) === 1 ? elapsed() : 0);
  const getPerSec = (emp) => Number(emp.base_salary || 0) / TOTAL_TARGET_SECONDS;
  const getLiveSalary = (emp) => getLiveWorked(emp) * getPerSec(emp);

  const openProcessModal = (emp) => {
    setSelectedEmp(emp);
    const base = Number(emp.base_salary || 0), worked = Number(emp.total_worked_seconds || 0);
    const perSec = base / TOTAL_TARGET_SECONDS, gajiMurni = Math.round(worked * perSec);
    const missed = Math.max(0, TOTAL_TARGET_SECONDS - worked);
    const potWaktu = worked < TOTAL_TARGET_SECONDS ? base - gajiMurni : 0;
    const jm = Math.floor(missed / 3600), mm = Math.floor((missed % 3600) / 60);
    const autoNotes = worked < TOTAL_TARGET_SECONDS
      ? `Kurang ${jm}j ${mm}m dari target 208 jam. Potongan otomatis: -${formatRp(potWaktu)}.`
      : 'Jam kerja terpenuhi penuh (≥ 208 jam). Tidak ada potongan.';
    const savedDed = (emp.deductions != null) ? Number(emp.deductions) : potWaktu;
    setFormData({ bonus: emp.bonus ? Number(emp.bonus) : 0, deductions: savedDed, notes: emp.notes || autoNotes, status: emp.payroll_status || 'pending' });
    setIsModalOpen(true);
  };

  const handleProcess = async (e) => {
    e.preventDefault(); setIsLoading(true);
    const base = Number(selectedEmp?.base_salary || 0), bon = Number(formData.bonus || 0), ded = Number(formData.deductions || 0);
    try {
      await api.post('/api/hr/payrolls', {
        user_id: selectedEmp.user_id, period_month: selectedMonth,
        base_salary: base, bonus: bon, deductions: ded,
        net_salary: base + bon - ded, status: formData.status, notes: formData.notes,
      });
      toast.success(`Gaji ${selectedEmp.name} berhasil disimpan!`);
      setIsModalOpen(false); fetchPayrollData(false);
    } catch { toast.error('Gagal menyimpan data gaji'); }
    finally { setIsLoading(false); }
  };

  const filtered      = payrolls.filter(e => e.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const paidCount     = payrolls.filter(e => e.payroll_status === 'paid').length;
  const pendingCount  = payrolls.filter(e => e.payroll_status === 'pending' || !e.payroll_status).length;
  const totalEst      = payrolls.reduce((s, e) => s + getLiveSalary(e), 0);
  const activeCount   = payrolls.filter(e => Number(e.is_active) === 1).length;
  const liveNet       = Number(selectedEmp?.base_salary || 0) + Number(formData.bonus || 0) - Number(formData.deductions || 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Figtree:wght@300;400;500;600;700;800&display=swap');

        :root {
          --ink:#0d0905; --bark:#2c1a0e; --umber:#5c3d2e;
          --sand:#c9a87c; --cream:#f0e6d3; --paper:#faf5ee;
          --white:#ffffff;
          --green:#14532d; --green-light:#dcfce7; --green-mid:#16a34a;
          --red:#7f1d1d; --red-light:#fee2e2; --red-mid:#dc2626;
          --amber:#78350f; --amber-light:#fef3c7; --amber-mid:#d97706;
          --blue:#1e3a8a; --blue-light:#dbeafe; --blue-mid:#2563eb;
          --shadow-sm:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.06);
          --shadow-md:0 4px 16px rgba(0,0,0,0.08),0 2px 6px rgba(0,0,0,0.05);
          --shadow-lg:0 20px 48px rgba(0,0,0,0.14),0 8px 20px rgba(0,0,0,0.08);
        }

        @keyframes shimmer  { 0%{background-position:-200% 0}100%{background-position:200% 0} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn  { from{opacity:0;transform:scale(0.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes breathe  { 0%,100%{opacity:1}50%{opacity:.35} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)} }
        
        @keyframes bounce-tick {
          0%   { transform: translateY(0); text-shadow: 0 0 0px rgba(22,163,74,0); }
          15%  { transform: translateY(-2px); color: #15803d; text-shadow: 0 4px 8px rgba(22,163,74,0.3); }
          30%  { transform: translateY(0); text-shadow: 0 0 0px rgba(22,163,74,0); }
          100% { transform: translateY(0); }
        }
        .live-bounce { display: inline-block; animation: bounce-tick 1s infinite; }

        .ap-root { min-height:100%; background:var(--paper); padding:32px; font-family:'Figtree',sans-serif; color:var(--ink); animation:fadeUp 0.3s ease; }
        @media(max-width:640px){ .ap-root{padding:16px} }

        .ap-header { margin-bottom:28px; }
        .ap-breadcrumb { display:flex; align-items:center; gap:5px; font-size:11.5px; font-weight:600; color:var(--umber); letter-spacing:0.04em; margin-bottom:12px; text-transform:uppercase; }
        .ap-breadcrumb .crumb-sep { color:var(--sand); font-size:10px; }
        .ap-breadcrumb .crumb-cur { color:var(--bark); }

        .ap-header-row { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .ap-title { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:700; color:var(--bark); line-height:1; letter-spacing:-0.02em; }
        .ap-title span { color:var(--sand); }
        .ap-subtitle { font-size:13px; color:var(--umber); margin-top:6px; font-weight:400; }

        .live-pill { display:inline-flex; align-items:center; gap:7px; background:var(--green-light); border:1px solid rgba(22,163,74,0.25); border-radius:100px; padding:6px 14px; font-size:11px; font-weight:700; color:var(--green); letter-spacing:0.06em; text-transform:uppercase; white-space:nowrap; }
        .live-dot { width:6px; height:6px; border-radius:50%; background:var(--green-mid); animation:breathe 1.4s infinite; }

        /* ── METRICS ROW ── */
        .metrics-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
        @media(max-width:900px){ .metrics-row{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:480px){ .metrics-row{grid-template-columns:1fr} }

        .metric-card { background:var(--white); border-radius:16px; border:1px solid rgba(0,0,0,0.06); box-shadow:var(--shadow-sm); padding:18px 20px; position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; }
        .metric-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
        .metric-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:16px 16px 0 0; }
        .metric-card.c-total::before  { background:linear-gradient(90deg,var(--sand),#e8b878); }
        .metric-card.c-paid::before   { background:linear-gradient(90deg,var(--green-mid),#4ade80); }
        .metric-card.c-pending::before{ background:linear-gradient(90deg,var(--amber-mid),#fbbf24); }
        .metric-card.c-payroll::before{ background:linear-gradient(90deg,var(--blue-mid),#60a5fa); }

        .metric-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
        .metric-label { font-size:10.5px; font-weight:700; color:var(--umber); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px; }
        .metric-value { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:700; color:var(--bark); line-height:1; }
        .metric-value.sm { font-size:16px; font-weight:800; font-family:'Figtree',sans-serif; }
        
        .metric-sub { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--green-mid); background:var(--green-light); padding:3px 8px; border-radius:6px; margin-top:8px; }
        .metric-sub-dot { width:5px; height:5px; border-radius:50%; background:currentColor; animation:breathe 1.5s infinite; }

        /* ── TOOLBAR ── */
        .ap-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; justify-content:space-between; }
        .toolbar-left { display:flex; align-items:center; gap:10px; flex:1; flex-wrap:wrap; }
        .search-box { position:relative; flex:1; min-width:200px; max-width:280px; }
        .search-box svg { position:absolute; left:13px; top:50%; transform:translateY(-50%); width:15px; height:15px; stroke:var(--umber); fill:none; stroke-width:2; stroke-linecap:round; pointer-events:none; }
        .search-input { width:100%; height:42px; padding:0 14px 0 40px; border:1.5px solid rgba(0,0,0,0.09); border-radius:12px; font-family:'Figtree',sans-serif; font-size:13.5px; color:var(--bark); background:var(--white); outline:none; transition:all 0.2s; box-sizing:border-box; }
        .search-input:focus { border-color:var(--sand); box-shadow:0 0 0 3px rgba(201,168,124,0.15); }
        .search-input::placeholder { color:#c4b09a; }
        .month-picker { display:flex; align-items:center; gap:8px; height:42px; padding:0 14px; background:var(--white); border:1.5px solid rgba(0,0,0,0.09); border-radius:12px; transition:all 0.2s; cursor:pointer; }
        .month-picker:focus-within { border-color:var(--sand); box-shadow:0 0 0 3px rgba(201,168,124,0.15); }
        .month-picker svg { width:14px; height:14px; stroke:var(--sand); fill:none; stroke-width:2; stroke-linecap:round; }
        .month-picker input { border:none; outline:none; background:transparent; font-family:'Figtree',sans-serif; font-size:13px; font-weight:700; color:var(--bark); cursor:pointer; }

        /* ── TABLE SECTION ── */
        .table-section { background:var(--white); border-radius:18px; border:1px solid rgba(0,0,0,0.06); box-shadow:var(--shadow-sm); overflow:hidden; }
        .table-topbar { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid rgba(0,0,0,0.06); flex-wrap:wrap; gap:10px; }
        .table-topbar-left { display:flex; align-items:center; gap:10px; }
        .tbar-title { font-size:14px; font-weight:700; color:var(--bark); }
        .tbar-count { font-size:11px; font-weight:700; color:var(--umber); background:var(--cream); border:1px solid rgba(201,168,124,0.3); padding:3px 10px; border-radius:100px; }

        .tbl-scroll { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; min-width:860px; }
        thead tr { border-bottom:2px solid var(--cream); }
        th { padding:12px 20px; font-size:10.5px; font-weight:700; color:var(--umber); text-transform:uppercase; letter-spacing:0.12em; text-align:left; white-space:nowrap; background:var(--paper); }
        tbody tr { border-bottom:1px solid rgba(0,0,0,0.045); transition:background 0.15s; animation:slideIn 0.22s ease both; }
        tbody tr:hover { background:rgba(250,245,238,0.7); }
        td { padding:14px 20px; font-size:13px; vertical-align:middle; }

        /* ── EMP CELL ── */
        .emp-cell { display:flex; align-items:center; gap:12px; }
        .emp-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.12); }
        .emp-name { font-size:13.5px; font-weight:700; color:var(--bark); line-height:1.2; }
        .emp-shift { font-size:11px; color:var(--umber); margin-top:3px; }

        /* ── DURATION CELL ── */
        .dur-main { font-size:14px; font-weight:800; color:var(--bark); font-variant-numeric:tabular-nums; }
        .dur-pct  { font-size:11px; color:var(--umber); margin-top:2px; }
        .dur-bar  { height:5px; border-radius:10px; background:var(--cream); margin-top:7px; overflow:hidden; width:110px; }
        .dur-fill { height:100%; border-radius:10px; background:linear-gradient(90deg,var(--sand),#e0a060); transition:width 0.8s ease; }
        .dur-fill.full { background:linear-gradient(90deg,var(--green-mid),#4ade80); }

        /* ── SALARY CELL (TWO THEMES: ACTIVE & OFFLINE) ── */
        .sal-card {
          border-radius: 12px; padding: 10px 13px; display: inline-block; min-width: 155px;
          transition: all 0.3s ease;
        }
        /* Mode 1: Active/Kerja */
        .sal-card.active {
          background: linear-gradient(135deg, rgba(22,163,74,0.08), rgba(22,163,74,0.02));
          border: 1px solid rgba(22,163,74,0.3); box-shadow: 0 4px 12px rgba(22,163,74,0.1);
        }
        .sal-card.active .sal-live-label { color: var(--green-mid); }
        .sal-card.active .sal-val { color: var(--green-mid); }
        .sal-card.active .sal-rate { color: var(--green); background: var(--white); border: 1px solid rgba(22,163,74,0.2); }
        
        /* Mode 2: Offline/Pulang */
        .sal-card.offline {
          background: #f8fafc; border: 1px solid #e2e8f0;
        }
        .sal-card.offline .sal-live-label { color: #64748b; }
        .sal-card.offline .sal-val { color: #334155; }
        .sal-card.offline .sal-rate { color: #94a3b8; background: transparent; border: 1px solid transparent; padding-left: 0; }

        .sal-live-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
        .sal-live-dot { width:5px; height:5px; border-radius:50%; background:currentColor; animation:breathe 1.2s infinite; }
        .sal-val { font-size:15px; font-weight:800; font-variant-numeric:tabular-nums; }
        .sal-rate { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; border-radius:6px; padding:2px 7px; margin-top:6px; }
        .sal-base { font-size:11px; color:#bba890; margin-top:6px; text-decoration:line-through; padding-left:2px; }

        /* ── DEDUCTION CELL ── */
        .ded-ok { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; color:var(--green); background:var(--green-light); border:1px solid rgba(22,163,74,0.2); border-radius:8px; padding:5px 10px; }
        .ded-box { background:rgba(220,38,38,0.04); border:1px solid rgba(220,38,38,0.15); border-radius:10px; padding:9px 12px; }
        .ded-amount { font-size:13px; font-weight:800; color:var(--red-mid); }
        .ded-info { font-size:10.5px; color:#b91c1c; margin-top:3px; line-height:1.5; }
        .ded-bar  { height:3px; border-radius:3px; background:rgba(220,38,38,0.1); margin-top:7px; overflow:hidden; }
        .ded-fill { height:100%; background:var(--red-mid); border-radius:3px; }

        /* ── STATUS ── */
        .s-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:100px; font-size:11px; font-weight:700; white-space:nowrap; }
        .s-paid    { background:var(--green-light); border:1px solid rgba(22,163,74,0.22); color:var(--green); }
        .s-pending { background:var(--amber-light); border:1px solid rgba(217,119,6,0.22); color:var(--amber); }
        .s-none    { background:var(--cream); border:1px solid rgba(201,168,124,0.3); color:var(--umber); }

        /* ── ACTION BUTTON ── */
        .btn-act { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:none; font-family:'Figtree',sans-serif; font-size:12.5px; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
        .btn-act.new  { background:var(--bark); color:var(--cream); }
        .btn-act.new:hover { background:var(--umber); transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.18); }
        .btn-act.edit { background:var(--cream); border:1.5px solid rgba(201,168,124,0.4); color:var(--umber); }
        .btn-act.edit:hover { background:#e8d9c2; transform:translateY(-1px); }
        .btn-act svg { width:12px; height:12px; stroke:currentColor; fill:none; stroke-width:2.2; stroke-linecap:round; }

        /* ── EMPTY STATE ── */
        .empty-state { padding:64px 20px; text-align:center; }
        .empty-icon  { display:flex; justify-content:center; margin-bottom:14px; }
        .empty-text  { font-size:15px; font-weight:700; color:var(--bark); }
        .empty-sub   { font-size:12.5px; color:var(--umber); margin-top:5px; }

        /* ═══════ MODAL ═══════ */
        .m-overlay { position:fixed; inset:0; background:rgba(5,2,0,0.62); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:16px; }
        .m-box { background:var(--white); border-radius:24px; width:100%; max-width:520px; box-shadow:var(--shadow-lg); animation:modalIn 0.26s ease; overflow:hidden; max-height:92dvh; overflow-y:auto; scrollbar-width:thin; scrollbar-color:var(--cream) transparent; }
        .m-head { padding:22px 26px 18px; position:sticky; top:0; background:var(--bark); display:flex; align-items:center; justify-content:space-between; z-index:2; }
        .m-head-left { display:flex; align-items:center; gap:13px; }
        .m-av { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; flex-shrink:0; box-shadow:0 2px 10px rgba(0,0,0,0.2); }
        .m-name { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:700; color:var(--white); line-height:1.1; }
        .m-sub  { font-size:11px; color:var(--sand); margin-top:3px; }
        .m-close { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; font-size:16px; transition:all 0.2s; flex-shrink:0; }
        .m-close:hover { background:rgba(255,255,255,0.2); }
        .m-body { padding:22px 26px 26px; }

        .m-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; }
        .m-info { background:var(--paper); border:1px solid rgba(0,0,0,0.07); border-radius:12px; padding:12px 14px; }
        .m-info-label { font-size:9.5px; font-weight:700; color:var(--umber); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:5px; }
        .m-info-val   { font-size:15px; font-weight:800; color:var(--bark); }
        .m-info-val.green  { color:var(--green); }
        .m-info-val.accent { color:var(--umber); }
        .m-info-val.red    { color:var(--red-mid); }

        .m-rate { display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg,rgba(201,168,124,0.1),rgba(201,168,124,0.04)); border:1px solid rgba(201,168,124,0.25); border-radius:12px; padding:12px 16px; margin-bottom:18px; }
        .m-rate-label { font-size:11px; font-weight:700; color:var(--umber); text-transform:uppercase; letter-spacing:0.08em; display:flex; align-items:center; gap:6px; }
        .m-rate-sub   { font-size:11px; color:#c4b09a; margin-top:2px; }
        .m-rate-val   { font-size:15px; font-weight:800; color:var(--umber); font-variant-numeric:tabular-nums; }

        .m-breakdown { background:rgba(220,38,38,0.035); border:1px solid rgba(220,38,38,0.12); border-radius:12px; padding:14px 16px; margin-bottom:18px; }
        .m-bkd-title { display:flex; align-items:center; gap:6px; font-size:10.5px; font-weight:700; color:var(--red-mid); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; }
        .m-bkd-row   { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(220,38,38,0.07); font-size:12.5px; }
        .m-bkd-row:last-child { border-bottom:none; padding-bottom:0; }
        .m-bkd-row.total { border-top:1.5px solid rgba(220,38,38,0.14); border-bottom:none; margin-top:6px; padding-top:10px; font-weight:700; }
        .pos { color:var(--green); } .neg { color:var(--red-mid); } .neu { color:var(--bark); }

        .f-two { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; }
        .f-field { margin-bottom:14px; }
        .f-label { display:block; font-size:10px; font-weight:700; color:var(--umber); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:7px; }
        .f-inp, .f-sel, .f-ta { width:100%; padding:10px 14px; box-sizing:border-box; border:1.5px solid rgba(0,0,0,0.09); border-radius:12px; font-family:'Figtree',sans-serif; font-size:13.5px; color:var(--bark); background:var(--paper); outline:none; transition:all 0.2s; }
        .f-inp:focus,.f-sel:focus,.f-ta:focus { border-color:var(--sand); background:var(--white); box-shadow:0 0 0 3px rgba(201,168,124,0.15); }
        .f-inp.green { color:var(--green); font-weight:800; }
        .f-inp.red   { color:var(--red-mid); font-weight:800; }
        .f-ta { resize:vertical; min-height:70px; font-size:12.5px; line-height:1.6; }
        .f-sel { height:44px; cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235c3d2e' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:38px; }

        .m-net { display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg,var(--bark),var(--umber)); border-radius:14px; padding:18px 20px; margin-bottom:20px; }
        .m-net-label { font-size:9.5px; font-weight:700; color:var(--sand); text-transform:uppercase; letter-spacing:0.12em; margin-bottom:6px; }
        .m-net-val   { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:700; color:var(--white); }
        .m-net-icon  { width:48px; height:48px; background:rgba(255,255,255,0.1); border-radius:14px; display:flex; align-items:center; justify-content:center; color:var(--sand); }

        .m-footer { display:flex; gap:10px; padding-top:18px; border-top:1px solid var(--cream); }
        .btn-cancel { flex:1; height:46px; border-radius:12px; background:var(--paper); border:1.5px solid rgba(0,0,0,0.1); font-family:'Figtree',sans-serif; font-size:13.5px; font-weight:600; color:var(--umber); cursor:pointer; transition:all 0.2s; }
        .btn-cancel:hover { background:var(--cream); }
        .btn-save { flex:2; height:46px; border-radius:12px; background:linear-gradient(135deg,var(--bark),var(--umber)); border:none; color:var(--cream); font-family:'Figtree',sans-serif; font-size:13.5px; font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-save:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 6px 18px rgba(0,0,0,0.18); }
        .btn-save:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-save svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.2; stroke-linecap:round; }
        .spin { animation:spin 1s linear infinite; }
      `}</style>

      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'Figtree', fontSize: 13, borderRadius: 12 },
        success: { iconTheme: { primary: '#16a34a', secondary: '#dcfce7' } },
      }} />

      {/* ════ MODAL ════ */}
      {isModalOpen && selectedEmp && (() => {
        const [avBg, avFg] = getAvatarColor(selectedEmp.user_id);
        const base     = Number(selectedEmp.base_salary || 0);
        const worked   = Number(selectedEmp.total_worked_seconds || 0);
        const perSec   = base / TOTAL_TARGET_SECONDS;
        const gajiMurni = Math.round(worked * perSec);
        const kurang   = Math.max(0, TOTAL_TARGET_SECONDS - worked);
        const potWaktu = worked < TOTAL_TARGET_SECONDS ? base - gajiMurni : 0;
        const bon = Number(formData.bonus || 0);
        return (
          <div className="m-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="m-box" onClick={e => e.stopPropagation()}>
              <div className="m-head">
                <div className="m-head-left">
                  <div className="m-av" style={{ background: avBg, color: avFg }}>
                    {(selectedEmp.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="m-name">{selectedEmp.name}</p>
                    <p className="m-sub">Slip Gaji · {selectedMonth}</p>
                  </div>
                </div>
                <button className="m-close" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <div className="m-body">
                <div className="m-info-grid">
                  <div className="m-info">
                    <p className="m-info-label">Gaji Pokok</p>
                    <p className="m-info-val">{formatRp(base)}</p>
                  </div>
                  <div className="m-info">
                    <p className="m-info-label">Jam Aktual</p>
                    <p className="m-info-val accent">{formatDurShort(worked)}</p>
                  </div>
                  <div className="m-info">
                    <p className="m-info-label">Target Bulan</p>
                    <p className="m-info-val" style={{ fontSize:13 }}>208j (26×8j)</p>
                  </div>
                  <div className="m-info">
                    <p className="m-info-label">Gaji Murni</p>
                    <p className={`m-info-val ${gajiMurni < base ? 'red' : 'green'}`}>{formatRp(gajiMurni)}</p>
                  </div>
                </div>

                <div className="m-rate">
                  <div>
                    <p className="m-rate-label"><Icons.Lightning /> Tarif per Detik</p>
                    <p className="m-rate-sub">Setiap 1 detik bekerja = gaji bertambah</p>
                  </div>
                  <p className="m-rate-val">Rp {perSec.toFixed(4)}</p>
                </div>

                {potWaktu > 0 && (
                  <div className="m-breakdown">
                    <p className="m-bkd-title"><Icons.Chart /> Rincian Potongan Otomatis</p>
                    <div className="m-bkd-row"><span>Gaji pokok target penuh</span><span className="neu">{formatRp(base)}</span></div>
                    <div className="m-bkd-row"><span>Kurang jam kerja</span><span className="neg">−{formatDurShort(kurang)} ({((kurang/TOTAL_TARGET_SECONDS)*100).toFixed(1)}%)</span></div>
                    <div className="m-bkd-row"><span>Potongan waktu</span><span className="neg">−{formatRp(potWaktu)}</span></div>
                    {bon > 0 && <div className="m-bkd-row"><span>Bonus / Lembur</span><span className="pos">+{formatRp(bon)}</span></div>}
                    <div className="m-bkd-row total"><span>Estimasi Gaji Bersih</span><span className="pos">{formatRp(gajiMurni + bon)}</span></div>
                  </div>
                )}

                <form onSubmit={handleProcess}>
                  <div className="f-two">
                    <div>
                      <label className="f-label">Bonus / Lembur (+)</label>
                      <input type="number" className="f-inp green" value={formData.bonus}
                        onChange={e => setFormData(p => ({ ...p, bonus: e.target.value }))} />
                    </div>
                    <div>
                      <label className="f-label">Potongan Manual (−)</label>
                      <input type="number" className="f-inp red" value={formData.deductions}
                        onChange={e => setFormData(p => ({ ...p, deductions: e.target.value }))} />
                    </div>
                  </div>

                  <div className="f-field">
                    <label className="f-label">Keterangan</label>
                    <textarea className="f-ta" value={formData.notes}
                      onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                  </div>

                  <div className="f-field">
                    <label className="f-label">Status Pembayaran</label>
                    <select className="f-sel" value={formData.status}
                      onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                      <option value="pending">Draft / Belum Lunas</option>
                      <option value="paid">Lunas Ditransfer</option>
                    </select>
                  </div>

                  <div className="m-net">
                    <div>
                      <p className="m-net-label">Gaji Bersih Diterima</p>
                      <AnimatedNumber value={liveNet} className="m-net-val" />
                    </div>
                    <div className="m-net-icon"><Icons.Money /></div>
                  </div>

                  <div className="m-footer">
                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Batal</button>
                    <button type="submit" disabled={isLoading} className="btn-save">
                      {isLoading ? (
                        <><svg className="spin" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" fill="none" strokeWidth="2"/></svg>Menyimpan...</>
                      ) : (
                        <><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Simpan Slip Gaji</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ════ MAIN ════ */}
      <div className="ap-root">
        <div className="ap-header">
          <div className="ap-breadcrumb">
            <span>Admin</span>
            <span className="crumb-sep">›</span>
            <span className="crumb-cur">Manajemen Gaji</span>
          </div>
          <div className="ap-header-row">
            <div>
              <h1 className="ap-title">Rekap <span>Penggajian</span></h1>
              <p className="ap-subtitle">Gaji dihitung berdasarkan jam kerja aktual — angka bergerak otomatis</p>
            </div>
            <span className="live-pill">
              <span className="live-dot" />
              Live · Sync tiap 5 detik
            </span>
          </div>
        </div>

        <div className="metrics-row">
          {[
            { cls:'c-total',   icon:<Icons.Users/>, label:'Total Karyawan',    val: isFirstLoad ? '—' : payrolls.length, sm:false },
            { cls:'c-paid',    icon:<Icons.Check/>, label:'Sudah Lunas',       val: isFirstLoad ? '—' : paidCount,       sm:false },
            { cls:'c-pending', icon:<Icons.Clock/>, label:'Belum Lunas',       val: isFirstLoad ? '—' : pendingCount,    sm:false },
            { cls:'c-payroll', icon:<Icons.Money/>, label:'Est. Total Payroll', val: null,                               sm:true  },
          ].map((m, i) => (
            <div key={i} className={`metric-card ${m.cls}`}>
              <div className="metric-icon" style={{
                background: i===0?'rgba(201,168,124,0.12)':i===1?'rgba(22,163,74,0.1)':i===2?'rgba(217,119,6,0.1)':'rgba(37,99,235,0.1)',
                color: i===0?'#c9a87c':i===1?'#16a34a':i===2?'#d97706':'#2563eb'
              }}>{m.icon}</div>
              <p className="metric-label">{m.label}</p>
              {m.val !== null
                ? <p className={`metric-value ${m.sm ? 'sm' : ''}`}>{m.val}</p>
                : isFirstLoad
                  ? <p className="metric-value sm">—</p>
                  : <AnimatedNumber value={totalEst} className="metric-value sm" />
              }
              {m.cls === 'c-total' && !isFirstLoad && activeCount > 0 && (
                <span className="metric-sub">
                  <span className="metric-sub-dot"/> {activeCount} sedang aktif bekerja
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="ap-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" className="search-input" placeholder="Cari nama karyawan..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="month-picker">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="table-section">
          <div className="table-topbar">
            <div className="table-topbar-left">
              <p className="tbar-title">Rekap Gaji Karyawan</p>
              <span className="tbar-count">
                {isFirstLoad ? '...' : `${filtered.length} karyawan`}
              </span>
            </div>
          </div>

          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Durasi Kerja</th>
                  <th>Gaji Aktual</th>
                  <th>Potongan Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isFirstLoad ? (
                  [0,1,2,3].map(i => (
                    <tr key={i}>
                      <td><div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <Skeleton w={38} h={38} r={50} />
                        <div><Skeleton w={110+i*15} h={13}/><div style={{marginTop:5}}><Skeleton w={75} h={10}/></div></div>
                      </div></td>
                      <td><Skeleton w={85} h={13}/><div style={{marginTop:8}}><Skeleton w={110} h={5} r={5}/></div></td>
                      <td><Skeleton w={150} h={64} r={12}/></td>
                      <td><Skeleton w={115} h={52} r={10}/></td>
                      <td><Skeleton w={85} h={26} r={100}/></td>
                      <td><Skeleton w={95} h={34} r={10}/></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="empty-state">
                    <div className="empty-icon"><Icons.Empty /></div>
                    <p className="empty-text">{searchTerm ? 'Karyawan tidak ditemukan' : 'Tidak ada data penggajian'}</p>
                    <p className="empty-sub">{searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Belum ada karyawan terdaftar bulan ini'}</p>
                  </td></tr>
                ) : (
                  filtered.map((emp, idx) => {
                    const [avBg, avFg]  = getAvatarColor(emp.user_id);
                    const isActive      = Number(emp.is_active) === 1; // Pengecekan aktif bekerja
                    const liveWorked    = getLiveWorked(emp);
                    const liveSal       = getLiveSalary(emp);
                    const perSec        = getPerSec(emp);
                    const base          = Number(emp.base_salary || 0);
                    const potWaktu      = liveWorked < TOTAL_TARGET_SECONDS ? base - liveSal : 0;
                    const progress      = Math.min(100, (liveWorked / TOTAL_TARGET_SECONDS) * 100);
                    const kurang        = Math.max(0, TOTAL_TARGET_SECONDS - liveWorked);
                    const isProcessed   = !!emp.payroll_id;

                    return (
                      <tr key={emp.user_id} style={{ animationDelay:`${idx * 0.04}s` }}>
                        <td>
                          <div className="emp-cell">
                            <div className="emp-avatar" style={{ background:avBg, color:avFg }}>
                              {(emp.name||'?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="emp-name">{emp.name}</p>
                              <p className="emp-shift">{emp.shift_name || 'Tanpa shift'}</p> 
                            </div>
                          </div>
                        </td>

                        <td>
                          <p className="dur-main">{formatDur(liveWorked)}</p>
                          <p className="dur-pct">{progress.toFixed(1)}% dari 208j</p>
                          <div className="dur-bar">
                            <div className={`dur-fill ${progress >= 100 ? 'full' : ''}`} style={{ width:`${progress}%` }} />
                          </div>
                        </td>

                        {/* MODE WARNA: ACTIVE vs OFFLINE */}
                        <td>
                          <div className={`sal-card ${isActive ? 'active' : 'offline'}`}>
                            <p className="sal-live-label">
                              {isActive && <span className="sal-live-dot" />}
                              {isActive ? 'Akumulasi Sekarang' : 'Gaji Terkumpul'}
                            </p>
                            
                            <AnimatedNumber 
                              value={liveSal} 
                              className={`sal-val ${isActive ? 'live-bounce' : ''}`} 
                            />
                            
                            <div>
                              <span className="sal-rate">
                                <svg viewBox="0 0 24 24" width="9" height="9" stroke="currentColor" fill="none" strokeWidth="2.5">
                                  {isActive ? <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/> : <circle cx="12" cy="12" r="10" />}
                                </svg>
                                Rp {perSec.toFixed(2)}/dtk
                              </span>
                            </div>
                          </div>
                          <p className="sal-base">Target Pokok: {formatRp(base)}</p>
                        </td>

                        <td>
                          {potWaktu <= 0 ? (
                            <span className="ded-ok">
                              <Icons.Check /> Jam Penuh
                            </span>
                          ) : (
                            <div className="ded-box">
                              <p className="ded-amount">−{formatRp(potWaktu)}</p>
                              <p className="ded-info">Kurang {formatDurShort(kurang)}<br/>{((kurang/TOTAL_TARGET_SECONDS)*100).toFixed(1)}% dari target</p>
                              <div className="ded-bar">
                                <div className="ded-fill" style={{ width:`${Math.min(100,(potWaktu/base)*100)}%` }} />
                              </div>
                            </div>
                          )}
                        </td>

                        <td>
                          {emp.payroll_status === 'paid'
                            ? <span className="s-badge s-paid"><Icons.Check /> Lunas</span>
                            : emp.payroll_status === 'pending'
                            ? <span className="s-badge s-pending"><Icons.Clock /> Pending</span>
                            : <span className="s-badge s-none">Belum Diproses</span>}
                        </td>

                        <td>
                          <button
                            className={`btn-act ${isProcessed ? 'edit' : 'new'}`}
                            onClick={() => openProcessModal(emp)}
                          >
                            <svg viewBox="0 0 24 24">
                              {isProcessed
                                ? <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                                : <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>}
                            </svg>
                            {isProcessed ? 'Edit Slip' : 'Proses'}
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}