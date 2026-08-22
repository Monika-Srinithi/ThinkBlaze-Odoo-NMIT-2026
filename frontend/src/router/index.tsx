import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import HRCommandCenter from '../pages/dashboard/HRCommandCenter';
import WhatIfSimulator from '../pages/simulator/WhatIfSimulator';
import CopilotPage from '../pages/agents/CopilotPage';
import DecisionTrace from '../pages/agents/DecisionTrace';
import RiskDashboard from '../pages/intelligence/RiskDashboard';
import Login from '../pages/Login';

// Placeholder components for basic routes
const Placeholder = ({ title }: { title: string }) => <div style={{ padding: '2rem' }}><h1>{title}</h1></div>;

const AuthLayout = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
        <Outlet />
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <HRCommandCenter /> }, // the main dashboard
      { path: '/employees', element: <Placeholder title="Employees" /> },
      { path: '/employees/:id', element: <Placeholder title="Employee Detail" /> },
      { path: '/attendance', element: <Placeholder title="Attendance" /> },
      { path: '/leave', element: <Placeholder title="Leave" /> },
      { path: '/payroll', element: <Placeholder title="Payroll" /> },
      
      // Intelligence Routes
      { path: '/intelligence', element: <RiskDashboard /> },
      { path: '/simulator', element: <WhatIfSimulator /> },
      { path: '/simulator/:leaveId', element: <WhatIfSimulator /> },
      { path: '/copilot', element: <CopilotPage /> },
      { path: '/traces', element: <DecisionTrace /> },
      { path: '/audit', element: <Placeholder title="Audit Log" /> },
      
      { path: '*', element: <div style={{ padding: '2rem' }}><h1>404 Not Found</h1></div> }
    ]
  }
]);

