import React from 'react';
import { ChatInterface } from '../../components/agents/ChatInterface';

export const CopilotPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Copilot</h1>
          <p className="text-slate-400">Multi-agent HR intelligence system.</p>
        </div>
      </div>
      <div className="h-full">
        <ChatInterface />
      </div>
    </div>
  );
};
