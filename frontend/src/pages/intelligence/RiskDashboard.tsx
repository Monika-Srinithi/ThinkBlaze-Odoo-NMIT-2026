import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, ArrowRight, X } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export const RiskDashboard = () => {
  const navigate = useNavigate();
  const [selectedTeamEvidence, setSelectedTeamEvidence] = useState<string | null>(null);

  // Fetch Team Risks
  const { data: risks, isLoading } = useQuery({
    queryKey: ['team-risks'],
    queryFn: () => apiFetch('/intelligence/risks'),
  });

  // Fetch Evidence for Modal
  const { data: evidenceData } = useQuery({
    queryKey: ['risk-evidence', selectedTeamEvidence],
    queryFn: () => apiFetch(`/intelligence/evidence/${encodeURIComponent(selectedTeamEvidence!)}`),
    enabled: !!selectedTeamEvidence,
  });

  const riskList = risks || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle color="var(--accent-rose)" size={32} /> Workforce Risk Engine
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Multi-factor operational risk scoring powered by attendance, leave overlaps, and staffing capacity.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Computing workforce risk matrix...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {riskList.map((r: any) => {
            const isHigh = r.risk_level === 'critical' || r.risk_level === 'high';
            const badgeClass = r.risk_level === 'critical' ? 'badge-danger' : r.risk_level === 'high' ? 'badge-warning' : 'badge-success';
            return (
              <div key={r.team} className={isHigh ? 'glass-panel-glow' : 'glass-panel'} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{r.team}</h3>
                    <span className={`badge ${badgeClass}`}>{r.risk_level}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isHigh ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                      {r.risk_score.toFixed(1)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ 100 Risk Score</div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Contributing Factors:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {(r.factors || []).slice(0, 3).map((f: any, i: number) => (
                        <div key={i} style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                          <span style={{ color: 'var(--accent-rose)' }}>•</span> {f.factor} (+{f.score} pts)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn-secondary" style={{ flex: 1, fontSize: '0.825rem', justifyContent: 'center' }} onClick={() => setSelectedTeamEvidence(r.team)}>
                    <Info size={14} /> View Evidence (Why?)
                  </button>
                  <button className="btn-primary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem' }} onClick={() => navigate('/dashboard')}>
                    Action <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evidence Modal ("WHY?") */}
      {selectedTeamEvidence && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="glass-panel-glow animate-slide-up" style={{ width: '100%', maxWidth: '650px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-danger" style={{ marginBottom: '0.35rem' }}>Evidence Trace</span>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Why is {selectedTeamEvidence} at Risk?</h2>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setSelectedTeamEvidence(null)}>
                <X size={22} />
              </button>
            </div>

            {evidenceData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>Risk Breakdown & Factors</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(evidenceData.risk_factors || []).map((f: any, i: number) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '0.5rem', borderLeft: '3px solid var(--accent-rose)', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{f.factor} (+{f.score} pts)</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{f.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>Overlapping Leave & Absences</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(evidenceData.leave_evidence || []).map((l: any, i: number) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{l.employee}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.start_date} → {l.end_date}</div>
                        </div>
                        <span className={`badge ${l.status === 'approved' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Fetching risk evidence...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;

