import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, Calendar, DollarSign,
  Activity, AlertTriangle, Zap, Bot, FileText, Shield, LogOut
} from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 0.95rem',
    borderRadius: '0.65rem',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    background: isActive ? 'linear-gradient(135deg, rgba(0,240,255,0.22) 0%, rgba(0,240,255,0.06) 100%)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.9rem',
    fontFamily: 'var(--font-heading)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: isActive ? '0 0 20px var(--primary-glow)' : 'none',
  });

  return (
    <div style={{
      width: '265px',
      height: '100vh',
      background: 'rgba(10, 14, 22, 0.96)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand Header */}
      <div style={{ padding: '1.6rem 1.35rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #00f0ff 0%, #00a8b5 100%)', padding: '0.6rem', borderRadius: '0.7rem', display: 'flex', boxShadow: '0 0 22px var(--primary-glow)' }}>
          <Activity color="#06070a" size={24} />
        </div>
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Dayflow
          </h1>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-mint)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Workforce AI
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
          <LayoutDashboard size={19} /> Overview
        </NavLink>
        <NavLink to="/employees" style={({ isActive }) => navItemStyle(isActive)}>
          <Users size={19} /> Employees
        </NavLink>
        <NavLink to="/attendance" style={({ isActive }) => navItemStyle(isActive)}>
          <Clock size={19} /> Attendance
        </NavLink>
        <NavLink to="/leave" style={({ isActive }) => navItemStyle(isActive)}>
          <Calendar size={19} /> Leave & Absence
        </NavLink>
        <NavLink to="/payroll" style={({ isActive }) => navItemStyle(isActive)}>
          <DollarSign size={19} /> Payroll
        </NavLink>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.1rem 0 0.65rem 0' }} />
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.85rem', marginBottom: '0.35rem', fontWeight: 800 }}>
          Intelligence Engine
        </div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={19} /> Command Center</div>
            <span className="animate-live-pulse" style={{ background: 'var(--accent-rose)', color: '#fff', fontSize: '0.65rem', padding: '0.12rem 0.5rem', borderRadius: '0.35rem', fontWeight: 800 }}>LIVE</span>
          </div>
        </NavLink>

        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive)}>
          <AlertTriangle size={19} /> Risk Analysis
        </NavLink>

        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={19} /> What-If Simulator</div>
            <span style={{ background: 'linear-gradient(135deg, #00f0ff, #e040fb)', color: '#06070a', fontSize: '0.65rem', padding: '0.12rem 0.5rem', borderRadius: '0.35rem', fontWeight: 800 }}>WOW</span>
          </div>
        </NavLink>

        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={19} color="var(--accent-magenta)" /> HR Copilot
          </div>
        </NavLink>

        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive)}>
          <FileText size={19} /> Decision Traces
        </NavLink>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.1rem 0 0.65rem 0' }} />

        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          <Shield size={19} /> Security & Audit
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ padding: '1.1rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f0ff, #00a8b5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06070a', fontWeight: 900, fontSize: '0.85rem' }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Admin HR</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-mint)', fontWeight: 700 }}>HR Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.15s' }} title="Logout" onMouseOver={e => e.currentTarget.style.color = 'var(--accent-rose)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <LogOut size={17} />
        </button>
      </div>
    </div>
  );
}

export { Sidebar };
