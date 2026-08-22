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
    borderRadius: '0.375rem',
    color: isActive ? '#0B111E' : 'var(--text-secondary)',
    background: isActive ? 'var(--primary)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 800 : 500,
    fontSize: '0.875rem',
    fontFamily: 'var(--font-heading)',
    transition: 'all 0.15s ease',
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
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.375rem', display: 'flex' }}>
          <Activity color="#0B111E" size={22} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            DAYFLOW
          </h1>
          <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            WORKFORCE AI
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <LayoutDashboard size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Overview
            </>
          )}
        </NavLink>
        <NavLink to="/employees" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Users size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Employees
            </>
          )}
        </NavLink>
        <NavLink to="/attendance" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Clock size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Attendance
            </>
          )}
        </NavLink>
        <NavLink to="/leave" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Calendar size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Leave & Absence
            </>
          )}
        </NavLink>
        <NavLink to="/payroll" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <DollarSign size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Payroll
            </>
          )}
        </NavLink>

        <div style={{ height: '1px', background: 'var(--divider)', margin: '1.1rem 0 0.65rem 0' }} />
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.85rem', marginBottom: '0.35rem', fontWeight: 800 }}>
          Intelligence Engine
        </div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Command Center
              </div>
              <span className="animate-live-pulse" style={{ background: isActive ? '#0B111E' : 'var(--danger)', color: isActive ? 'var(--primary)' : '#FFFFFF', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.2rem', fontWeight: 800 }}>LIVE</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <AlertTriangle size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Risk Analysis
            </>
          )}
        </NavLink>

        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> What-If Simulator
              </div>
              <span style={{ background: isActive ? '#0B111E' : 'var(--primary-soft)', color: isActive ? 'var(--primary)' : 'var(--primary)', border: '1px solid var(--primary)', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.2rem', fontWeight: 800 }}>AI</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Bot size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> HR Copilot
            </>
          )}
        </NavLink>

        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <FileText size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Decision Traces
            </>
          )}
        </NavLink>

        <div style={{ height: '1px', background: 'var(--divider)', margin: '1.1rem 0 0.65rem 0' }} />

        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Shield size={18} color={isActive ? '#0B111E' : 'var(--text-secondary)'} /> Security & Audit
            </>
          )}
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '0.375rem', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B111E', fontWeight: 900, fontSize: '0.85rem' }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Admin HR</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 700 }}>HR Director</div>
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
