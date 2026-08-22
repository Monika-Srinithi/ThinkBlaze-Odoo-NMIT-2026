import React from 'react';
import { CheckInCard } from '../../components/attendance/CheckInCard';
import { AttendanceCalendar } from '../../components/attendance/AttendanceCalendar';
import { Table } from '../../components/ui/Table';

export const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Attendance</h1>
      <CheckInCard />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <AttendanceCalendar />
        </div>
        <div>
          <Table 
            columns={[
              { header: 'Date', accessor: 'date' },
              { header: 'Hours', accessor: 'hours' }
            ]} 
            data={[
              { date: 'Oct 12', hours: '8h 15m' },
              { date: 'Oct 11', hours: '7h 50m' },
              { date: 'Oct 10', hours: '8h 00m' }
            ]} 
          />
        </div>
      </div>
    </div>
  );
};
