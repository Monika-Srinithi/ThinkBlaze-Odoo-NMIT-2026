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
    padding: '0.65rem 0.9rem',
    borderRadius: '0.6rem',
    color: isActive ? '#fff' : 'var(--text-secondary)',
    background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.06) 100%)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.875rem',
    fontFamily: 'var(--font-heading)',
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'rgba(14, 18, 30, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', padding: '0.55rem', borderRadius: '0.6rem', display: 'flex', boxShadow: '0 0 15px var(--primary-glow)' }}>
          <Activity color="#fff" size={22} />
        </div>
        <div>
          <h1 className="gradient-text" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Dayflow
          </h1>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Workforce AI Platform
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0 0.6rem 0' }} />
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.85rem', marginBottom: '0.35rem', fontWeight: 700 }}>
          Intelligence Engine
        </div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={18} /> Command Center</div>
            <span style={{ background: 'var(--accent-rose)', color: '#fff', fontSize: '0.625rem', padding: '0.1rem 0.45rem', borderRadius: '0.3rem', fontWeight: 700 }}>LIVE</span>
          </div>
        </NavLink>

        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive)}>
          <AlertTriangle size={18} /> Risk Analysis
        </NavLink>

        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={18} /> What-If Simulator</div>
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '0.625rem', padding: '0.1rem 0.45rem', borderRadius: '0.3rem', fontWeight: 700 }}>WOW</span>
          </div>
        </NavLink>

        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={18} color="var(--accent-cyan)" /> HR Copilot
          </div>
        </NavLink>

        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive)}>
          <FileText size={18} /> Decision Traces
        </NavLink>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0 0.6rem 0' }} />

        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          <Shield size={18} /> Security & Audit
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Admin HR</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>HR Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.15s' }} title="Logout" onMouseOver={e => e.currentTarget.style.color = 'var(--accent-rose)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export { Sidebar };
