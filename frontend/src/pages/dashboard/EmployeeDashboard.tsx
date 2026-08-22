import React from 'react';
import { CheckInCard } from '../../components/attendance/CheckInCard';
import { StatCard } from '../../components/ui/StatCard';
import { Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Good morning, {user?.full_name || 'User'}!</h1>
        <p className="text-slate-400">Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CheckInCard />
        </div>
        <div className="flex flex-col gap-6">
          <StatCard title="Hours this Week" value="32h 15m" icon={<Clock />} trend="up" trendValue="+2h compared to last week" />
          <StatCard title="Leave Balance" value="12 Days" icon={<Calendar />} />
        </div>
      </div>
    </div>
  );
};
