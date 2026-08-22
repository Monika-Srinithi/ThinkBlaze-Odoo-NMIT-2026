import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const SimulatorPage: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setResult({ impact: 'High', capacityChange: '-15%', bottlenecks: 2 });
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">What-If Simulator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header="Create Scenario">
          <form onSubmit={runSimulation} className="space-y-4">
            <Select 
              label="Scenario Type" 
              options={[
                { label: 'Leave Impact (Peak Season)', value: 'leave_impact' },
                { label: 'Headcount Change', value: 'headcount' },
                { label: 'Department Restructure', value: 'restructure' }
              ]} 
            />
            <Input label="Target Department" defaultValue="Engineering" />
            <Input label="Additional Parameter (e.g. % absent)" defaultValue="20" type="number" />
            
            <Button className="w-full mt-4" loading={running}>Run Simulation</Button>
          </form>
        </Card>
        
        {result && (
          <Card header="Simulation Results" className="bg-indigo-500/10 border-indigo-500/30">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Predicted Capacity Impact</p>
                <p className="text-2xl font-bold text-rose-400">{result.capacityChange}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Identified Bottlenecks</p>
                <p className="text-2xl font-bold text-amber-400">{result.bottlenecks} processes at risk</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-medium text-white mb-2">Recommendation</p>
                <p className="text-slate-300 text-sm">Approve maximum 10% concurrent leaves to maintain SLA.</p>
                <Button size="sm" className="mt-4">Apply Policy Target</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
