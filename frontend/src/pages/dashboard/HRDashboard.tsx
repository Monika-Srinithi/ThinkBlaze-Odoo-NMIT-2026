import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Users, UserCheck, UserMinus, AlertTriangle } from 'lucide-react';

export const HRDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">HR Command Center</h1>
        <p className="text-slate-400">Overview of workforce metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value="1,248" icon={<Users />} trend="up" trendValue="+12 this month" />
        <StatCard title="Present Today" value="1,180" icon={<UserCheck />} />
        <StatCard title="On Leave" value="68" icon={<UserMinus />} />
        <StatCard title="Pending Approvals" value="24" icon={<AlertTriangle />} trend="down" trendValue="-5 since yesterday" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-slate-400">[ Workforce Health Score Gauge Placeholder ]</p>
        </div>
        <div className="glass p-6 min-h-[300px] flex items-center justify-center">
          <p className="text-slate-400">[ Attendance Heatmap Placeholder ]</p>
        </div>
      </div>
    </div>
  );
};
