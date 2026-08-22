import { Bell, Search, ShieldCheck } from 'lucide-react';

export const Header = () => {
  return (
    <header
      style={{
        height: '60px',
        background: 'rgba(14, 18, 30, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '380px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search Dayflow intelligence, employees, team risk..."
            style={{ paddingLeft: '2.4rem', borderRadius: '2rem', fontSize: '0.825rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.775rem', fontWeight: 600, border: '1px solid rgba(99,102,241,0.25)' }}>
          <ShieldCheck size={14} /> AI Decision Engine Active
        </div>

        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        <button
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            padding: '0.45rem',
            borderRadius: '50%',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          title="Notifications"
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '7px',
              height: '7px',
              background: 'var(--accent-rose)',
              borderRadius: '50%',
              boxShadow: '0 0 6px var(--accent-rose)',
            }}
          />
        </button>
      </div>
    </header>
  );
};
