import { useState, useEffect } from 'react';
import axios from 'axios';
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

export default function AdminReports() {
  const [orders, setOrders]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders');
        setOrders(res.data);
      } catch (e) {
        console.error('Gagal memuat data laporan', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const orderDate  = new Date(order.created_at).toLocaleDateString('en-CA');
    const matchStart = startDate ? orderDate >= startDate : true;
    const matchEnd   = endDate   ? orderDate <= endDate   : true;
    const matchSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.cashier_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStart && matchEnd && matchSearch;
  });

  const totalRevenue       = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalTransactions  = filteredOrders.length;
  const avgTransaction     = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const hasFilter          = searchTerm || startDate || endDate;

  const handleReset = () => { setSearchTerm(''); setStartDate(''); setEndDate(''); };

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
        @keyframes slideDown{from{opacity:0;max-height:0}to{opacity:1;max-height:400px}}

        .rpt-root{
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){.rpt-root{padding:14px}}

        /* header */
        .page-header{margin-bottom:22px;}
        .page-header h1{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--espresso);}
        .page-header p{font-size:13px;color:var(--text-dim);margin-top:4px;}
        .breadcrumb{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-dim);margin-bottom:10px;}
        .breadcrumb span{color:var(--accent);font-weight:600;}
        .breadcrumb svg{width:12px;height:12px;stroke:var(--text-dim);fill:none;stroke-width:2;stroke-linecap:round;}

        /* filter card */
        .filter-card{
          background:#fff;border-radius:16px;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid rgba(0,0,0,0.05);
          padding:20px 22px;margin-bottom:20px;
        }
        .filter-card-head{
          display:flex;align-items:center;gap:8px;margin-bottom:16px;
        }
        .filter-card-head svg{width:15px;height:15px;stroke:var(--accent);fill:none;stroke-width:2;stroke-linecap:round;}
        .filter-card-head span{font-size:13px;font-weight:700;color:var(--espresso);}
        .filter-row{display:grid;grid-template-columns:1fr 180px 180px auto auto;gap:12px;align-items:end;}
        @media(max-width:900px){.filter-row{grid-template-columns:1fr 1fr;}}
        @media(max-width:520px){.filter-row{grid-template-columns:1fr;}}

        .f-field label{
          display:block;font-size:10.5px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.09em;margin-bottom:7px;
        }
        .f-input,.f-date{
          width:100%;height:42px;padding:0 14px;
          border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
          font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--espresso);
          background:var(--foam);outline:none;transition:all 0.2s;
        }
        .f-input:focus,.f-date:focus{
          border-color:var(--accent);background:#fff;
          box-shadow:0 0 0 3px rgba(201,123,58,0.1);
        }
        .f-input::placeholder{color:#bba890;}
        .f-date::-webkit-calendar-picker-indicator{opacity:0.5;cursor:pointer;}

        .btn-reset{
          height:42px;padding:0 18px;border-radius:10px;
          background:var(--foam);border:1.5px solid rgba(0,0,0,0.1);
          font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:var(--text-dim);
          cursor:pointer;transition:all 0.2s;white-space:nowrap;
          display:flex;align-items:center;gap:7px;
        }
        .btn-reset:hover{background:var(--milk);}
        .btn-reset svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;}

        .active-filter-tag{
          display:inline-flex;align-items:center;gap:6px;
          background:rgba(201,123,58,0.1);border:1px solid rgba(201,123,58,0.2);
          color:var(--accent);font-size:11px;font-weight:600;
          padding:4px 10px;border-radius:20px;margin-top:12px;
          cursor:pointer;transition:all 0.2s;
        }
        .active-filter-tag:hover{background:rgba(201,123,58,0.18);}

        /* summary strip */
        .summary-strip{
          display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;
        }
        @media(max-width:760px){.summary-strip{grid-template-columns:1fr 1fr;}}
        @media(max-width:480px){.summary-strip{grid-template-columns:1fr;}}

        .sum-card{
          background:#fff;border-radius:14px;padding:18px 20px;
          box-shadow:0 2px 10px rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.05);
          display:flex;align-items:center;gap:14px;
        }
        .sum-icon{
          width:46px;height:46px;border-radius:13px;
          display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;
        }
        .sum-label{font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;}
        .sum-value{font-size:18px;font-weight:800;color:var(--espresso);line-height:1.1;}
        .sum-sub{font-size:10px;color:#bba890;margin-top:3px;}

        /* hero revenue */
        .hero-card{
          background:linear-gradient(135deg,var(--espresso) 0%,var(--roast) 100%);
          border-radius:16px;padding:22px 24px;margin-bottom:20px;
          position:relative;overflow:hidden;
          box-shadow:0 8px 24px rgba(26,15,10,0.25);
        }
        .hero-card::before{
          content:'☕';position:absolute;right:-10px;top:-10px;
          font-size:100px;opacity:0.06;line-height:1;
        }
        .hero-label{font-size:11px;font-weight:700;color:var(--crema);opacity:0.7;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;}
        .hero-value{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:var(--latte);line-height:1;}
        .hero-sub{font-size:12px;color:var(--crema);opacity:0.6;margin-top:6px;}
        @media(max-width:480px){.hero-value{font-size:26px;}}

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
        .tbl-inner{max-height:520px;overflow-y:auto;}
        .tbl-inner::-webkit-scrollbar{width:4px;}
        .tbl-inner::-webkit-scrollbar-thumb{background:var(--latte);border-radius:2px;}

        table{width:100%;border-collapse:collapse;min-width:700px;}
        thead tr{background:var(--foam);border-bottom:1px solid rgba(0,0,0,0.07);}
        th{
          padding:11px 18px;font-size:11px;font-weight:700;
          color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;text-align:left;
          position:sticky;top:0;background:var(--foam);z-index:2;
        }
        th:last-child{text-align:center;}
        tbody tr{border-bottom:1px solid rgba(0,0,0,0.05);transition:background 0.15s;}
        tbody tr:last-child{border-bottom:none;}
        tbody tr:hover{background:var(--foam);}
        td{padding:13px 18px;font-size:13px;vertical-align:top;}

        .order-num{font-family:monospace;font-size:12.5px;font-weight:700;color:var(--espresso);}
        .order-time{font-size:12px;color:var(--text-dim);}

        .cashier-row{display:flex;align-items:center;gap:7px;}
        .cashier-av{
          width:26px;height:26px;border-radius:50%;
          background:linear-gradient(135deg,var(--accent),var(--crema));
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;color:var(--espresso);flex-shrink:0;
        }
        .cashier-name{font-weight:600;color:var(--espresso);font-size:13px;}
        .cashier-del{font-style:italic;color:var(--text-dim);font-size:12px;}

        /* items accordion */
        .items-toggle{
          display:inline-flex;align-items:center;gap:5px;
          background:var(--foam);border:1px solid rgba(0,0,0,0.09);
          border-radius:8px;padding:5px 10px;
          font-size:12px;font-weight:600;color:var(--text-dim);
          cursor:pointer;transition:all 0.2s;
        }
        .items-toggle:hover{background:var(--milk);border-color:rgba(0,0,0,0.15);}
        .items-toggle.open{background:rgba(201,123,58,0.1);border-color:rgba(201,123,58,0.2);color:var(--accent);}
        .items-toggle svg{width:12px;height:12px;stroke:currentColor;fill:none;stroke-width:2.5;stroke-linecap:round;transition:transform 0.2s;}
        .items-toggle.open svg{transform:rotate(180deg);}

        .items-expand{
          display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;
          animation:fadeUp 0.18s ease;
        }
        .item-chip{
          display:inline-flex;align-items:center;gap:4px;
          background:rgba(201,123,58,0.07);border:1px solid rgba(201,123,58,0.15);
          color:var(--espresso);font-size:11px;padding:4px 9px;border-radius:20px;
        }
        .item-qty{font-weight:800;color:var(--accent);}

        .total-val{font-weight:800;font-size:14px;color:var(--espresso);}

        .struk-btn{
          display:inline-flex;align-items:center;gap:5px;
          padding:5px 11px;border-radius:8px;
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

        .table-footer{
          display:flex;align-items:center;justify-content:space-between;
          padding:14px 22px;border-top:1px solid rgba(0,0,0,0.06);
          font-size:12px;color:var(--text-dim);flex-wrap:wrap;gap:8px;
        }
        .footer-total{font-weight:800;font-size:14px;color:var(--espresso);}
      `}</style>

      <div className="rpt-root">

        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Laporan Penjualan</span>
          </div>
          <h1>Laporan Penjualan</h1>
          <p>Ringkasan pendapatan berdasarkan filter waktu dan kasir</p>
        </div>

        {/* Filter Card */}
        <div className="filter-card">
          <div className="filter-card-head">
            <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>Filter Laporan</span>
          </div>
          <div className="filter-row">
            <div className="f-field">
              <label>Cari Kasir / No. Order</label>
              <input type="text" className="f-input" placeholder="Ketik nama kasir atau nomor order..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="f-field">
              <label>Dari Tanggal</label>
              <input type="date" className="f-date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="f-field">
              <label>Sampai Tanggal</label>
              <input type="date" className="f-date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            {hasFilter && (
              <div className="f-field">
                <label style={{ opacity: 0 }}>_</label>
                <button className="btn-reset" onClick={handleReset}>
                  <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Reset
                </button>
              </div>
            )}
          </div>
          {hasFilter && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {searchTerm && (
                <span className="active-filter-tag" onClick={() => setSearchTerm('')}>
                  🔍 "{searchTerm}" ✕
                </span>
              )}
              {startDate && (
                <span className="active-filter-tag" onClick={() => setStartDate('')}>
                  📅 Dari: {new Date(startDate).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })} ✕
                </span>
              )}
              {endDate && (
                <span className="active-filter-tag" onClick={() => setEndDate('')}>
                  📅 Sampai: {new Date(endDate).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })} ✕
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hero Revenue */}
        <div className="hero-card">
          <p className="hero-label">
            {hasFilter ? 'Total Pendapatan (Sesuai Filter)' : 'Total Pendapatan Keseluruhan'}
          </p>
          <p className="hero-value">
            {isLoading ? '—' : formatRp(totalRevenue)}
          </p>
          <p className="hero-sub">
            {isLoading ? '' : `Dari ${totalTransactions} transaksi yang tercatat`}
          </p>
        </div>

        {/* Summary Strip */}
        <div className="summary-strip">
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(201,123,58,0.1)' }}>🧾</div>
            <div>
              <p className="sum-label">Jumlah Transaksi</p>
              <p className="sum-value">{isLoading ? '—' : totalTransactions}</p>
              <p className="sum-sub">Order sukses</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(39,174,96,0.1)' }}>📈</div>
            <div>
              <p className="sum-label">Rata-rata / Transaksi</p>
              <p className="sum-value" style={{ fontSize: 15 }}>
                {isLoading ? '—' : formatRp(avgTransaction)}
              </p>
              <p className="sum-sub">Per order</p>
            </div>
          </div>
          <div className="sum-card">
            <div className="sum-icon" style={{ background: 'rgba(108,75,202,0.1)' }}>📦</div>
            <div>
              <p className="sum-label">Total Item Terjual</p>
              <p className="sum-value">
                {isLoading ? '—' : filteredOrders.reduce((s, o) => s + (o.items?.reduce((a, i) => a + Number(i.qty), 0) || 0), 0)}
              </p>
              <p className="sum-sub">Dari semua order</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-head-bar">
            <div className="table-title">
              <div className="table-title-dot" />
              Detail Transaksi
            </div>
            <span className="count-badge">
              {isLoading ? '...' : `${filteredOrders.length} Transaksi`}
            </span>
          </div>

          <div className="tbl-scroll">
            <div className="tbl-inner">
              <table>
                <thead>
                  <tr>
                    <th>Waktu & No. Order</th>
                    <th>Kasir</th>
                    <th>Item Pesanan</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Struk</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [0,1,2,3,4].map(i => (
                      <tr key={i}>
                        <td>
                          <Skeleton w={100} h={13} /><br />
                          <span style={{ marginTop: 5, display: 'block' }}><Skeleton w={70} h={11} /></span>
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <Skeleton w={26} h={26} r={50} />
                            <Skeleton w={80} h={13} />
                          </div>
                        </td>
                        <td><Skeleton w={120} h={24} r={20} /></td>
                        <td style={{ textAlign:'right' }}><Skeleton w={90} h={14} /></td>
                        <td style={{ textAlign:'center' }}><Skeleton w={64} h={28} r={8} /></td>
                      </tr>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan="5" className="empty-cell">
                      <div className="empty-icon">📊</div>
                      <p className="empty-text">
                        {hasFilter ? 'Tidak ada data untuk filter ini' : 'Belum ada data penjualan'}
                      </p>
                      <p className="empty-sub">
                        {hasFilter ? 'Coba ubah rentang tanggal atau kata kunci pencarian' : 'Data akan muncul setelah ada transaksi'}
                      </p>
                    </td></tr>
                  ) : filteredOrders.map(order => {
                    const isOpen = expandedId === order.id;
                    const initials = (order.cashier_name || 'K')[0].toUpperCase();
                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="order-num">{order.order_number}</div>
                          <div className="order-time" style={{ marginTop: 3 }}>{formatDate(order.created_at)}</div>
                        </td>
                        <td>
                          <div className="cashier-row">
                            <div className="cashier-av">{initials}</div>
                            {order.cashier_name
                              ? <span className="cashier-name">{order.cashier_name}</span>
                              : <span className="cashier-del">Kasir Dihapus</span>
                            }
                          </div>
                        </td>
                        <td>
                          {order.items?.length > 0 ? (
                            <>
                              <button
                                className={`items-toggle ${isOpen ? 'open' : ''}`}
                                onClick={() => setExpandedId(isOpen ? null : order.id)}
                              >
                                {isOpen ? 'Sembunyikan' : `${order.items.length} Item`}
                                <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                              {isOpen && (
                                <div className="items-expand">
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
                            <span style={{ fontSize: 12, color: '#bba890' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="total-val">{formatRp(order.total)}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
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