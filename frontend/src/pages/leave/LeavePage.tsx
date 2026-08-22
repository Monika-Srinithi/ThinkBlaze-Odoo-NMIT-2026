import React from 'react';
import { LeaveBalanceCard } from '../../components/leave/LeaveBalanceCard';
import { LeaveRequestForm } from '../../components/leave/LeaveRequestForm';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export const LeavePage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Leave Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeaveBalanceCard type="Annual Leave" total={20} used={8} />
        <LeaveBalanceCard type="Sick Leave" total={10} used={2} />
        <LeaveBalanceCard type="Unpaid Leave" total={15} used={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeaveRequestForm />
        </div>
        <div className="lg:col-span-2">
          <Card header="Recent Requests">
            <Table 
              columns={[
                { header: 'Type', accessor: 'type' },
                { header: 'Dates', accessor: 'dates' },
                { header: 'Status', accessor: (row: any) => <Badge variant={row.status === 'Approved' ? 'success' : 'warning'}>{row.status}</Badge> }
              ]}
              data={[
                { type: 'Annual Leave', dates: 'Oct 15 - Oct 20', status: 'Approved' },
                { type: 'Sick Leave', dates: 'Sep 02 - Sep 03', status: 'Approved' },
                { type: 'Annual Leave', dates: 'Dec 24 - Dec 31', status: 'Pending' }
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
