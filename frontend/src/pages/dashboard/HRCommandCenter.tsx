import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Users, Calendar, Zap, ArrowRight, ShieldAlert } from 'lucide-react';

const getToken = () => localStorage.getItem('token') || '';
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function apiFetch(path: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export default function HRCommandCenter() {
  const navigate = useNavigate();

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['workforce-health'],
    queryFn: () => apiFetch('/intelligence/workforce-health'),
    retry: 1,
  });

  const { data: actionData, isLoading: actionLoading } = useQuery({
    queryKey: ['action-center'],
    queryFn: () => apiFetch('/intelligence/action-center'),
    retry: 1,
  });

  if (healthLoading || actionLoading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <div style={{ width: 24, height: 24, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Loading HR Command Center...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const score = healthData?.overall_health_score || 0;
  const gaugeColor = score > 80 ? 'var(--success)' : score > 60 ? 'var(--warning)' : 'var(--danger)';
  const teams = healthData?.teams || [];
  const riskDist = healthData?.risk_distribution || { critical: 0, high: 0, medium: 0, low: 5 };
  const pendingLeaves = actionData?.pending_leave_requests || [];
  const alerts = actionData?.immediate_actions || [];

  const teamsAtRisk = teams.filter((t: any) => t.risk_level === 'critical' || t.risk_level === 'high').length;
  const onLeave = teams.reduce((acc: number, t: any) => acc + (t.employees_on_leave || 0), 0);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity color="var(--primary)" size={32} /> HR Command Center
        </h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Live · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {/* Animated Health Gauge */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem', backdropFilter: 'blur(10px)' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke={gaugeColor} strokeWidth="12"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                style={{ transition: 'stroke-dasharray 1.5s ease-in-out', filter: `drop-shadow(0 0 6px ${gaugeColor})` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: gaugeColor }}>
              {score.toFixed(0)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Workforce Health</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: gaugeColor }}>
              {score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Needs Attention' : 'Critical'}
            </div>
          </div>
        </div>

        {[
          { label: 'Teams at Risk', value: teamsAtRisk, icon: AlertTriangle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Pending Actions', value: pendingLeaves.length, icon: Zap, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
          { label: 'On Leave Today', value: onLeave, icon: Users, color: 'var(--info)', bg: 'rgba(59,130,246,0.1)' },
        ].map((m, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', backdropFilter: 'blur(10px)', transition: 'transform 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'none')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.label}</div>
              <div style={{ background: m.bg, padding: '0.5rem', borderRadius: '0.5rem' }}><m.icon size={18} color={m.color} /></div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Action Center — Pending Leaves */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--warning)" /> Action Center
              {pendingLeaves.length > 0 && (
                <span style={{ marginLeft: '0.5rem', background: 'var(--danger)', color: '#fff', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontWeight: 700 }}>
                  {pendingLeaves.length} Pending
                </span>
              )}
            </h2>
            {pendingLeaves.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>✅ No pending actions</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingLeaves.map((leave: any) => {
                  const urgColor = leave.urgency === 'critical' ? 'var(--danger)' : leave.urgency === 'high' ? 'var(--warning)' : 'var(--info)';
                  return (
                    <div key={leave.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(0,0,0,0.25)', borderRadius: '0.75rem', border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.35rem' }}>
                          {leave.employee_name}
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 400 }}> · {leave.designation}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {leave.start_date} → {leave.end_date}</span>
                          <span>·</span>
                          <span style={{ color: 'var(--warning)' }}>{leave.team} @ {leave.simulated_capacity}% if approved</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, background: `${urgColor}22`, color: urgColor, border: `1px solid ${urgColor}44` }}>
                          {leave.urgency?.toUpperCase()}
                        </span>
                        <button onClick={() => navigate(`/simulator/${leave.id}`)}
                          style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                          onMouseOver={e => (e.currentTarget.style.boxShadow = '0 0 12px var(--primary-glow)')}
                          onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}>
                          Simulate <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Capacity Grid */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Team Capacity Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {teams.map((team: any, i: number) => {
                const cap = team.capacity_pct || 0;
                const barColor = cap < 60 ? 'var(--danger)' : cap < 75 ? 'var(--warning)' : 'var(--success)';
                const riskLabel = team.risk_level === 'critical' ? '🔴 CRITICAL' : team.risk_level === 'high' ? '🟠 HIGH' : team.risk_level === 'medium' ? '🟡 MEDIUM' : '🟢 NORMAL';
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>{team.name}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{riskLabel}</span>
                        <span style={{ fontWeight: 700, color: barColor }}>{cap}%</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${cap}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 1.2s ease-in-out', boxShadow: `0 0 6px ${barColor}88` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Alerts */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', flex: 1 }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="var(--danger)" /> Risk Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {alerts.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '1rem', textAlign: 'center' }}>✅ No active alerts</div>
              ) : (
                alerts.map((a: any, i: number) => (
                  <div key={i} style={{ padding: '0.875rem', borderRadius: '0.5rem', borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}`, background: a.severity === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {a.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Risk Distribution */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Risk Distribution</h3>
            <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', width: '100%', gap: '2px' }}>
              {riskDist.critical > 0 && <div style={{ flex: riskDist.critical, background: 'var(--danger)', borderRadius: '2px' }} title={`Critical: ${riskDist.critical}`} />}
              {riskDist.high > 0 && <div style={{ flex: riskDist.high, background: 'var(--warning)', borderRadius: '2px' }} title={`High: ${riskDist.high}`} />}
              {riskDist.medium > 0 && <div style={{ flex: riskDist.medium, background: 'var(--info)', borderRadius: '2px' }} title={`Medium: ${riskDist.medium}`} />}
              {(riskDist.low || riskDist.normal || 0) > 0 && <div style={{ flex: riskDist.low || riskDist.normal || 1, background: 'var(--success)', borderRadius: '2px' }} title="Normal" />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>🔴 {riskDist.critical || 0} Critical</span>
              <span>🟠 {riskDist.high || 0} High</span>
              <span>🟡 {riskDist.medium || 0} Medium</span>
              <span>🟢 {riskDist.low || riskDist.normal || 0} Normal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
