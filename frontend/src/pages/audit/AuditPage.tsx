import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Download } from 'lucide-react';
import { apiFetch } from '../../api/client';

export const AuditPage = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', severityFilter],
    queryFn: () => apiFetch('/audit/logs', { severity: severityFilter === 'all' ? undefined : severityFilter }),
  });

  const auditList = logs || [
    { id: '1', action: 'RECOMMENDATION_APPLIED', resource_type: 'leave_request', resource_id: 'lr_beta_01', details: { option: 'approve_with_reassign', team: 'Team Beta' }, severity: 'critical', created_at: new Date().toISOString() },
    { id: '2', action: 'SIMULATION_RUN', resource_type: 'workforce_simulator', resource_id: 'sim_02', details: { before_cap: 75, after_cap: 62.5 }, severity: 'warning', created_at: new Date().toISOString() },
    { id: '3', action: 'USER_LOGIN', resource_type: 'auth', resource_id: 'admin@dayflow.com', details: { ip: '127.0.0.1' }, severity: 'info', created_at: new Date().toISOString() },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield color="var(--primary)" size={32} /> Audit & Governance Log
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Immutable security log of all system state changes, AI recommendations, and human approvals.
          </p>
        </div>

        <button className="btn-secondary" onClick={() => {
          const json = JSON.stringify(auditList, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'dayflow_audit_log.json';
          a.click();
        }}>
          <Download size={16} /> Export Audit Log
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Security Event Log</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'info', 'warning', 'critical'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  background: severityFilter === sev ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: severityFilter === sev ? 'var(--primary)' : 'var(--text-secondary)',
                  border: severityFilter === sev ? '1px solid var(--primary)' : '1px solid transparent',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading audit records...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Timestamp</th>
                <th style={{ padding: '1rem 1.25rem' }}>Action Event</th>
                <th style={{ padding: '1rem 1.25rem' }}>Resource Type</th>
                <th style={{ padding: '1rem 1.25rem' }}>Details</th>
                <th style={{ padding: '1rem 1.25rem' }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {auditList.map((log: any) => {
                const badgeClass = log.severity === 'critical' ? 'badge-danger' : log.severity === 'warning' ? 'badge-warning' : 'badge-info';
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{log.action}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--accent-cyan)' }}>{log.resource_type}</td>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${badgeClass}`}>{log.severity}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditPage;

