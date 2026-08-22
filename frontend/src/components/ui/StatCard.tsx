import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendValue }) => {
  return (
    <Card className="flex items-center gap-4 hover:bg-[rgba(255,255,255,0.08)] transition-all">
      <div className="p-4 rounded-xl bg-indigo-500/20 text-indigo-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trendValue && (
          <p className={`text-xs mt-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
            {trendValue}
          </p>
        )}
      </div>
    </Card>
  );
};
