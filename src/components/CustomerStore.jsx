import React, { useState } from 'react';
import { Calculator, MapPin, Phone, Clock, Download, Mail } from 'lucide-react';

export default function CustomerStore({ 
  products, 
  categories, 
  activeCategory, 
  setActiveCategory, 
  onOpenCalc, 
  onInquire, 
  onDownloadPdf 
}) {
  return (
    <main>
      {/* Hero Header */}
      <section className="hero-section">
        <div className="hero-badge">
          M R TILES AND SANITATION • SILCHAR
        </div>
        <h1 className="hero-heading">
          Premium Tiles & <span>Sanitary Solutions</span>
        </h1>
        <p className="hero-desc" style={{ fontWeight: '600', letterSpacing: '0.04em', color: '#475569', fontSize: '1.05rem', margin: '0 auto 1.5rem' }}>
          Quality • Design • Durability
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onOpenCalc(null)}>
            <Calculator size={16} /> Tile & Budget Calculator
          </button>
          <button className="btn-secondary" onClick={onDownloadPdf}>
            <Download size={16} /> Download Catalogue (PDF)
          </button>
        </div>
      </section>

      {/* Category Filter Bar */}
      <div id="catalog" className="filter-container">
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogue Grid */}
      <section className="catalog-section">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Products in this Category</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Please select another category or add stock from the Admin Portal.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(prod => {
              const displayUnit = prod.unit || 'sq.ft';
              const displayImg = prod.image || 'images/regal-white-marble.png';

              return (
                <div key={prod.id} className="product-card">
                  <div className="card-image-wrap">
                    <img 
                      src={displayImg} 
                      alt={prod.name} 
                      onError={e => e.target.src = 'images/regal-white-marble.png'}
                    />
                    <span className="category-badge">
                      {prod.categoryLabel || prod.category}
                    </span>
                  </div>

                  <div className="card-content">
                    <h3 className="product-name">{prod.name}</h3>
                    <p className="product-desc">{prod.description}</p>

                    <div className="specs-list">
                      <div className="spec-item">
                        <span>Dimensions:</span> <strong>{prod.dimensions || 'Standard'}</strong>
                      </div>
                      <div className="spec-item">
                        <span>Finish:</span> <strong>{prod.finish || 'High Gloss'}</strong>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="price-tag">
                        <span className="currency">₹</span>
                        <span className="amount">{prod.price.toLocaleString('en-IN')}</span>
                        <span className="unit">/{displayUnit}</span>
                      </div>

                      {prod.category && prod.category.includes('tiles') && (
                        <button 
                          className="btn-sm-calc"
                          onClick={() => onOpenCalc(prod)}
                          title="Calculate Box & Sq.Ft Requirement"
                        >
                          <Calculator size={14} /> Calculate
                        </button>
                      )}

                      <button 
                        className="btn-sm-inquire"
                        onClick={() => onInquire(prod, `Inquiry for ${prod.name}`)}
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Showroom Location & Embedded Google Map */}
      <section style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              <MapPin size={16} /> VISIT OUR SHOWROOM
            </div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>M R Tiles & Sanitation</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Trinayani Ln, near Karan TVS Showroom, Kanakpur, Silchar, Assam - 788006
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
                <Phone size={16} style={{ color: 'var(--text-dark)' }} />
                <strong>Call / WhatsApp:</strong> +91 70993 14333
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
                <Mail size={16} style={{ color: 'var(--text-dark)' }} />
                <strong>Email:</strong> mrtilesandsanitation@gmail.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
                <Clock size={16} style={{ color: 'var(--text-dark)' }} />
                <strong>Opening Hours:</strong> Mon - Sat (9:30 AM to 8:00 PM)
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Why Choose M R Tiles?</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <li>✓ Direct factory pricing on vitrified floor & wall tiles</li>
                <li>✓ Premium ceramic sanitaryware & designer doors</li>
                <li>✓ On-time safe delivery across Cachar & Silchar</li>
              </ul>
            </div>
          </div>

          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', minHeight: '300px', position: 'relative' }}>
            <iframe 
              title="M R Tiles & Sanitation Showroom Location"
              src="https://maps.google.com/maps?q=M+R+TILES+AND+SANITATION,+Trinayani+Ln,+near+Karan+TVS+Showroom,+Kanakpur,+Silchar,+Assam+788006&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '320px' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
