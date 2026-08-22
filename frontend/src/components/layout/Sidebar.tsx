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
    padding: '0.68rem 0.95rem',
    borderRadius: '0.5rem',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.875rem',
    fontFamily: 'var(--font-heading)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: isActive ? '0 0 15px var(--primary-glow)' : 'none',
  });

  return (
    <div style={{
      width: '265px',
      height: '100vh',
      background: 'var(--bg-base)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.35rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-violet) 100%)', padding: '0.55rem', borderRadius: '0.6rem', display: 'flex', boxShadow: '0 0 18px var(--primary-glow)' }}>
          <Activity color="#FFFFFF" size={24} />
        </div>
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Dayflow
          </h1>
          <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Workforce AI
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
          <LayoutDashboard size={18} /> Overview
        </NavLink>
        <NavLink to="/employees" style={({ isActive }) => navItemStyle(isActive)}>
          <Users size={18} /> Employees
        </NavLink>
        <NavLink to="/attendance" style={({ isActive }) => navItemStyle(isActive)}>
          <Clock size={18} /> Attendance
        </NavLink>
        <NavLink to="/leave" style={({ isActive }) => navItemStyle(isActive)}>
          <Calendar size={18} /> Leave & Absence
        </NavLink>
        <NavLink to="/payroll" style={({ isActive }) => navItemStyle(isActive)}>
          <DollarSign size={18} /> Payroll
        </NavLink>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.1rem 0 0.65rem 0' }} />
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.85rem', marginBottom: '0.35rem', fontWeight: 700 }}>
          Intelligence Engine
        </div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={18} /> Command Center</div>
            <span className="animate-live-pulse" style={{ background: 'var(--accent-rose)', color: '#ffffff', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.3rem', fontWeight: 800 }}>LIVE</span>
          </div>
        </NavLink>

        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive)}>
          <AlertTriangle size={18} /> Risk Analysis
        </NavLink>

        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={18} /> What-If Simulator</div>
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent-violet))', color: '#FFFFFF', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.3rem', fontWeight: 800 }}>WOW</span>
          </div>
        </NavLink>

        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={18} color="var(--accent-violet)" /> HR Copilot
          </div>
        </NavLink>

        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive)}>
          <FileText size={18} /> Decision Traces
        </NavLink>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1.1rem 0 0.65rem 0' }} />

        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          <Shield size={18} /> Security & Audit
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem' }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Admin HR</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 600 }}>HR Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }} title="Logout" onMouseOver={e => e.currentTarget.style.color = 'var(--accent-rose)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export { Sidebar };
