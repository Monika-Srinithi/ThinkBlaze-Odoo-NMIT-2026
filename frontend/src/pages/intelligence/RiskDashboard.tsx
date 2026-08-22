import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, X } from 'lucide-react';

export default function RiskDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const { data: risks, isLoading: risksLoading } = useQuery({
    queryKey: ['team-risks'],
    queryFn: async () => {
      // Mocked data
      return [
        { team: 'Engineering', score: 85, level: 'Critical', capacity: 55, factors: ['Overlapping senior leaves', 'Recent high turnover', 'SLA breaches in past week'] },
        { team: 'Support', score: 60, level: 'High', capacity: 72, factors: ['High absenteeism', 'Upcoming public holidays'] },
        { team: 'Sales', score: 30, level: 'Normal', capacity: 90, factors: ['Stable attendance'] },
        { team: 'Marketing', score: 45, level: 'Medium', capacity: 82, factors: ['One key person on long leave'] },
      ];
    }
  });

  const { data: evidence, isLoading: evidenceLoading } = useQuery({
    queryKey: ['risk-evidence', selectedTeam],
    queryFn: async () => {
      if (!selectedTeam) return null;
      // Mocked evidence
      return {
        team: selectedTeam,
        attendanceStats: '78% avg this week (down 12% from normal)',
        leaveEvidence: '3 senior engineers have overlapping leaves approved for Oct 18-20.',
        breakdown: [
          { name: 'Ravi K', role: 'Senior', status: 'Pending Leave' },
          { name: 'Maria S', role: 'Lead', status: 'On Leave' },
          { name: 'John D', role: 'Mid', status: 'Present' }
        ]
      };
    },
    enabled: !!selectedTeam
  });

  if (risksLoading) return <div style={{ padding: '2rem' }}>Loading Risk Engine...</div>;

  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '2rem', position: 'relative' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <AlertTriangle color="var(--danger)" /> Workforce Risk Analysis
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {risks?.map((risk: any) => {
            const badgeColor = risk.level === 'Critical' ? 'var(--danger)' : risk.level === 'High' ? 'var(--warning)' : risk.level === 'Medium' ? 'var(--info)' : 'var(--success)';
            
            return (
              <div key={risk.team} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: `1px solid ${risk.level === 'Critical' ? 'var(--danger)' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{risk.team}</h3>
                  <div style={{ background: `${badgeColor}33`, color: badgeColor, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    {risk.level} ({risk.score}/100)
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span>Capacity</span>
                    <span>{risk.capacity}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: `${risk.capacity}%`, height: '100%', background: badgeColor, borderRadius: '3px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Contributing Factors:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {risk.factors.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  </ul>
                </div>

                <button 
                  onClick={() => setSelectedTeam(risk.team)}
                  style={{ width: '100%', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Info size={16} /> View Evidence
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel for Evidence */}
      {selectedTeam && (
        <div style={{ width: '400px', background: 'var(--bg-base)', borderLeft: '1px solid var(--border)', padding: '2rem', height: 'calc(100vh - 4rem)', position: 'sticky', top: '2rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>WHY? Panel</h2>
            <button onClick={() => setSelectedTeam(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          
          {evidenceLoading ? (
            <div>Loading evidence...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{evidence?.team} Evidence</h3>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Attendance Stats</h4>
                  <p style={{ margin: 0 }}>{evidence?.attendanceStats}</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Leave Conflicts</h4>
                <p style={{ margin: 0 }}>{evidence?.leaveEvidence}</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Employee Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {evidence?.breakdown.map((emp: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.role}</div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: emp.status === 'Present' ? 'var(--success)' : 'var(--warning)' }}>{emp.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

