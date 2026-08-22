import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, LogOut, Calendar, CheckCircle2, AlertCircle, Users, BarChart3 } from 'lucide-react';
import { apiFetch, apiPost } from '../../api/client';

export const AttendancePage = () => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'summary'>('today');

  // Fetch Today's Attendance
  const { data: todayAttendance, isLoading: todayLoading } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => apiFetch('/attendance/today'),
  });

  // Fetch My Attendance History
  const { data: myAttendance } = useQuery({
    queryKey: ['attendance-my'],
    queryFn: () => apiFetch('/attendance/my?days=30'),
  });

  // Fetch HR Attendance Summary
  const { data: summaryData } = useQuery({
    queryKey: ['attendance-summary'],
    queryFn: () => apiFetch('/attendance/summary'),
  });

  // Check In Mutation
  const checkinMutation = useMutation({
    mutationFn: () => apiPost('/attendance/checkin', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-today'] });
      qc.invalidateQueries({ queryKey: ['attendance-my'] });
    },
  });

  // Check Out Mutation
  const checkoutMutation = useMutation({
    mutationFn: () => apiPost('/attendance/checkout', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance-today'] });
      qc.invalidateQueries({ queryKey: ['attendance-my'] });
    },
  });

  const records = todayAttendance || [];
  const presentCount = records.filter((r: any) => r.status === 'present' || r.status === 'late').length;
  const lateCount = records.filter((r: any) => r.status === 'late').length;
  const leaveCount = records.filter((r: any) => r.status === 'on_leave').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Quick Check-in Widget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock color="var(--primary)" size={32} /> Attendance Tracking
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time check-in, check-out, working hours analysis, and monthly attendance rates.
          </p>
        </div>

        {/* Action Card */}
        <div className="glass-panel-glow" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Attendance Today
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-emerald)' }}>
              Live · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button className="btn-success" onClick={() => checkinMutation.mutate()} disabled={checkinMutation.isPending}>
            <LogIn size={16} /> Check In
          </button>
          <button className="btn-secondary" onClick={() => checkoutMutation.mutate()} disabled={checkoutMutation.isPending}>
            <LogOut size={16} /> Check Out
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Present Today', value: presentCount, icon: CheckCircle2, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Late Arrivals', value: lateCount, icon: AlertCircle, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.1)' },
          { label: 'On Leave Today', value: leaveCount, icon: Calendar, color: 'var(--accent-cyan)', bg: 'rgba(6,182,212,0.1)' },
          { label: 'Total Tracked', value: records.length || 45, icon: Users, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)' },
        ].map((m, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>{m.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{m.value}</div>
            </div>
            <div style={{ background: m.bg, padding: '0.75rem', borderRadius: '0.75rem', color: m.color }}>
              <m.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass-panel" style={{ padding: '0.5rem', display: 'inline-flex', gap: '0.5rem', width: 'fit-content' }}>
        {[
          { id: 'today', label: "Today's Status", icon: Clock },
          { id: 'history', label: 'My Attendance History', icon: Calendar },
          { id: 'summary', label: 'Monthly HR Summary', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '0.6rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'today' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <h3 style={{ padding: '1.25rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-subtle)', fontSize: '1.1rem' }}>
            Today's Employee Attendance Roster
          </h3>
          {todayLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading today's roster...</div>
          ) : records.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records logged for today yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Employee</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Check In</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Check Out</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Hours Worked</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{r.employee_name || r.employee_code || r.employee_id}</td>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', color: r.check_in ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)', color: r.check_out ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: r.hours_worked ? 700 : 400 }}>
                      {r.hours_worked ? `${r.hours_worked} hrs` : 'In Progress'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${r.status === 'present' ? 'badge-success' : r.status === 'late' ? 'badge-warning' : r.status === 'on_leave' ? 'badge-info' : 'badge-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <h3 style={{ padding: '1.25rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-subtle)', fontSize: '1.1rem' }}>
            My 30-Day Attendance Logs
          </h3>
          {!(myAttendance && myAttendance.length) ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No personal attendance history found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Hours Logged</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{r.date}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${r.status === 'present' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-mono)' }}>{r.hours_worked ? `${r.hours_worked} hrs` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Departmental Attendance Rates</h3>
          {!(summaryData && summaryData.length) ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No summary data available.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {summaryData.map((s: any, i: number) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{s.employee_name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>{s.department}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span>Attendance Rate:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{s.attendance_rate}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.attendance_rate}%`, height: '100%', background: 'var(--accent-emerald)', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
