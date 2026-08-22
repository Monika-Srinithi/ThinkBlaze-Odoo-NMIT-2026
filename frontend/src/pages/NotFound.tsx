import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => (
  <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-center p-4">
    <h1 className="text-9xl font-bold text-indigo-500/20 mb-4">404</h1>
    <h2 className="text-3xl font-semibold text-white mb-4">Page Not Found</h2>
    <p className="text-slate-400 mb-8">The page you are looking for doesn't exist or has been moved.</p>
    <Link to="/">
      <Button size="lg">Go Back Home</Button>
    </Link>
  </div>
);
