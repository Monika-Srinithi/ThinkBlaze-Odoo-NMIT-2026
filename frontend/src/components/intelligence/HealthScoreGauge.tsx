import React from 'react';
import { Card } from '../ui/Card';

export const HealthScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  return (
    <Card className="flex flex-col items-center justify-center py-8">
      <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-r-transparent transform -rotate-45"></div>
        <div className="text-center">
          <div className="text-5xl font-bold text-white">{score}</div>
          <div className="text-sm text-emerald-400 mt-1">Excellent</div>
        </div>
      </div>
      <h3 className="mt-6 text-lg font-medium text-white">Workforce Health</h3>
    </Card>
  );
};
