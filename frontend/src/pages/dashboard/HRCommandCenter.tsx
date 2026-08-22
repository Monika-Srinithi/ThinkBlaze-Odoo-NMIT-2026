import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Calendar, Zap, ArrowRight, ShieldAlert } from 'lucide-react';
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

  // Awwwards Style Dimensions Scorecard
  const awwwardsDimensions = [
    { title: 'Attendance Stability', score: 7.5 },
    { title: 'Leave Coverage Capacity', score: 6.8 },
    { title: 'Operational Capacity Slack', score: 7.0 },
    { title: 'System Policy Adherence', score: 8.2 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '3rem' }}>
      {/* Editorial Header Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '1.5rem',
        borderBottom: '2px solid var(--primary)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)' }}>
            Workforce AI Evaluation
          </span>
          <h1 style={{ margin: '0.25rem 0 0 0', fontSize: '3.2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', letterSpacing: '-0.05em', lineHeight: 1.0 }}>
            HR Command Center
          </h1>
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#FFFFFF', 
          background: 'var(--primary)', 
          padding: '0.6rem 1.2rem', 
          borderRadius: '0' 
        }}>
          System Score: {(score / 10).toFixed(2)} of 10
        </div>
      </div>

      {/* Awwwards Scoreboard Card & Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Large Awwwards Score Panel */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2.5px solid var(--primary)' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem', fontWeight: 900 }}>
              Workforce Health Rating
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '5.5rem', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.05em', color: 'var(--primary)' }}>
                {(score / 10).toFixed(1)}
              </span>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>/10</span>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: gaugeColor, marginBottom: '0.25rem' }}>
              Evaluation Status
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
              {score >= 85 ? 'Excellent Health' : score >= 70 ? 'Good Standing' : score >= 55 ? 'Needs Attention' : 'Critical Threat'}
            </div>
          </div>
        </div>

        {/* Dimension Ratings Grid */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', fontWeight: 900 }}>
            Operational Breakdown
          </div>
          {awwwardsDimensions.map((dim, index) => (
            <div key={index} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dim.title}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{dim.score}</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--divider)', position: 'relative' }}>
                <div style={{ width: `${dim.score * 10}%`, height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Monochromatic Mini Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Risk Incident Teams', value: teamsAtRisk, icon: AlertTriangle, desc: 'Requires instant mitigation' },
            { label: 'Pending AI Actions', value: pendingLeaves.length, icon: Zap, desc: 'Requires simulation run' },
            { label: 'Total Active Absences', value: onLeave, icon: Users, desc: 'Leaves approved today' },
          ].map((m, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.15rem' }}>{m.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{m.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{m.desc}</div>
              </div>
              <div style={{ border: '1.5px solid var(--border)', padding: '0.6rem', color: 'var(--primary)' }}>
                <m.icon size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Action Center — Pending Leaves */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1.5px solid var(--primary)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.02em' }}>
                <Zap size={20} /> Action Evaluation Center
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', background: 'var(--primary)', color: '#FFFFFF', padding: '0.25rem 0.65rem' }}>
                {pendingLeaves.length} Queued
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingLeaves.map((leave: any) => {
                const urgencyColor = leave.urgency === 'critical' ? 'var(--danger)' : 'var(--warning)';
                return (
                  <div
                    key={leave.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                        {leave.employee_name}
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}> · {leave.designation}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} /> {leave.start_date} → {leave.end_date} ({leave.total_days || 5} days)
                        </span>
                        <span>·</span>
                        <span style={{ color: urgencyColor, fontWeight: 700 }}>
                          {leave.team} capacity drops to {leave.simulated_capacity}% if approved
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span className="badge badge-info" style={{ borderColor: urgencyColor, color: urgencyColor }}>
                        {leave.urgency}
                      </span>
                      <button
                        className="btn-primary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}
                        onClick={() => navigate(`/simulator`)}
                      >
                        Simulate <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Capacity Overview */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 900, borderBottom: '1.5px solid var(--primary)', paddingBottom: '1rem' }}>Team Allocation Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {teams.map((team: any, i: number) => {
                const cap = team.capacity_pct || 0;
                const barColor = cap < 65 ? 'var(--danger)' : cap < 80 ? 'var(--warning)' : 'var(--primary)';
                const riskBadge = team.risk_level === 'critical' ? 'badge-danger' : team.risk_level === 'high' ? 'badge-warning' : 'badge-success';

                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase' }}>{team.name}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span className={`badge ${riskBadge}`}>{team.risk_level}</span>
                        <span style={{ fontWeight: 900, color: barColor, fontSize: '0.95rem' }}>{cap}%</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'var(--divider)', position: 'relative' }}>
                      <div
                        style={{
                          width: `${cap}%`,
                          height: '100%',
                          background: barColor,
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
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1.5px solid var(--primary)', paddingBottom: '1rem' }}>
              <ShieldAlert size={18} /> Operational Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {alerts.map((a: any, i: number) => {
                const borderColor = a.severity === 'critical' ? 'var(--danger)' : a.severity === 'high' ? 'var(--secondary-accent)' : 'var(--warning)';
                const bg = a.severity === 'critical' ? 'var(--danger-soft)' : 'var(--surface-elevated)';
                return (
                  <div
                    key={i}
                    style={{
                      padding: '1.1rem',
                      border: `1px solid var(--border)`,
                      borderLeft: `4px solid ${borderColor}`,
                      background: bg,
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      color: a.severity === 'critical' ? 'var(--danger)' : 'var(--text-primary)'
                    }}
                  >
                    {a.message}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Distribution Matrix */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Risk Distribution Matrix</h3>
            <div style={{ display: 'flex', height: '16px', width: '100%', gap: '3px' }}>
              <div style={{ flex: riskDist.critical || 1, background: 'var(--danger)' }} />
              <div style={{ flex: riskDist.high || 1, background: 'var(--secondary-accent)' }} />
              <div style={{ flex: riskDist.medium || 1, background: 'var(--warning)' }} />
              <div style={{ flex: riskDist.low || 2, background: 'var(--primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.25rem' }}>
                <span>Critical Risk</span>
                <span style={{ color: 'var(--danger)' }}>{riskDist.critical || 1} Team</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.25rem' }}>
                <span>High Alert</span>
                <span style={{ color: 'var(--secondary-accent)' }}>{riskDist.high || 1} Team</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--divider)', paddingBottom: '0.25rem' }}>
                <span>Medium Alert</span>
                <span style={{ color: 'var(--warning)' }}>{riskDist.medium || 1} Team</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Normal Standing</span>
                <span>{riskDist.low || 2} Teams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
