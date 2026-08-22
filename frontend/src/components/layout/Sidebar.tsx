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
    padding: '0.75rem 1rem',
    borderRadius: '0',                     /* Sharp editorial corners */
    color: isActive ? '#FFFFFF' : 'var(--text-primary)',
    background: isActive ? 'var(--primary)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 900 : 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    fontFamily: 'var(--font-heading)',
    borderBottom: isActive ? 'none' : '1px solid var(--divider)',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{
      width: '265px',
      height: '100vh',
      background: 'var(--sidebar)',
      borderRight: '1.5px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'background-color 0.25s ease, border-color 0.25s ease',
    }}>
      {/* Brand Header */}
      <div style={{ 
        padding: '1.5rem 1.35rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.85rem',
        borderBottom: '1.5px solid var(--border)' 
      }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0', display: 'flex' }}>
          <Activity color="#FFFFFF" size={22} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            DAYFLOW
          </h1>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            WORKFORCE AI
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <LayoutDashboard size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Overview
            </>
          )}
        </NavLink>
        <NavLink to="/employees" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Users size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Employees
            </>
          )}
        </NavLink>
        <NavLink to="/attendance" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Clock size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Attendance
            </>
          )}
        </NavLink>
        <NavLink to="/leave" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Calendar size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Leave & Absence
            </>
          )}
        </NavLink>
        <NavLink to="/payroll" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <DollarSign size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Payroll
            </>
          )}
        </NavLink>

        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '1.25rem 1rem 0.35rem 1rem', fontWeight: 800 }}>
          Intelligence Engine
        </div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Command Center
              </div>
              <span className="animate-live-pulse" style={{ background: isActive ? '#FFFFFF' : 'var(--primary)', color: isActive ? 'var(--primary)' : '#FFFFFF', fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontWeight: 900 }}>LIVE</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <AlertTriangle size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Risk Analysis
            </>
          )}
        </NavLink>

        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> What-If Simulator
              </div>
              <span style={{ background: isActive ? '#FFFFFF' : 'var(--primary-soft)', color: isActive ? 'var(--primary)' : 'var(--primary)', border: '1px solid var(--border)', fontSize: '0.6rem', padding: '0.1rem 0.4rem', fontWeight: 900 }}>AI</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Bot size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> HR Copilot
            </>
          )}
        </NavLink>

        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <FileText size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Decision Traces
            </>
          )}
        </NavLink>

        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '1.25rem 1rem 0.35rem 1rem', fontWeight: 800 }}>
          System
        </div>

        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Shield size={16} color={isActive ? '#FFFFFF' : 'var(--text-primary)'} /> Security & Audit
            </>
          )}
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ 
        padding: '1rem 1.25rem', 
        borderTop: '1.5px solid var(--border)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        background: 'var(--surface)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '0', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 900, fontSize: '0.85rem' }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Admin HR</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>HR Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.15s' }} title="Logout" onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export { Sidebar };
