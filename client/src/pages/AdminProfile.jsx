import { useState, useEffect } from 'react';
import api from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AVATAR_COLORS = [
  ['#c97b3a','#fdf0e3'], ['#1a7a4a','#e6f7ef'], ['#2563eb','#dbeafe'],
  ['#7c3aed','#ede9fe'], ['#c0392b','#fde8e8'], ['#0e7490','#cffafe'],
];
const getAvatarColor = (str = '') => {
  let n = 0;
  for (let i = 0; i < str.length; i++) n += str.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

export default function AdminProfile() {
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });
  const [step, setStep]               = useState(1);
  const [isLoading, setIsLoading]     = useState(false);
  const [isFetching, setIsFetching]   = useState(true);
  const [formData, setFormData]       = useState({ otp: '', newPassword: '' });
  const [showPass, setShowPass]       = useState(false);

  const navigate   = useNavigate();
  const localUser  = JSON.parse(localStorage.getItem('user')) || {};
  const [avBg, avFg] = getAvatarColor(localUser.name || 'A');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      const res = await api.get(`/api/profile/${localUser.id}`);
      setUserProfile(res.data);
    } catch {
      toast.error('Gagal memuat profil');
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(`/api/profile/${localUser.id}`, {
        name: userProfile.name, email: userProfile.email,
      });
      toast.success('Informasi profil diperbarui!');
    } catch {
      toast.error('Gagal update profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setIsLoading(true);
    try {
      await api.post('/api/profile/request-otp', { id: localUser.id });
      toast.success('Kode OTP terkirim ke email Anda!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/api/profile/reset-password', {
        id: localUser.id, otp: formData.otp, newPassword: formData.newPassword,
      });
      toast.success('Password diubah! Silakan login kembali.');
      setTimeout(() => { localStorage.clear(); navigate('/login'); }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --espresso:#1a0f0a; --roast:#2d1a10; --crema:#c8a97e;
          --latte:#e8d5b7; --foam:#faf6f0; --milk:#f5ede0;
          --accent:#c97b3a; --text-dim:#8b7355;
        }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes otpIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        .profile-root {
          min-height:100%; background:var(--foam); padding:28px;
          font-family:'DM Sans',sans-serif; animation:fadeUp 0.28s ease;
        }
        @media(max-width:640px){ .profile-root{padding:14px} }

        /* ── header ── */
        .page-header { margin-bottom:26px; }
        .page-header h1 { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:var(--espresso); }
        .page-header p  { font-size:13px; color:var(--text-dim); margin-top:4px; }
        .breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-dim); margin-bottom:10px; }
        .breadcrumb span { color:var(--accent); font-weight:600; }
        .breadcrumb svg  { width:12px; height:12px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round; }

        /* ── layout ── */
        .profile-grid {
          display:grid; grid-template-columns:280px 1fr; gap:22px; align-items:start;
        }
        @media(max-width:900px){ .profile-grid{ grid-template-columns:1fr; } }

        /* ── CARD BASE ── */
        .card {
          background:#fff; border-radius:16px;
          border:1px solid rgba(200,169,126,0.2);
          box-shadow:0 2px 12px rgba(45,26,16,0.07); overflow:hidden;
        }
        .card-header {
          display:flex; align-items:center; gap:10px;
          padding:18px 22px 16px;
          border-bottom:1px solid rgba(200,169,126,0.15);
          background:linear-gradient(135deg, rgba(250,246,240,0.8), #fff);
        }
        .card-header-icon {
          width:34px; height:34px;
          background:linear-gradient(135deg, rgba(201,123,58,0.15), rgba(200,169,126,0.1));
          border:1px solid rgba(201,123,58,0.2); border-radius:9px;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .card-header-icon svg { width:15px; height:15px; stroke:var(--accent); fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
        .card-header h2 { font-size:14.5px; font-weight:700; color:var(--roast); }
        .card-header p  { font-size:11px; color:var(--text-dim); margin-top:2px; }
        .card-body { padding:22px; }

        /* ── LEFT — avatar card ── */
        .avatar-card { text-align:center; }
        .avatar-big {
          width:88px; height:88px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-family:'Playfair Display',serif;
          font-size:34px; font-weight:700;
          margin:0 auto 14px;
          box-shadow:0 6px 20px rgba(0,0,0,0.12);
          position:relative;
        }
        .avatar-online {
          position:absolute; bottom:4px; right:4px;
          width:14px; height:14px; border-radius:50%;
          background:#27ae60; border:2.5px solid #fff;
        }
        .avatar-name {
          font-family:'Playfair Display',serif;
          font-size:17px; font-weight:700; color:var(--espresso); margin-bottom:4px;
        }
        .avatar-role {
          display:inline-flex; align-items:center; gap:5px;
          font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;
          background:linear-gradient(135deg, rgba(201,123,58,0.15), rgba(200,169,126,0.1));
          border:1px solid rgba(201,123,58,0.2); color:var(--accent);
          border-radius:20px; padding:3px 12px; margin-bottom:18px;
        }
        .avatar-divider { height:1px; background:rgba(200,169,126,0.15); margin:0 -22px 18px; }
        .meta-row {
          display:flex; align-items:center; gap:10px;
          padding:9px 12px; border-radius:10px;
          background:var(--foam); border:1px solid rgba(200,169,126,0.15);
          margin-bottom:8px; text-align:left;
        }
        .meta-row:last-child { margin-bottom:0; }
        .meta-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .meta-icon svg { width:13px; height:13px; stroke:var(--accent); fill:none; stroke-width:2; stroke-linecap:round; }
        .meta-label { font-size:10px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em; }
        .meta-val   { font-size:12.5px; font-weight:600; color:var(--roast); margin-top:1px; word-break:break-all; }

        /* skeleton */
        .skel {
          display:inline-block; border-radius:6px;
          background:linear-gradient(90deg,#f0e8df 25%,#f8f2eb 50%,#f0e8df 75%);
          backgroundSize:200% 100%; animation:shimmer 1.4s infinite;
        }

        /* ── FORM ── */
        .form-group { margin-bottom:16px; }
        .form-label {
          display:block; font-size:11px; font-weight:700;
          color:var(--roast); margin-bottom:7px;
          letter-spacing:0.04em; text-transform:uppercase;
        }
        .form-input {
          width:100%; padding:10px 13px;
          background:var(--foam); border:1.5px solid rgba(200,169,126,0.3);
          border-radius:10px; font-family:'DM Sans',sans-serif;
          font-size:13.5px; font-weight:500; color:var(--roast);
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .form-input::placeholder { color:var(--text-dim); font-weight:400; }
        .form-input:focus {
          border-color:var(--accent); background:#fff;
          box-shadow:0 0 0 3px rgba(201,123,58,0.12);
        }

        /* input with icon */
        .input-wrap { position:relative; }
        .input-wrap svg.input-icon {
          position:absolute; left:12px; top:50%; transform:translateY(-50%);
          width:15px; height:15px; stroke:var(--text-dim); fill:none;
          stroke-width:2; stroke-linecap:round; pointer-events:none;
        }
        .input-wrap .form-input { padding-left:38px; }
        .input-wrap .eye-btn {
          position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; padding:0;
          display:flex; align-items:center;
        }
        .input-wrap .eye-btn svg { width:15px; height:15px; stroke:var(--text-dim); fill:none; stroke-width:2; stroke-linecap:round; }

        /* hint text */
        .hint { font-size:11.5px; color:var(--text-dim); margin-top:5px; }

        /* ── BUTTONS ── */
        .btn-primary {
          display:inline-flex; align-items:center; justify-content:center; gap:7px;
          padding:10px 20px; border-radius:10px;
          background:linear-gradient(135deg, var(--accent), #e8913f);
          border:none; color:#fff;
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:700;
          cursor:pointer; letter-spacing:0.02em;
          box-shadow:0 4px 14px rgba(201,123,58,0.35); transition:all 0.2s;
        }
        .btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(201,123,58,0.45); }
        .btn-primary:disabled { opacity:0.6; cursor:not-allowed; box-shadow:none; }
        .btn-primary svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2.2; stroke-linecap:round; }

        .btn-dark {
          display:inline-flex; align-items:center; justify-content:center; gap:7px;
          padding:10px 20px; border-radius:10px;
          background:var(--espresso); border:none; color:var(--crema);
          font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:700;
          cursor:pointer; transition:opacity 0.2s;
          box-shadow:0 3px 10px rgba(26,15,10,0.25);
        }
        .btn-dark:hover:not(:disabled) { opacity:0.87; }
        .btn-dark:disabled { opacity:0.5; cursor:not-allowed; }
        .btn-dark svg { width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2; stroke-linecap:round; }

        .btn-ghost {
          display:inline-flex; align-items:center; gap:6px;
          padding:10px 16px; border-radius:10px;
          background:var(--foam); border:1.5px solid rgba(0,0,0,0.1);
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:#666;
          cursor:pointer; transition:all 0.2s;
        }
        .btn-ghost:hover { background:var(--milk); }

        /* ── SPINNER ── */
        .spinner {
          width:14px; height:14px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.35);
          border-top-color:#fff; animation:spin 0.7s linear infinite;
        }
        .spinner.dark { border-color:rgba(201,123,58,0.3); border-top-color:var(--accent); }

        /* ── OTP SECTION ── */
        .otp-info-box {
          display:flex; align-items:flex-start; gap:12px;
          background:rgba(201,123,58,0.05); border:1px solid rgba(201,123,58,0.18);
          border-radius:12px; padding:14px 16px; margin-bottom:18px;
        }
        .otp-info-icon {
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          background:rgba(201,123,58,0.12); border:1px solid rgba(201,123,58,0.2);
          display:flex; align-items:center; justify-content:center;
        }
        .otp-info-icon svg { width:15px; height:15px; stroke:var(--accent); fill:none; stroke-width:2; stroke-linecap:round; }
        .otp-info-title { font-size:12.5px; font-weight:700; color:var(--roast); margin-bottom:3px; }
        .otp-info-desc  { font-size:11.5px; color:var(--text-dim); line-height:1.55; }

        .otp-form-wrap { animation:otpIn 0.25s ease; }

        /* OTP input boxes */
        .otp-digits-label {
          font-size:11px; font-weight:700; color:var(--roast);
          text-transform:uppercase; letter-spacing:0.04em; margin-bottom:10px; display:block;
        }
        .otp-input {
          width:100%; padding:12px 16px; text-align:center;
          font-size:24px; font-weight:800; letter-spacing:0.5em;
          color:var(--espresso);
          background:var(--foam); border:1.5px solid rgba(200,169,126,0.3);
          border-radius:12px; outline:none; font-family:'DM Sans',sans-serif;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .otp-input:focus {
          border-color:var(--accent); background:#fff;
          box-shadow:0 0 0 3px rgba(201,123,58,0.12);
        }
        .otp-input::placeholder { color:rgba(200,169,126,0.5); font-size:16px; letter-spacing:0.3em; }

        /* section divider */
        .section-divider {
          height:1px; background:linear-gradient(to right, rgba(201,123,58,0.2), transparent);
          margin:24px 0;
        }

        /* security badge */
        .security-tag {
          display:inline-flex; align-items:center; gap:5px;
          font-size:10.5px; font-weight:700; color:#1a7a4a;
          background:rgba(39,174,96,0.08); border:1px solid rgba(39,174,96,0.18);
          border-radius:20px; padding:3px 10px; margin-bottom:14px;
        }
        .security-tag svg { width:10px; height:10px; stroke:currentColor; fill:none; stroke-width:2.5; stroke-linecap:round; }
      `}</style>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px',
            borderRadius: '10px', border: '1px solid rgba(200,169,126,0.3)',
            background: '#fff', color: '#2d1a10',
          },
          success: { iconTheme: { primary: '#c97b3a', secondary: '#fff' } },
        }}
      />

      <div className="profile-root">

        {/* ── PAGE HEADER ── */}
        <div className="page-header">
          <div className="breadcrumb">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            Admin
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Profil Admin</span>
          </div>
          <h1>Pengaturan Akun</h1>
          <p>Kelola informasi profil dan keamanan akun Anda.</p>
        </div>

        <div className="profile-grid">

          {/* ══ LEFT — AVATAR CARD ══ */}
          <div className="card">
            <div className="card-body avatar-card">
              {isFetching ? (
                <>
                  <span className="skel" style={{ width:88, height:88, borderRadius:'50%', display:'block', margin:'0 auto 14px' }} />
                  <span className="skel" style={{ width:120, height:16, display:'block', margin:'0 auto 8px' }} />
                  <span className="skel" style={{ width:70, height:22, borderRadius:20, display:'block', margin:'0 auto 18px' }} />
                </>
              ) : (
                <>
                  <div className="avatar-big" style={{ background: avBg, color: avFg }}>
                    {(userProfile.name || localUser.name || 'A')[0].toUpperCase()}
                    <span className="avatar-online" />
                  </div>
                  <p className="avatar-name">{userProfile.name || '—'}</p>
                  <span className="avatar-role">
                    <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    {localUser.role || 'admin'}
                  </span>
                </>
              )}

              <div className="avatar-divider" />

              <div className="meta-row">
                <div className="meta-icon" style={{ background:'rgba(201,123,58,0.1)' }}>
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p className="meta-label">Nama</p>
                  {isFetching
                    ? <span className="skel" style={{ width:100, height:12, display:'block', marginTop:3 }} />
                    : <p className="meta-val">{userProfile.name || '—'}</p>}
                </div>
              </div>

              <div className="meta-row">
                <div className="meta-icon" style={{ background:'rgba(37,99,235,0.1)' }}>
                  <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <p className="meta-label">Email</p>
                  {isFetching
                    ? <span className="skel" style={{ width:140, height:12, display:'block', marginTop:3 }} />
                    : <p className="meta-val">{userProfile.email || '—'}</p>}
                </div>
              </div>

              <div className="meta-row">
                <div className="meta-icon" style={{ background:'rgba(39,174,96,0.1)' }}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <p className="meta-label">Status</p>
                  <p className="meta-val" style={{ color:'#1a7a4a' }}>● Aktif</p>
                </div>
              </div>
            </div>
          </div>

          {/* ══ RIGHT — FORM CARD ══ */}
          <div>

            {/* ── Edit Profil ── */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <div className="card-header-icon">
                  <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div>
                  <h2>Informasi Dasar</h2>
                  <p>Perbarui nama dan alamat email akun</p>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <div className="input-wrap">
                      <svg className="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <input
                        type="text" className="form-input"
                        placeholder="Nama lengkap Anda"
                        value={userProfile.name}
                        onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Aktif</label>
                    <div className="input-wrap">
                      <svg className="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <input
                        type="email" className="form-input" required
                        placeholder="email@domain.com"
                        value={userProfile.email}
                        onChange={e => setUserProfile({ ...userProfile, email: e.target.value })}
                      />
                    </div>
                    <p className="hint">Email ini digunakan untuk menerima kode OTP.</p>
                  </div>
                  <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading
                      ? <><div className="spinner" /> Menyimpan...</>
                      : <><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Simpan Perubahan</>
                    }
                  </button>
                </form>
              </div>
            </div>

            {/* ── Ganti Password ── */}
            <div className="card">
              <div className="card-header">
                <div className="card-header-icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                </div>
                <div>
                  <h2>Keamanan & Password</h2>
                  <p>Ubah password menggunakan verifikasi OTP</p>
                </div>
              </div>
              <div className="card-body">

                {step === 1 ? (
                  <>
                    <div className="otp-info-box">
                      <div className="otp-info-icon">
                        <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.22 2 2 0 012.1 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
                      </div>
                      <div>
                        <p className="otp-info-title">Cara Kerja OTP</p>
                        <p className="otp-info-desc">
                          Kode 6 digit akan dikirim ke email yang terdaftar.
                          Pastikan email sudah benar di bagian <strong>Informasi Dasar</strong> sebelum melanjutkan.
                        </p>
                      </div>
                    </div>

                    <span className="security-tag">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      Diverifikasi via Email
                    </span>

                    <div>
                      <button onClick={handleRequestOTP} disabled={isLoading} className="btn-dark">
                        {isLoading
                          ? <><div className="spinner" /> Mengirim OTP...</>
                          : <><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Kirim Kode OTP ke Email</>
                        }
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="otp-form-wrap">
                    <div className="otp-info-box" style={{ background:'rgba(39,174,96,0.04)', borderColor:'rgba(39,174,96,0.18)' }}>
                      <div className="otp-info-icon" style={{ background:'rgba(39,174,96,0.1)', borderColor:'rgba(39,174,96,0.2)' }}>
                        <svg viewBox="0 0 24 24" stroke="#1a7a4a"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </div>
                      <div>
                        <p className="otp-info-title" style={{ color:'#1a7a4a' }}>OTP Terkirim!</p>
                        <p className="otp-info-desc">Cek email <strong>{userProfile.email}</strong>. Kode berlaku selama <strong>10 menit</strong>.</p>
                      </div>
                    </div>

                    <form onSubmit={handleResetPassword}>
                      <div className="form-group">
                        <label className="otp-digits-label">Kode OTP (6 Digit)</label>
                        <input
                          type="text" className="otp-input"
                          maxLength="6" placeholder="······"
                          value={formData.otp} required
                          onChange={e => setFormData({ ...formData, otp: e.target.value.replace(/\D/g,'') })}
                        />
                      </div>

                      <div className="section-divider" />

                      <div className="form-group">
                        <label className="form-label">Password Baru</label>
                        <div className="input-wrap">
                          <svg className="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          <input
                            type={showPass ? 'text' : 'password'}
                            className="form-input" required
                            placeholder="Minimal 6 karakter"
                            value={formData.newPassword}
                            onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                            style={{ paddingRight: 40 }}
                          />
                          <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                            <svg viewBox="0 0 24 24">
                              {showPass
                                ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                              }
                            </svg>
                          </button>
                        </div>
                        <p className="hint">Gunakan kombinasi huruf, angka, dan simbol untuk keamanan lebih baik.</p>
                      </div>

                      <div style={{ display:'flex', gap:10, marginTop:4 }}>
                        <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                          Batal
                        </button>
                        <button type="submit" disabled={isLoading} className="btn-primary" style={{ flex:1 }}>
                          {isLoading
                            ? <><div className="spinner" /> Menyimpan...</>
                            : <><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> Konfirmasi Password Baru</>
                          }
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>{/* end right */}
        </div>{/* end grid */}
      </div>
    </>
  );
}