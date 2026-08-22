import { Bell, Search, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header
      style={{
        height: '62px',
        background: 'rgba(10, 14, 22, 0.88)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '400px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search Dayflow workforce intelligence, team risk, employees..."
            style={{ paddingLeft: '2.5rem', borderRadius: '2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,240,255,0.14)', color: 'var(--primary)', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(0,240,255,0.4)', boxShadow: '0 0 12px var(--primary-glow)' }}>
          <Sparkles size={14} className="animate-live-pulse" /> AI Decision Engine Active
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        <button
          style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-medium)',
            padding: '0.5rem',
            borderRadius: '50%',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          title="Notifications"
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Bell size={17} />
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
