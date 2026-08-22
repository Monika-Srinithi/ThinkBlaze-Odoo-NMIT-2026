import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('admin@thinkblaze.com');
  const [password, setPassword] = React.useState('password');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[150px] animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[150px] animate-blob" style={{ animationDelay: '2s' }}></div>
      
      <div className="glass p-10 w-full max-w-md relative z-10 border-t border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">ThinkBlaze</h1>
          <p className="text-slate-400">Sign in to Dayflow HRMS</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <Button type="submit" className="w-full" size="lg">Sign In</Button>
        </form>
      </div>
    </div>
  );
};
