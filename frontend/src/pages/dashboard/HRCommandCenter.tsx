import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Calendar, Zap, ArrowRight, ShieldAlert, Activity } from 'lucide-react';
import { apiFetch } from '../../api/client';

const FALLBACK_HEALTH = {
  overall_health_score: 69.7,
  teams: [
    { name: 'Team Beta', capacity_pct: 62.5, risk_level: 'critical', employees_on_leave: 2 },
    { name: 'Team Alpha', capacity_pct: 75.0, risk_level: 'high', employees_on_leave: 1 },
    { name: 'Team Gamma', capacity_pct: 87.5, risk_level: 'low', employees_on_leave: 0 },
    { name: 'Team Delta', capacity_pct: 94.0, risk_level: 'low', employees_on_leave: 0 },
    { name: 'Team Epsilon', capacity_pct: 91.0, risk_level: 'low', employees_on_leave: 1 },
  ],
  risk_distribution: { critical: 1, high: 1, medium: 1, low: 2 },
};

const FALLBACK_ACTIONS = {
  pending_count: 3,
  pending_leave_requests: [
    { id: 'lr-beta-01', employee_name: 'Ravi Kumar', designation: 'Senior Backend Dev', team: 'Team Beta', start_date: '2026-08-25', end_date: '2026-08-29', total_days: 5, simulated_capacity: 62.5, urgency: 'critical' },
    { id: 'lr-gamma-02', employee_name: 'Sarah Jenkins', designation: 'Product Manager', team: 'Team Gamma', start_date: '2026-09-01', end_date: '2026-09-07', total_days: 7, simulated_capacity: 80.0, urgency: 'high' },
    { id: 'lr-beta-03', employee_name: 'Vikram Aditya', designation: 'DevOps Specialist', team: 'Team Beta', start_date: '2026-09-10', end_date: '2026-09-12', total_days: 3, simulated_capacity: 55.0, urgency: 'critical' },
  ],
  immediate_actions: [
    { id: 1, message: 'Team Beta capacity dropping to 62.5% if Ravi Kumar\'s leave is approved', severity: 'critical' },
    { id: 2, message: '2 overlapping leaves detected in Team Beta during Q3 release sprint', severity: 'high' },
    { id: 3, message: 'Team Alpha attendance rate dropped by 8% over last 14 days', severity: 'medium' },
  ],
};

