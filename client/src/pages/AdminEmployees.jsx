import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const formatRp = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');

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
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

export default function AdminEmployees() {
  const [employees, setEmployees]   = useState([]);
  const [shifts, setShifts]         = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [formData, setFormData]     = useState({ shift_id: '', base_salary: 0 });
  const [isLoading, setIsLoading]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [empRes, shiftRes] = await Promise.all([
        axios.get('http://localhost:5000/api/hr/employees'),
        axios.get('http://localhost:5000/api/hr/shifts'),
      ]);
      setEmployees(empRes.data);
      setShifts(shiftRes.data);
    } catch {
      toast.error('Gagal mengambil data SDM');
    } finally {
      setIsFetching(false);
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmp(emp);
    setFormData({ shift_id: emp.shift_id || '', base_salary: emp.base_salary || 0 });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/hr/employees/${selectedEmp.id}`, formData);
      toast.success(`Data ${selectedEmp.name} diperbarui!`);
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error('Gagal memperbarui karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const noShiftCount  = employees.filter(e => !e.shift_id).length;
  const avgSalary     = employees.length
    ? Math.round(employees.reduce((s, e) => s + Number(e.base_salary), 0) / employees.length)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e;
          --latte:#e8d5b7; --foam:#faf6f0; --milk:#f5ede0;
          --accent:#c97b3a; --text-dim:#8b7355;
        }
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .emp-root{
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){.emp-root{padding:14px}}

        /* header */
        .page-header{margin-bottom:22px;}
        .page-header h1{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--espresso);}
        .page-header p{font-size:13px;color:var(--text-dim);margin-top:4px;}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-dim);margin-bottom:10px;}
        .breadcrumb span{color:var(--accent);font-weight:600;}
        .breadcrumb svg{width:12px;height:12px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;}

        /* summary */
        .summary-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;}
        @media(max-width:640px){.summary-strip{grid-template-columns:1fr 1fr;}}
        .sum-card{
          background:#fff;border-radius:14px;padding:16px 18px;
          box-shadow:0 2px 10px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.05);
          display:flex;align-items:center;gap:13px;
        }
        .sum-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .sum-label{font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;}
        .sum-value{font-size:18px;font-weight:800;color:var(--espresso);line-height:1;}

        /* toolbar */
        .toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
        .search-wrap{position:relative;flex:1;min-width:180px;max-width:280px;}
        .search-wrap svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;pointer-events:none;}
        .search-input{
          width:100%;height:42px;padding:0 12px 0 38px;
          border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--espresso);
          background:var(--foam);outline:none;transition:all 0.2s;
        }
        .search-input:focus{border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px rgba(201,123,58,0.1);}
        .search-input::placeholder{color:#bba890;}

        /* table card */
        .table-card{
          background:#fff;border-radius:16px;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.05);overflow:hidden;
        }
        .table-head-bar{
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 22px;border-bottom:1px solid rgba(0,0,0,0.06);flex-wrap:wrap;gap:8px;
        }
        .table-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--espresso);}
        .table-title-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);}
        .count-badge{font-size:11px;font-weight:700;background:rgba(201,123,58,0.1);color:var(--accent);padding:3px 10px;border-radius:20px;}
        .warn-badge{font-size:11px;font-weight:700;background:rgba(230,126,34,0.1);color:#a04000;padding:3px 10px;border-radius:20px;}

        .tbl-scroll{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:620px;}
        thead tr{background:var(--foam);border-bottom:1px solid rgba(0,0,0,0.07);}
        th{padding:11px 18px;font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;text-align:left;}
        th:last-child{text-align:right;}
        tbody tr{border-bottom:1px solid rgba(0,0,0,0.05);transition:background 0.15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--foam);}
        td{padding:14px 18px;font-size:13px;vertical-align:middle;}

        /* employee cell */
        .emp-cell{display:flex;align-items:center;gap:11px;}
        .emp-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0;}
        .emp-name{font-weight:700;color:var(--espresso);font-size:13.5px;}
        .emp-role{font-size:11px;color:var(--text-dim);margin-top:2px;text-transform:capitalize;}

        /* shift pill */
        .shift-pill{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(37,99,235,0.1);color:#2563eb;
        }
        .shift-none{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 11px;border-radius:20px;font-size:11px;font-weight:600;
          background:rgba(0,0,0,0.05);color:var(--text-dim);
        }
        .shift-dot{width:5px;height:5px;border-radius:50%;background:#2563eb;}

        .time-text{font-size:12.5px;color:var(--text-dim);font-weight:500;}
        .salary-val{font-size:13.5px;font-weight:800;color:#1a7a4a;}

        .btn-edit{
          display:inline-flex;align-items:center;gap:5px;
          padding:7px 14px;border-radius:8px;
          background:rgba(201,123,58,0.1);border:1px solid rgba(201,123,58,0.2);
          color:var(--accent);font-size:12px;font-weight:600;
          cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;
        }
        .btn-edit:hover{background:rgba(201,123,58,0.2);}
        .btn-edit svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

        .empty-cell{padding:56px 20px;text-align:center;}
        .empty-icon{width:52px;height:52px;background:var(--milk);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;}
        .empty-text{font-size:14px;color:var(--text-dim);font-weight:600;}
        .empty-sub{font-size:12px;color:#bba890;margin-top:4px;}

        /* ── MODAL ── */
        .modal-overlay{
          position:fixed;inset:0;
          background:rgba(10,5,2,0.55);backdrop-filter:blur(3px);
          z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;
        }
        .modal-box{
          background:#fff;border-radius:20px;
          width:100%;max-width:440px;
          box-shadow:0 24px 64px rgba(0,0,0,0.28);
          animation:modalIn 0.25s ease;overflow:hidden;
        }
        .modal-top{
          padding:20px 24px 16px;
          border-bottom:1px solid rgba(0,0,0,0.07);
          display:flex;align-items:center;justify-content:space-between;
        }
        .modal-user-cell{display:flex;align-items:center;gap:12px;}
        .modal-av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;flex-shrink:0;}
        .modal-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--espresso);}
        .modal-sub{font-size:11px;color:var(--text-dim);margin-top:2px;}
        .modal-close{
          width:32px;height:32px;border-radius:50%;
          background:var(--foam);border:1px solid rgba(0,0,0,0.1);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;font-size:14px;color:var(--text-dim);transition:all 0.2s;
        }
        .modal-close:hover{background:var(--milk);}
        .modal-body{padding:22px 24px 24px;}

        .field{margin-bottom:16px;}
        .field label{
          display:block;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:7px;
        }
        .f-select,.f-input{
          width:100%;height:44px;padding:0 14px;
          border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--espresso);
          background:var(--foam);outline:none;transition:all 0.2s;
        }
        .f-select:focus,.f-input:focus{
          border-color:var(--accent);background:#fff;
          box-shadow:0 0 0 3px rgba(201,123,58,0.1);
        }
        .f-input::placeholder{color:#bba890;}
        .f-select{
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b7355' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat:no-repeat;background-position:right 13px center;padding-right:36px;
        }

        .salary-preview{
          display:flex;align-items:center;justify-content:space-between;
          background:rgba(39,174,96,0.06);border:1px solid rgba(39,174,96,0.15);
          border-radius:10px;padding:10px 14px;margin-top:8px;
        }
        .salary-preview p:first-child{font-size:11px;color:var(--text-dim);font-weight:600;}
        .salary-preview p:last-child{font-size:16px;font-weight:800;color:#1a7a4a;}

        .modal-footer{display:flex;gap:10px;margin-top:20px;padding-top:18px;border-top:1px solid rgba(0,0,0,0.07);}
        .btn-cancel{
          flex:1;height:44px;border-radius:10px;
          background:var(--foam);border:1.5px solid rgba(0,0,0,0.1);
          font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;color:#666;
          cursor:pointer;transition:all 0.2s;
        }
        .btn-cancel:hover{background:var(--milk);}
        .btn-save{
          flex:2;height:44px;border-radius:10px;
          background:var(--espresso);border:none;color:var(--crema);
          font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;
          cursor:pointer;transition:opacity 0.2s;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .btn-save:hover{opacity:0.88;}
        .btn-save:disabled{opacity:0.5;cursor:not-allowed;}
        .btn-save svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}
      `}</style>

      <div className="emp-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 13 } }} />

        {/* Modal */}
        {isModalOpen && selectedEmp && (() => {
          const [avBg, avFg] = getAvatarColor(selectedEmp.id);
          return (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-top">
                  <div className="modal-user-cell">
                    <div className="modal-av" style={{ background: avBg, color: avFg }}>
                      {selectedEmp.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="modal-title">{selectedEmp.name}</p>
                      <p className="modal-sub">Atur shift & gaji pokok</p>
                    </div>
                  </div>
                  <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleUpdate}>
                    <div className="field">
                      <label>Shift Aktif</label>
                      <select className="f-select" value={formData.shift_id}
                        onChange={e => setFormData(p => ({ ...p, shift_id: e.target.value }))}>
                        <option value="">— Tanpa Shift —</option>
                        {shifts.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.start_time} – {s.end_time})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Gaji Pokok (Rp)</label>
                      <input type="number" className="f-input"
                        value={formData.base_salary} placeholder="Contoh: 3000000"
                        onChange={e => setFormData(p => ({ ...p, base_salary: e.target.value }))} />
                      {formData.base_salary > 0 && (
                        <div className="salary-preview">
                          <p>Preview Gaji</p>
                          <p>{formatRp(formData.base_salary)}</p>
                        </div>
                      )}
                    </div>
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
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Manajemen SDM</span>
          </div>
          <h1>Manajemen SDM</h1>
          <p>Atur penempatan shift dan gaji pokok karyawan</p>
        </div>

        {/* Summary */}
        <div className="summary-strip">
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(201,123,58,0.1)' }}>👥</div>
            <div>
              <p className="sum-label">Total Karyawan</p>
              <p className="sum-value">{isFetching ? '—' : employees.length}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(37,99,235,0.1)' }}>🕐</div>
            <div>
              <p className="sum-label">Punya Shift</p>
              <p className="sum-value">{isFetching ? '—' : employees.length - noShiftCount}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(39,174,96,0.1)' }}>💰</div>
            <div>
              <p className="sum-label">Rata-rata Gaji</p>
              <p className="sum-value" style={{ fontSize:14 }}>{isFetching ? '—' : formatRp(avgSalary)}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" className="search-input"
              placeholder="Cari nama karyawan..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-head-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Daftar Karyawan
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {noShiftCount > 0 && <span className="warn-badge">⚠️ {noShiftCount} Belum ada shift</span>}
              <span className="count-badge">{isFetching ? '...' : `${filtered.length} Karyawan`}</span>
            </div>
          </div>

          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Shift Aktif</th>
                  <th>Jam Kerja</th>
                  <th>Gaji Pokok / Bulan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  [0,1,2,3].map(i => (
                    <tr key={i}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                          <Skeleton w={36} h={36} r={50} />
                          <div>
                            <Skeleton w={100+i*20} h={13} />
                            <div style={{ marginTop:5 }}><Skeleton w={60} h={10} /></div>
                          </div>
                        </div>
                      </td>
                      <td><Skeleton w={80} h={24} r={20} /></td>
                      <td><Skeleton w={90} h={13} /></td>
                      <td><Skeleton w={100} h={13} /></td>
                      <td style={{ textAlign:'right' }}><Skeleton w={80} h={30} r={8} /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="empty-cell">
                    <div className="empty-icon">👤</div>
                    <p className="empty-text">{searchTerm ? 'Karyawan tidak ditemukan' : 'Belum ada data karyawan'}</p>
                    <p className="empty-sub">{searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Data muncul setelah user kasir terdaftar'}</p>
                  </td></tr>
                ) : filtered.map(emp => {
                  const [avBg, avFg] = getAvatarColor(emp.id);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="emp-cell">
                          <div className="emp-av" style={{ background: avBg, color: avFg }}>
                            {emp.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="emp-name">{emp.name}</p>
                            <p className="emp-role">{emp.role || 'kasir'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {emp.shift_name ? (
                          <span className="shift-pill">
                            <span className="shift-dot" />{emp.shift_name}
                          </span>
                        ) : (
                          <span className="shift-none">Belum Diatur</span>
                        )}
                      </td>
                      <td>
                        <span className="time-text">
                          {emp.start_time ? `${emp.start_time} – ${emp.end_time}` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="salary-val">{formatRp(emp.base_salary)}</span>
                      </td>
                      <td style={{ textAlign:'right' }}>
                        <button className="btn-edit" onClick={() => openEditModal(emp)}>
                          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Atur SDM
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}