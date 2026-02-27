import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [deleteId, setDeleteId] = useState(null); // modal confirm
  const inputRef = useRef(null);

  const fetchCategories = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch {
      toast.error('Gagal mengambil data kategori');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Focus input saat edit
  useEffect(() => {
    if (editId && inputRef.current) inputRef.current.focus();
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/categories/${editId}`, { name });
        toast.success('Kategori berhasil diperbarui!');
      } else {
        await axios.post('http://localhost:5000/api/categories', { name });
        toast.success('Kategori berhasil ditambahkan!');
      }
      setName(''); setEditId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditId(cat.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => { setName(''); setEditId(null); };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${deleteId}`);
      toast.success('Kategori berhasil dihapus!');
      fetchCategories();
    } catch {
      toast.error('Gagal menghapus kategori');
    } finally {
      setDeleteId(null);
    }
  };

  const isEditing = !!editId;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --espresso: #1a0f0a;
          --roast:    #2d1a10;
          --crema:    #c8a97e;
          --latte:    #e8d5b7;
          --foam:     #faf6f0;
          --milk:     #f5ede0;
          --accent:   #c97b3a;
          --accent-h: #e8913f;
          --text-dim: #8b7355;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }

        .cat-root {
          min-height: 100%;
          background: var(--foam);
          padding: 28px;
          font-family: 'DM Sans', sans-serif;
          animation: fadeUp 0.28s ease;
        }
        @media (max-width: 640px) { .cat-root { padding: 16px; } }

        /* ─── PAGE HEADER ─── */
        .page-header { margin-bottom: 24px; }
        .page-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700;
          color: var(--espresso); line-height: 1.2;
        }
        .page-header p { font-size: 13px; color: var(--text-dim); margin-top: 4px; }

        .breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--text-dim); margin-bottom: 10px;
        }
        .breadcrumb span { color: var(--accent); font-weight: 600; }
        .breadcrumb svg { width: 12px; height: 12px; stroke: var(--text-dim); fill: none; stroke-width: 2; stroke-linecap: round; }

        /* ─── FORM CARD ─── */
        .form-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          padding: 24px;
          margin-bottom: 20px;
          animation: scaleIn 0.25s ease;
          transition: border-color 0.3s;
        }
        .form-card.editing {
          border-color: rgba(201,123,58,0.35);
          box-shadow: 0 0 0 3px rgba(201,123,58,0.08), 0 2px 12px rgba(0,0,0,0.06);
        }

        .form-label-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
        }
        .form-label-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          transition: background 0.3s;
        }
        .editing .form-label-dot { background: #e8913f; }

        .form-label-text {
          font-size: 14px; font-weight: 700; color: var(--espresso);
        }

        .edit-badge {
          font-size: 10px; font-weight: 700;
          background: rgba(201,123,58,0.12);
          color: var(--accent);
          padding: 3px 9px; border-radius: 20px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        .form-row {
          display: flex; gap: 12px; align-items: stretch; flex-wrap: wrap;
        }

        .form-input-wrap {
          flex: 1; min-width: 200px; position: relative;
        }
        .form-input-wrap svg {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          width: 16px; height: 16px;
          stroke: var(--text-dim); fill: none; stroke-width: 1.8; stroke-linecap: round;
          pointer-events: none;
        }
        .cat-input {
          width: 100%; height: 44px;
          padding: 0 14px 0 40px;
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; color: var(--espresso);
          background: var(--foam);
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .cat-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(201,123,58,0.12);
          background: #fff;
        }
        .cat-input::placeholder { color: #bba890; }

        .btn-save {
          height: 44px; padding: 0 22px;
          background: var(--espresso); color: var(--crema);
          border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; gap: 7px;
          white-space: nowrap;
        }
        .btn-save:hover { background: var(--roast); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-save svg {
          width: 14px; height: 14px;
          stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round;
        }

        .btn-cancel {
          height: 44px; padding: 0 18px;
          background: var(--foam);
          border: 1.5px solid rgba(0,0,0,0.1);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 600; color: #666;
          cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-cancel:hover { background: var(--milk); border-color: rgba(0,0,0,0.18); }

        /* ─── TABLE CARD ─── */
        .table-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .table-header-bar {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          flex-wrap: wrap; gap: 10px;
        }

        .table-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 700; color: var(--espresso);
        }
        .table-title-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
        }

        .count-badge {
          font-size: 11px; font-weight: 700;
          background: rgba(201,123,58,0.1);
          color: var(--accent);
          padding: 3px 10px; border-radius: 20px;
        }

        table { width: 100%; border-collapse: collapse; }

        thead tr {
          background: var(--foam);
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        th {
          padding: 12px 20px;
          font-size: 11px; font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase; letter-spacing: 0.1em;
          text-align: left;
        }
        th:last-child { text-align: right; }

        tbody tr {
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: background 0.15s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--foam); }

        td { padding: 14px 20px; font-size: 13.5px; }

        .td-id {
          color: var(--text-dim); font-weight: 600;
          font-size: 12px; letter-spacing: 0.04em;
        }

        .cat-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(201,123,58,0.08);
          border: 1px solid rgba(201,123,58,0.15);
          color: var(--espresso);
          padding: 5px 12px; border-radius: 20px;
          font-size: 13px; font-weight: 600;
        }
        .cat-chip-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
        }

        .action-cell { text-align: right; }
        .action-cell .btn-wrap { display: flex; gap: 8px; justify-content: flex-end; }

        .btn-edit {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 13px; border-radius: 8px;
          background: rgba(201,123,58,0.1);
          border: 1px solid rgba(201,123,58,0.2);
          color: var(--accent); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-edit:hover { background: rgba(201,123,58,0.2); }
        .btn-edit svg { width: 13px; height: 13px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; }

        .btn-delete {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 13px; border-radius: 8px;
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.18);
          color: #c0392b; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-delete:hover { background: rgba(192,57,43,0.18); }
        .btn-delete svg { width: 13px; height: 13px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; }

        /* ─── EMPTY STATE ─── */
        .empty-row td {
          padding: 56px 20px; text-align: center;
        }
        .empty-icon {
          width: 48px; height: 48px;
          background: var(--milk); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
          font-size: 22px;
        }
        .empty-text { font-size: 14px; color: var(--text-dim); font-weight: 500; }
        .empty-sub { font-size: 12px; color: #bba890; margin-top: 4px; }

        /* ─── SKELETON ─── */
        .skel {
          border-radius: 6px;
          background: linear-gradient(90deg, #f0e8df 25%, #f8f2eb 50%, #f0e8df 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          display: inline-block;
        }

        /* ─── MODAL OVERLAY ─── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(10,5,2,0.5);
          backdrop-filter: blur(3px);
          z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .modal-box {
          background: #fff; border-radius: 20px;
          padding: 32px 28px;
          max-width: 360px; width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: modalIn 0.25s ease;
          text-align: center;
        }
        .modal-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(192,57,43,0.1);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 26px;
        }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: var(--espresso); margin-bottom: 8px;
        }
        .modal-body {
          font-size: 13px; color: var(--text-dim); line-height: 1.6; margin-bottom: 24px;
        }
        .modal-actions { display: flex; gap: 10px; }
        .modal-btn-cancel {
          flex: 1; height: 42px; border-radius: 10px;
          background: var(--foam); border: 1.5px solid rgba(0,0,0,0.1);
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; color: #555;
          cursor: pointer; transition: all 0.2s;
        }
        .modal-btn-cancel:hover { background: var(--milk); }
        .modal-btn-confirm {
          flex: 1; height: 42px; border-radius: 10px;
          background: #c0392b; border: none; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .modal-btn-confirm:hover { background: #a93226; }
      `}</style>

      <div className="cat-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 13 } }} />

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">🗑️</div>
              <p className="modal-title">Hapus Kategori?</p>
              <p className="modal-body">
                Tindakan ini tidak bisa dibatalkan. Kategori yang dihapus mungkin mempengaruhi produk yang terkait.
              </p>
              <div className="modal-actions">
                <button className="modal-btn-cancel" onClick={() => setDeleteId(null)}>Batal</button>
                <button className="modal-btn-confirm" onClick={confirmDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Kategori Menu</span>
          </div>
          <h1>Kategori Menu</h1>
          <p>Kelola kategori untuk mengorganisir produk di menu kafe</p>
        </div>

        {/* Form Card */}
        <div className={`form-card ${isEditing ? 'editing' : ''}`}>
          <div className="form-label-row">
            <div className="form-label-dot" />
            <span className="form-label-text">
              {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </span>
            {isEditing && <span className="edit-badge">Mode Edit</span>}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-input-wrap">
                <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h7"/></svg>
                <input
                  ref={inputRef}
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama kategori, contoh: Minuman Panas"
                  className="cat-input"
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-save">
                {isLoading ? (
                  <>
                    <svg viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    {isEditing ? 'Update' : 'Simpan'}
                  </>
                )}
              </button>
              {isEditing && (
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Daftar Kategori
            </div>
            <span className="count-badge">
              {isFetching ? '...' : `${categories.length} Kategori`}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Nama Kategori</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                [0,1,2,3].map(i => (
                  <tr key={i}>
                    <td><span className="skel" style={{ width: 30, height: 14 }} /></td>
                    <td><span className="skel" style={{ width: `${140 + i * 30}px`, height: 28, borderRadius: 20 }} /></td>
                    <td className="action-cell">
                      <div className="btn-wrap">
                        <span className="skel" style={{ width: 64, height: 30, borderRadius: 8 }} />
                        <span className="skel" style={{ width: 64, height: 30, borderRadius: 8 }} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="3">
                    <div className="empty-icon">📁</div>
                    <p className="empty-text">Belum ada kategori</p>
                    <p className="empty-sub">Tambahkan kategori pertama menggunakan form di atas</p>
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id}>
                    <td>
                      <span className="td-id">#{cat.id}</span>
                    </td>
                    <td>
                      <span className="cat-chip">
                        <span className="cat-chip-dot" />
                        {cat.name}
                      </span>
                    </td>
                    <td className="action-cell">
                      <div className="btn-wrap">
                        <button className="btn-edit" onClick={() => handleEdit(cat)}>
                          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => setDeleteId(cat.id)}>
                          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}