import React from 'react';

export default function Header({ currentView, setCurrentView, adminToken, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('store')}>
          <div className="logo-icon">MR</div>
          <div>
            <div className="brand-title" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.02em', color: '#0f172a' }}>
              M R TILES AND SANITATION SILCHAR
            </div>
            <div className="brand-subtitle" style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Silchar, Assam • Premium Tiles & Sanitaryware
            </div>
          </div>
        </div>

        <div className="nav-links">
          {adminToken ? (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button 
                className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px' }}
                onClick={() => setCurrentView('admin')}
              >
                Admin Dashboard
              </button>
              <button 
                className="btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px' }}
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="admin-nav-btn"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px' }}
              onClick={() => setCurrentView('admin')}
            >
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
