import React, { useState } from 'react';
import { Layers, ShieldCheck, Sparkles, Menu, X } from 'lucide-react';

export default function Header({ currentView, setCurrentView, adminToken, onLogout, onOpenAi }) {
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
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
          <button 
            className={`nav-btn ${currentView === 'store' ? 'active' : ''}`}
            onClick={() => handleNavClick('store')}
          >
            <Layers size={18} />
            Showroom Catalog
          </button>

          <button className="nav-btn" onClick={() => { onOpenAi(); setMobileOpen(false); }}>
            <Sparkles size={18} style={{ color: 'var(--accent-gold-bright)' }} />
            AI Room Advisor
          </button>

          {adminToken ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: mobileOpen ? '100%' : 'auto' }}>
              <button 
                className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin')}
                style={{ flex: 1 }}
              >
                <ShieldCheck size={18} />
                Admin Dashboard
              </button>
              <button 
                className="btn-secondary"
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.82rem' }}
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
              <ShieldCheck size={18} />
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
