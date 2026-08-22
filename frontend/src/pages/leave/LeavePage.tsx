import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, CheckCircle, XCircle, X } from 'lucide-react';
import { apiFetch, apiPost, apiPut } from '../../api/client';

const FALLBACK_REQUESTS = [
  { id: 'lr-1', employee_name: 'Ravi Kumar', leave_type: 'casual', start_date: '2026-08-25', end_date: '2026-08-29', total_days: 5, reason: 'Family commitment in hometown', status: 'pending' },
  { id: 'lr-2', employee_name: 'Vikram Aditya', leave_type: 'sick', start_date: '2026-08-20', end_date: '2026-08-23', total_days: 3, reason: 'Recovering from viral fever', status: 'approved' },
  { id: 'lr-3', employee_name: 'Sarah Jenkins', leave_type: 'earned', start_date: '2026-09-01', end_date: '2026-09-07', total_days: 7, reason: 'Annual vacation trip', status: 'pending' },
  { id: 'lr-4', employee_name: 'Priya Nair', leave_type: 'casual', start_date: '2026-08-10', end_date: '2026-08-11', total_days: 1, reason: 'Personal work', status: 'approved' },
  { id: 'lr-5', employee_name: 'Ananya Rao', leave_type: 'emergency', start_date: '2026-07-15', end_date: '2026-07-16', total_days: 2, reason: 'Medical emergency', status: 'approved' },
];

export const LeavePage = () => {
  const qc = useQueryClient();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    leave_type: 'casual',
    start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    reason: 'Personal leave for family commitment',
  });

  const { data: balances } = useQuery({
    queryKey: ['leave-balances'],
    queryFn: () => apiFetch('/leave/balance'),
  });

  const { data: requests } = useQuery({
    queryKey: ['leave-requests', statusFilter],
    queryFn: () => apiFetch('/leave/requests', { status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const submitMutation = useMutation({
    mutationFn: (data: typeof formData) => apiPost('/leave/request', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
      qc.invalidateQueries({ queryKey: ['leave-balances'] });
      setIsApplyModalOpen(false);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiPut(`/leave/requests/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
      qc.invalidateQueries({ queryKey: ['action-center'] });
      qc.invalidateQueries({ queryKey: ['workforce-health'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => apiPut(`/leave/requests/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave-requests'] });
      qc.invalidateQueries({ queryKey: ['action-center'] });
    },
  });

  const fetchedReqs = requests || [];
  const leaveList = fetchedReqs.length > 0 ? fetchedReqs : FALLBACK_REQUESTS;
  const filteredList = leaveList.filter((r: any) => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar color="var(--primary)" size={34} /> Leave & Absence Management
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Submit time-off requests, view leave balances, and manage team absence approvals.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsApplyModalOpen(true)}>
          <Plus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {(balances && balances.length ? balances : [
          { leave_type: 'casual', total_days: 12, used_days: 2, available_days: 10 },
          { leave_type: 'sick', total_days: 10, used_days: 1, available_days: 9 },
          { leave_type: 'earned', total_days: 15, used_days: 0, available_days: 15 },
        ]).map((b: any, i: number) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
              {b.leave_type} Leave
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {b.available_days || b.total_days - b.used_days} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {b.total_days} days left</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${((b.available_days || 10) / b.total_days) * 100}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '3px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Requests Filter & Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Leave Requests Roster</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? 'rgba(16,185,129,0.2)' : 'transparent',
                  color: statusFilter === st ? 'var(--primary)' : 'var(--text-secondary)',
                  border: statusFilter === st ? '1px solid var(--primary)' : '1px solid transparent',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Employee</th>
              <th style={{ padding: '1rem 1.25rem' }}>Type</th>
              <th style={{ padding: '1rem 1.25rem' }}>Dates & Duration</th>
              <th style={{ padding: '1rem 1.25rem' }}>Reason</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((r: any) => {
              const isPending = r.status === 'pending';
              const badgeClass = r.status === 'approved' ? 'badge-success' : isPending ? 'badge-warning' : 'badge-danger';
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{r.employee_name || 'Ravi Sharma'}</td>
                  <td style={{ padding: '1rem 1.25rem', textTransform: 'capitalize', color: 'var(--accent-cyan)' }}>{r.leave_type}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {r.start_date} → {r.end_date}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.total_days} day(s)</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>{r.reason || '—'}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${badgeClass}`}>{r.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    {isPending ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-primary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => approveMutation.mutate(r.id)}>
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button className="btn-danger" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={() => rejectMutation.mutate({ id: r.id, reason: 'High workload' })}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Processed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel-glow animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Apply for Leave</h2>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setIsApplyModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Leave Type</label>
                <select className="input-field" value={formData.leave_type} onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="emergency">Emergency Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Start Date</label>
                  <input className="input-field" type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>End Date</label>
                  <input className="input-field" type="date" required value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Reason</label>
                <textarea className="input-field" rows={3} required value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Reason for leave..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsApplyModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePage;
