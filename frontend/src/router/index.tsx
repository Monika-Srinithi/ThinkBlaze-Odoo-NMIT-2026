import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { HRDashboard } from '../pages/dashboard/HRDashboard';
import { EmployeeDashboard } from '../pages/dashboard/EmployeeDashboard';
import { EmployeeList } from '../pages/employees/EmployeeList';
import { EmployeeDetail } from '../pages/employees/EmployeeDetail';
import { AttendancePage } from '../pages/attendance/AttendancePage';
import { LeavePage } from '../pages/leave/LeavePage';
import { PayrollPage } from '../pages/payroll/PayrollPage';
import { IntelligencePage } from '../pages/intelligence/IntelligencePage';
import { SimulatorPage } from '../pages/simulator/SimulatorPage';
import { CopilotPage } from '../pages/agents/CopilotPage';
import { AuditPage } from '../pages/audit/AuditPage';
import { NotFound } from '../pages/NotFound';
import { useAuthStore } from '../store/auth';

const DashboardRouter = () => {
  const user = useAuthStore(state => state.user);
  if (user?.role === 'admin' || user?.role === 'hr') {
    return <HRDashboard />;
  }
  return <EmployeeDashboard />;
};

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardRouter /> },
          { path: 'employees', element: <EmployeeList /> },
          { path: 'employees/:id', element: <EmployeeDetail /> },
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'leave', element: <LeavePage /> },
          { path: 'payroll', element: <PayrollPage /> },
          { path: 'intelligence', element: <IntelligencePage /> },
          { path: 'simulator', element: <SimulatorPage /> },
          { path: 'copilot', element: <CopilotPage /> },
          { path: 'audit', element: <AuditPage /> },
        ]
      }
    ]
  },
  { path: '*', element: <NotFound /> }
]);
