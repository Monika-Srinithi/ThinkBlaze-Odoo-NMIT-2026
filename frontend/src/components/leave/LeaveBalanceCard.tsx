import React from 'react';
import { Card } from '../ui/Card';

export const LeaveBalanceCard: React.FC<{ type: string, total: number, used: number }> = ({ type, total, used }) => {
  const percentage = Math.round((used / total) * 100);
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white">{type}</h3>
        <span className="text-sm text-slate-400">{total - used} days left</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div className="bg-indigo-500 h-full" style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-slate-500">{used} of {total} days used</p>
    </Card>
  );
};
