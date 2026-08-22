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
    borderRadius: '0.25rem',
    color: isActive ? '#0C0C0C' : '#888888',
    background: isActive ? '#FFFFFF' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 900 : 500,
    fontSize: '0.875rem',
    fontFamily: 'var(--font-heading)',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{
      width: '265px',
      height: '100vh',
      background: 'var(--sidebar)',
      borderRight: '1px solid #222222',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'background-color 0.25s ease, border-color 0.25s ease',
    }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.35rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ background: '#FFFFFF', padding: '0.5rem', borderRadius: '0.25rem', display: 'flex' }}>
          <Activity color="#0C0C0C" size={22} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#FFFFFF' }}>
            DAYFLOW
          </h1>
          <div style={{ fontSize: '0.68rem', color: '#888888', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            WORKFORCE AI
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <LayoutDashboard size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Overview
            </>
          )}
        </NavLink>
        <NavLink to="/employees" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Users size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Employees
            </>
          )}
        </NavLink>
        <NavLink to="/attendance" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Clock size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Attendance
            </>
          )}
        </NavLink>
        <NavLink to="/leave" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Calendar size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Leave & Absence
            </>
          )}
        </NavLink>
        <NavLink to="/payroll" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <DollarSign size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Payroll
            </>
          )}
        </NavLink>

        <div style={{ height: '1px', background: '#222222', margin: '1.1rem 0 0.65rem 0' }} />
        <div style={{ fontSize: '0.68rem', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.85rem', marginBottom: '0.35rem', fontWeight: 800 }}>
          Intelligence Engine
        </div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Command Center
              </div>
              <span className="animate-live-pulse" style={{ background: isActive ? '#0C0C0C' : '#FFFFFF', color: isActive ? '#FFFFFF' : '#0C0C0C', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.2rem', fontWeight: 900 }}>LIVE</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <AlertTriangle size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Risk Analysis
            </>
          )}
        </NavLink>

        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={18} color={isActive ? '#0C0C0C' : '#888888'} /> What-If Simulator
              </div>
              <span style={{ background: isActive ? '#0C0C0C' : 'rgba(255,255,255,0.1)', color: isActive ? '#FFFFFF' : '#FFFFFF', border: '1px solid #444444', fontSize: '0.65rem', padding: '0.12rem 0.45rem', borderRadius: '0.2rem', fontWeight: 800 }}>AI</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Bot size={18} color={isActive ? '#0C0C0C' : '#888888'} /> HR Copilot
            </>
          )}
        </NavLink>

        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <FileText size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Decision Traces
            </>
          )}
        </NavLink>

        <div style={{ height: '1px', background: '#222222', margin: '1.1rem 0 0.65rem 0' }} />

        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Shield size={18} color={isActive ? '#0C0C0C' : '#888888'} /> Security & Audit
            </>
          )}
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #222222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0C0C0C' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '0.25rem', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0C0C0C', fontWeight: 900, fontSize: '0.85rem' }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#FFFFFF' }}>Admin HR</div>
            <div style={{ fontSize: '0.725rem', color: '#888888', fontWeight: 700 }}>HR Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer', transition: 'color 0.15s' }} title="Logout" onMouseOver={e => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={e => e.currentTarget.style.color = '#888888'}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export { Sidebar };