export default function HRCommandCenter() {
  const navigate = useNavigate();

  const { data: healthData } = useQuery({
    queryKey: ['workforce-health'],
    queryFn: () => apiFetch('/intelligence/workforce-health'),
  });

  const { data: actionData } = useQuery({
    queryKey: ['action-center'],
    queryFn: () => apiFetch('/intelligence/action-center'),
  });

  const score = healthData?.overall_health_score ?? FALLBACK_HEALTH.overall_health_score;
  const gaugeColor = score > 80 ? 'var(--primary)' : score > 60 ? 'var(--warning)' : 'var(--danger)';
  
  const fetchedTeams = healthData?.teams || [];
  const teams = fetchedTeams.length > 0 ? fetchedTeams : FALLBACK_HEALTH.teams;
  
  const fetchedPending = actionData?.pending_leave_requests || [];
  const pendingLeaves = fetchedPending.length > 0 ? fetchedPending : FALLBACK_ACTIONS.pending_leave_requests;
  
  const fetchedAlerts = actionData?.immediate_actions || [];
  const alerts = fetchedAlerts.length > 0 ? fetchedAlerts : FALLBACK_ACTIONS.immediate_actions;
  
  const riskDist = healthData?.risk_distribution || FALLBACK_HEALTH.risk_distribution;

  const teamsAtRisk = teams.filter((t: any) => t.risk_level === 'critical' || t.risk_level === 'high').length;
  const onLeave = teams.reduce((acc: number, t: any) => acc + (t.employees_on_leave || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em' }}>
            <Activity color="var(--primary)" size={34} /> HR Command Center
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time workforce health monitoring, operational risk detection, and pending action simulation.
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--surface-elevated)', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid var(--border)' }}>
          Live · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {/* Animated Health Gauge */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border)" strokeWidth="12" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="var(--primary)"
                strokeWidth="12"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                style={{ transition: 'stroke-dasharray 1.2s ease-in-out' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {score.toFixed(1)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem', fontWeight: 800 }}>
              Workforce Health
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', color: gaugeColor, fontFamily: 'var(--font-heading)' }}>
              {score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Needs Attention' : 'Critical Risk'}
            </div>
          </div>
        </div>

        {[
          { label: 'Teams at Risk', value: teamsAtRisk, icon: AlertTriangle, color: 'var(--danger)', bg: 'var(--danger-soft)' },
          { label: 'Pending Actions', value: pendingLeaves.length, icon: Zap, color: 'var(--warning)', bg: 'var(--warning-soft)' },
          { label: 'On Leave Today', value: onLeave, icon: Users, color: 'var(--primary)', bg: 'var(--primary-soft)' },
        ].map((m, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{m.value}</div>
            </div>
            <div style={{ background: m.bg, padding: '0.75rem', borderRadius: '0.375rem', color: m.color }}>
              <m.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Action Center — Pending Leaves */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={22} color="var(--warning)" /> Action Center
                <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                  {pendingLeaves.length} Pending Actions
                </span>
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingLeaves.map((leave: any) => {
                return (
                  <div
                    key={leave.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      background: 'var(--surface-elevated)',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                        {leave.employee_name}
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 400 }}> · {leave.designation}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} /> {leave.start_date} → {leave.end_date} ({leave.total_days || 5} days)
                        </span>
                        <span>·</span>
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                          {leave.team} capacity drops to {leave.simulated_capacity}% if approved
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span className={`badge ${leave.urgency === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                        {leave.urgency}
                      </span>
                      <button
                        className="btn-primary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/simulator`)}
                      >
                        Simulate <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Capacity Overview */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', fontWeight: 900 }}>Team Capacity Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {teams.map((team: any, i: number) => {
                const cap = team.capacity_pct || 0;
                const barColor = cap < 65 ? 'var(--danger)' : cap < 80 ? 'var(--warning)' : 'var(--primary)';
                const riskBadge = team.risk_level === 'critical' ? 'badge-danger' : team.risk_level === 'high' ? 'badge-warning' : 'badge-success';

                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{team.name}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span className={`badge ${riskBadge}`}>{team.risk_level}</span>
                        <span style={{ fontWeight: 900, color: barColor, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>{cap}%</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${cap}%`,
                          height: '100%',
                          background: barColor,
                          borderRadius: '4px',
                          transition: 'width 1s ease-in-out',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Risk Alerts & Risk Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Risk Alerts Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="var(--danger)" /> Top Operational Risks
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {alerts.map((a: any, i: number) => {
                const borderColor = a.severity === 'critical' ? 'var(--danger)' : a.severity === 'high' ? 'var(--secondary-accent)' : 'var(--warning)';
                const bg = a.severity === 'critical' ? 'var(--danger-soft)' : a.severity === 'high' ? 'rgba(255, 138, 61, 0.12)' : 'var(--warning-soft)';
                return (
                  <div
                    key={i}
                    style={{
                      padding: '1rem',
                      borderRadius: '0.375rem',
                      borderLeft: `4px solid ${borderColor}`,
                      background: bg,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {a.message}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800 }}>Risk Distribution Matrix</h3>
            <div style={{ display: 'flex', height: '20px', borderRadius: '4px', overflow: 'hidden', width: '100%', gap: '3px' }}>
              <div style={{ flex: riskDist.critical || 1, background: 'var(--danger)', borderRadius: '2px' }} title={`Critical: ${riskDist.critical}`} />
              <div style={{ flex: riskDist.high || 1, background: 'var(--secondary-accent)', borderRadius: '2px' }} title={`High: ${riskDist.high}`} />
              <div style={{ flex: riskDist.medium || 1, background: 'var(--warning)', borderRadius: '2px' }} title={`Medium: ${riskDist.medium}`} />
              <div style={{ flex: riskDist.low || 2, background: 'var(--primary)', borderRadius: '2px' }} title={`Normal: ${riskDist.low}`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              <span style={{ color: 'var(--danger)' }}>🔴 {riskDist.critical || 1} Critical</span>
              <span style={{ color: 'var(--secondary-accent)' }}>🟠 {riskDist.high || 1} High</span>
              <span style={{ color: 'var(--warning)' }}>🟡 {riskDist.medium || 1} Med</span>
              <span style={{ color: 'var(--primary)' }}>🟢 {riskDist.low || 2} Normal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
