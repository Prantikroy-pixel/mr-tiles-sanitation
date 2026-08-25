import React, { useState } from 'react';
import { Calculator, MapPin, Phone, Clock, Download, Mail, ArrowRight, Maximize2, X, ZoomIn, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

function ProductCard({ prod, onOpenCalc, onInquire, onPreview }) {
  const imagesList = (prod.images && Array.isArray(prod.images) && prod.images.length > 0)
    ? prod.images
    : [prod.image || 'images/regal-white-marble.png'];

  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImgIdx(prev => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImgIdx(prev => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const displayUnit = prod.unit || 'sq.ft';
  const displayImg = imagesList[activeImgIdx] || imagesList[0];

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
    <div className="product-card">
      <div 
        className="card-image-wrap" 
        style={{ cursor: 'pointer', position: 'relative' }} 
        onClick={() => onPreview(prod, activeImgIdx)}
        title="Click to view full photo gallery"
      >
        <img 
          className="card-img"
          src={displayImg} 
          alt={prod.name} 
          style={{ objectFit: 'contain', background: '#f8fafc', padding: '4px' }}
          onError={e => { e.target.src = 'images/regal-white-marble.png'; }}
        />

        <span className={`stock-badge ${stockClass}`}>
          {stockText}
        </span>
        
        <span className="category-tag">
          {prod.categoryLabel || prod.category}
        </span>

        {/* Multi-Photo Carousel Slider Controls */}
        {imagesList.length > 1 && (
          <>
            <button 
              type="button" 
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: '0.4rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}
              title="Previous photo"
            >
              <ChevronLeft size={16} />
            </button>

            <button 
              type="button" 
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: '0.4rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}
              title="Next photo"
            >
              <ChevronRight size={16} />
            </button>

            {/* Slider Dot Indicators */}
            <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.3rem', zIndex: 2 }}>
              {imagesList.map((_, idx) => (
                <span 
                  key={idx} 
                  onClick={(e) => { e.stopPropagation(); setActiveImgIdx(idx); }}
                  style={{ 
                    width: activeImgIdx === idx ? '16px' : '6px', 
                    height: '6px', 
                    borderRadius: '3px', 
                    background: activeImgIdx === idx ? '#2563eb' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }} 
                />
              ))}
            </div>

            {/* Photo Counter Badge */}
            <span style={{ position: 'absolute', top: '0.65rem', left: '0.65rem', background: 'rgba(15,23,42,0.85)', color: '#ffffff', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Layers size={10} /> {activeImgIdx + 1}/{imagesList.length} Photos
            </span>
          </>
        )}

        {/* Zoom Photo Overlay Icon */}
        <button 
          type="button" 
          style={{ 
            position: 'absolute', 
            bottom: '0.65rem', 
            right: '0.65rem', 
            background: 'rgba(15, 23, 42, 0.85)', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '20px', 
            padding: '0.25rem 0.65rem', 
            fontSize: '0.72rem', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem', 
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(2px)',
            zIndex: 2
          }}
          onClick={(e) => { e.stopPropagation(); onPreview(prod, activeImgIdx); }}
        >
          <ZoomIn size={13} /> View Full
        </button>
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
}

export default function CustomerStore({ 
  products = [], 
  categories = [], 
  activeCategory = 'all', 
  setActiveCategory, 
  onOpenCalc, 
  onInquire, 
  onDownloadPdf 
}) {
  const [previewProduct, setPreviewProduct] = useState(null);
  const [activeModalImgIdx, setActiveModalImgIdx] = useState(0);

  const openModalPreview = (prod, initialIdx = 0) => {
    setPreviewProduct(prod);
    setActiveModalImgIdx(initialIdx);
  };

  const previewImagesList = previewProduct ? (
    (previewProduct.images && Array.isArray(previewProduct.images) && previewProduct.images.length > 0)
      ? previewProduct.images
      : [previewProduct.image || 'images/regal-white-marble.png']
  ) : [];

  const prevModalImg = () => {
    setActiveModalImgIdx(prev => (prev === 0 ? previewImagesList.length - 1 : prev - 1));
  };

  const nextModalImg = () => {
    setActiveModalImgIdx(prev => (prev === previewImagesList.length - 1 ? 0 : prev + 1));
  };

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
            {products.map(prod => (
              <ProductCard 
                key={prod.id}
                prod={prod}
                onOpenCalc={onOpenCalc}
                onInquire={onInquire}
                onPreview={openModalPreview}
              />
            ))}
          </div>
        )}
      </section>

      {/* Full-Screen Multi-Photo Slider Lightbox Preview Modal */}
      {previewProduct && (
        <div className="modal-overlay" onClick={() => setPreviewProduct(null)} style={{ background: 'rgba(15, 23, 42, 0.88)', zIndex: 9999 }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '860px', 
              width: '94vw', 
              maxHeight: '94vh', 
              padding: '1.25rem', 
              background: '#ffffff', 
              borderRadius: '12px', 
              display: 'flex', 
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>{previewProduct.name}</h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {previewProduct.categoryLabel || previewProduct.category} • {previewProduct.dimensions || 'Standard Size'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewProduct(null)}
                style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* High-Res Full Image Slider Container */}
            <div style={{ position: 'relative', width: '100%', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', maxHeight: '55vh', marginBottom: '0.75rem' }}>
              <img 
                src={previewImagesList[activeModalImgIdx] || previewImagesList[0]} 
                alt={previewProduct.name} 
                style={{ maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain', borderRadius: '4px' }}
                onError={e => { e.target.src = 'images/regal-white-marble.png'; }}
              />

              {/* Slider Arrows inside Lightbox Modal */}
              {previewImagesList.length > 1 && (
                <>
                  <button 
                    type="button" 
                    onClick={prevModalImg}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                    title="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button 
                    type="button" 
                    onClick={nextModalImg}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                    title="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip Gallery Selector */}
            {previewImagesList.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                {previewImagesList.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`Thumbnail ${idx+1}`}
                    onClick={() => setActiveModalImgIdx(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: activeModalImgIdx === idx ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      opacity: activeModalImgIdx === idx ? 1 : 0.65,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                  ₹{previewProduct.price ? previewProduct.price.toLocaleString('en-IN') : 0} 
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>/{previewProduct.unit || 'sq.ft'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  Finish: <strong>{previewProduct.finish || 'Polished'}</strong> • Stock: <strong>{previewProduct.stock} {previewProduct.unit || 'sq.ft'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {previewProduct.category && previewProduct.category.includes('tiles') && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => { setPreviewProduct(null); onOpenCalc(previewProduct); }}
                    style={{ padding: '0.65rem 1rem' }}
                  >
                    <Calculator size={16} /> Calculate Requirement
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn-whatsapp"
                  onClick={() => { setPreviewProduct(null); onInquire(previewProduct, `Inquiry for ${previewProduct.name}`); }}
                  style={{ padding: '0.65rem 1.1rem' }}
                >
                  💬 Request Quote on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
