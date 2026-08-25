import React from 'react';
import { Calculator, MapPin, Phone, Clock, Download, Mail, ArrowRight } from 'lucide-react';

export default function CustomerStore({ 
  products = [], 
  categories = [], 
  activeCategory = 'all', 
  setActiveCategory, 
  onOpenCalc, 
  onInquire, 
  onDownloadPdf 
}) {
  return (
    <main>
      {/* Premium Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          M R TILES AND SANITATION • SILCHAR
        </div>
        <h1 className="hero-heading">
          Premium Tiles & <span>Sanitary Solutions</span>
        </h1>
        <p className="hero-desc">
          Explore our exclusive collection of high-gloss vitrified floor tiles, ceramic wall tiles, designer sanitaryware, and premium doors in Silchar.
        </p>

        <div className="hero-actions">
          <button type="button" className="btn-primary" onClick={() => onOpenCalc(null)}>
            <Calculator size={16} /> Tile & Budget Calculator
          </button>
          <button type="button" className="btn-secondary" onClick={onDownloadPdf}>
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
              type="button"
              className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalogue Grid */}
      <section className="catalog-section">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f172a', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Products in this Category</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Please select another category or add stock from the Admin Portal.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(prod => {
              const displayUnit = prod.unit || 'sq.ft';
              const displayImg = prod.image || 'images/regal-white-marble.png';
              
              let stockClass = 'in-stock';
              let stockText = 'In Stock';
              if (prod.stock === 0) {
                stockClass = 'out-of-stock';
                stockText = 'Out of Stock';
              } else if (prod.stock < (prod.minStock || 10)) {
                stockClass = 'low-stock';
                stockText = 'Low Stock';
              }

              return (
                <div key={prod.id} className="product-card">
                  <div className="card-image-wrap">
                    <img 
                      className="card-img"
                      src={displayImg} 
                      alt={prod.name} 
                      onError={e => { e.target.src = 'images/regal-white-marble.png'; }}
                    />
                    <span className={`stock-badge ${stockClass}`}>
                      {stockText}
                    </span>
                    <span className="category-tag">
                      {prod.categoryLabel || prod.category}
                    </span>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{prod.name}</h3>
                    <p className="card-specs">
                      {prod.dimensions || 'Standard'} • {prod.finish || 'Polished'}
                    </p>

                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {prod.description || 'Premium quality product from M R Tiles & Sanitation.'}
                    </p>

                    <div className="card-price-row">
                      <div className="price-main">
                        ₹{prod.price ? prod.price.toLocaleString('en-IN') : 0} 
                        <span className="price-unit">/{displayUnit}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {prod.stock} {displayUnit} available
                      </div>
                    </div>

                    <div className="card-actions">
                      {prod.category && prod.category.includes('tiles') ? (
                        <button 
                          type="button"
                          className="btn-sm-calc"
                          onClick={() => onOpenCalc(prod)}
                          title="Calculate Box & Sq.Ft Requirement"
                        >
                          <Calculator size={14} /> Calculate
                        </button>
                      ) : (
                        <div />
                      )}

                      <button 
                        type="button"
                        className="btn-sm-inquire"
                        onClick={() => onInquire(prod, `Inquiry for ${prod.name}`)}
                      >
                        Request Quote <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Showroom Location & Contact Details Banner */}
      <section style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              <MapPin size={16} /> VISIT OUR SHOWROOM
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '0.75rem' }}>M R Tiles & Sanitation</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Trinayani Ln, near Karan TVS Showroom, Kanakpur, Silchar, Assam - 788006
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <Phone size={16} style={{ color: '#0f172a' }} />
                <strong>Call / WhatsApp:</strong> +91 70993 13433
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <Mail size={16} style={{ color: '#0f172a' }} />
                <strong>Email:</strong> mrtilesandsanitation@gmail.com
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                <Clock size={16} style={{ color: '#0f172a' }} />
                <strong>Opening Hours:</strong> Mon - Sat (9:30 AM to 8:00 PM)
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.3rem' }}>Need Direct Showroom Assistance?</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                Contact our sales desk directly via WhatsApp for custom bulk pricing and instant stock verification.
              </p>
              <a 
                href="https://wa.me/917099313433?text=Hello%20M%20R%20Tiles%20%26%20Sanitation%2C%20I%20would%20like%20to%20inquire%20about%20products." 
                target="_blank" 
                rel="noreferrer"
                className="btn-whatsapp"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
              >
                💬 Chat on WhatsApp (+91 70993 13433)
              </a>
            </div>
          </div>

          <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', minHeight: '300px' }}>
            <iframe 
              title="M R Tiles & Sanitation Location Map"
              src="https://maps.google.com/maps?q=Trinayani+Ln+near+Karan+TVS+Showroom+Kanakpur+Silchar+Assam+788006&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '300px' }} 
              allowFullScreen="" 
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
