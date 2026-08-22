import { Bell, Search, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header
      style={{
        height: '64px',
        background: 'rgba(10, 12, 20, 0.75)',
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
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search Dayflow intelligence, employees, team risks..."
            style={{ paddingLeft: '2.5rem', borderRadius: '2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
          <Sparkles size={14} /> AI Decision Engine Active
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        <button
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-subtle)',
            padding: '0.5rem',
            borderRadius: '50%',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              background: 'var(--accent-rose)',
              borderRadius: '50%',
              boxShadow: '0 0 8px var(--accent-rose)',
            }}
          />
        </button>
      </div>
    </header>
  );
};
