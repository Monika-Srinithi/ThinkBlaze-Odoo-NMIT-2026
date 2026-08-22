import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Clock, CalendarHeart, 
  CreditCard, BrainCircuit, Activity, Bot, ShieldCheck, LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Employees', path: '/employees', icon: <Users size={20} /> },
    { label: 'Attendance', path: '/attendance', icon: <Clock size={20} /> },
    { label: 'Leave', path: '/leave', icon: <CalendarHeart size={20} /> },
    { label: 'Payroll', path: '/payroll', icon: <CreditCard size={20} /> },
    { label: 'Intelligence', path: '/intelligence', icon: <BrainCircuit size={20} /> },
    { label: 'Simulator', path: '/simulator', icon: <Activity size={20} /> },
    { label: 'AI Copilot', path: '/copilot', icon: <Bot size={20} /> },
    { label: 'Audit Log', path: '/audit', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="w-64 flex-shrink-0 h-screen glass rounded-none border-t-0 border-b-0 border-l-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          ThinkBlaze
        </h1>
        <p className="text-xs text-indigo-300/70 tracking-widest uppercase mt-1">Dayflow HRMS</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-500/20 text-indigo-300 shadow-[inset_4px_0_0_0_#6366f1]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
          <Avatar name={user?.full_name || 'User'} size={36} />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
