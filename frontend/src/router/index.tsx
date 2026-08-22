import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import HRCommandCenter from '../pages/dashboard/HRCommandCenter';
import WhatIfSimulator from '../pages/simulator/WhatIfSimulator';
import CopilotPage from '../pages/agents/CopilotPage';
import DecisionTrace from '../pages/agents/DecisionTrace';
import RiskDashboard from '../pages/intelligence/RiskDashboard';
import EmployeeList from '../pages/employees/EmployeeList';
import EmployeeDetail from '../pages/employees/EmployeeDetail';
import AttendancePage from '../pages/attendance/AttendancePage';
import LeavePage from '../pages/leave/LeavePage';
import PayrollPage from '../pages/payroll/PayrollPage';
import AuditPage from '../pages/audit/AuditPage';
import Login from '../pages/Login';

const AuthLayout = () => {
  // Ensure token exists for seamless navigation
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'demo-admin-token');
    localStorage.setItem('accessToken', 'demo-admin-token');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-base)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--bg-base)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <HRCommandCenter /> },
      { path: '/employees', element: <EmployeeList /> },
      { path: '/employees/:id', element: <EmployeeDetail /> },
      { path: '/attendance', element: <AttendancePage /> },
      { path: '/leave', element: <LeavePage /> },
      { path: '/payroll', element: <PayrollPage /> },
      { path: '/intelligence', element: <RiskDashboard /> },
      { path: '/simulator', element: <WhatIfSimulator /> },
      { path: '/simulator/:leaveId', element: <WhatIfSimulator /> },
      { path: '/copilot', element: <CopilotPage /> },
      { path: '/traces', element: <DecisionTrace /> },
      { path: '/audit', element: <AuditPage /> },
      { path: '*', element: <div style={{ padding: '2rem' }}><h1>404 Page Not Found</h1></div> },
    ],
  },
]);

export default router;
