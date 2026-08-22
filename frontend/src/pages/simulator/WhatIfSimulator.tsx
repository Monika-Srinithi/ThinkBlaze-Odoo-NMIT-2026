import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, ArrowLeft, AlertTriangle, Play, FileText, CheckCircle, TrendingDown, Users, Shield } from 'lucide-react';

const getToken = () => localStorage.getItem('token') || '';
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function apiPost(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function apiFetch(path: string) {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

const OPTION_META: Record<string, { label: string; impact: string; impactColor: string; desc: string }> = {
  approve_only: { label: 'Approve Only', impact: 'HIGH RISK', impactColor: 'var(--danger)', desc: 'Approve leave as-is. Team capacity drops.' },
  approve_with_reassign: { label: 'Approve + Reassign Tasks', impact: 'LOW RISK', impactColor: 'var(--success)', desc: 'Approve and assign backup to cover critical tasks.' },
  suggest_alternate: { label: 'Suggest Alternate Dates', impact: 'MEDIUM RISK', impactColor: 'var(--warning)', desc: 'Request employee to shift leave to lower-impact period.' },
};

export default function WhatIfSimulator() {
  const { leaveId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [simResult, setSimResult] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string>('approve_with_reassign');
  const [applied, setApplied] = useState(false);
  const [applyResult, setApplyResult] = useState<any>(null);

  // Fetch pending leaves if no leaveId
  const { data: actionCenter } = useQuery({
    queryKey: ['action-center'],
    queryFn: () => apiFetch('/intelligence/action-center'),
    enabled: !leaveId,
  });

  const simulateMutation = useMutation({
    mutationFn: () => apiPost('/intelligence/simulate', { leave_request_id: leaveId }),
    onSuccess: (data) => { setSimResult(data); setSelectedOption(data.ai_recommendation?.recommended_option || 'approve_with_reassign'); },
  });

  const applyMutation = useMutation({
    mutationFn: () => apiPost('/intelligence/recommendation/apply', {
      leave_request_id: leaveId,
      option_id: selectedOption,
      backup_employee_id: simResult?.ai_recommendation?.backup_employee?.id || null,
    }),
    onSuccess: (data) => { setApplied(true); setApplyResult(data); qc.invalidateQueries({ queryKey: ['action-center'] }); qc.invalidateQueries({ queryKey: ['workforce-health'] }); },
  });

  // No leaveId — show list of pending leaves
  if (!leaveId) {
    const pending = actionCenter?.pending_leave_requests || [];
    return (
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap color="var(--warning)" size={32} /> What-If Simulator
        </h1>
        <p style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)' }}>Select a pending leave request to simulate the impact on your workforce.</p>
        {pending.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '3rem', textAlign: 'center', borderRadius: '1rem', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            ✅ No pending leave requests to simulate.
            <br /><button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem', background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Go to Dashboard</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pending.map((l: any) => (
              <div key={l.id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 15px var(--primary-glow)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                onClick={() => navigate(`/simulator/${l.id}`)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{l.employee_name} · <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{l.designation}</span></div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{l.team} · {l.start_date} → {l.end_date} ({l.total_days} days)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '1.25rem' }}>{l.simulated_capacity}%</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>capacity if approved</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Applied success state
  if (applied) {
    return (
      <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '2px solid var(--success)' }}>
          <CheckCircle size={40} color="var(--success)" />
        </div>
        <h1 style={{ marginBottom: '1rem', color: 'var(--success)' }}>Action Applied Successfully</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {applyResult?.action_taken || 'The recommendation has been executed and workforce data updated.'}
        </p>
        {applyResult?.new_capacity_pct && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', borderRadius: '0.75rem', padding: '1rem 2rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
            Team capacity: {applyResult.new_capacity_pct}%
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            ← Back to Dashboard
          </button>
          <button onClick={() => navigate('/traces')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> View Decision Trace
          </button>
        </div>
      </div>
    );
  }

  const lr = simResult?.leave_request;
  const cur = simResult?.current_state;
  const sim = simResult?.simulated_state;
  const rec = simResult?.ai_recommendation;
  const options = simResult?.options || [];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content', transition: 'color 0.2s' }}
        onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap color="var(--warning)" size={28} /> What-If Simulator
        </h1>
        {simResult && (
          <div style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 700, border: '1px solid var(--primary)44' }}>
            ⚡ Simulation Active
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: simResult ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* LEFT: Context + Capacity Impact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Request Context */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', color: 'var(--text-secondary)' }}>Leave Request</h2>
            {lr ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {[
                  { label: 'Employee', value: lr.employee_name },
                  { label: 'Team', value: cur?.team || '–' },
                  { label: 'Leave Type', value: lr.leave_type },
                  { label: 'Duration', value: `${lr.total_days} days` },
                  { label: 'From', value: lr.start_date },
                  { label: 'To', value: lr.end_date },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>Leave ID: {leaveId}<br />Run simulation to see details.</div>
            )}
          </div>

          {/* Capacity Impact */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={18} color="var(--warning)" /> Capacity Impact
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current Capacity (Before)</span>
                <span style={{ fontWeight: 700, color: cur ? 'var(--success)' : 'var(--text-secondary)' }}>{cur?.capacity_pct ?? '—'}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${cur?.capacity_pct || 0}%`, height: '100%', background: 'var(--success)', borderRadius: '6px', transition: 'width 1s ease-in-out' }} />
              </div>
            </div>

            {simResult && (
              <div style={{ animation: 'fadeSlideIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Projected Capacity (After Approval)</span>
                  <span style={{ fontWeight: 700, color: (sim?.capacity_pct || 0) < 60 ? 'var(--danger)' : 'var(--warning)' }}>{sim?.capacity_pct ?? '—'}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${sim?.capacity_pct || 0}%`, height: '100%', background: (sim?.capacity_pct || 0) < 60 ? 'var(--danger)' : 'var(--warning)', borderRadius: '6px', transition: 'width 1.2s ease-in-out', boxShadow: `0 0 8px ${(sim?.capacity_pct || 0) < 60 ? 'var(--danger)' : 'var(--warning)'}88` }} />
                </div>
                {sim?.capacity_pct < 60 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> Capacity drops below CRITICAL threshold (60%)
                  </div>
                )}
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Team size:</span> <strong>{cur?.total || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>On leave:</span> <strong>{sim?.employees_on_leave || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Available:</span> <strong style={{ color: 'var(--success)' }}>{sim?.available || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Impact:</span> <strong style={{ color: 'var(--danger)' }}>-{((cur?.capacity_pct || 0) - (sim?.capacity_pct || 0)).toFixed(1)}%</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Run Simulation Button */}
          {!simResult && (
            <button onClick={() => simulateMutation.mutate()} disabled={simulateMutation.isPending}
              style={{ background: simulateMutation.isPending ? 'var(--bg-card)' : 'var(--primary)', color: '#fff', padding: '1.1rem', border: 'none', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 700, cursor: simulateMutation.isPending ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', boxShadow: '0 0 20px var(--primary-glow)' }}>
              {simulateMutation.isPending ? (
                <><div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Simulating...</>
              ) : (
                <><Play size={20} /> Run Simulation</>
              )}
            </button>
          )}
        </div>

        {/* RIGHT: AI Recommendation + Options */}
        {simResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeSlideIn 0.4s ease-out' }}>

            {/* AI Recommendation Card */}
            <div style={{ background: 'rgba(99,102,241,0.07)', padding: '1.5rem', borderRadius: '1rem', border: '2px solid var(--primary)44' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '0.4rem' }}><Shield size={18} color="#fff" /></div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>AI Recommendation</span>
                {rec?.confidence && (
                  <span style={{ marginLeft: 'auto', background: 'var(--primary)22', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--primary)44' }}>
                    {rec.confidence}% Confidence
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 1rem 0', lineHeight: 1.65, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                {rec?.reasoning || 'Based on team capacity analysis, backup availability, and leave overlap data.'}
              </p>
              {rec?.backup_employee?.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.875rem' }}>
                  <Users size={14} color="var(--success)" />
                  <span style={{ color: 'var(--text-secondary)' }}>Backup employee:</span>
                  <strong style={{ color: 'var(--success)' }}>{rec.backup_employee.name}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>({rec.backup_employee.designation})</span>
                </div>
              )}
            </div>

            {/* Options */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Choose Action</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(options.length > 0 ? options : Object.keys(OPTION_META)).map((opt: any) => {
                  const id = typeof opt === 'string' ? opt : opt.id;
                  const meta = OPTION_META[id] || { label: id, impact: '—', impactColor: 'var(--text-secondary)', desc: '' };
                  const isRec = rec?.recommended_option === id;
                  const isSelected = selectedOption === id;
                  return (
                    <div key={id} onClick={() => setSelectedOption(id)}
                      style={{ padding: '1.1rem 1.25rem', background: isSelected ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)', borderRadius: '0.75rem', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', boxShadow: isSelected ? '0 0 16px var(--primary-glow)' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {meta.label}
                          {isRec && <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontWeight: 700 }}>RECOMMENDED</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{meta.desc || (typeof opt === 'object' ? opt.description : '')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: meta.impactColor }}>{meta.impact}</span>
                        {isSelected && <CheckCircle size={20} color="var(--primary)" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Apply Button */}
            <button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}
              style={{ background: applyMutation.isPending ? 'var(--bg-card)' : 'var(--success)', color: '#fff', padding: '1.1rem', border: 'none', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 700, cursor: applyMutation.isPending ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
              {applyMutation.isPending ? (
                <><div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Applying...</>
              ) : (
                <><CheckCircle size={20} /> APPLY RECOMMENDATION</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
