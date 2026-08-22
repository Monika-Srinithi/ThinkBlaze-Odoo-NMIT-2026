import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Download, RefreshCw, CheckCircle2, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { apiFetch, apiPost } from '../../api/client';

export const PayrollPage = () => {
  const qc = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch Payroll History
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll', selectedMonth, selectedYear],
    queryFn: () => apiFetch('/payroll', { month: selectedMonth, year: selectedYear }),
  });

  // Fetch My Payslip
  const { data: myPayroll } = useQuery({
    queryKey: ['payroll-my'],
    queryFn: () => apiFetch('/payroll/my'),
  });

  // Batch Generate Payroll Mutation
  const generateMutation = useMutation({
    mutationFn: () => apiPost('/payroll/generate', { month: selectedMonth, year: selectedYear }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const records = payrollData || [];
  const latestPayslip = (myPayroll && myPayroll[0]) || records[0];

  const totalGross = records.reduce((acc: number, r: any) => acc + (r.gross_salary || 0), 0);
  const totalNet = records.reduce((acc: number, r: any) => acc + (r.net_salary || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <DollarSign color="var(--accent-emerald)" size={32} /> Payroll & Compensation
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage salary structures, deductions, net payouts, and monthly payslips.
          </p>
        </div>

        <button className="btn-success" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          <RefreshCw size={16} className={generateMutation.isPending ? 'animate-spin' : ''} />
          {generateMutation.isPending ? 'Generating Payroll...' : `Run Batch Payroll (${selectedMonth}/${selectedYear})`}
        </button>
      </div>

      {/* Payslip Card Highlight */}
      {latestPayslip && (
        <div className="glass-panel-glow" style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Latest Statement · {latestPayslip.period || `${selectedMonth}/${selectedYear}`}
              </div>
              <h2 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', fontWeight: 800 }}>
                {latestPayslip.employee_name || 'Employee Salary Statement'}
              </h2>
            </div>
            <button className="btn-secondary" onClick={() => window.print()}>
              <Download size={16} /> Print Payslip
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Basic Salary</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{latestPayslip.basic_salary?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>HRA + Allowances</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>₹{(latestPayslip.hra + latestPayslip.other_allowances)?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Deductions (PF + Tax)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-rose)' }}>-₹{(latestPayslip.pf_deduction + latestPayslip.tax_deduction)?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Net Salary Disbursed</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>₹{latestPayslip.net_salary?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Total Payroll Budget', value: `₹${totalGross.toLocaleString()}`, icon: DollarSign, color: 'var(--primary)' },
          { label: 'Total Net Disbursed', value: `₹${totalNet.toLocaleString()}`, icon: CheckCircle2, color: 'var(--accent-emerald)' },
          { label: 'Processed Payslips', value: records.length, icon: FileSpreadsheet, color: 'var(--accent-cyan)' },
          { label: 'Status', value: 'Verified', icon: ShieldCheck, color: 'var(--accent-amber)' },
        ].map((m, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>{m.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{m.value}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.75rem', color: m.color }}>
              <m.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Monthly Payroll Breakdown</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select className="input-field" style={{ width: 'auto' }} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>Month {m}</option>
              ))}
            </select>
            <select className="input-field" style={{ width: 'auto' }} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payroll records...</div>
        ) : records.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No payroll generated for {selectedMonth}/{selectedYear} yet. Click "Run Batch Payroll" above to compute salaries.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Employee</th>
                <th style={{ padding: '1rem 1.25rem' }}>Basic</th>
                <th style={{ padding: '1rem 1.25rem' }}>Allowances</th>
                <th style={{ padding: '1rem 1.25rem' }}>Deductions</th>
                <th style={{ padding: '1rem 1.25rem' }}>Gross Salary</th>
                <th style={{ padding: '1rem 1.25rem' }}>Net Salary</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{r.employee_name || 'Ravi Sharma'}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)' }}>₹{r.basic_salary?.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>₹{(r.hra + r.other_allowances)?.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-rose)' }}>-₹{(r.pf_deduction + r.tax_deduction)?.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)' }}>₹{r.gross_salary?.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>₹{r.net_salary?.toLocaleString()}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge badge-success">{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;
