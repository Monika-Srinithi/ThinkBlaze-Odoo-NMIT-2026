import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Shield, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login
    setTimeout(() => {
      localStorage.setItem('token', 'fake-jwt-token');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-base)' }}>
      {/* Left side branding */}
      <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(15,15,26,1) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'var(--primary-glow)', filter: 'blur(100px)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '1rem', display: 'flex' }}>
              <Activity color="#fff" size={40} />
            </div>
            <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: 700 }}>ThinkBlaze</h1>
          </div>
          
          <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '4rem', color: 'var(--text-secondary)' }}>
            AI-Powered Workforce<br/>Decision Intelligence
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {[
              { icon: Brain, title: 'Predictive Intelligence', desc: 'Forecast workforce risks before they happen.' },
              { icon: Zap, title: 'What-If Simulations', desc: 'Test decisions with AI-powered scenario planning.' },
              { icon: Shield, title: 'Decision Traceability', desc: 'Full audit trails of AI recommendations.' }
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                  <feature.icon size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>{feature.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side login */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', padding: '3rem', borderRadius: '1.5rem', border: '1px solid var(--border)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 2rem 0', textAlign: 'center' }}>Welcome Back</h2>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                placeholder="admin@dayflow.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '1rem', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
            Demo: admin@dayflow.com / Demo@1234
          </div>
        </div>
      </div>
    </div>
  );
}
