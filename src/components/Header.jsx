import React, { useState } from 'react';

export default function Header({ currentView, setCurrentView, adminToken, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileOpen(false);
  };

  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('store')}>
          <div className="logo-icon">MR</div>
          <div>
            <div className="brand-title">M R TILES & SANITATION</div>
            <div className="brand-subtitle">Silchar, Assam • Premium Tiles & Sanitaryware</div>
          </div>
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <button 
            className={`nav-btn ${currentView === 'store' ? 'active' : ''}`}
            onClick={() => handleNavClick('store')}
          >
            Showroom Catalog
          </button>

          {adminToken ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: mobileOpen ? '100%' : 'auto' }}>
              <button 
                className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin')}
                style={{ flex: 1 }}
              >
                Admin Dashboard
              </button>
              <button 
                className="btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => { onLogout(); setMobileOpen(false); }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="admin-nav-btn"
              onClick={() => handleNavClick('admin')}
            >
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
