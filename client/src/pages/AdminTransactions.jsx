import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const formatRp = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');

const formatDate = (d) =>
  new Date(d).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const Skeleton = ({ w = '100%', h = 14, r = 8 }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
  }} />
);

export default function AdminTransactions() {
  const [orders, setOrders]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all'); // all | cash | qris
  const [sortDesc, setSortDesc]   = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders');
        setOrders(res.data);
      } catch (e) {
        console.error('Gagal memuat transaksi', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders
    .filter(o =>
      (o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (o.cashier_name || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterMethod === 'all' ||
       (filterMethod === 'cash' && o.payment_method === 'cash') ||
       (filterMethod === 'qris' && o.payment_method !== 'cash'))
    )
    .sort((a, b) => sortDesc
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
    );

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total), 0);
  const cashCount    = filtered.filter(o => o.payment_method === 'cash').length;
  const qrisCount    = filtered.filter(o => o.payment_method !== 'cash').length;

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

        .trx-root{
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){.trx-root{padding:14px}}

        .page-header{margin-bottom:24px;}
        .page-header h1{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--espresso);}
        .page-header p{font-size:13px;color:var(--text-dim);margin-top:4px;}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-dim);margin-bottom:10px;}
        .breadcrumb span{color:var(--accent);font-weight:600;}
        .breadcrumb svg{width:12px;height:12px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;}

        /* summary strip */
        .summary-strip{
          display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px;
        }
        @media(max-width:640px){.summary-strip{grid-template-columns:1fr 1fr;}}
        .sum-card{
          background:#fff;border-radius:14px;padding:16px 18px;
          box-shadow:0 2px 10px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.05);
          display:flex;align-items:center;gap:14px;
        }
        .sum-icon{
          width:42px;height:42px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;flex-shrink:0;
        }
        .sum-label{font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;}
        .sum-value{font-size:17px;font-weight:800;color:var(--espresso);line-height:1;}

        /* toolbar */
        .toolbar{
          display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;
        }
        .search-wrap{position:relative;flex:1;min-width:180px;max-width:300px;}
        .search-wrap svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;pointer-events:none;}
        .search-input{
          width:100%;height:40px;padding:0 12px 0 38px;
          border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--espresso);
          background:var(--foam);outline:none;transition:all 0.2s;
        }
        .search-input:focus{border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px rgba(201,123,58,0.1);}
        .search-input::placeholder{color:#bba890;}

        .filter-group{display:flex;gap:6px;flex-wrap:wrap;}
        .filter-btn{
          height:40px;padding:0 14px;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
          border:1.5px solid rgba(0,0,0,0.1);cursor:pointer;transition:all 0.2s;
          background:var(--foam);color:var(--text-dim);
        }
        .filter-btn:hover{background:var(--milk);}
        .filter-btn.active{background:var(--espresso);color:var(--crema);border-color:var(--espresso);}

        .sort-btn{
          height:40px;padding:0 14px;border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
          border:1.5px solid rgba(0,0,0,0.1);cursor:pointer;transition:all 0.2s;
          background:var(--foam);color:var(--text-dim);
          display:flex;align-items:center;gap:6px;margin-left:auto;
        }
        .sort-btn:hover{background:var(--milk);}
        .sort-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

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

        .tbl-scroll{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:660px;}
        thead tr{background:var(--foam);border-bottom:1px solid rgba(0,0,0,0.07);}
        th{
          padding:11px 18px;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;text-align:left;
        }
        th:last-child{text-align:center;}
        tbody tr{border-bottom:1px solid rgba(0,0,0,0.05);transition:background 0.15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--foam);}
        td{padding:14px 18px;font-size:13px;vertical-align:middle;}

        .order-num{
          font-family:monospace;font-size:13px;font-weight:700;
          color:var(--espresso);letter-spacing:0.04em;
        }
        .order-num-sub{font-size:10.5px;color:var(--text-dim);margin-top:2px;font-family:'DM Sans',sans-serif;}

        .cashier-name{
          display:inline-flex;align-items:center;gap:7px;
        }
        .cashier-avatar{
          width:26px;height:26px;border-radius:50%;
          background:linear-gradient(135deg,var(--accent),var(--crema));
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;color:var(--espresso);flex-shrink:0;
        }
        .cashier-label{font-weight:600;color:var(--espresso);}
        .cashier-deleted{font-style:italic;color:var(--text-dim);}

        .total-val{font-weight:800;font-size:14px;color:var(--espresso);}

        .method-cash{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(39,174,96,0.1);color:#1a7a4a;
        }
        .method-qris{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(108,75,202,0.1);color:#5a3fac;
        }
        .method-dot{width:6px;height:6px;border-radius:50%;}
        .dot-cash{background:#27ae60;}
        .dot-qris{background:#7c5cbf;}

        .struk-btn{
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 12px;border-radius:8px;
          background:rgba(201,123,58,0.1);border:1px solid rgba(201,123,58,0.2);
          color:var(--accent);font-size:12px;font-weight:600;
          text-decoration:none;transition:all 0.2s;
        }
        .struk-btn:hover{background:rgba(201,123,58,0.2);}
        .struk-btn svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

        .empty-cell{padding:56px 20px;text-align:center;}
        .empty-icon{width:52px;height:52px;background:var(--milk);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;}
        .empty-text{font-size:14px;color:var(--text-dim);font-weight:600;}
        .empty-sub{font-size:12px;color:#bba890;margin-top:4px;}

        /* table footer */
        .table-footer{
          display:flex;align-items:center;justify-content:space-between;
          padding:14px 22px;border-top:1px solid rgba(0,0,0,0.06);
          font-size:12px;color:var(--text-dim);flex-wrap:wrap;gap:8px;
        }
        .total-footer{font-weight:800;font-size:14px;color:var(--espresso);}
      `}</style>

      <div className="trx-root">

        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Riwayat Transaksi</span>
          </div>
          <h1>Riwayat Transaksi</h1>
          <p>Pantau seluruh aktivitas penjualan dari semua kasir</p>
        </div>

        {/* Summary Strip */}
        <div className="summary-strip">
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(201,123,58,0.1)' }}>🧾</div>
            <div>
              <p className="sum-label">Total Transaksi</p>
              <p className="sum-value">{isLoading ? '—' : `${filtered.length} Order`}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(39,174,96,0.1)' }}>💰</div>
            <div>
              <p className="sum-label">Total Pendapatan</p>
              <p className="sum-value" style={{ fontSize: 14 }}>{isLoading ? '—' : formatRp(totalRevenue)}</p>
            </div>
          </div>
          <div className="sum-card" style={{ gridColumn: 'span 1' }}>
            <div className="sum-icon" style={{ background: 'rgba(108,75,202,0.1)' }}>📊</div>
            <div>
              <p className="sum-label">Cash / QRIS</p>
              <p className="sum-value">{isLoading ? '—' : `${cashCount} / ${qrisCount}`}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" className="search-input"
              placeholder="Cari no. order atau kasir..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            {['all','cash','qris'].map(m => (
              <button key={m} className={`filter-btn ${filterMethod === m ? 'active' : ''}`}
                onClick={() => setFilterMethod(m)}>
                {m === 'all' ? 'Semua' : m === 'cash' ? '💵 Cash' : '📱 QRIS'}
              </button>
            ))}
          </div>
          <button className="sort-btn" onClick={() => setSortDesc(p => !p)}>
            <svg viewBox="0 0 24 24">
              {sortDesc
                ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
              }
            </svg>
            {sortDesc ? 'Terbaru' : 'Terlama'}
          </button>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-head-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Daftar Transaksi
            </div>
            <span className="count-badge">{isLoading ? '...' : `${filtered.length} Transaksi`}</span>
          </div>

          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>No. Order</th>
                  <th>Waktu</th>
                  <th>Kasir</th>
                  <th>Total</th>
                  <th>Metode</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [0,1,2,3,4,5].map(i => (
                    <tr key={i}>
                      <td><Skeleton w={100} h={14} /><br/><Skeleton w={70} h={10} r={4} /></td>
                      <td><Skeleton w={110} h={13} /></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <Skeleton w={26} h={26} r={50} />
                          <Skeleton w={80} h={13} />
                        </div>
                      </td>
                      <td><Skeleton w={90} h={14} /></td>
                      <td><Skeleton w={60} h={22} r={20} /></td>
                      <td style={{ textAlign:'center' }}><Skeleton w={80} h={28} r={8} /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="empty-cell">
                    <div className="empty-icon">🧾</div>
                    <p className="empty-text">
                      {searchTerm || filterMethod !== 'all' ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
                    </p>
                    <p className="empty-sub">
                      {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : 'Transaksi akan muncul setelah kasir melakukan penjualan'}
                    </p>
                  </td></tr>
                ) : filtered.map(order => {
                  const isCash = order.payment_method === 'cash';
                  const initials = (order.cashier_name || 'K')[0].toUpperCase();
                  return (
                    <tr key={order.id}>
                      <td>
                        <div className="order-num">{order.order_number}</div>
                        <div className="order-num-sub">#{order.id}</div>
                      </td>
                      <td style={{ color:'var(--text-dim)', fontSize:12.5 }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td>
                        <div className="cashier-name">
                          <div className="cashier-avatar">{initials}</div>
                          {order.cashier_name
                            ? <span className="cashier-label">{order.cashier_name}</span>
                            : <span className="cashier-deleted">Kasir Dihapus</span>
                          }
                        </div>
                      </td>
                      <td><span className="total-val">{formatRp(order.total)}</span></td>
                      <td>
                        <span className={isCash ? 'method-cash' : 'method-qris'}>
                          <span className={`method-dot ${isCash ? 'dot-cash' : 'dot-qris'}`}/>
                          {isCash ? 'Cash' : 'QRIS'}
                        </span>
                      </td>
                      <td style={{ textAlign:'center' }}>
                        <Link to={`/kasir/receipt/${order.id}`} target="_blank" className="struk-btn">
                          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          Struk
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!isLoading && filtered.length > 0 && (
            <div className="table-footer">
              <span>Menampilkan {filtered.length} dari {orders.length} transaksi</span>
              <span>Total: <span className="total-footer">{formatRp(totalRevenue)}</span></span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}