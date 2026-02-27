import { useState, useEffect } from 'react';
import api from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/* ─── SVG ICONS ─── */
const Icons = {
  Mail: () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Lock: () => <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
};

export default function KasirProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [step, setStep] = useState(1); // 1: Profil, 2: Masukkan OTP
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ otp: '', newPassword: '' });
  
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    api.get(`/api/profile/${localUser.id}`)
      .then(res => setUserProfile(res.data))
      .catch(() => toast.error('Gagal memuat profil'));
  }, [localUser.id]);

  const handleRequestOTP = async () => {
    setIsLoading(true);
    try {
      await api.post('/api/profile/request-otp', { id: localUser.id });
      toast.success('Kode OTP telah meluncur ke email Anda!');
      setStep(2); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 6) return toast.error('Password minimal 6 karakter!');
    
    setIsLoading(true);
    try {
      await api.post('/api/profile/reset-password', {
        id: localUser.id,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      toast.success('Password diperbarui! Silakan login kembali.');
      setTimeout(() => {
        localStorage.clear();
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#faf6f0' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #e8d5b7', borderTopColor: '#c97b3a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --espresso: #1a0f0a; --roast: #2d1a10; --umber: #5c3d2e;
          --crema: #c8a97e; --latte: #e8d5b7;
          --foam: #faf6f0; --milk: #f5ede0; --white: #ffffff;
          --accent: #c97b3a; --accent-h: #b36829;
          --text-dim: #8b7355;
          --shadow-sm: 0 2px 12px rgba(0,0,0,0.06);
          --shadow-md: 0 8px 24px rgba(0,0,0,0.08);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .prof-root {
          min-height: 100%; background: var(--foam); padding: 40px 20px;
          font-family: 'DM Sans', sans-serif; color: var(--espresso);
          display: flex; justify-content: center;
        }

        .prof-card {
          background: var(--white); border-radius: 24px;
          width: 100%; max-width: 580px;
          box-shadow: var(--shadow-md); border: 1px solid rgba(0,0,0,0.04);
          overflow: hidden; animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── HEADER ── */
        .prof-head {
          padding: 32px 36px; border-bottom: 1px solid var(--milk);
          display: flex; align-items: center; justify-content: space-between;
        }
        .prof-title {
          font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700;
          color: var(--espresso); letter-spacing: -0.02em; line-height: 1.1;
        }
        .prof-title span { color: var(--accent); }
        .prof-badge {
          background: var(--milk); color: var(--umber);
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; padding: 6px 14px; border-radius: 100px;
        }

        .prof-body { padding: 36px; }

        /* ── USER INFO ── */
        .u-box {
          display: flex; align-items: center; gap: 20px;
          background: linear-gradient(135deg, var(--foam), var(--white));
          border: 1px solid var(--milk); border-radius: 16px;
          padding: 20px 24px; margin-bottom: 32px;
        }
        .u-av {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #e0a060);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 700; color: var(--white);
          box-shadow: 0 4px 12px rgba(201,123,58,0.3); flex-shrink: 0;
        }
        .u-name { font-size: 20px; font-weight: 700; color: var(--espresso); margin-bottom: 4px; }
        .u-email { font-size: 13.5px; color: var(--text-dim); display: flex; align-items: center; gap: 6px; }

        /* ── SECURITY SECTION ── */
        .sec-title {
          font-size: 14px; font-weight: 700; color: var(--espresso);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .sec-title svg { color: var(--accent); }

        .sec-desc { font-size: 13.5px; color: var(--text-dim); line-height: 1.6; margin-bottom: 24px; }

        .btn-main {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--espresso); color: var(--crema);
          padding: 14px 20px; border-radius: 12px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-main:hover:not(:disabled) { background: var(--roast); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .btn-main:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── FORM OTP ── */
        .otp-form {
          background: var(--foam); border: 1px solid var(--milk);
          border-radius: 16px; padding: 24px;
          animation: fadeUp 0.3s ease;
        }
        .f-group { margin-bottom: 16px; }
        .f-label {
          display: block; font-size: 11px; font-weight: 700; color: var(--umber);
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;
        }
        .f-inp {
          width: 100%; padding: 12px 16px; box-sizing: border-box;
          background: var(--white); border: 1.5px solid var(--milk); border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--espresso);
          outline: none; transition: all 0.2s;
        }
        .f-inp:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,123,58,0.1); }
        .f-inp.otp-box { text-align: center; font-size: 24px; font-weight: 700; letter-spacing: 0.4em; }

        .form-acts { display: flex; gap: 12px; margin-top: 24px; }
        .btn-cancel {
          flex: 1; background: var(--white); color: var(--umber);
          border: 1.5px solid var(--milk); border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-cancel:hover { background: var(--milk); }
        .btn-save {
          flex: 2; background: var(--accent); color: var(--white);
          border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-save:hover:not(:disabled) { background: var(--accent-h); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(201,123,58,0.25); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="prof-root">
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 13, borderRadius: 10 } }} />
        
        <div className="prof-card">
          <div className="prof-head">
            <h1 className="prof-title">Profil <span>Saya</span></h1>
            <span className="prof-badge">{userProfile.role}</span>
          </div>

          <div className="prof-body">
            {/* User Badge */}
            <div className="u-box">
              <div className="u-av">
                {userProfile.name[0].toUpperCase()}
              </div>
              <div>
                <p className="u-name">{userProfile.name}</p>
                <p className="u-email">
                  <Icons.Mail /> {userProfile.email || 'Email belum dikonfigurasi'}
                </p>
              </div>
            </div>

            {/* Security Area */}
            <h2 className="sec-title"><Icons.Shield /> Keamanan Akun</h2>
            
            {step === 1 ? (
              <div>
                <p className="sec-desc">Untuk menjaga keamanan akun Kaffe POS Anda, perubahan password wajib melalui verifikasi kode OTP yang akan dikirimkan ke email terdaftar di atas.</p>
                <button className="btn-main" onClick={handleRequestOTP} disabled={isLoading}>
                  <Icons.Lock /> {isLoading ? 'Mengirim Kode...' : 'Minta Kode OTP via Email'}
                </button>
              </div>
            ) : (
              <form className="otp-form" onSubmit={handleResetPassword}>
                <div className="f-group">
                  <label className="f-label">Kode OTP (Cek Email Anda)</label>
                  <input 
                    type="text" required maxLength="6" placeholder="------"
                    className="f-inp otp-box"
                    value={formData.otp} 
                    onChange={e => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
                <div className="f-group" style={{ marginBottom: 0 }}>
                  <label className="f-label">Password Baru</label>
                  <input 
                    type="password" required placeholder="Minimal 6 karakter"
                    className="f-inp"
                    value={formData.newPassword} 
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  />
                </div>

                <div className="form-acts">
                  <button type="button" className="btn-cancel" onClick={() => setStep(1)} disabled={isLoading}>
                    Batal
                  </button>
                  <button type="submit" className="btn-save" disabled={isLoading}>
                    <Icons.Lock /> {isLoading ? 'Memproses...' : 'Simpan Password'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  );
}