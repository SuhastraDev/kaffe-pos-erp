import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

/* ─── helpers ─── */
const Skeleton = ({ w = '100%', h = 14, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

const getDuration = (start, end) => {
  if (!start || !end) return '—';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60), m = diff % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
};

const DOT_COLORS = ['#c97b3a','#2563eb','#1a7a4a','#7c3aed','#c0392b','#0e7490'];

export default function AdminShifts() {
  const [shifts, setShifts]           = useState([]);
  const [isFetching, setIsFetching]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [formData, setFormData]       = useState({ name: '', start_time: '', end_time: '' });

  useEffect(() => { fetchShifts(); }, []);

  const fetchShifts = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get('http://localhost:5000/api/hr/shifts');
      setShifts(res.data);
    } catch {
      toast.error('Gagal mengambil data shift');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/hr/shifts', formData);
      toast.success('Shift baru berhasil ditambahkan!');
      setFormData({ name: '', start_time: '', end_time: '' });
      setIsModalOpen(false);
      fetchShifts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan shift');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered      = shifts.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const morningCount  = shifts.filter(s => parseInt(s.start_time) < 12).length;
  const afternoonCount = shifts.filter(s => parseInt(s.start_time) >= 12).length;
  const previewDuration = getDuration(formData.start_time, formData.end_time);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e;
          --latte:#e8d5b7; --foam:#faf6f0; --milk:#f5ede0;
          --accent:#c97b3a; --text-dim:#8b7355;
        }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .shift-root {
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){ .shift-root{padding:14px} }

        /* ── header ── */
        .page-header { margin-bottom:22px; }
        .page-header h1 { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:var(--espresso); }
        .page-header p  { font-size:13px; color:var(--text-dim); margin-top:4px; }
        .breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-dim); margin-bottom:10px; }
        .breadcrumb span { color:var(--accent); font-weight:600; }
        .breadcrumb svg  { width:12px; height:12px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round; }

        /* ── summary strip ── */
        .summary-strip { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
        @media(max-width:640px){ .summary-strip{ grid-template-columns:1fr 1fr; } }
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
        .search-wrap { position:relative; flex:1; min-width:180px; max-width:280px; }
        .search-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round; pointer-events:none; }
        .search-input {
          width:100%; height:42px; padding:0 12px 0 38px;
          border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--espresso);
          background:var(--foam); outline:none; transition:all 0.2s;
        }
        .search-input:focus { border-color:var(--accent); background:#fff; box-shadow:0 0 0 3px rgba(201,123,58,0.1); }
        .search-input::placeholder { color:#bba890; }

        .btn-add {
          height:42px; padding:0 18px;
          background:var(--espresso); border:none; border-radius:10px;
          color:var(--crema); font-family:'DM Sans',sans-serif;
          font-size:13px; font-weight:700; cursor:pointer;
          display:flex; align-items:center; gap:7px;
          transition:opacity 0.2s;
          box-shadow:0 3px 10px rgba(26,15,10,0.25);
        }
        .btn-add:hover { opacity:0.87; }
        .btn-add svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.2; stroke-linecap:round; }

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
        .count-badge     { font-size:11px; font-weight:700; background:rgba(201,123,58,0.1); color:var(--accent); padding:3px 10px; border-radius:20px; }

        .tbl-scroll { overflow-x:auto; }
        table  { width:100%; border-collapse:collapse; min-width:520px; }
        thead tr { background:var(--foam); border-bottom:1px solid rgba(0,0,0,0.07); }
        th { padding:11px 18px; font-size:11px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em; text-align:left; }
        tbody tr { border-bottom:1px solid rgba(0,0,0,0.05); transition:background 0.15s; }
        tbody tr:last-child { border-bottom:none; }
        tbody tr:hover { background:var(--foam); }
        td { padding:14px 18px; font-size:13px; vertical-align:middle; }

        /* ── cells ── */
        .id-badge {
          font-size:11.5px; font-weight:700; color:var(--text-dim);
          background:var(--milk); border:1px solid rgba(200,169,126,0.25);
          border-radius:6px; padding:3px 8px; display:inline-block;
        }
        .shift-name-cell { display:flex; align-items:center; gap:10px; }
        .shift-color-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
        .shift-name      { font-weight:700; color:var(--espresso); font-size:13.5px; }

        .badge-time {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 11px; border-radius:20px;
          font-size:12px; font-weight:700;
        }
        .badge-time svg { width:11px; height:11px; stroke:currentColor; fill:none; stroke-width:2.2; stroke-linecap:round; }
        .badge-start { background:rgba(39,174,96,0.1);  border:1px solid rgba(39,174,96,0.2);  color:#1e8449; }
        .badge-end   { background:rgba(192,57,43,0.1);  border:1px solid rgba(192,57,43,0.2);  color:#c0392b; }
        .duration-text { font-size:12.5px; color:var(--text-dim); font-weight:600; }

        /* ── empty ── */
        .empty-cell { padding:56px 20px; text-align:center; }
        .empty-icon { width:52px; height:52px; background:var(--milk); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px; }
        .empty-text { font-size:14px; color:var(--text-dim); font-weight:600; }
        .empty-sub  { font-size:12px; color:#bba890; margin-top:4px; }

        /* ── modal ── */
        .modal-overlay {
          position:fixed; inset:0;
          background:rgba(10,5,2,0.55); backdrop-filter:blur(3px);
          z-index:100; display:flex; align-items:center; justify-content:center; padding:16px;
        }
        .modal-box {
          background:#fff; border-radius:20px;
          width:100%; max-width:420px;
          box-shadow:0 24px 64px rgba(0,0,0,0.28);
          animation:modalIn 0.25s ease; overflow:hidden;
        }
        .modal-top {
          padding:20px 24px 16px;
          border-bottom:1px solid rgba(0,0,0,0.07);
          display:flex; align-items:center; justify-content:space-between;
        }
        .modal-top-left { display:flex; align-items:center; gap:12px; }
        .modal-icon {
          width:42px; height:42px; border-radius:12px; flex-shrink:0;
          background:linear-gradient(135deg, var(--accent), var(--crema));
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 12px rgba(201,123,58,0.3);
        }
        .modal-icon svg { width:18px; height:18px; stroke:#fff; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
        .modal-title { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:var(--espresso); }
        .modal-sub   { font-size:11px; color:var(--text-dim); margin-top:2px; }
        .modal-close {
          width:32px; height:32px; border-radius:50%;
          background:var(--foam); border:1px solid rgba(0,0,0,0.1);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; font-size:14px; color:var(--text-dim); transition:all 0.2s;
        }
        .modal-close:hover { background:var(--milk); }
        .modal-body { padding:22px 24px 24px; }

        .field { margin-bottom:16px; }
        .field label {
          display:block; font-size:11px; font-weight:700;
          color:var(--text-dim); text-transform:uppercase; letter-spacing:0.09em; margin-bottom:7px;
        }
        .f-input {
          width:100%; height:44px; padding:0 14px;
          border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--espresso);
          background:var(--foam); outline:none; transition:all 0.2s;
        }
        .f-input:focus { border-color:var(--accent); background:#fff; box-shadow:0 0 0 3px rgba(201,123,58,0.1); }
        .f-input::placeholder { color:#bba890; }
        input[type="time"].f-input { cursor:pointer; }

        .time-row-modal { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }

        .duration-preview {
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(201,123,58,0.06); border:1px solid rgba(201,123,58,0.15);
          border-radius:10px; padding:10px 14px; margin-bottom:16px;
        }
        .duration-preview-label { font-size:11px; color:var(--text-dim); font-weight:600; }
        .duration-preview-val   { font-size:16px; font-weight:800; color:var(--accent); }

        .modal-footer { display:flex; gap:10px; margin-top:4px; padding-top:18px; border-top:1px solid rgba(0,0,0,0.07); }
        .btn-cancel {
          flex:1; height:44px; border-radius:10px;
          background:var(--foam); border:1.5px solid rgba(0,0,0,0.1);
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600; color:#666;
          cursor:pointer; transition:all 0.2s;
        }
        .btn-cancel:hover { background:var(--milk); }
        .btn-save {
          flex:2; height:44px; border-radius:10px;
          background:var(--espresso); border:none; color:var(--crema);
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600;
          cursor:pointer; transition:opacity 0.2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn-save:hover    { opacity:0.88; }
        .btn-save:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-save svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; }
      `}</style>

      <div className="shift-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 13 } }} />

        {/* ── MODAL ── */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-top">
                <div className="modal-top-left">
                  <div className="modal-icon">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="modal-title">Tambah Shift Baru</p>
                    <p className="modal-sub">Atur nama dan jam kerja shift</p>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label>Nama Shift</label>
                    <input
                      type="text" className="f-input"
                      placeholder="Cth: Shift Pagi, Shift Sore…"
                      value={formData.name} required
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div className="time-row-modal">
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:7 }}>Jam Masuk</label>
                      <input
                        type="time" className="f-input"
                        value={formData.start_time} required
                        onChange={e => setFormData(p => ({ ...p, start_time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:7 }}>Jam Pulang</label>
                      <input
                        type="time" className="f-input"
                        value={formData.end_time} required
                        onChange={e => setFormData(p => ({ ...p, end_time: e.target.value }))}
                      />
                    </div>
                  </div>

                  {formData.start_time && formData.end_time && (
                    <div className="duration-preview">
                      <span className="duration-preview-label">Durasi Shift</span>
                      <span className="duration-preview-val">{previewDuration}</span>
                    </div>
                  )}

                  <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Batal</button>
                    <button type="submit" disabled={isLoading} className="btn-save">
                      {isLoading ? (
                        <>
                          <svg viewBox="0 0 24 24" style={{ animation:'spin 1s linear infinite' }}>
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" fill="none" strokeWidth="2"/>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          Simpan Shift
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE HEADER ── */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Manajemen Shift</span>
          </div>
          <h1>Manajemen Shift</h1>
          <p>Atur jam kerja operasional untuk karyawan Anda</p>
        </div>

        {/* ── SUMMARY STRIP ── */}
        <div className="summary-strip">
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(201,123,58,0.1)' }}>🕐</div>
            <div>
              <p className="sum-label">Total Shift</p>
              <p className="sum-value">{isFetching ? '—' : shifts.length}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(39,174,96,0.1)' }}>🌅</div>
            <div>
              <p className="sum-label">Shift Pagi</p>
              <p className="sum-value">{isFetching ? '—' : morningCount}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(37,99,235,0.1)' }}>🌆</div>
            <div>
              <p className="sum-label">Sore / Malam</p>
              <p className="sum-value">{isFetching ? '—' : afternoonCount}</p>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" className="search-input"
              placeholder="Cari nama shift..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn-add"
            onClick={() => { setFormData({ name:'', start_time:'', end_time:'' }); setIsModalOpen(true); }}
          >
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Shift
          </button>
        </div>

        {/* ── TABLE CARD ── */}
        <div className="table-card">
          <div className="table-head-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Daftar Shift Aktif
            </div>
            <span className="count-badge">{isFetching ? '...' : `${filtered.length} Shift`}</span>
          </div>

          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Shift</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Durasi</th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  [0,1,2].map(i => (
                    <tr key={i}>
                      <td><Skeleton w={40} h={24} r={6} /></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Skeleton w={9} h={9} r={50} />
                          <Skeleton w={100 + i * 20} h={13} />
                        </div>
                      </td>
                      <td><Skeleton w={80} h={24} r={20} /></td>
                      <td><Skeleton w={80} h={24} r={20} /></td>
                      <td><Skeleton w={55} h={13} /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      <div className="empty-icon">🕐</div>
                      <p className="empty-text">
                        {searchTerm ? 'Shift tidak ditemukan' : 'Belum ada data shift'}
                      </p>
                      <p className="empty-sub">
                        {searchTerm
                          ? `Tidak ada hasil untuk "${searchTerm}"`
                          : 'Tambahkan shift pertama dengan tombol "Tambah Shift"'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((shift, idx) => (
                    <tr key={shift.id}>
                      <td><span className="id-badge">#{shift.id}</span></td>
                      <td>
                        <div className="shift-name-cell">
                          <span className="shift-color-dot" style={{ background: DOT_COLORS[idx % DOT_COLORS.length] }} />
                          <span className="shift-name">{shift.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-time badge-start">
                          <svg viewBox="0 0 24 24"><polyline points="5 12 12 5 19 12"/></svg>
                          {shift.start_time}
                        </span>
                      </td>
                      <td>
                        <span className="badge-time badge-end">
                          <svg viewBox="0 0 24 24"><polyline points="19 12 12 19 5 12"/></svg>
                          {shift.end_time}
                        </span>
                      </td>
                      <td>
                        <span className="duration-text">{getDuration(shift.start_time, shift.end_time)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}