export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
  employee_id?: string;
}

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  location: string;
  date_of_joining: string;
  employment_type: string;
  status: string;
  salary: number;
  manager_id?: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  hours_worked?: number;
  is_anomaly: boolean;
  anomaly_score?: number;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface LeaveBalance {
  leave_type: string;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: number;
  year: number;
  basic_salary: number;
  hra: number;
  other_allowances: number;
  pf_deduction: number;
  tax_deduction: number;
  gross_salary: number;
  net_salary: number;
  status: string;
}

export interface WorkforceHealthScore {
  overall_score: number;
  risk_level: string;
  department_scores: Record<string, number>;
  trend: 'up' | 'down' | 'neutral';
}

export interface RiskAlert {
  id: string;
  employee_id: string;
  risk_type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommended_action: string;
}

export interface WhatIfScenario {
  id: string;
  scenario_type: string;
  parameters: any;
  impact_analysis: any;
  recommendations: any[];
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent_name?: string;
  trace_id?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  timestamp: string;
  severity: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  message: string;
  detail: any;
  status_code: number;
}
