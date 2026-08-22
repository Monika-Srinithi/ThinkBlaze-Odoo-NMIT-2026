import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Calendar, Clock } from 'lucide-react';
import { apiFetch } from '../../api/client';

export const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: emp, isLoading, isError } = useQuery({
    queryKey: ['employee-detail', id],
    queryFn: () => apiFetch(`/employees/${id}`),
    enabled: !!id,
  });

  const { data: attHistory } = useQuery({
    queryKey: ['employee-attendance', id],
    queryFn: () => apiFetch(`/attendance?employee_id=${id}&limit=10`),
    enabled: !!id,
  });

  const { data: leaveHistory } = useQuery({
    queryKey: ['employee-leave', id],
    queryFn: () => apiFetch(`/leave/requests?employee_id=${id}&limit=10`),
    enabled: !!id,
  });

  if (isLoading) {
    return <div style={{ padding: '3rem', color: 'var(--text-secondary)' }}>Loading employee profile...</div>;
  }

  if (isError || !emp) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', color: 'var(--accent-rose)' }}>
        Employee record not found.
        <button className="btn-secondary" onClick={() => navigate('/employees')} style={{ marginTop: '1rem' }}>
          Back to Directory
        </button>
      </div>
    );
  }

  const badgeClass = emp.status === 'active' ? 'badge-success' : emp.status === 'on_leave' ? 'badge-warning' : 'badge-danger';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Header Profile Card */}
      <div className="glass-panel-glow" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>
          {emp.first_name?.[0]}{emp.last_name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{emp.full_name}</h1>
            <span className={`badge ${badgeClass}`}>{emp.status}</span>
          </div>
          <div style={{ color: 'var(--accent-mint)', fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
            {emp.designation} · {emp.department}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
            Code: {emp.employee_code} · ID: #{emp.id?.slice(0, 8)}
          </div>
        </div>
      </div>

      {/* Info Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <User size={18} /> Contact & Employment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> <strong>{emp.email}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Phone:</span> <strong>{emp.phone || '—'}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Location:</span> <strong>{emp.location || 'Bangalore'}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Employment Type:</span> <strong style={{ textTransform: 'capitalize' }}>{emp.employment_type}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Joining Date:</span> <strong>{emp.date_of_joining}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Salary:</span> <strong style={{ color: 'var(--accent-mint)' }}>₹{emp.salary?.toLocaleString()} / yr</strong></div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Clock size={18} /> Recent Attendance
          </h3>
          {!(attHistory && attHistory.length) ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recent attendance logs.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {attHistory.slice(0, 5).map((a: any) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>{a.date}</span>
                  <span className={`badge ${a.status === 'present' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
          <Calendar size={18} /> Leave Request History
        </h3>
        {!(leaveHistory && leaveHistory.length) ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No leave history on record.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaveHistory.map((l: any) => (
              <div key={l.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{l.leave_type} Leave ({l.total_days} days)</div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{l.start_date} → {l.end_date} · {l.reason}</div>
                </div>
                <span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;
