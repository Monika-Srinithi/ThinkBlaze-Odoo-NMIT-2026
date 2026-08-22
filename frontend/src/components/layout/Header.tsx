import { Bell, Search, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header
      style={{
        height: '60px',
        background: '#0D1422',
        borderBottom: '1px solid #243149',
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
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search Dayflow workforce intelligence, team risk, employees..."
            style={{ paddingLeft: '2.5rem', borderRadius: '2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 217, 255, 0.12)', color: '#00D9FF', padding: '0.35rem 0.85rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(0, 217, 255, 0.35)', boxShadow: '0 0 12px rgba(0, 217, 255, 0.2)' }}>
          <Sparkles size={14} className="animate-live-pulse" /> AI Decision Engine Active
        </div>

        <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        <button
          style={{
            position: 'relative',
            background: '#111B2E',
            border: '1px solid #243149',
            padding: '0.5rem',
            borderRadius: '50%',
            color: '#94A3B8',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          title="Notifications"
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              background: '#FF3B6B',
              borderRadius: '50%',
              boxShadow: '0 0 8px #FF3B6B',
            }}
          />
        </button>
      </div>
    </header>
  );
};
