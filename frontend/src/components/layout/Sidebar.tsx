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

  const navItemStyle = (isActive: boolean, isAi: boolean = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.68rem 0.95rem',
    borderRadius: '0.5rem',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive ? (isAi ? 'var(--ai-soft)' : 'var(--primary-soft)') : 'transparent',
    borderLeft: isActive ? `3px solid ${isAi ? 'var(--ai)' : 'var(--primary)'}` : '3px solid transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.875rem',
    fontFamily: 'var(--font-heading)',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{
      width: '265px',
      height: '100vh',
      background: 'var(--sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'background-color 0.25s ease, border-color 0.25s ease',
    }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.35rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ background: 'var(--primary-soft)', border: '1px solid var(--primary)', padding: '0.55rem', borderRadius: '0.6rem', display: 'flex' }}>
          <Activity color="var(--primary)" size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
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

        <div style={{ height: '1px', background: 'var(--divider)', margin: '1.1rem 0 0.65rem 0' }} />
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.85rem', marginBottom: '0.35rem', fontWeight: 700 }}>
          Intelligence Engine
        </div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive, true)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={18} color="var(--ai)" /> Command Center</div>
            <span className="animate-live-pulse" style={{ background: 'var(--danger)', color: '#FFFFFF', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.3rem', fontWeight: 800 }}>LIVE</span>
          </div>
        </NavLink>

        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive, true)}>
          <AlertTriangle size={18} color="var(--ai)" /> Risk Analysis
        </NavLink>

        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive, true)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={18} color="var(--ai)" /> What-If Simulator</div>
            <span style={{ background: 'var(--ai-soft)', color: 'var(--ai)', border: '1px solid var(--ai)', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.3rem', fontWeight: 800 }}>WOW</span>
          </div>
        </NavLink>

        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive, true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={18} color="var(--ai)" /> HR Copilot
          </div>
        </NavLink>

        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive, true)}>
          <FileText size={18} color="var(--ai)" /> Decision Traces
        </NavLink>

        <div style={{ height: '1px', background: 'var(--divider)', margin: '1.1rem 0 0.65rem 0' }} />

        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          <Shield size={18} /> Security & Audit
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--primary-soft)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 900, fontSize: '0.85rem' }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Admin HR</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 600 }}>HR Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.15s' }} title="Logout" onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export { Sidebar };
