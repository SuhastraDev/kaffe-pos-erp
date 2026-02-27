import { useState, useEffect } from 'react';
import api from '../api';
import toast, { Toaster } from 'react-hot-toast';

const Skeleton = ({ w = '100%', h = 16, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

const StockBar = ({ value, max }) => {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  const color = value === 0 ? '#c0392b' : value <= 5 ? '#e67e22' : '#27ae60';
  return (
    <div style={{ width: '100%', background: 'rgba(0,0,0,0.07)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
    </div>
  );
};

export default function Stock() {
  const [stocks, setStocks]   = useState([]);
  const [logs, setLogs]       = useState([]);
  const [isFetchingStocks, setIsFetchingStocks] = useState(true);
  const [isFetchingLogs, setIsFetchingLogs]     = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', quantity: '', note: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{"id":1,"name":"Admin"}');

  useEffect(() => { fetchStocks(); fetchLogs(); }, []);

  const fetchStocks = async () => {
    setIsFetchingStocks(true);
    try {
      const res = await api.get('/api/stock');
      setStocks(res.data);
    } catch { toast.error('Gagal memuat data stok'); }
    finally { setIsFetchingStocks(false); }
  };

  const fetchLogs = async () => {
    setIsFetchingLogs(true);
    try {
      const res = await api.get('/api/stock/logs');
      setLogs(res.data);
    } catch { toast.error('Gagal memuat riwayat stok'); }
    finally { setIsFetchingLogs(false); }
  };

  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.quantity || formData.quantity <= 0)
      return toast.error('Pilih produk dan masukkan jumlah yang valid!');
    setIsLoading(true);
    try {
      await api.post('/api/stock/add', {
        product_id: formData.product_id,
        user_id: user.id,
        quantity: formData.quantity,
        note: formData.note,
      });
      toast.success('Stok berhasil ditambahkan!');
      setFormData({ product_id: '', quantity: '', note: '' });
      fetchStocks(); fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambah stok');
    } finally { setIsLoading(false); }
  };

  const maxStock = Math.max(...stocks.map(s => s.stock), 1);
  const lowCount = stocks.filter(s => s.stock <= 5).length;

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
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        .stk-root{
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){.stk-root{padding:14px}}

        /* header */
        .page-header{margin-bottom:24px;}
        .page-header h1{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--espresso);}
        .page-header p{font-size:13px;color:var(--text-dim);margin-top:4px;}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-dim);margin-bottom:10px;}
        .breadcrumb span{color:var(--accent);font-weight:600;}
        .breadcrumb svg{width:12px;height:12px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;}

        /* alert banner */
        .alert-banner{
          display:flex;align-items:center;gap:12px;
          background:rgba(230,126,34,0.1);border:1px solid rgba(230,126,34,0.25);
          border-radius:12px;padding:12px 16px;margin-bottom:20px;
        }
        .alert-banner svg{width:18px;height:18px;stroke:#e67e22;fill:none;stroke-width:2;stroke-linecap:round;flex-shrink:0;}
        .alert-banner p{font-size:13px;font-weight:600;color:#a04000;}
        .alert-banner span{font-size:12px;color:#c0622a;margin-left:4px;}

        /* two-col layout */
        .stk-grid{
          display:grid;
          grid-template-columns:1fr 320px;
          gap:20px;align-items:start;
        }
        @media(max-width:1100px){.stk-grid{grid-template-columns:1fr;}}

        /* card */
        .card{
          background:#fff;border-radius:16px;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.05);
          overflow:hidden;margin-bottom:20px;
        }
        .card:last-child{margin-bottom:0;}
        .card-head{
          display:flex;align-items:center;justify-content:space-between;
          padding:18px 22px;border-bottom:1px solid rgba(0,0,0,0.06);flex-wrap:wrap;gap:8px;
        }
        .card-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--espresso);}
        .card-title-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);}
        .count-badge{font-size:11px;font-weight:700;background:rgba(201,123,58,0.1);color:var(--accent);padding:3px 10px;border-radius:20px;}
        .danger-badge{font-size:11px;font-weight:700;background:rgba(192,57,43,0.1);color:#c0392b;padding:3px 10px;border-radius:20px;}

        /* restock form */
        .form-body{padding:22px;}
        .form-grid{display:grid;grid-template-columns:1fr 110px 1fr auto;gap:12px;align-items:end;}
        @media(max-width:800px){.form-grid{grid-template-columns:1fr 1fr;}}
        @media(max-width:520px){.form-grid{grid-template-columns:1fr;}}

        .field label{
          display:block;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:7px;
        }
        .f-select,.f-input{
          width:100%;height:42px;padding:0 14px;
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
          background-repeat:no-repeat;background-position:right 12px center;padding-right:34px;
        }
        .btn-restock{
          height:42px;padding:0 22px;
          background:var(--espresso);color:var(--crema);
          border:none;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;
          cursor:pointer;transition:opacity 0.2s;white-space:nowrap;
          display:flex;align-items:center;gap:8px;
        }
        .btn-restock:hover{opacity:0.85;}
        .btn-restock:disabled{opacity:0.5;cursor:not-allowed;}
        .btn-restock svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

        /* stock table */
        .tbl-scroll{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;}
        thead tr{background:var(--foam);border-bottom:1px solid rgba(0,0,0,0.07);}
        th{
          padding:11px 18px;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;text-align:left;
        }
        tbody tr{border-bottom:1px solid rgba(0,0,0,0.05);transition:background 0.15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--foam);}
        td{padding:13px 18px;font-size:13px;vertical-align:middle;}

        .cat-pill{
          display:inline-block;background:rgba(201,123,58,0.08);
          border:1px solid rgba(201,123,58,0.15);color:var(--accent);
          font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;
        }
        .stk-val{font-size:16px;font-weight:800;margin-bottom:4px;}
        .stk-green{color:#1a7a4a;}
        .stk-orange{color:#a04000;}
        .stk-red{color:#c0392b;}
        .status-pill{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;
        }
        .s-safe{background:rgba(39,174,96,0.1);color:#1a7a4a;}
        .s-low{background:rgba(230,126,34,0.12);color:#a04000;}
        .s-empty{background:rgba(192,57,43,0.1);color:#c0392b;}
        .status-dot{width:6px;height:6px;border-radius:50%;}
        .dot-safe{background:#27ae60;}
        .dot-low{background:#e67e22;}
        .dot-empty{background:#c0392b;}

        /* log panel */
        .log-panel{background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.05);overflow:hidden;}
        .log-list{max-height:580px;overflow-y:auto;}
        .log-list::-webkit-scrollbar{width:4px;}
        .log-list::-webkit-scrollbar-thumb{background:var(--latte);border-radius:2px;}

        .log-item{
          display:flex;gap:12px;padding:14px 20px;
          border-bottom:1px solid rgba(0,0,0,0.05);
          transition:background 0.15s;
        }
        .log-item:last-child{border-bottom:none;}
        .log-item:hover{background:var(--foam);}

        .log-icon{
          width:34px;height:34px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;flex-shrink:0;margin-top:2px;
        }
        .log-icon-in{background:rgba(39,174,96,0.1);}
        .log-icon-out{background:rgba(192,57,43,0.1);}

        .log-info{flex:1;min-width:0;}
        .log-prod{font-size:13px;font-weight:600;color:var(--espresso);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .log-meta{display:flex;align-items:center;gap:6px;margin-top:5px;flex-wrap:wrap;}
        .log-qty-in{font-size:11px;font-weight:800;background:rgba(39,174,96,0.12);color:#1a7a4a;padding:2px 8px;border-radius:20px;}
        .log-qty-out{font-size:11px;font-weight:800;background:rgba(192,57,43,0.1);color:#c0392b;padding:2px 8px;border-radius:20px;}
        .log-user{font-size:11px;color:var(--text-dim);}
        .log-note{font-size:11px;color:#bba890;font-style:italic;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .log-time{font-size:10px;color:var(--text-dim);white-space:nowrap;margin-top:2px;}

        .empty-cell{padding:48px 20px;text-align:center;}
        .empty-icon{width:48px;height:48px;background:var(--milk);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:22px;}
        .empty-text{font-size:13px;color:var(--text-dim);font-weight:600;}
        .empty-sub{font-size:12px;color:#bba890;margin-top:4px;}
      `}</style>

      <div className="stk-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 13 } }} />

        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Manajemen Stok</span>
          </div>
          <h1>Manajemen Stok</h1>
          <p>Pantau dan tambah stok produk kafe secara real-time</p>
        </div>

        {/* Low stock alert */}
        {!isFetchingStocks && lowCount > 0 && (
          <div className="alert-banner">
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p>
              {lowCount} produk stok menipis atau habis
              <span>— segera lakukan restock!</span>
            </p>
          </div>
        )}

        <div className="stk-grid">

          {/* LEFT: Form + Stock Table */}
          <div>

            {/* Restock Form */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-dot" />
                  Tambah Stok (Restock)
                </div>
              </div>
              <div className="form-body">
                <form onSubmit={handleRestock}>
                  <div className="form-grid">
                    <div className="field">
                      <label>Pilih Produk *</label>
                      <select name="product_id" value={formData.product_id} onChange={handleInputChange} className="f-select" required>
                        <option value="">— Pilih Produk —</option>
                        {stocks.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Sisa: {p.stock})</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label>Jumlah *</label>
                      <input type="number" name="quantity" min="1" value={formData.quantity}
                        onChange={handleInputChange} placeholder="0" className="f-input" required />
                    </div>

                    <div className="field">
                      <label>Catatan</label>
                      <input type="text" name="note" value={formData.note}
                        onChange={handleInputChange} placeholder="Contoh: Supplier A" className="f-input" />
                    </div>

                    <div className="field">
                      <label style={{ opacity: 0 }}>_</label>
                      <button type="submit" disabled={isLoading} className="btn-restock">
                        {isLoading ? (
                          <>
                            <svg viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" fill="none" strokeWidth="2"/>
                            </svg>
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Tambah Stok
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Stock Table */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-dot" />
                  Sisa Stok Produk
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {lowCount > 0 && <span className="danger-badge">⚠️ {lowCount} Menipis</span>}
                  <span className="count-badge">{isFetchingStocks ? '...' : `${stocks.length} Produk`}</span>
                </div>
              </div>
              <div className="tbl-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Kategori</th>
                      <th style={{ width: 130 }}>Stok</th>
                      <th style={{ width: 100 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFetchingStocks ? (
                      [0,1,2,3,4].map(i => (
                        <tr key={i}>
                          <td><Skeleton w={120 + i * 15} h={14} /></td>
                          <td><Skeleton w={80} h={22} r={20} /></td>
                          <td><Skeleton w="90%" h={14} /></td>
                          <td><Skeleton w={70} h={22} r={20} /></td>
                        </tr>
                      ))
                    ) : stocks.length === 0 ? (
                      <tr><td colSpan="4" className="empty-cell">
                        <div className="empty-icon">📦</div>
                        <p className="empty-text">Belum ada data stok</p>
                        <p className="empty-sub">Tambahkan produk terlebih dahulu</p>
                      </td></tr>
                    ) : stocks.map(p => {
                      const isEmpty  = p.stock === 0;
                      const isLow    = p.stock > 0 && p.stock <= 5;
                      const valClass = isEmpty ? 'stk-red' : isLow ? 'stk-orange' : 'stk-green';
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600, color: 'var(--espresso)' }}>{p.name}</td>
                          <td><span className="cat-pill">{p.category_name || '—'}</span></td>
                          <td>
                            <div className={`stk-val ${valClass}`}>{p.stock}</div>
                            <StockBar value={p.stock} max={maxStock} />
                          </td>
                          <td>
                            {isEmpty ? (
                              <span className="status-pill s-empty">
                                <span className="status-dot dot-empty"/>Habis
                              </span>
                            ) : isLow ? (
                              <span className="status-pill s-low">
                                <span className="status-dot dot-low"/>Menipis
                              </span>
                            ) : (
                              <span className="status-pill s-safe">
                                <span className="status-dot dot-safe"/>Aman
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Log */}
          <div className="log-panel">
            <div className="card-head">
              <div className="card-title">
                <div className="card-title-dot" style={{ background: '#27ae60' }} />
                Riwayat Stok
              </div>
              <span className="count-badge">{isFetchingLogs ? '...' : `${logs.length} Log`}</span>
            </div>

            <div className="log-list">
              {isFetchingLogs ? (
                [0,1,2,3,4,5].map(i => (
                  <div key={i} className="log-item">
                    <Skeleton w={34} h={34} r={50} />
                    <div style={{ flex: 1 }}>
                      <Skeleton w="70%" h={13} />
                      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                        <Skeleton w={40} h={18} r={20} />
                        <Skeleton w={70} h={18} r={20} />
                      </div>
                    </div>
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div className="empty-cell">
                  <div className="empty-icon">📋</div>
                  <p className="empty-text">Belum ada riwayat</p>
                  <p className="empty-sub">Log akan muncul setelah ada perubahan stok</p>
                </div>
              ) : logs.map(log => (
                <div key={log.id} className="log-item">
                  <div className={`log-icon ${log.type === 'in' ? 'log-icon-in' : 'log-icon-out'}`}>
                    
                  </div>
                  <div className="log-info">
                    <div className="log-prod">{log.product_name}</div>
                    <div className="log-meta">
                      <span className={log.type === 'in' ? 'log-qty-in' : 'log-qty-out'}>
                        {log.type === 'in' ? '+' : '-'}{log.quantity}
                      </span>
                      <span className="log-user">oleh {log.user_name || 'Sistem'}</span>
                    </div>
                    {log.note && <div className="log-note">"{log.note}"</div>}
                    <div className="log-time">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}