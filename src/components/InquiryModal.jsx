import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function InquiryModal({ product, initialNote, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(initialNote || '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate formatted WhatsApp message link
  const getWhatsAppLink = () => {
    const storePhone = '916001399842';
    const prodName = product ? product.name : 'General Inquiry';
    const prodPrice = product ? ` (₹${product.price}/${product.unit})` : '';

    let text = `Hello M R Tiles & Sanitation! 👋\n\n` +
      `*Name*: ${name || 'Customer'}\n` +
      `*Phone*: ${phone || 'N/A'}\n` +
      `*Product Interest*: ${prodName}${prodPrice}\n`;

    if (message) {
      text += `*Inquiry Details*: ${message}\n`;
    }

    text += `\nPlease provide best trade discounts & availability!`;

    return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          productInterest: product ? product.name : 'General Inquiry'
        })
      });
    } catch (err) {}

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <CheckCircle2 size={52} style={{ color: '#34d399', margin: '0 auto 0.85rem' }} />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.4rem' }}>Inquiry Prepared!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Click below to send your formatted quote request directly to M R Tiles & Sanitation sales desk on WhatsApp:
            </p>

            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-whatsapp"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.95rem' }}
            >
              <MessageSquare size={18} /> Send Quote Request on WhatsApp
            </a>

            <button className="btn-secondary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.25rem' }}>Request Quote & Best Price</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
              {product ? `Inquiring about: ${product.name} (₹${product.price}/${product.unit})` : 'Get trade price quote from Silchar showroom team'}
            </p>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Your Full Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Rahul Roy"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone / WhatsApp Number *</label>
              <input 
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email Address (Optional)</label>
              <input 
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Project Details / Room Calculations</label>
              <textarea 
                rows="3"
                placeholder="Room size, delivery date, discount request..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#fff', fontFamily: 'inherit', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <MessageSquare size={16} /> Send via WhatsApp Direct
              </a>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Inquiry Form'} <Send size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
