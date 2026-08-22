import React from 'react';
import { Table } from '../../components/ui/Table';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import type { Employee } from '../../types';

export const EmployeeList: React.FC = () => {
  const dummyEmployees: Employee[] = [
    { id: '1', employee_code: 'EMP001', first_name: 'John', last_name: 'Doe', full_name: 'John Doe', email: 'john@example.com', phone: '123456', department: 'Engineering', designation: 'Senior Dev', location: 'NY', date_of_joining: '2020-01-01', employment_type: 'Full Time', status: 'Active', salary: 100000 },
    { id: '2', employee_code: 'EMP002', first_name: 'Jane', last_name: 'Smith', full_name: 'Jane Smith', email: 'jane@example.com', phone: '654321', department: 'HR', designation: 'Manager', location: 'NY', date_of_joining: '2019-05-15', employment_type: 'Full Time', status: 'Active', salary: 90000 }
  ];

  const columns = [
    { header: 'Employee', accessor: (row: Employee) => <div className="font-medium text-white">{row.full_name}<br/><span className="text-xs text-slate-400">{row.email}</span></div> },
    { header: 'ID', accessor: 'employee_code' as keyof Employee },
    { header: 'Department', accessor: 'department' as keyof Employee },
    { header: 'Role', accessor: 'designation' as keyof Employee },
    { header: 'Status', accessor: (row: Employee) => <Badge variant={row.status === 'Active' ? 'success' : 'default'}>{row.status}</Badge> }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Employees</h1>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Employee</Button>
      </div>

      <Card>
        <Table data={dummyEmployees} columns={columns} />
      </Card>
    </div>
  );
};
