import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Shield, Zap, Lock, Mail } from 'lucide-react';
import { apiPost } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('admin@dayflow.com');
  const [password, setPassword] = useState('Demo@1234');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiPost('/auth/login', { email, password });
      const token = res.access_token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(res.user));
        navigate('/dashboard');
      } else {
        setErrorMsg('Invalid response from authentication server.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-base)' }}>
      {/* Left side branding */}
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(9,10,16,1) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'var(--primary-glow)', filter: 'blur(120px)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '1rem', borderRadius: '1rem', display: 'flex', boxShadow: '0 0 25px var(--primary-glow)' }}>
              <Activity color="#fff" size={40} />
            </div>
            <h1 className="gradient-text" style={{ fontSize: '3.2rem', margin: 0, fontWeight: 800 }}>ThinkBlaze</h1>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '4rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            Dayflow — AI-Powered Workforce<br />Decision Intelligence
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {[
              { icon: Brain, title: 'Predictive Intelligence', desc: 'Forecast operational workforce risks before bottlenecks occur.' },
              { icon: Zap, title: 'What-If Workforce Simulator', desc: 'Test leave approvals and capacity reassignments in real time.' },
              { icon: Shield, title: 'Transparent Decision Traceability', desc: 'Audit reasoning steps for every AI recommendation.' },
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="glass-panel" style={{ padding: '0.85rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                  <feature.icon size={22} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 700 }}>{feature.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div className="glass-panel-glow" style={{ width: '100%', maxWidth: '420px', padding: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', textAlign: 'center', fontWeight: 800 }}>System Login</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Sign in to access HR Command Center
          </p>

          {errorMsg && (
            <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)', color: 'var(--accent-rose)', padding: '0.75rem 1rem', borderRadius: '0.6rem', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@dayflow.com"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }}>
              {loading ? 'Authenticating with Backend...' : 'Sign In to Dayflow'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.6rem', border: '1px solid var(--border-subtle)' }}>
            <strong>Demo Credentials:</strong><br />
            <code>admin@dayflow.com</code> / <code>Demo@1234</code>
          </div>
        </div>
      </div>
    </div>
  );
}
