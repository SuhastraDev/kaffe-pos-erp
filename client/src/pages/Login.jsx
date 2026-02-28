import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

/* ─── ICONS ─── */
const Icons = {
  Email: () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Lock: () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Spinner: () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2.5" className="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login berhasil! Mengalihkan...', { icon: '☕' });

      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/kasir/pos');
        }
      }, 1000);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --espresso: #1a0f0a; --roast: #2d1a10; --umber: #5c3d2e;
          --crema: #c8a97e; --latte: #e8d5b7;
          --foam: #faf6f0; --milk: #f5ede0; --white: #ffffff;
          --accent: #c97b3a; 
          --text-dim: #8b7355;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .spin { animation: spin 1s linear infinite; }

        .login-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--foam) 0%, var(--milk) 100%);
          font-family: 'DM Sans', sans-serif;
          padding: 20px; position: relative; overflow: hidden;
        }

        /* Ornamen Latar Belakang */
        .login-root::before {
          content: ''; position: absolute; top: -10%; left: -5%;
          width: 40vw; height: 40vw; background: radial-gradient(circle, rgba(201,123,58,0.04) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .login-root::after {
          content: ''; position: absolute; bottom: -15%; right: -10%;
          width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(26,15,10,0.03) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none;
        }

        .login-card {
          background: var(--white);
          width: 100%; max-width: 420px;
          border-radius: 28px;
          box-shadow: 0 20px 40px rgba(45,26,14,0.06), 0 1px 3px rgba(0,0,0,0.02);
          border: 1px solid rgba(201,123,58,0.1);
          position: relative; z-index: 10;
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-head { padding: 48px 40px 24px; text-align: center; }
        .login-logo {
          width: 64px; height: 64px; margin: 0 auto 20px;
          background: linear-gradient(135deg, var(--accent), var(--crema));
          border-radius: 18px; display: flex; align-items: center; justify-content: center;
          font-size: 32px; box-shadow: 0 8px 16px rgba(201,123,58,0.25);
          transform: rotate(-5deg); transition: transform 0.3s;
        }
        .login-card:hover .login-logo { transform: rotate(0deg) scale(1.05); }

        .login-title {
          font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800;
          color: var(--espresso); letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 8px;
        }
        .login-title span { color: var(--accent); }
        .login-sub { font-size: 14px; color: var(--text-dim); }

        .login-body { padding: 0 40px 48px; }

        .f-group { margin-bottom: 20px; }
        .f-label {
          display: block; font-size: 11.5px; font-weight: 700; color: var(--umber);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;
        }
        .inp-wrap { position: relative; }
        .inp-wrap svg {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #bba890; pointer-events: none; transition: color 0.2s;
        }
        .f-inp {
          width: 100%; padding: 16px 16px 16px 46px; box-sizing: border-box;
          background: var(--foam); border: 1.5px solid var(--milk); border-radius: 14px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; color: var(--espresso);
          outline: none; transition: all 0.2s;
        }
        .f-inp:focus { background: var(--white); border-color: var(--accent); box-shadow: 0 0 0 4px rgba(201,123,58,0.12); }
        .f-inp:focus + svg, .inp-wrap:focus-within svg { color: var(--accent); }
        .f-inp::placeholder { color: #c4b09a; font-weight: 400; }

        .btn-submit {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          background: var(--espresso); color: var(--crema);
          padding: 16px; border-radius: 14px; border: none;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.03em;
          cursor: pointer; transition: all 0.3s ease; margin-top: 12px;
        }
        .btn-submit:hover:not(:disabled) {
          background: var(--roast); transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26,15,10,0.2); color: var(--white);
        }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Demo Accounts */
        .demo-section {
          margin-top: 24px; padding-top: 20px;
          border-top: 1px dashed rgba(200,169,126,0.3);
        }
        .demo-title {
          font-size: 11px; font-weight: 700; color: var(--text-dim);
          text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px;
          text-align: center;
        }
        .demo-grid { display: flex; flex-direction: column; gap: 6px; }
        .demo-card {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          background: var(--foam); border: 1px solid var(--milk);
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .demo-card:hover {
          background: var(--milk); border-color: var(--crema);
          transform: translateX(3px);
        }
        .demo-avatar {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; flex-shrink: 0;
        }
        .demo-avatar.admin { background: rgba(201,123,58,0.15); color: var(--accent); }
        .demo-avatar.kasir { background: rgba(39,174,96,0.12); color: #1a7a4a; }
        .demo-info { flex: 1; min-width: 0; }
        .demo-name { font-size: 12px; font-weight: 700; color: var(--roast); }
        .demo-email { font-size: 11px; color: var(--text-dim); }
        .demo-role {
          font-size: 9px; font-weight: 700; padding: 2px 8px;
          border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em;
          flex-shrink: 0;
        }
        .demo-role.admin { background: rgba(201,123,58,0.12); color: var(--accent); }
        .demo-role.kasir { background: rgba(39,174,96,0.1); color: #1a7a4a; }
      `}</style>

      <div className="login-root">
        <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'DM Sans', fontSize: 14, borderRadius: 12 } }} />
        
        <div className="login-card">
          <div className="login-head">
            <div className="login-logo">☕</div>
            <h2 className="login-title">Kaffe <span>POS</span></h2>
            <p className="login-sub">Masuk untuk memulai manajemen kafe</p>
          </div>
          
          <div className="login-body">
            <form onSubmit={handleLogin}>
              
              <div className="f-group">
                <label className="f-label">Alamat Email</label>
                <div className="inp-wrap">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="f-inp"
                    placeholder="kasir@kaffe.com"
                  />
                  <Icons.Email />
                </div>
              </div>
              
              <div className="f-group">
                <label className="f-label">Password</label>
                <div className="inp-wrap">
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="f-inp"
                    placeholder="••••••••"
                  />
                  <Icons.Lock />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-submit"
              >
                {isLoading ? (
                  <><Icons.Spinner /> Mengautentikasi...</>
                ) : (
                  'Masuk ke Sistem'
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="demo-section">
              <p className="demo-title">Akun Demo — Klik untuk login</p>
              <div className="demo-grid">
                {[
                  { name: 'Admin', email: 'admin@kafe.com', password: 'password', role: 'admin' },
                  { name: 'Indra', email: 'indra@kafe.com', password: 'password', role: 'kasir' },
                  { name: 'Raden', email: 'raden@kafe.com', password: 'password', role: 'kasir' },
                  { name: 'Kasir', email: 'kasir@kafe.com', password: 'password', role: 'kasir' },
                ].map((acc) => (
                  <div key={acc.email} className="demo-card" onClick={() => { setEmail(acc.email); setPassword(acc.password); }}>
                    <div className={`demo-avatar ${acc.role}`}>{acc.name[0]}</div>
                    <div className="demo-info">
                      <p className="demo-name">{acc.name}</p>
                      <p className="demo-email">{acc.email}</p>
                    </div>
                    <span className={`demo-role ${acc.role}`}>{acc.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}