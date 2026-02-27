import { useState, useEffect, useRef } from 'react';
import api, { API_URL } from '../api';
import toast, { Toaster } from 'react-hot-toast';

const formatRp = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');

const Skeleton = ({ w = '100%', h = 16, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId]         = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', category_id: '', price: '', stock: '', description: '', is_available: true
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch { toast.error('Gagal mengambil data produk'); }
    finally { setIsFetching(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data);
    } catch {}
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', category_id: '', price: '', stock: '', description: '', is_available: true });
    setImageFile(null); setImagePreview(null); setEditId(null); setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setFormData({
      name: p.name, category_id: p.category_id, price: p.price,
      stock: p.stock, description: p.description || '', is_available: p.is_available
    });
    setImageFile(null);
    setImagePreview(p.image_url ? `${API_URL}${p.image_url}` : null);
    setEditId(p.id); setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditId(null); setImagePreview(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (imageFile) data.append('image', imageFile);
    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk berhasil diperbarui!');
      } else {
        await api.post('/api/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk berhasil ditambahkan!');
      }
      handleCloseModal(); fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setIsLoading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/api/products/${deleteId}`);
      toast.success('Produk berhasil dihapus!');
      fetchProducts();
    } catch { toast.error('Gagal menghapus produk'); }
    finally { setDeleteId(null); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .prod-root {
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){.prod-root{padding:14px}}

        /* header */
        .page-header { margin-bottom:24px; }
        .page-header h1 {
          font-family:'Playfair Display',serif;
          font-size:26px; font-weight:700; color:var(--espresso);
        }
        .page-header p { font-size:13px; color:var(--text-dim); margin-top:4px; }
        .breadcrumb {
          display:flex; align-items:center; gap:6px;
          font-size:12px; color:var(--text-dim); margin-bottom:10px;
        }
        .breadcrumb span { color:var(--accent); font-weight:600; }
        .breadcrumb svg { width:12px;height:12px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round; }

        /* toolbar */
        .toolbar {
          display:flex; align-items:center; justify-content:space-between;
          gap:12px; margin-bottom:20px; flex-wrap:wrap;
        }
        .search-wrap {
          position:relative; flex:1; min-width:180px; max-width:320px;
        }
        .search-wrap svg {
          position:absolute; left:12px; top:50%; transform:translateY(-50%);
          width:15px; height:15px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round;
          pointer-events:none;
        }
        .search-input {
          width:100%; height:42px; padding:0 12px 0 38px;
          border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
          background:var(--foam); font-family:'DM Sans',sans-serif;
          font-size:13.5px; color:var(--espresso); outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
        }
        .search-input:focus {
          border-color:var(--accent); background:#fff;
          box-shadow:0 0 0 3px rgba(201,123,58,0.1);
        }
        .search-input::placeholder { color:#bba890; }

        .btn-add {
          display:flex; align-items:center; gap:8px;
          height:42px; padding:0 20px;
          background:var(--espresso); color:var(--crema);
          border:none; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600;
          cursor:pointer; transition:opacity 0.2s; white-space:nowrap;
        }
        .btn-add:hover { opacity:0.85; }
        .btn-add svg { width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round; }

        /* table card */
        .table-card {
          background:#fff; border-radius:16px;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.05); overflow:hidden;
        }
        .table-header-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 22px; border-bottom:1px solid rgba(0,0,0,0.06); flex-wrap:wrap; gap:8px;
        }
        .table-title { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:var(--espresso); }
        .table-title-dot { width:8px;height:8px;border-radius:50%;background:var(--accent); }
        .count-badge {
          font-size:11px; font-weight:700;
          background:rgba(201,123,58,0.1); color:var(--accent);
          padding:3px 10px; border-radius:20px;
        }

        .table-scroll { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; min-width:680px; }
        thead tr { background:var(--foam); border-bottom:1px solid rgba(0,0,0,0.07); }
        th {
          padding:11px 18px; font-size:11px; font-weight:700;
          color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em; text-align:left;
        }
        th:last-child { text-align:right; }
        tbody tr { border-bottom:1px solid rgba(0,0,0,0.05); transition:background 0.15s; }
        tbody tr:last-child { border-bottom:none; }
        tbody tr:hover { background:var(--foam); }
        td { padding:13px 18px; font-size:13.5px; vertical-align:middle; }

        .prod-thumb {
          width:52px; height:52px; border-radius:10px;
          object-fit:cover; border:1px solid rgba(0,0,0,0.07);
          flex-shrink:0;
        }
        .prod-thumb-placeholder {
          width:52px; height:52px; border-radius:10px;
          background:var(--milk); display:flex; align-items:center; justify-content:center;
          font-size:20px; flex-shrink:0; border:1px solid rgba(0,0,0,0.07);
        }
        .prod-name { font-weight:600; color:var(--espresso); font-size:13.5px; }
        .cat-pill {
          display:inline-block;
          background:rgba(201,123,58,0.08); border:1px solid rgba(201,123,58,0.15);
          color:var(--accent); font-size:11px; font-weight:600;
          padding:3px 10px; border-radius:20px;
        }
        .price-text { font-weight:700; color:var(--espresso); }
        .stock-num {
          font-weight:700; font-size:14px;
          color: var(--espresso);
        }
        .stock-low { color:#c0392b; }
        .status-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:20px;
          font-size:11px; font-weight:700;
        }
        .status-on { background:rgba(39,174,96,0.1); color:#1a7a4a; }
        .status-off { background:rgba(192,57,43,0.1); color:#c0392b; }
        .status-dot { width:6px;height:6px;border-radius:50%; }
        .dot-on { background:#27ae60; }
        .dot-off { background:#c0392b; }

        .btn-edit {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 12px; border-radius:8px;
          background:rgba(201,123,58,0.1); border:1px solid rgba(201,123,58,0.2);
          color:var(--accent); font-size:12px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; margin-right:6px;
        }
        .btn-edit:hover { background:rgba(201,123,58,0.2); }
        .btn-edit svg { width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round; }
        .btn-delete {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 12px; border-radius:8px;
          background:rgba(192,57,43,0.08); border:1px solid rgba(192,57,43,0.18);
          color:#c0392b; font-size:12px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif;
        }
        .btn-delete:hover { background:rgba(192,57,43,0.18); }
        .btn-delete svg { width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round; }

        /* empty */
        .empty-cell { padding:56px 20px; text-align:center; }
        .empty-icon { width:52px;height:52px;background:var(--milk);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px; }
        .empty-text { font-size:14px;color:var(--text-dim);font-weight:600; }
        .empty-sub { font-size:12px;color:#bba890;margin-top:4px; }

        /* ─── MODAL ─── */
        .modal-overlay {
          position:fixed; inset:0;
          background:rgba(10,5,2,0.55); backdrop-filter:blur(3px);
          z-index:100; display:flex; align-items:center; justify-content:center; padding:16px;
        }
        .modal-box {
          background:#fff; border-radius:20px;
          width:100%; max-width:520px; max-height:92dvh;
          overflow-y:auto; box-shadow:0 24px 64px rgba(0,0,0,0.28);
          animation:modalIn 0.25s ease;
        }
        .modal-box::-webkit-scrollbar { width:4px; }
        .modal-box::-webkit-scrollbar-thumb { background:var(--latte); border-radius:2px; }

        .modal-top {
          position:sticky; top:0; z-index:2;
          background:#fff; padding:22px 24px 18px;
          border-bottom:1px solid rgba(0,0,0,0.07);
          display:flex; align-items:center; justify-content:space-between;
        }
        .modal-title {
          font-family:'Playfair Display',serif;
          font-size:18px; font-weight:700; color:var(--espresso);
          display:flex; align-items:center; gap:10px;
        }
        .modal-badge {
          font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
          background:rgba(201,123,58,0.12); color:var(--accent);
          padding:3px 9px; border-radius:20px;
        }
        .modal-close {
          width:32px;height:32px;border-radius:50%;
          background:var(--foam); border:1px solid rgba(0,0,0,0.1);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer; font-size:16px; color:var(--text-dim); transition:all 0.2s;
        }
        .modal-close:hover { background:var(--milk); color:var(--espresso); }

        .modal-body { padding:22px 24px 24px; }

        .field { margin-bottom:16px; }
        .field label {
          display:block; font-size:12px; font-weight:700;
          color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:7px;
        }
        .field-input, .field-select, .field-textarea {
          width:100%; padding:10px 14px;
          border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--espresso);
          background:var(--foam); outline:none; transition:all 0.2s;
        }
        .field-input:focus, .field-select:focus, .field-textarea:focus {
          border-color:var(--accent); background:#fff;
          box-shadow:0 0 0 3px rgba(201,123,58,0.1);
        }
        .field-input::placeholder, .field-textarea::placeholder { color:#bba890; }
        .field-textarea { resize:vertical; min-height:72px; }
        .field-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b7355' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; }

        .field-row { display:flex; gap:14px; }
        .field-row .field { flex:1; margin-bottom:0; }

        /* image upload */
        .img-upload-zone {
          border:2px dashed rgba(201,123,58,0.3); border-radius:12px;
          padding:16px; text-align:center; cursor:pointer;
          transition:all 0.2s; background:var(--foam);
          position:relative; overflow:hidden;
        }
        .img-upload-zone:hover { border-color:var(--accent); background:rgba(201,123,58,0.04); }
        .img-upload-zone input[type=file] {
          position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%;
        }
        .img-preview {
          width:80px; height:80px; border-radius:10px; object-fit:cover;
          border:2px solid rgba(201,123,58,0.2); margin:0 auto 10px; display:block;
        }
        .img-upload-icon { font-size:28px; margin-bottom:6px; }
        .img-upload-text { font-size:12px; color:var(--text-dim); }
        .img-upload-text strong { color:var(--accent); }

        /* toggle */
        .toggle-row {
          display:flex; align-items:center; justify-content:space-between;
          background:var(--foam); border:1.5px solid rgba(0,0,0,0.08);
          border-radius:10px; padding:12px 16px;
        }
        .toggle-label { font-size:13px; font-weight:600; color:var(--espresso); }
        .toggle-sub { font-size:11px; color:var(--text-dim); margin-top:2px; }
        .toggle-switch {
          width:44px; height:24px; border-radius:12px; border:none;
          cursor:pointer; transition:background 0.25s; position:relative; flex-shrink:0;
        }
        .toggle-switch::after {
          content:''; position:absolute; top:3px; left:3px;
          width:18px; height:18px; border-radius:50%; background:#fff;
          box-shadow:0 1px 4px rgba(0,0,0,0.2);
          transition:transform 0.25s;
        }
        .toggle-on { background:var(--accent); }
        .toggle-on::after { transform:translateX(20px); }
        .toggle-off { background:#d1cdc8; }

        /* modal footer */
        .modal-footer {
          display:flex; gap:10px; margin-top:22px;
          padding-top:18px; border-top:1px solid rgba(0,0,0,0.07);
        }
        .btn-modal-cancel {
          flex:1; height:44px; border-radius:10px;
          background:var(--foam); border:1.5px solid rgba(0,0,0,0.1);
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600; color:#666;
          cursor:pointer; transition:all 0.2s;
        }
        .btn-modal-cancel:hover { background:var(--milk); }
        .btn-modal-save {
          flex:2; height:44px; border-radius:10px;
          background:var(--espresso); border:none; color:var(--crema);
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600;
          cursor:pointer; transition:opacity 0.2s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .btn-modal-save:hover { opacity:0.88; }
        .btn-modal-save:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-modal-save svg { width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round; }

        /* delete modal */
        .del-modal-overlay {
          position:fixed; inset:0; background:rgba(10,5,2,0.5); backdrop-filter:blur(3px);
          z-index:110; display:flex; align-items:center; justify-content:center; padding:20px;
        }
        .del-modal-box {
          background:#fff; border-radius:20px; padding:32px 28px;
          max-width:360px; width:100%;
          box-shadow:0 20px 60px rgba(0,0,0,0.25); animation:modalIn 0.22s ease; text-align:center;
        }
        .del-icon { width:58px;height:58px;border-radius:50%;background:rgba(192,57,43,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:26px; }
        .del-title { font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--espresso);margin-bottom:8px; }
        .del-body { font-size:13px;color:var(--text-dim);line-height:1.6;margin-bottom:24px; }
        .del-actions { display:flex;gap:10px; }
        .btn-del-cancel { flex:1;height:42px;border-radius:10px;background:var(--foam);border:1.5px solid rgba(0,0,0,0.1);font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;color:#555;cursor:pointer;transition:all 0.2s; }
        .btn-del-cancel:hover { background:var(--milk); }
        .btn-del-confirm { flex:1;height:42px;border-radius:10px;background:#c0392b;border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:all 0.2s; }
        .btn-del-confirm:hover { background:#a93226; }
      `}</style>

      <div className="prod-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 13 } }} />

        {/* Delete Modal */}
        {deleteId && (
          <div className="del-modal-overlay" onClick={() => setDeleteId(null)}>
            <div className="del-modal-box" onClick={e => e.stopPropagation()}>
              <div className="del-icon">🗑️</div>
              <p className="del-title">Hapus Produk?</p>
              <p className="del-body">Produk yang dihapus tidak bisa dikembalikan. Pastikan tidak ada transaksi aktif yang menggunakan produk ini.</p>
              <div className="del-actions">
                <button className="btn-del-cancel" onClick={() => setDeleteId(null)}>Batal</button>
                <button className="btn-del-confirm" onClick={confirmDelete}>Ya, Hapus</button>
              </div>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-top">
                <div className="modal-title">
                  {editId ? 'Edit Produk' : 'Produk Baru'}
                  {editId && <span className="modal-badge">Edit</span>}
                </div>
                <button className="modal-close" onClick={handleCloseModal}>✕</button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>

                  {/* Image Upload */}
                  <div className="field">
                    <label>Foto Produk</label>
                    <div className="img-upload-zone">
                      <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
                      {imagePreview
                        ? <img src={imagePreview} alt="preview" className="img-preview" />
                        : <div className="img-upload-icon">🖼️</div>
                      }
                      <p className="img-upload-text">
                        {imagePreview ? <strong>Klik untuk ganti foto</strong> : <><strong>Klik untuk upload</strong> atau drag & drop</>}
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="field">
                    <label>Nama Produk *</label>
                    <input type="text" name="name" required value={formData.name}
                      onChange={handleInputChange} placeholder="Contoh: Cappuccino Premium" className="field-input" />
                  </div>

                  {/* Category */}
                  <div className="field">
                    <label>Kategori *</label>
                    <select name="category_id" required value={formData.category_id}
                      onChange={handleInputChange} className="field-select">
                      <option value="">— Pilih Kategori —</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Price + Stock */}
                  <div className="field-row" style={{ marginBottom: 16 }}>
                    <div className="field">
                      <label>Harga (Rp) *</label>
                      <input type="number" name="price" required min="0"
                        value={formData.price} onChange={handleInputChange}
                        placeholder="25000" className="field-input" />
                    </div>
                    <div className="field">
                      <label>Stok Awal</label>
                      <input type="number" name="stock" min="0"
                        value={formData.stock} onChange={handleInputChange}
                        placeholder="0" className="field-input" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="field">
                    <label>Deskripsi</label>
                    <textarea name="description" value={formData.description}
                      onChange={handleInputChange} placeholder="Deskripsi singkat produk..."
                      className="field-textarea" />
                  </div>

                  {/* Availability Toggle */}
                  <div className="field">
                    <label>Ketersediaan</label>
                    <div className="toggle-row">
                      <div>
                        <p className="toggle-label">Produk {formData.is_available ? 'Tersedia' : 'Tidak Tersedia'}</p>
                        <p className="toggle-sub">
                          {formData.is_available ? 'Produk bisa dibeli oleh kasir' : 'Produk disembunyikan dari menu'}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${formData.is_available ? 'toggle-on' : 'toggle-off'}`}
                        onClick={() => setFormData(p => ({ ...p, is_available: !p.is_available }))}
                      />
                    </div>
                  </div>

                  {/* Footer */}
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
                          {editId ? 'Update Produk' : 'Simpan Produk'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
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
            <span>Data Produk</span>
          </div>
          <h1>Data Produk</h1>
          <p>Kelola semua produk yang tersedia di menu kafe</p>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" className="search-input"
              placeholder="Cari produk atau kategori..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={handleOpenAdd}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Produk
          </button>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-header-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Daftar Produk
            </div>
            <span className="count-badge">
              {isFetching ? '...' : `${filtered.length} Produk`}
            </span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 72 }}>Foto</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  [0,1,2,3,4].map(i => (
                    <tr key={i}>
                      <td><Skeleton w={52} h={52} r={10} /></td>
                      <td><Skeleton w={120 + i * 20} h={14} /></td>
                      <td><Skeleton w={80} h={22} r={20} /></td>
                      <td><Skeleton w={90} h={14} /></td>
                      <td><Skeleton w={30} h={14} /></td>
                      <td><Skeleton w={72} h={22} r={20} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <Skeleton w={56} h={28} r={8} />
                        {' '}
                        <Skeleton w={56} h={28} r={8} />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="empty-cell">
                    <div className="empty-icon">🍔</div>
                    <p className="empty-text">{searchQuery ? 'Produk tidak ditemukan' : 'Belum ada produk'}</p>
                    <p className="empty-sub">{searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Klik "Tambah Produk" untuk menambahkan produk pertama'}</p>
                  </td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.image_url
                        ? <img src={`${API_URL}${p.image_url}`} alt={p.name} className="prod-thumb" />
                        : <div className="prod-thumb-placeholder">☕</div>
                      }
                    </td>
                    <td><span className="prod-name">{p.name}</span></td>
                    <td><span className="cat-pill">{p.category_name || '—'}</span></td>
                    <td><span className="price-text">{formatRp(p.price)}</span></td>
                    <td>
                      <span className={`stock-num ${p.stock <= 5 ? 'stock-low' : ''}`}>
                        {p.stock}{p.stock <= 5 && p.stock > 0 ? ' ⚠️' : p.stock === 0 ? ' 🚫' : ''}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${p.is_available ? 'status-on' : 'status-off'}`}>
                        <span className={`status-dot ${p.is_available ? 'dot-on' : 'dot-off'}`} />
                        {p.is_available ? 'Tersedia' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-edit" onClick={() => handleOpenEdit(p)}>
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => setDeleteId(p.id)}>
                        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}