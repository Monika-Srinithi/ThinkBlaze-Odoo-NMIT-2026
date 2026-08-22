import React from 'react';
import { Card } from '../ui/Card';

export const AttendanceCalendar: React.FC = () => {
  return (
    <Card header="Attendance Calendar">
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-slate-400 text-sm py-2">{d}</div>
        ))}
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className={`h-12 flex items-center justify-center rounded-lg ${i % 7 === 0 || i % 7 === 6 ? 'bg-white/5' : 'bg-indigo-500/10 text-indigo-200'}`}>
            {i + 1}
          </div>
        ))}
      </div>
    </Card>
  );
};
