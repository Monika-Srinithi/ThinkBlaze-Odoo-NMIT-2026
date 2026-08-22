import React from 'react';
import { HealthScoreGauge } from '../../components/intelligence/HealthScoreGauge';
import { RiskAlertCard } from '../../components/intelligence/RiskAlertCard';

export const IntelligencePage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Workforce Intelligence</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HealthScoreGauge score={85} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-2">Active Risk Alerts</h3>
          <RiskAlertCard 
            severity="high" 
            description="High risk of attrition in Engineering department." 
            action="Review compensation and schedule 1:1s." 
          />
          <RiskAlertCard 
            severity="medium" 
            description="Unusual spike in sick leaves in Marketing." 
            action="Monitor trend for the next 2 weeks." 
          />
        </div>
      </div>
    </div>
  );
};
