import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const CheckInCard: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card gradientBorder className={`relative overflow-hidden ${isCheckedIn ? 'shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p className="text-slate-400">
            {isCheckedIn ? 'You are currently checked in' : 'You are not checked in'}
          </p>
          {isCheckedIn && <p className="text-emerald-400 mt-2 text-sm font-medium">Worked today: 4h 12m</p>}
        </div>
        
        <Button 
          variant={isCheckedIn ? 'danger' : 'primary'}
          size="lg"
          onClick={() => setIsCheckedIn(!isCheckedIn)}
          className={isCheckedIn ? '' : 'animate-pulse-glow'}
        >
          {isCheckedIn ? 'Check Out' : 'Check In Now'}
        </Button>
      </div>
    </Card>
  );
};
