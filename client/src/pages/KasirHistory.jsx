import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const formatRp    = (v) => 'Rp ' + Number(v).toLocaleString('id-ID');
const formatDate  = (d) => new Date(d).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
const formatShort = (d) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short' });

const Skeleton = ({ w = '100%', h = 14, r = 8 }) => (
  <span style={{
    display:'inline-block', width:w, height:h, borderRadius:r,
    background:'linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%)',
    backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite',
  }} />
);

/* ── SVG ICONS ──────────────────────────── */
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconReset = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const IconReceipt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconTrx = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);
const IconRevenue = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);

export default function KasirHistory() {
  const [orders, setOrders]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/orders/user/${user.id}`);
        setOrders(res.data);
      } catch (e) {
        console.error('Gagal mengambil riwayat', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);

  const filteredOrders = orders.filter(order => {
    const orderDate  = new Date(order.created_at).toLocaleDateString('en-CA');
    const matchStart = startDate ? orderDate >= startDate : true;
    const matchEnd   = endDate   ? orderDate <= endDate   : true;
    const matchSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStart && matchEnd && matchSearch;
  });

  const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const hasFilter    = searchTerm || startDate || endDate;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root{
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e;
          --latte:#e8d5b7; --foam:#faf6f0; --milk:#f5ede0;
          --accent:#c97b3a; --text-dim:#8b7355;
        }
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

        .hist-root{
          min-height:100%; background:var(--foam); padding:26px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
          overflow-y:auto;
        }
        @media(max-width:640px){.hist-root{padding:14px}}

        /* ── HEADER ── */
        .page-header{margin-bottom:20px;}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-dim);margin-bottom:10px;}
        .breadcrumb span{color:var(--accent);font-weight:600;}
        .breadcrumb svg{width:12px;height:12px;}
        .page-header h1{
          font-family:'Playfair Display',serif;
          font-size:25px;font-weight:700;color:var(--espresso);
        }
        .page-header p{font-size:13px;color:var(--text-dim);margin-top:4px;}

        /* ── SUMMARY CARDS ── */
        .summary-strip{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;}
        @media(max-width:480px){.summary-strip{grid-template-columns:1fr;}}
        .sum-card{
          background:#fff;border-radius:14px;padding:18px 20px;
          box-shadow:0 2px 10px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.05);
          display:flex;align-items:center;gap:14px;
        }
        .sum-icon{
          width:44px;height:44px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
        }
        .sum-icon svg{width:20px;height:20px;}
        .sum-label{font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;}
        .sum-value{font-size:19px;font-weight:800;color:var(--espresso);line-height:1;}

        /* ── FILTER CARD ── */
        .filter-card{
          background:#fff;border-radius:14px;
          box-shadow:0 2px 10px rgba(0,0,0,0.05);
          border:1px solid rgba(0,0,0,0.05);
          padding:18px 20px;margin-bottom:18px;
        }
        .filter-row{
          display:grid;grid-template-columns:1fr 180px 180px auto;
          gap:12px;align-items:end;
        }
        @media(max-width:860px){.filter-row{grid-template-columns:1fr 1fr;}}
        @media(max-width:500px){.filter-row{grid-template-columns:1fr;}}

        .f-field label{
          display:block;font-size:10.5px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:7px;
        }
        .f-wrap{position:relative;}
        .f-icon{
          position:absolute;left:12px;top:50%;transform:translateY(-50%);
          width:14px;height:14px;color:var(--text-dim);pointer-events:none;
        }
        .f-icon svg{width:14px;height:14px;}
        .f-input,.f-date{
          width:100%;height:42px;
          border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--espresso);
          background:var(--foam);outline:none;transition:all 0.2s;
        }
        .f-input{padding:0 12px 0 36px;}
        .f-date{padding:0 12px;}
        .f-input:focus,.f-date:focus{
          border-color:var(--accent);background:#fff;
          box-shadow:0 0 0 3px rgba(201,123,58,0.1);
        }
        .f-input::placeholder{color:#bba890;}
        .f-date::-webkit-calendar-picker-indicator{opacity:0.4;cursor:pointer;}

        .btn-reset{
          height:42px;padding:0 16px;border-radius:10px;
          background:var(--foam);border:1.5px solid rgba(0,0,0,0.1);
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:var(--text-dim);
          cursor:pointer;transition:all 0.2s;
          display:flex;align-items:center;gap:6px;white-space:nowrap;
        }
        .btn-reset:hover{background:var(--milk);}
        .btn-reset svg{width:13px;height:13px;}

        .filter-tags{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}
        .filter-tag{
          display:inline-flex;align-items:center;gap:6px;
          background:rgba(201,123,58,0.08);border:1px solid rgba(201,123,58,0.18);
          color:var(--accent);font-size:11px;font-weight:600;
          padding:4px 10px;border-radius:20px;cursor:pointer;transition:all 0.2s;
        }
        .filter-tag:hover{background:rgba(201,123,58,0.16);}

        /* ── TABLE CARD ── */
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
        .title-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);}
        .count-badge{font-size:11px;font-weight:700;background:rgba(201,123,58,0.1);color:var(--accent);padding:3px 10px;border-radius:20px;}

        .tbl-wrap{overflow-x:auto;}
        table{width:100%;border-collapse:collapse;min-width:640px;}
        thead tr{background:var(--foam);border-bottom:1px solid rgba(0,0,0,0.07);}
        th{
          padding:11px 18px;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;text-align:left;
        }
        th:nth-child(4){text-align:right;}
        th:nth-child(5),th:nth-child(6){text-align:center;}
        tbody tr{border-bottom:1px solid rgba(0,0,0,0.05);transition:background 0.15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--foam);}
        td{padding:13px 18px;font-size:13px;vertical-align:middle;}

        .order-num{font-family:monospace;font-size:12.5px;font-weight:700;color:var(--espresso);}
        .order-time{font-size:11.5px;color:var(--text-dim);}

        /* items toggle */
        .items-btn{
          display:inline-flex;align-items:center;gap:5px;
          background:var(--foam);border:1px solid rgba(0,0,0,0.09);
          border-radius:8px;padding:5px 10px;
          font-family:'DM Sans',sans-serif;
          font-size:12px;font-weight:600;color:var(--text-dim);
          cursor:pointer;transition:all 0.2s;
        }
        .items-btn:hover{background:var(--milk);}
        .items-btn.open{background:rgba(201,123,58,0.1);border-color:rgba(201,123,58,0.2);color:var(--accent);}
        .items-btn svg{width:12px;height:12px;transition:transform 0.2s;}
        .items-btn.open svg{transform:rotate(180deg);}

        .items-list{
          display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;
          animation:fadeUp 0.18s ease;
        }
        .item-chip{
          display:inline-flex;align-items:center;gap:4px;
          background:rgba(201,123,58,0.07);border:1px solid rgba(201,123,58,0.14);
          color:var(--espresso);font-size:11px;padding:4px 9px;border-radius:20px;
        }
        .item-qty{font-weight:800;color:var(--accent);}

        .total-val{font-weight:800;font-size:14px;color:var(--espresso);}

        /* method pill */
        .pill-cash{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(39,174,96,0.1);color:#1a7a4a;
        }
        .pill-qris{
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(108,75,202,0.1);color:#5a3fac;
        }
        .mdot{width:5px;height:5px;border-radius:50%;}
        .mdot-cash{background:#27ae60;}
        .mdot-qris{background:#7c5cbf;}

        /* receipt btn */
        .receipt-btn{
          display:inline-flex;align-items:center;gap:5px;
          padding:6px 12px;border-radius:8px;
          background:rgba(201,123,58,0.1);border:1px solid rgba(201,123,58,0.2);
          color:var(--accent);font-size:12px;font-weight:600;
          text-decoration:none;transition:all 0.2s;white-space:nowrap;
        }
        .receipt-btn:hover{background:rgba(201,123,58,0.2);}
        .receipt-btn svg{width:12px;height:12px;}

        /* empty */
        .empty-cell{padding:56px 20px;text-align:center;}
        .empty-icon{
          width:52px;height:52px;background:var(--milk);border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 12px;
        }
        .empty-icon svg{width:24px;height:24px;stroke:var(--crema);fill:none;stroke-width:1.5;stroke-linecap:round;}
        .empty-text{font-size:14px;color:var(--text-dim);font-weight:600;}
        .empty-sub{font-size:12px;color:#bba890;margin-top:4px;}

        /* table footer */
        .table-footer{
          display:flex;align-items:center;justify-content:space-between;
          padding:13px 22px;border-top:1px solid rgba(0,0,0,0.06);
          font-size:12px;color:var(--text-dim);flex-wrap:wrap;gap:8px;
        }
        .footer-total{font-weight:800;font-size:14px;color:var(--espresso);}
      `}</style>

      <div className="hist-root">

        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width:12, height:12 }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Kasir
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width:12, height:12 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span>Riwayat Transaksi</span>
          </div>
          <h1>Riwayat Transaksi Saya</h1>
          <p>Laporan penjualan yang diproses oleh akun <strong style={{ color:'var(--accent)' }}>{user?.name}</strong></p>
        </div>

        {/* Summary */}
        <div className="summary-strip">
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(201,123,58,0.1)', color:'var(--accent)' }}>
              <IconTrx />
            </div>
            <div>
              <p className="sum-label">Total Transaksi</p>
              <p className="sum-value">{isLoading ? '—' : `${filteredOrders.length} Order`}</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background:'rgba(39,174,96,0.1)', color:'#1a7a4a' }}>
              <IconRevenue />
            </div>
            <div>
              <p className="sum-label">Total Setoran</p>
              <p className="sum-value" style={{ fontSize:15 }}>{isLoading ? '—' : formatRp(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="filter-card">
          <div className="filter-row">
            <div className="f-field">
              <label>Cari No. Order</label>
              <div className="f-wrap">
                <span className="f-icon"><IconSearch /></span>
                <input type="text" className="f-input"
                  placeholder="Contoh: ORD-..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="f-field">
              <label>Dari Tanggal</label>
              <input type="date" className="f-date"
                value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="f-field">
              <label>Sampai Tanggal</label>
              <input type="date" className="f-date"
                value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            {hasFilter && (
              <div className="f-field">
                <label style={{ opacity:0 }}>_</label>
                <button className="btn-reset"
                  onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); }}>
                  <IconReset />
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Active filter tags */}
          {hasFilter && (
            <div className="filter-tags">
              {searchTerm && (
                <span className="filter-tag" onClick={() => setSearchTerm('')}>
                  {searchTerm} ✕
                </span>
              )}
              {startDate && (
                <span className="filter-tag" onClick={() => setStartDate('')}>
                  Dari: {new Date(startDate).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} ✕
                </span>
              )}
              {endDate && (
                <span className="filter-tag" onClick={() => setEndDate('')}>
                  Sampai: {new Date(endDate).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} ✕
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-head-bar">
            <div className="table-title">
              <span className="title-dot" />
              Detail Transaksi
            </div>
            <span className="count-badge">
              {isLoading ? '...' : `${filteredOrders.length} Transaksi`}
            </span>
          </div>

          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>No. Order</th>
                  <th>Item Pesanan</th>
                  <th>Total</th>
                  <th>Metode</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [0,1,2,3,4].map(i => (
                    <tr key={i}>
                      <td>
                        <Skeleton w={80} h={12} />
                        <div style={{ marginTop:5 }}><Skeleton w={60} h={10} /></div>
                      </td>
                      <td><Skeleton w={100} h={13} /></td>
                      <td><Skeleton w={90} h={26} r={8} /></td>
                      <td style={{ textAlign:'right' }}><Skeleton w={90} h={13} /></td>
                      <td style={{ textAlign:'center' }}><Skeleton w={58} h={24} r={20} /></td>
                      <td style={{ textAlign:'center' }}><Skeleton w={72} h={28} r={8} /></td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="empty-cell">
                    <div className="empty-icon">
                      <IconReceipt />
                    </div>
                    <p className="empty-text">
                      {hasFilter ? 'Transaksi tidak ditemukan' : 'Belum ada riwayat transaksi'}
                    </p>
                    <p className="empty-sub">
                      {hasFilter ? 'Coba ubah filter pencarian' : 'Transaksi akan muncul setelah Anda memproses order'}
                    </p>
                  </td></tr>
                ) : filteredOrders.map(order => {
                  const isOpen  = expandedId === order.id;
                  const isCash  = order.payment_method === 'cash';
                  return (
                    <tr key={order.id}>
                      <td>
                        <div className="order-time">
                          {formatShort(order.created_at)}
                        </div>
                        <div style={{ fontSize:11, color:'#bba890', marginTop:2 }}>
                          {new Date(order.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
                        </div>
                      </td>
                      <td>
                        <div className="order-num">{order.order_number}</div>
                        <div style={{ fontSize:10.5, color:'var(--text-dim)', marginTop:2 }}>#{order.id}</div>
                      </td>
                      <td>
                        {order.items?.length > 0 ? (
                          <>
                            <button
                              className={`items-btn ${isOpen ? 'open' : ''}`}
                              onClick={() => setExpandedId(isOpen ? null : order.id)}
                            >
                              {isOpen ? 'Sembunyikan' : `${order.items.length} Item`}
                              <IconChevron />
                            </button>
                            {isOpen && (
                              <div className="items-list">
                                {order.items.map((item, idx) => (
                                  <span key={idx} className="item-chip">
                                    <span className="item-qty">{item.qty}×</span>
                                    {item.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <span style={{ fontSize:12, color:'#bba890' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign:'right' }}>
                        <span className="total-val">{formatRp(order.total)}</span>
                      </td>
                      <td style={{ textAlign:'center' }}>
                        <span className={isCash ? 'pill-cash' : 'pill-qris'}>
                          <span className={`mdot ${isCash ? 'mdot-cash' : 'mdot-qris'}`} />
                          {isCash ? 'Cash' : 'QRIS'}
                        </span>
                      </td>
                      <td style={{ textAlign:'center' }}>
                        <Link to={`/kasir/receipt/${order.id}`} className="receipt-btn">
                          <IconReceipt />
                          Struk
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredOrders.length > 0 && (
            <div className="table-footer">
              <span>Menampilkan {filteredOrders.length} dari {orders.length} transaksi</span>
              <span>Total: <span className="footer-total">{formatRp(totalRevenue)}</span></span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}