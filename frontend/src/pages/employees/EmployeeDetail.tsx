import React from 'react';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';

export const EmployeeDetail: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card gradientBorder className="flex items-center gap-6">
        <Avatar name="John Doe" size={80} />
        <div>
          <h1 className="text-3xl font-bold text-white">John Doe</h1>
          <p className="text-slate-400 text-lg">Senior Developer • Engineering</p>
        </div>
      </Card>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card header="Overview">
            <div className="space-y-4 text-slate-300">
              <p><strong>Email:</strong> john.doe@thinkblaze.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Location:</strong> New York, USA</p>
              <p><strong>Joined:</strong> January 15, 2022</p>
            </div>
          </Card>
        </div>
        <div>
          <Card header="Manager">
            <div className="flex items-center gap-4">
              <Avatar name="Sarah Jenkins" />
              <div>
                <p className="text-white font-medium">Sarah Jenkins</p>
                <p className="text-sm text-slate-400">VP of Engineering</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
