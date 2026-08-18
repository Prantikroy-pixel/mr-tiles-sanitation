import React from 'react';

export default function Header({ currentView, setCurrentView, adminToken, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('store')}>
          <div className="logo-icon">MR</div>
          <div>
            <div className="brand-title">M R TILES & SANITATION</div>
            <div className="brand-subtitle">Silchar, Assam • Premium Tiles & Sanitaryware</div>
          </div>
        </div>

        <div className="nav-links">
          {adminToken ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                Admin Dashboard
              </button>
              <button 
                className="btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="admin-nav-btn"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', borderRadius: '5px' }}
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
