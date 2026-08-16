import React, { useState } from 'react';
import { Calculator, MapPin, Phone, Clock, Download } from 'lucide-react';

export default function CustomerStore({ products, activeCategory, setActiveCategory, onOpenCalc, onInquire, onDownloadPdf }) {
  const [selectedColors, setSelectedColors] = useState({});

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'floor-tiles', label: 'Floor Tiles' },
    { id: 'wall-tiles', label: 'Wall Tiles' },
    { id: 'bathroom-fittings', label: 'Bathroom Fittings' },
    { id: 'kitchen-solutions', label: 'Kitchen Solutions' }
  ];

  const handleColorSelect = (productId, colorName) => {
    setSelectedColors(prev => ({ ...prev, [productId]: colorName }));
  };

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
        <p className="hero-desc">
          Quality • Design • Durability. Discover high-gloss vitrified floor tiles, ceramic wall designs, and smart sanitaryware for home and commercial spaces.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onOpenCalc(null)}>
            <Calculator size={16} /> Tile & Budget Calculator
          </button>
          <button className="btn-secondary" onClick={onDownloadPdf}>
            <Download size={16} /> Download Catalog (PDF)
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

      {/* Catalog Grid */}
      <section className="catalog-section">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem' }}>No products found matching your filter.</p>
            <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setActiveCategory('all')}>
              Reset Category Filter
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(prod => {
              const isLowStock = prod.stock > 0 && prod.stock <= (prod.minStock || 10);
              const isOutOfStock = prod.stock <= 0;
              const stockStatusClass = isOutOfStock ? 'out-of-stock' : (isLowStock ? 'low-stock' : 'in-stock');
              const stockLabel = isOutOfStock ? 'Out of Stock' : (isLowStock ? `Low Stock (${prod.stock} left)` : `In Stock (${prod.stock} ${prod.unit})`);
              const activeColorName = selectedColors[prod.id] || (prod.colors && prod.colors[0] ? prod.colors[0].name : '');

              return (
                <div key={prod.id} className="product-card">
                  <div className="card-image-wrap">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="card-img" 
                      onError={(e) => { e.target.src = 'images/regal-white-marble.png'; }} 
                    />
                    <div className={`stock-badge ${stockStatusClass}`}>
                      {stockLabel}
                    </div>
                    <div className="category-tag">
                      {prod.categoryLabel || prod.category}
                    </div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{prod.name}</h3>
                    <p className="card-specs">
                      {prod.dimensions} • {prod.finish}
                    </p>

                    {prod.colors && prod.colors.length > 0 && (
                      <div className="color-selector">
                        {prod.colors.map(c => (
                          <div 
                            key={c.name}
                            className={`color-chip ${activeColorName === c.name ? 'active' : ''}`}
                            style={{ backgroundColor: c.hex }}
                            onClick={() => handleColorSelect(prod.id, c.name)}
                            title={c.name}
                          />
                        ))}
                        <span className="color-label">{activeColorName}</span>
                      </div>
                    )}

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem', flex: 1 }}>
                      {prod.description}
                    </p>

                    <div className="card-price-row">
                      <div>
                        <span className="price-main">₹{prod.price.toLocaleString('en-IN')}</span>
                        <span className="price-unit"> / {prod.unit}</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="btn-sm-calc"
                        onClick={() => onOpenCalc(prod)}
                      >
                        <Calculator size={14} /> Calculate
                      </button>
                      <button 
                        className="btn-sm-inquire"
                        onClick={() => onInquire(prod, activeColorName ? `Selected Color: ${activeColorName}` : '')}
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

      {/* Showroom & Business Details */}
      <section style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.4rem' }}>
              <MapPin size={16} /> VISIT OUR SHOWROOM
            </div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>M R Tiles & Sanitation</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
              Trinayani Ln, near Karan TVS Showroom, Kanakpur, Silchar, Assam - 788006
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
                <Phone size={16} style={{ color: 'var(--text-dark)' }} />
                <strong>Call / WhatsApp:</strong> +91 60013 99842
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
                <Clock size={16} style={{ color: 'var(--text-dark)' }} />
                <strong>Opening Hours:</strong> Mon - Sat (9:30 AM to 8:00 PM)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.85rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)' }}>Why Choose M R Tiles?</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span> Direct factory pricing on vitrified & porcelain tiles
              </li>
              <li style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span> Live tile finish and color choice selection
              </li>
              <li style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span> Safe transport & on-time delivery across Cachar & Silchar
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
