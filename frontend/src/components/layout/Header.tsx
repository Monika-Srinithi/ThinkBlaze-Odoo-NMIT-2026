import { Bell, Search, Sparkles, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/theme';

export const Header = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header
      style={{
        height: '60px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '400px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search Dayflow workforce intelligence, team risk, employees..."
            style={{ paddingLeft: '2.5rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* AI Decision Engine Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.35rem 0.85rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 800, border: '1px solid var(--primary)' }}>
          <Sparkles size={14} className="animate-live-pulse" /> AI Decision Engine Active
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--hover)',
            border: '1px solid var(--border)',
            padding: '0.45rem 0.85rem',
            borderRadius: '0.375rem',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            transition: 'all 0.2s ease',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="var(--warning)" /> Light
            </>
          ) : (
            <>
              <Moon size={15} color="var(--primary)" /> Dark
            </>
          )}
        </button>

        {/* Notification Bell */}
        <button
          style={{
            position: 'relative',
            background: 'var(--hover)',
            border: '1px solid var(--border)',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          title="Notifications"
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
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
              background: 'var(--danger)',
              borderRadius: '50%',
            }}
          />
        </button>
      </div>
    </header>
  );
};
