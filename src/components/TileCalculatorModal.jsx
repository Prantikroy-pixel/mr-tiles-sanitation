import React, { useState } from 'react';
import { X, Calculator, ArrowRight } from 'lucide-react';

export default function TileCalculatorModal({ product, onClose, onInquire }) {
  const [length, setLength] = useState(12);
  const [width, setWidth] = useState(10);
  const [wastagePercent, setWastagePercent] = useState(10);

  const pricePerSqFt = product && product.unit === 'sq.ft' ? product.price : 65;
  const netArea = Number(length || 0) * Number(width || 0);
  const wastageArea = (netArea * Number(wastagePercent)) / 100;
  const totalArea = Math.ceil(netArea + wastageArea);
  
  const sqFtPerBox = 16;
  const boxesNeeded = Math.ceil(totalArea / sqFtPerBox);
  const estimatedCost = totalArea * pricePerSqFt;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: '#f1f5f9', color: 'var(--text-dark)', padding: '0.6rem', borderRadius: '8px' }}>
            <Calculator size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>Tile & Budget Calculator</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {product ? `Calculating for: ${product.name} (₹${product.price}/sq.ft)` : 'Estimate room coverage & total cost'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Room Length (Feet)</label>
            <input 
              type="number"
              min="1"
              value={length}
              onChange={e => setLength(e.target.value)}
              style={{ width: '100%', background: '#ffffff', border: '1px solid var(--border-dark)', borderRadius: '6px', padding: '0.55rem 0.75rem', color: 'var(--text-dark)', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Room Width (Feet)</label>
            <input 
              type="number"
              min="1"
              value={width}
              onChange={e => setWidth(e.target.value)}
              style={{ width: '100%', background: '#ffffff', border: '1px solid var(--border-dark)', borderRadius: '6px', padding: '0.55rem 0.75rem', color: 'var(--text-dark)', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Include Fitting & Cutting Wastage</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[5, 10, 15].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setWastagePercent(pct)}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  background: wastagePercent === pct ? 'var(--text-dark)' : '#ffffff',
                  color: wastagePercent === pct ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-dark)'
                }}
              >
                {pct}% Margin
              </button>
            ))}
          </div>
        </div>

        {/* Results Card */}
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1.1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Room Area</span>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-dark)' }}>{netArea} sq.ft</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Area (w/ {wastagePercent}%)</span>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent-blue)' }}>{totalArea} sq.ft</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Boxes Needed (~16 sq.ft/box)</span>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-dark)' }}>{boxesNeeded} Boxes</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a' }}>₹{estimatedCost.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
            💡 Tip: Keep 1 extra box in reserve for future tile repairs.
          </div>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => {
            onClose();
            if (onInquire) onInquire(product, `Calculated ${totalArea} sq.ft (${boxesNeeded} boxes) for ${length}x${width} ft room. Est. Cost: ₹${estimatedCost}`);
          }}
        >
          Book Order Inquiry with Calculation <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
