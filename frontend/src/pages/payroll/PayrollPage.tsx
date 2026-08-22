import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';

export const PayrollPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Payroll</h1>
      
      <Card gradientBorder className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400">Net Salary (October 2026)</p>
            <h2 className="text-4xl font-bold text-white mt-1">$8,240.50</h2>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Download Payslip</Button>
        </div>
      </Card>

      <Card header="Payslip History">
        <Table 
          columns={[
            { header: 'Month/Year', accessor: 'month' },
            { header: 'Gross Pay', accessor: 'gross' },
            { header: 'Deductions', accessor: 'deductions' },
            { header: 'Net Pay', accessor: 'net' }
          ]}
          data={[
            { month: 'September 2026', gross: '$10,000.00', deductions: '$1,759.50', net: '$8,240.50' },
            { month: 'August 2026', gross: '$10,000.00', deductions: '$1,759.50', net: '$8,240.50' },
            { month: 'July 2026', gross: '$10,000.00', deductions: '$1,759.50', net: '$8,240.50' }
          ]}
        />
      </Card>
    </div>
  );
};
