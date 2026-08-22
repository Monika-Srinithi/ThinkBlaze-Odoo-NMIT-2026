import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export const AuditPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">System Audit Logs</h1>
      
      <Card>
        <div className="flex gap-4 mb-6">
          <Input placeholder="Search logs..." className="max-w-xs" />
          <div className="flex gap-2">
            <Badge variant="danger" className="cursor-pointer">High Severity</Badge>
            <Badge variant="warning" className="cursor-pointer">Medium Severity</Badge>
            <Badge variant="info" className="cursor-pointer">Info</Badge>
          </div>
        </div>
        
        <Table 
          columns={[
            { header: 'Timestamp', accessor: 'timestamp' },
            { header: 'User', accessor: 'user' },
            { header: 'Action', accessor: 'action' },
            { header: 'Severity', accessor: (row: any) => <Badge variant={row.severity === 'High' ? 'danger' : 'info'}>{row.severity}</Badge> },
            { header: 'Details', accessor: 'details' }
          ]}
          data={[
            { timestamp: '2026-10-12 14:22:05', user: 'admin@thinkblaze.com', action: 'Approved Leave', severity: 'Info', details: 'Leave req #1042 approved' },
            { timestamp: '2026-10-12 11:15:30', user: 'SYSTEM', action: 'Simulation Run', severity: 'Info', details: 'Scenario ID 55 completed' },
            { timestamp: '2026-10-11 09:05:12', user: 'hr@thinkblaze.com', action: 'Bulk Update', severity: 'High', details: 'Updated 50 employee records' }
          ]}
        />
      </Card>
    </div>
  );
};
