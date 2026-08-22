import React from 'react';
import { Card } from '../ui/Card';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const RiskAlertCard: React.FC<{ severity: string, description: string, action: string }> = ({ severity, description, action }) => {
  return (
    <Card className={`border-l-4 ${severity === 'high' ? 'border-l-rose-500' : 'border-l-amber-500'}`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <AlertTriangle className={severity === 'high' ? 'text-rose-500' : 'text-amber-500'} />
          <div>
            <p className="text-white mb-2">{description}</p>
            <p className="text-sm text-slate-400 mb-4"><strong className="text-slate-300">Action:</strong> {action}</p>
            <Button size="sm" variant="outline">Apply Action</Button>
          </div>
        </div>
        <button className="text-slate-500 hover:text-white"><X size={16} /></button>
      </div>
    </Card>
  );
};
