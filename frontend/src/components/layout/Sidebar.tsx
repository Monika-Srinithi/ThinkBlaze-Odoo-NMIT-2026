import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Clock, Calendar, DollarSign, 
  Activity, AlertTriangle, Zap, Bot, FileText, Shield, LogOut 
} from 'lucide-react';

export default function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    color: isActive ? '#fff' : 'var(--text-secondary)',
    background: isActive ? 'var(--primary-glow)' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s',
    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
    boxShadow: isActive ? '0 0 10px var(--primary-glow)' : 'none'
  });

  return (
    <div style={{ 
      width: '280px', 
      height: '100vh', 
      background: 'var(--bg-base)', 
      borderRight: '1px solid var(--border)', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Brand */}
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
          <Activity color="#fff" size={24} />
        </div>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>ThinkBlaze</h1>
      </div>

      {/* Nav Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/employees" style={({ isActive }) => navItemStyle(isActive)}>
          <Users size={20} /> Employees
        </NavLink>
        <NavLink to="/attendance" style={({ isActive }) => navItemStyle(isActive)}>
          <Clock size={20} /> Attendance
        </NavLink>
        <NavLink to="/leave" style={({ isActive }) => navItemStyle(isActive)}>
          <Calendar size={20} /> Leave
        </NavLink>
        <NavLink to="/payroll" style={({ isActive }) => navItemStyle(isActive)}>
          <DollarSign size={20} /> Payroll
        </NavLink>

        <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 1rem', marginBottom: '0.5rem' }}>Intelligence</div>

        <NavLink to="/dashboard" end style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Activity size={20} /> Command Center</div>
            <span style={{ background: 'var(--danger)', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 700 }}>HOT</span>
          </div>
        </NavLink>
        <NavLink to="/intelligence" style={({ isActive }) => navItemStyle(isActive)}>
          <AlertTriangle size={20} /> Risk Analysis
        </NavLink>
        <NavLink to="/simulator" style={({ isActive }) => navItemStyle(isActive)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Zap size={20} /> Simulator</div>
            <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 700 }}>WOW</span>
          </div>
        </NavLink>
        <NavLink to="/copilot" style={({ isActive }) => navItemStyle(isActive)}>
          <Bot size={20} /> HR Copilot
        </NavLink>
        <NavLink to="/traces" style={({ isActive }) => navItemStyle(isActive)}>
          <FileText size={20} /> Decision Traces
        </NavLink>

        <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
        
        <NavLink to="/audit" style={({ isActive }) => navItemStyle(isActive)}>
          <Shield size={20} /> Audit Log
        </NavLink>
      </div>

      {/* User Info */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
            AD
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Admin User</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HR Director</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
}
export { Sidebar };

