import { useState, useEffect } from 'react';
import axios from 'axios';

/* ─── helpers ─── */
const Skeleton = ({ w = '100%', h = 14, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

const AVATAR_COLORS = [
  ['#c97b3a','#fdf0e3'], ['#1a7a4a','#e6f7ef'], ['#2563eb','#dbeafe'],
  ['#7c3aed','#ede9fe'], ['#c0392b','#fde8e8'], ['#0e7490','#cffafe'],
];
const getAvatarColor = (str = '') => {
  let n = 0;
  for (let i = 0; i < str.length; i++) n += str.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}j ${m}m`;
};

const formatTime = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

export default function AdminAttendance() {
  const [history, setHistory]           = useState([]);
  const [isFetching, setIsFetching]     = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm]     = useState('');

  useEffect(() => { fetchHistory(); }, [selectedMonth]);

  const fetchHistory = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/hr/attendance-history?month=${selectedMonth}`);
      setHistory(res.data);
    } catch {
      /* silent */
    } finally {
      setIsFetching(false);
    }
  };

  const filtered = history.filter(l =>
    l.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* summary counts */
  const ontimeCount  = history.filter(l => l.status === 'ontime').length;
  const lateCount    = history.filter(l => l.status === 'late').length;
  const absentCount  = history.filter(l => l.status === 'sick' || l.status === 'leave').length;
  const activeCount  = history.filter(l => l.clock_in && !l.clock_out).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e;
          --latte:#e8d5b7; --foam:#faf6f0; --milk:#f5ede0;
          --accent:#c97b3a; --text-dim:#8b7355;
        }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes working  { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .att-root {
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){ .att-root{padding:14px} }

        /* ── header ── */
        .page-header { margin-bottom:22px; }
        .page-header h1 { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:var(--espresso); }
        .page-header p  { font-size:13px; color:var(--text-dim); margin-top:4px; }
        .breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-dim); margin-bottom:10px; }
        .breadcrumb span { color:var(--accent); font-weight:600; }
        .breadcrumb svg  { width:12px; height:12px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round; }

        /* ── summary strip ── */
        .summary-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:860px){ .summary-strip{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px){ .summary-strip{ grid-template-columns:1fr 1fr; } }
        .sum-card {
          background:#fff; border-radius:14px; padding:16px 18px;
          box-shadow:0 2px 10px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.05);
          display:flex; align-items:center; gap:13px;
        }
        .sum-icon  { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .sum-label { font-size:11px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:3px; }
        .sum-value { font-size:18px; font-weight:800; color:var(--espresso); line-height:1; }

        /* ── toolbar ── */
        .toolbar { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; justify-content:space-between; }
        .toolbar-left { display:flex; align-items:center; gap:10px; flex:1; flex-wrap:wrap; }

        .search-wrap { position:relative; min-width:180px; max-width:260px; flex:1; }
        .search-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round; pointer-events:none; }
        .search-input {
          width:100%; height:42px; padding:0 12px 0 38px;
          border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--espresso);
          background:var(--foam); outline:none; transition:all 0.2s;
        }
        .search-input:focus { border-color:var(--accent); background:#fff; box-shadow:0 0 0 3px rgba(201,123,58,0.1); }
        .search-input::placeholder { color:#bba890; }

        /* month picker */
        .month-wrap {
          display:flex; align-items:center; gap:8px;
          height:42px; padding:0 14px;
          background:#fff; border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
          transition:all 0.2s;
        }
        .month-wrap:focus-within { border-color:var(--accent); box-shadow:0 0 0 3px rgba(201,123,58,0.1); }
        .month-wrap svg { width:15px; height:15px; stroke:var(--accent); fill:none; stroke-width:2; stroke-linecap:round; flex-shrink:0; }
        .month-input {
          border:none; outline:none; background:transparent;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700;
          color:var(--roast); cursor:pointer;
        }

        /* ── table card ── */
        .table-card {
          background:#fff; border-radius:16px;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.05); overflow:hidden;
        }
        .table-head-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 22px; border-bottom:1px solid rgba(0,0,0,0.06); flex-wrap:wrap; gap:8px;
        }
        .table-title     { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:var(--espresso); }
        .table-title-dot { width:8px; height:8px; border-radius:50%; background:var(--accent); }
        .count-badge { font-size:11px; font-weight:700; background:rgba(201,123,58,0.1); color:var(--accent); padding:3px 10px; border-radius:20px; }
        .active-badge { font-size:11px; font-weight:700; background:rgba(39,174,96,0.1); color:#1a7a4a; padding:3px 10px; border-radius:20px; display:flex; align-items:center; gap:5px; }
        .active-dot { width:6px; height:6px; border-radius:50%; background:#27ae60; animation:working 1.6s infinite; }

        .tbl-scroll { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; min-width:680px; }
        thead tr { background:var(--foam); border-bottom:1px solid rgba(0,0,0,0.07); }
        th { padding:11px 18px; font-size:11px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em; text-align:left; }
        tbody tr { border-bottom:1px solid rgba(0,0,0,0.05); transition:background 0.15s; }
        tbody tr:last-child { border-bottom:none; }
        tbody tr:hover { background:var(--foam); }
        td { padding:13px 18px; font-size:13px; vertical-align:middle; }

        /* ── cells ── */
        .date-cell { }
        .date-day  { font-weight:700; color:var(--espresso); font-size:13px; }
        .date-num  { font-size:11px; color:var(--text-dim); margin-top:2px; }

        .emp-cell  { display:flex; align-items:center; gap:10px; }
        .emp-av    { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; flex-shrink:0; }
        .emp-name  { font-weight:700; color:var(--espresso); font-size:13px; }
        .emp-shift { font-size:10.5px; color:var(--text-dim); margin-top:2px; text-transform:uppercase; letter-spacing:0.06em; }

        .time-pill {
          display:inline-flex; align-items:center; gap:5px;
          font-size:12.5px; font-weight:700; color:var(--roast);
          background:var(--milk); border:1px solid rgba(200,169,126,0.25);
          border-radius:8px; padding:4px 10px;
        }
        .time-pill svg { width:11px; height:11px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round; }
        .time-none { font-size:13px; color:#ccc; font-weight:500; }

        .working-pill {
          display:inline-flex; align-items:center; gap:6px;
          font-size:11.5px; font-weight:700; color:#1a7a4a;
          background:rgba(39,174,96,0.08); border:1px solid rgba(39,174,96,0.2);
          border-radius:20px; padding:4px 11px;
          animation:working 1.8s infinite;
        }
        .working-dot { width:6px; height:6px; border-radius:50%; background:#27ae60; }

        .status-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:20px;
          font-size:11.5px; font-weight:700;
        }
        .status-ontime { background:rgba(39,174,96,0.1);  border:1px solid rgba(39,174,96,0.2);  color:#1e8449; }
        .status-late   { background:rgba(192,57,43,0.1);  border:1px solid rgba(192,57,43,0.2);  color:#c0392b; }
        .status-sick   { background:rgba(230,126,34,0.1); border:1px solid rgba(230,126,34,0.2); color:#a04000; }
        .status-leave  { background:rgba(37,99,235,0.1);  border:1px solid rgba(37,99,235,0.2);  color:#1e40af; }

        /* ── empty ── */
        .empty-cell { padding:56px 20px; text-align:center; }
        .empty-icon { width:52px; height:52px; background:var(--milk); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px; }
        .empty-text { font-size:14px; color:var(--text-dim); font-weight:600; }
        .empty-sub  { font-size:12px; color:#bba890; margin-top:4px; }
      `}</style>

      <div className="att-root">

        {/* ── PAGE HEADER ── */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Riwayat Kehadiran</span>
          </div>
          <h1>Riwayat Kehadiran</h1>
          <p>Pantau jam masuk dan pulang seluruh karyawan secara detail</p>
        </div>

        {/* ── SUMMARY STRIP ── */}
        <div className="summary-strip">
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(201,123,58,0.1)' }}>📋</div>
            <div>
              <p className="sum-label">Total Catatan</p>
              <p className="sum-value">{isFetching ? '—' : history.length}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(39,174,96,0.1)' }}>✅</div>
            <div>
              <p className="sum-label">Tepat Waktu</p>
              <p className="sum-value">{isFetching ? '—' : ontimeCount}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(192,57,43,0.1)' }}>⏰</div>
            <div>
              <p className="sum-label">Terlambat</p>
              <p className="sum-value">{isFetching ? '—' : lateCount}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(230,126,34,0.1)' }}>📝</div>
            <div>
              <p className="sum-label">Izin / Sakit</p>
              <p className="sum-value">{isFetching ? '—' : absentCount}</p>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrap">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text" className="search-input"
                placeholder="Cari nama karyawan..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="month-wrap">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <input
                type="month" className="month-input"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── TABLE CARD ── */}
        <div className="table-card">
          <div className="table-head-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Log Kehadiran
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              {activeCount > 0 && (
                <span className="active-badge">
                  <span className="active-dot" />
                  {activeCount} Sedang Bekerja
                </span>
              )}
              <span className="count-badge">{isFetching ? '...' : `${filtered.length} Catatan`}</span>
            </div>
          </div>

          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Karyawan</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  [0,1,2,3,4].map(i => (
                    <tr key={i}>
                      <td>
                        <Skeleton w={60} h={13} />
                        <div style={{ marginTop:5 }}><Skeleton w={45} h={10} /></div>
                      </td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Skeleton w={34} h={34} r={50} />
                          <div>
                            <Skeleton w={100 + i * 15} h={13} />
                            <div style={{ marginTop:5 }}><Skeleton w={60} h={10} /></div>
                          </div>
                        </div>
                      </td>
                      <td><Skeleton w={80} h={28} r={8} /></td>
                      <td><Skeleton w={80} h={28} r={8} /></td>
                      <td><Skeleton w={90} h={26} r={20} /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      <div className="empty-icon">📋</div>
                      <p className="empty-text">
                        {searchTerm ? 'Karyawan tidak ditemukan' : 'Tidak ada riwayat kehadiran'}
                      </p>
                      <p className="empty-sub">
                        {searchTerm
                          ? `Tidak ada hasil untuk "${searchTerm}"`
                          : 'Belum ada catatan kehadiran untuk bulan ini'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => {
                    const [avBg, avFg] = getAvatarColor(log.user_name);
                    const clockIn  = formatTime(log.clock_in);
                    const clockOut = formatTime(log.clock_out);
                    const [dayName, ...rest] = formatDate(log.date).split(' ');

                    return (
                      <tr key={log.id}>
                        <td className="date-cell">
                          <p className="date-day">{dayName}</p>
                          <p className="date-num">{rest.join(' ')}</p>
                        </td>
                        <td>
                          <div className="emp-cell">
                            <div className="emp-av" style={{ background: avBg, color: avFg }}>
                              {(log.user_name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="emp-name">{log.user_name}</p>
                              <p className="emp-shift">{log.shift_name || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {clockIn ? (
                            <span className="time-pill">
                              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {clockIn}
                            </span>
                          ) : <span className="time-none">—</span>}
                        </td>
                        <td>
                          {clockOut ? (
                            <span className="time-pill">
                              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {clockOut}
                            </span>
                          ) : log.clock_in ? (
                            <span className="working-pill">
                              <span className="working-dot" />
                              Bekerja...
                            </span>
                          ) : <span className="time-none">—</span>}
                        </td>
                        <td>
                          {log.status === 'ontime' && (
                            <span className="status-pill status-ontime">✓ Tepat Waktu</span>
                          )}
                          {log.status === 'late' && (
                            <span className="status-pill status-late">
                              ⏰ Terlambat {formatDuration(log.late_seconds)}
                            </span>
                          )}
                          {log.status === 'sick' && (
                            <span className="status-pill status-sick">
                              🤒 Sakit{log.notes ? ` — ${log.notes}` : ''}
                            </span>
                          )}
                          {log.status === 'leave' && (
                            <span className="status-pill status-leave">
                              📝 Izin{log.notes ? ` — ${log.notes}` : ''}
                            </span>
                          )}
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