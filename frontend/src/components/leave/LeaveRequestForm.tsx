import React from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const LeaveRequestForm: React.FC = () => {
  return (
    <Card header="Apply for Leave">
      <form className="space-y-4">
        <Select 
          label="Leave Type" 
          options={[
            { label: 'Annual Leave', value: 'annual' },
            { label: 'Sick Leave', value: 'sick' }
          ]} 
        />
        <div className="grid grid-cols-2 gap-4">
          <Input type="date" label="Start Date" />
          <Input type="date" label="End Date" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-slate-300">Reason</label>
          <textarea className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white h-24 focus:outline-none focus:border-indigo-500" />
        </div>
        <Button className="w-full">Submit Request</Button>
      </form>
    </Card>
  );
};
