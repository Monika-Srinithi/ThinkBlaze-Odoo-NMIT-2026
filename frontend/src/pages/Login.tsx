import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Shield, Zap, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg)' }}>
      {/* Left side editorial hero branding */}
      <div style={{ flex: 1.2, padding: '4.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '3.5rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.65rem', borderRadius: '0.375rem', display: 'flex' }}>
              <Activity color="#08090A" size={26} />
            </div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)', display: 'block' }}>DAYFLOW</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.08em' }}>WORKFORCE AI</span>
            </div>
          </div>

          <h1 style={{ fontSize: '3.8rem', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '1.5rem', maxWidth: '640px' }}>
            Next-Gen Workforce <span style={{ color: 'var(--primary)' }}>Intelligence</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.6, marginBottom: '3.5rem', fontWeight: 400 }}>
            Predictive HR decision engine powered by multi-agent risk modeling, capacity simulation, and operational execution traces.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '600px' }}>
            {[
              { icon: Brain, title: 'Predictive Risk Engine', desc: 'Forecast team bottlenecks before operational impact.' },
              { icon: Zap, title: 'What-If Simulator', desc: 'Interactive leave scenario simulation & capacity modeling.' },
              { icon: Shield, title: 'Full Traceability', desc: 'Transparent audit logs and multi-agent execution steps.' },
              { icon: Sparkles, title: 'AI HR Copilot', desc: 'Instant policy reasoning & workflow automation.' },
            ].map((f, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '0.5rem' }}>
                <f.icon size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 800 }}>{f.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          © 2026 Dayflow Workforce AI Inc. Enterprise Edition.
        </div>
      </div>

      {/* Right side login form */}
      <div style={{ flex: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: 'var(--bg)' }}>
        <div className="glass-panel-glow" style={{ width: '100%', maxWidth: '420px', padding: '3rem', borderRadius: '0.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.35rem 0.85rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
            <Sparkles size={13} /> Dayflow HR Portal
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', fontWeight: 900, letterSpacing: '-0.03em' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Sign in to access your Workforce Command Center
          </p>

          {errorMsg && (
            <div style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Command Center'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Demo Account: <strong style={{ color: 'var(--primary)' }}>admin@dayflow.com</strong> / <strong style={{ color: 'var(--primary)' }}>Demo@1234</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
