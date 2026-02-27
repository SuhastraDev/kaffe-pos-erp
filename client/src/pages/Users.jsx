import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Skeleton = ({ w = '100%', h = 14, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

const AVATAR_COLORS = [
  ['#c97b3a','#e8d5b7'], ['#1a7a4a','#d4f0e0'], ['#5a3fac','#e0d9f5'],
  ['#1a6a9a','#d0eaf8'], ['#a04000','#fde8d0'], ['#7a3a4a','#f5d5db'],
];

const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

export default function Users() {
  const [users, setUsers]           = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId]         = useState(null);
  const [showPass, setShowPass]     = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'kasir', is_active: true
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch { toast.error('Gagal memuat data user'); }
    finally { setIsFetching(false); }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', password: '', role: 'kasir', is_active: true });
    setEditId(null); setShowPass(false); setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setFormData({ name: u.name, email: u.email, password: '', role: u.role, is_active: u.is_active });
    setEditId(u.id); setShowPass(false); setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !formData.password) {
      toast.error('Password wajib diisi untuk user baru!'); return;
    }
    setIsLoading(true);
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/users/${editId}`, {
          name: formData.name, role: formData.role, is_active: formData.is_active
        });
        toast.success('User berhasil diperbarui!');
      } else {
        await axios.post('http://localhost:5000/api/users', formData);
        toast.success('User berhasil ditambahkan!');
      }
      handleCloseModal(); fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setIsLoading(false); }
  };

  const filtered = users.filter(u =>
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole === 'all' || u.role === filterRole)
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const kasirCount = users.filter(u => u.role === 'kasir').length;
  const activeCount = users.filter(u => u.is_active).length;

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
        @keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .usr-root{
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){.usr-root{padding:14px}}

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
        .sum-value{font-size:20px;font-weight:800;color:var(--espresso);line-height:1;}

        /* toolbar */
        .toolbar{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
        .search-wrap{position:relative;flex:1;min-width:180px;max-width:300px;}
        .search-wrap svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;pointer-events:none;}
        .search-input{
          width:100%;height:42px;padding:0 12px 0 38px;
          border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--espresso);
          background:var(--foam);outline:none;transition:all 0.2s;
        }
        .search-input:focus{border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px rgba(201,123,58,0.1);}
        .search-input::placeholder{color:#bba890;}

        .filter-group{display:flex;gap:6px;}
        .filter-btn{
          height:42px;padding:0 15px;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
          border:1.5px solid rgba(0,0,0,0.1);cursor:pointer;transition:all 0.2s;
          background:var(--foam);color:var(--text-dim);white-space:nowrap;
        }
        .filter-btn:hover{background:var(--milk);}
        .filter-btn.active{background:var(--espresso);color:var(--crema);border-color:var(--espresso);}

        .btn-add{
          display:flex;align-items:center;gap:8px;
          height:42px;padding:0 20px;
          background:var(--espresso);color:var(--crema);
          border:none;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;
          cursor:pointer;transition:opacity 0.2s;white-space:nowrap;margin-left:auto;
        }
        .btn-add:hover{opacity:0.85;}
        .btn-add svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;}

        /* table */
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

        .tbl-scroll{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:580px;}
        thead tr{background:var(--foam);border-bottom:1px solid rgba(0,0,0,0.07);}
        th{
          padding:11px 18px;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;text-align:left;
        }
        th:last-child{text-align:right;}
        tbody tr{border-bottom:1px solid rgba(0,0,0,0.05);transition:background 0.15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--foam);}
        td{padding:14px 18px;font-size:13px;vertical-align:middle;}

        /* user cell */
        .user-cell{display:flex;align-items:center;gap:11px;}
        .user-av{
          width:38px;height:38px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;font-weight:800;flex-shrink:0;
        }
        .user-name{font-weight:700;color:var(--espresso);font-size:13.5px;}
        .user-email{font-size:11.5px;color:var(--text-dim);margin-top:2px;}

        /* role badge */
        .role-admin{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(108,75,202,0.1);color:#5a3fac;
        }
        .role-kasir{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(201,123,58,0.1);color:var(--accent);
        }
        .role-dot{width:5px;height:5px;border-radius:50%;}
        .dot-admin{background:#5a3fac;}
        .dot-kasir{background:var(--accent);}

        /* status */
        .status-on{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(39,174,96,0.1);color:#1a7a4a;}
        .status-off{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(192,57,43,0.1);color:#c0392b;}
        .sdot{width:5px;height:5px;border-radius:50%;}
        .sdot-on{background:#27ae60;}
        .sdot-off{background:#c0392b;}

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

        /* ─── MODAL ─── */
        .modal-overlay{
          position:fixed;inset:0;
          background:rgba(10,5,2,0.55);backdrop-filter:blur(3px);
          z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;
        }
        .modal-box{
          background:#fff;border-radius:20px;
          width:100%;max-width:460px;
          box-shadow:0 24px 64px rgba(0,0,0,0.28);
          animation:modalIn 0.25s ease;overflow:hidden;
        }
        .modal-top{
          padding:22px 24px 18px;
          border-bottom:1px solid rgba(0,0,0,0.07);
          display:flex;align-items:center;justify-content:space-between;
        }
        .modal-title{
          font-family:'Playfair Display',serif;
          font-size:18px;font-weight:700;color:var(--espresso);
          display:flex;align-items:center;gap:10px;
        }
        .modal-badge{
          font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          background:rgba(201,123,58,0.12);color:var(--accent);
          padding:3px 9px;border-radius:20px;
        }
        .modal-close{
          width:32px;height:32px;border-radius:50%;
          background:var(--foam);border:1px solid rgba(0,0,0,0.1);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;font-size:15px;color:var(--text-dim);transition:all 0.2s;
        }
        .modal-close:hover{background:var(--milk);color:var(--espresso);}
        .modal-body{padding:22px 24px 24px;}

        .field{margin-bottom:16px;}
        .field label{
          display:block;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:7px;
        }
        .f-input,.f-select{
          width:100%;height:44px;padding:0 14px;
          border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--espresso);
          background:var(--foam);outline:none;transition:all 0.2s;
        }
        .f-input:focus,.f-select:focus{
          border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px rgba(201,123,58,0.1);
        }
        .f-input::placeholder{color:#bba890;}
        .f-input:disabled{background:var(--milk);color:var(--text-dim);cursor:not-allowed;}
        .f-select{
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b7355' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat:no-repeat;background-position:right 13px center;padding-right:36px;
        }

        /* password field with show/hide */
        .pass-wrap{position:relative;}
        .pass-wrap .f-input{padding-right:44px;}
        .pass-eye{
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          width:20px;height:20px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
        }
        .pass-eye svg{width:16px;height:16px;stroke:var(--text-dim);fill:none;stroke-width:1.8;stroke-linecap:round;}
        .pass-eye:hover svg{stroke:var(--accent);}

        .disabled-note{
          display:flex;align-items:center;gap:6px;
          font-size:11px;color:var(--text-dim);margin-top:6px;
        }
        .disabled-note svg{width:12px;height:12px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;flex-shrink:0;}

        /* status toggle */
        .toggle-row{
          display:flex;align-items:center;justify-content:space-between;
          background:var(--foam);border:1.5px solid rgba(0,0,0,0.08);
          border-radius:10px;padding:12px 16px;
        }
        .toggle-info p:first-child{font-size:13px;font-weight:600;color:var(--espresso);}
        .toggle-info p:last-child{font-size:11px;color:var(--text-dim);margin-top:2px;}
        .toggle-switch{
          width:44px;height:24px;border-radius:12px;border:none;
          cursor:pointer;transition:background 0.25s;position:relative;flex-shrink:0;
        }
        .toggle-switch::after{
          content:'';position:absolute;top:3px;left:3px;
          width:18px;height:18px;border-radius:50%;background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.2);transition:transform 0.25s;
        }
        .t-on{background:var(--accent);}
        .t-on::after{transform:translateX(20px);}
        .t-off{background:#d1cdc8;}

        /* section divider */
        .section-divider{
          display:flex;align-items:center;gap:10px;
          font-size:11px;font-weight:700;color:var(--text-dim);
          text-transform:uppercase;letter-spacing:0.08em;
          margin:18px 0 14px;
        }
        .section-divider::before,.section-divider::after{
          content:'';flex:1;height:1px;background:rgba(0,0,0,0.08);
        }

        /* modal footer */
        .modal-footer{display:flex;gap:10px;margin-top:22px;padding-top:18px;border-top:1px solid rgba(0,0,0,0.07);}
        .btn-modal-cancel{
          flex:1;height:44px;border-radius:10px;
          background:var(--foam);border:1.5px solid rgba(0,0,0,0.1);
          font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;color:#666;
          cursor:pointer;transition:all 0.2s;
        }
        .btn-modal-cancel:hover{background:var(--milk);}
        .btn-modal-save{
          flex:2;height:44px;border-radius:10px;
          background:var(--espresso);border:none;color:var(--crema);
          font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;
          cursor:pointer;transition:opacity 0.2s;
          display:flex;align-items:center;justify-content:center;gap:8px;
        }
        .btn-modal-save:hover{opacity:0.88;}
        .btn-modal-save:disabled{opacity:0.5;cursor:not-allowed;}
        .btn-modal-save svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}
      `}</style>

      <div className="usr-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 13 } }} />

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-top">
                <div className="modal-title">
                  {editId ? 'Edit User' : 'User Baru'}
                  {editId && <span className="modal-badge">Edit</span>}
                </div>
                <button className="modal-close" onClick={handleCloseModal}>✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>

                  {/* Info Section */}
                  <div className="section-divider">Informasi Akun</div>

                  <div className="field">
                    <label>Nama Lengkap *</label>
                    <input type="text" name="name" required value={formData.name}
                      onChange={handleInputChange} placeholder="Contoh: Budi Santoso" className="f-input" />
                  </div>

                  <div className="field">
                    <label>Email *</label>
                    <input type="email" name="email" required disabled={!!editId}
                      value={formData.email} onChange={handleInputChange}
                      placeholder="budi@kafe.com" className="f-input" />
                    {editId && (
                      <p className="disabled-note">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Email tidak bisa diubah setelah akun dibuat
                      </p>
                    )}
                  </div>

                  {!editId && (
                    <div className="field">
                      <label>Password *</label>
                      <div className="pass-wrap">
                        <input type={showPass ? 'text' : 'password'} name="password" required
                          value={formData.password} onChange={handleInputChange}
                          placeholder="Min. 6 karakter" className="f-input" />
                        <span className="pass-eye" onClick={() => setShowPass(p => !p)}>
                          {showPass
                            ? <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Role & Status Section */}
                  <div className="section-divider">Hak Akses</div>

                  <div className="field">
                    <label>Role Akun</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="f-select">
                      <option value="kasir">👤 Kasir — Akses ke POS & Transaksi</option>
                      <option value="admin">🛡️ Admin — Akses Penuh ke Semua Fitur</option>
                    </select>
                  </div>

                  {editId && (
                    <div className="field">
                      <label>Status Akun</label>
                      <div className="toggle-row">
                        <div className="toggle-info">
                          <p>Akun {formData.is_active ? 'Aktif' : 'Nonaktif'}</p>
                          <p>{formData.is_active ? 'User bisa login dan menggunakan sistem' : 'User tidak bisa login'}</p>
                        </div>
                        <button
                          type="button"
                          className={`toggle-switch ${formData.is_active ? 't-on' : 't-off'}`}
                          onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="modal-footer">
                    <button type="button" className="btn-modal-cancel" onClick={handleCloseModal}>Batal</button>
                    <button type="submit" disabled={isLoading} className="btn-modal-save">
                      {isLoading ? (
                        <>
                          <svg viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" fill="none" strokeWidth="2"/>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                          {editId ? 'Update User' : 'Buat User'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Manajemen User</span>
          </div>
          <h1>Manajemen User</h1>
          <p>Kelola akun admin dan kasir yang memiliki akses ke sistem</p>
        </div>

        {/* Summary Strip */}
        <div className="summary-strip">
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(201,123,58,0.1)' }}>👥</div>
            <div>
              <p className="sum-label">Total User</p>
              <p className="sum-value">{isFetching ? '—' : users.length}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(108,75,202,0.1)' }}>🛡️</div>
            <div>
              <p className="sum-label">Admin</p>
              <p className="sum-value">{isFetching ? '—' : adminCount}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(39,174,96,0.1)' }}>✅</div>
            <div>
              <p className="sum-label">Akun Aktif</p>
              <p className="sum-value">{isFetching ? '—' : activeCount}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" className="search-input"
              placeholder="Cari nama atau email..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-group">
            {['all','admin','kasir'].map(r => (
              <button key={r} className={`filter-btn ${filterRole === r ? 'active' : ''}`}
                onClick={() => setFilterRole(r)}>
                {r === 'all' ? 'Semua' : r === 'admin' ? '🛡️ Admin' : '👤 Kasir'}
              </button>
            ))}
          </div>
          <button className="btn-add" onClick={handleOpenAdd}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah User
          </button>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-head-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Daftar User
            </div>
            <span className="count-badge">
              {isFetching ? '...' : `${filtered.length} User`}
            </span>
          </div>

          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  [0,1,2,3].map(i => (
                    <tr key={i}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                          <Skeleton w={38} h={38} r={50} />
                          <div>
                            <Skeleton w={110 + i*15} h={13} />
                            <div style={{ marginTop:5 }}><Skeleton w={140} h={11} /></div>
                          </div>
                        </div>
                      </td>
                      <td><Skeleton w={70} h={24} r={20} /></td>
                      <td><Skeleton w={64} h={24} r={20} /></td>
                      <td style={{ textAlign:'right' }}><Skeleton w={70} h={30} r={8} /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="4" className="empty-cell">
                    <div className="empty-icon">👥</div>
                    <p className="empty-text">
                      {searchTerm || filterRole !== 'all' ? 'User tidak ditemukan' : 'Belum ada user'}
                    </p>
                    <p className="empty-sub">
                      {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Klik "Tambah User" untuk memulai'}
                    </p>
                  </td></tr>
                ) : filtered.map(u => {
                  const [bg, fg] = getAvatarColor(u.id);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-av" style={{ background: bg, color: fg }}>
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">{u.name}</div>
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {u.role === 'admin' ? (
                          <span className="role-admin">
                            <span className="role-dot dot-admin"/>Admin
                          </span>
                        ) : (
                          <span className="role-kasir">
                            <span className="role-dot dot-kasir"/>Kasir
                          </span>
                        )}
                      </td>
                      <td>
                        {u.is_active ? (
                          <span className="status-on">
                            <span className="sdot sdot-on"/>Aktif
                          </span>
                        ) : (
                          <span className="status-off">
                            <span className="sdot sdot-off"/>Nonaktif
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign:'right' }}>
                        <button className="btn-edit" onClick={() => handleOpenEdit(u)}>
                          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
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