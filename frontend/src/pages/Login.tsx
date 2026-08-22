import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Shield, Zap, Lock, Mail, Sparkles } from 'lucide-react';
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
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,7,10,1) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', background: 'var(--primary-glow)', filter: 'blur(140px)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', padding: '1rem', borderRadius: '0.9rem', display: 'flex', boxShadow: '0 0 30px var(--primary-glow)' }}>
              <Activity color="#ffffff" size={42} />
            </div>
            <h1 className="gradient-text" style={{ fontSize: '3.6rem', margin: 0, fontWeight: 900, letterSpacing: '-0.03em' }}>Dayflow</h1>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '4rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            AI-Powered Workforce<br />Decision Intelligence Platform
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {[
              { icon: Brain, title: 'Predictive Workforce Risk', desc: 'Forecast team capacity bottlenecks and attendance decline before operational impact.' },
              { icon: Zap, title: 'What-If Workforce Simulator', desc: 'Test leave approvals and task reassignments in interactive AI scenario simulations.' },
              { icon: Shield, title: 'Full Decision Traceability', desc: 'Transparent audit logs and reasoning steps for every recommendation.' },
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.18)', color: 'var(--accent-mint)', padding: '0.3rem 0.8rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1rem' }}>
            <Sparkles size={13} /> Dayflow HR Portal
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Sign in to access your Workforce Command Center
          </p>

          {errorMsg && (
            <div style={{ background: 'rgba(244,63,94,0.18)', border: '1px solid rgba(244,63,94,0.45)', color: 'var(--accent-rose)', padding: '0.75rem 1rem', borderRadius: '0.6rem', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>
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
              {loading ? 'Authenticating with Dayflow Engine...' : 'Sign In to Dayflow'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.85rem', background: 'rgba(0,0,0,0.35)', borderRadius: '0.6rem', border: '1px solid var(--border-subtle)' }}>
            <strong>Demo Credentials:</strong><br />
            <code>admin@dayflow.com</code> / <code>Demo@1234</code>
          </div>
        </div>
      </div>
    </div>
  );
}
