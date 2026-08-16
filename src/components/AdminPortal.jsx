import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, ShieldCheck } from 'lucide-react';

export default function AdminPortal({ 
  products, 
  adminToken, 
  onLogin, 
  onUpdateProduct, 
  onAddProduct, 
  onDeleteProduct 
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Edit Product State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('floor-tiles');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('sq.ft');
  const [newStock, setNewStock] = useState('');
  const [newDimensions, setNewDimensions] = useState('2x4 ft (600x1200 mm)');
  const [newFinish, setNewFinish] = useState('High Gloss Polished');
  const [newImage, setNewImage] = useState('images/regal-white-marble.png');
  const [newDescription, setNewDescription] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'admin123') {
      onLogin('mr_admin_token_' + Date.now());
    } else {
      setLoginError('Invalid credentials! Default: admin / admin123');
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(p.price);
    setEditStock(p.stock);
  };

  const saveEdit = (id) => {
    onUpdateProduct(id, {
      name: editName,
      price: Number(editPrice),
      stock: Number(editStock)
    });
    setEditingId(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) {
      alert('Please fill in product name, price, and stock!');
      return;
    }

    onAddProduct({
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      unit: newUnit,
      stock: Number(newStock),
      dimensions: newDimensions,
      finish: newFinish,
      image: newImage || 'images/regal-white-marble.png',
      description: newDescription || 'Premium high quality product from M R Tiles & Sanitation.',
      colors: [
        { name: "Standard White", hex: "#ffffff" },
        { name: "Grey Finish", hex: "#cbd5e1" }
      ]
    });

    setShowAddModal(false);
    setNewName('');
    setNewPrice('');
    setNewStock('');
    setNewDescription('');
  };

  if (!adminToken) {
    return (
      <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '1.5rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.5rem', textAlign: 'center' }}>Admin Portal Login</h2>
        
        {loginError && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>Username</label>
            <input type="text" required placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>Password</label>
            <input type="password" required placeholder="admin123" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign In to Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Stock & Price Control Center</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage product names, inventory stock, trade pricing, and new stock introductions</p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add New Tile / Stock
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item / Image</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock Level</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const isEditing = editingId === p.id;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={p.image} alt={p.name} className="table-img" onError={e => e.target.src = 'images/regal-white-marble.png'} />
                      <div>
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{ padding: '0.25rem', border: '1px solid #2563eb', borderRadius: '4px', color: '#0f172a', fontWeight: 'bold' }}
                          />
                        ) : (
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{p.name}</div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.dimensions}</div>
                      </div>
                    </div>
                  </td>

                  <td>{p.categoryLabel || p.category}</td>

                  <td>
                    {isEditing ? (
                      <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width: '75px', padding: '0.25rem', border: '1px solid #2563eb', borderRadius: '4px' }} />
                    ) : (
                      `₹${p.price.toLocaleString('en-IN')}/${p.unit}`
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} style={{ width: '75px', padding: '0.25rem', border: '1px solid #2563eb', borderRadius: '4px' }} />
                    ) : (
                      `${p.stock} ${p.unit}`
                    )}
                  </td>

                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button className="btn-icon" style={{ background: '#16a34a', color: '#fff' }} onClick={() => saveEdit(p.id)} title="Save Changes">
                            <Check size={16} />
                          </button>
                          <button className="btn-icon" onClick={() => setEditingId(null)} title="Cancel">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon" onClick={() => startEdit(p)} title="Edit Name, Price & Stock">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon delete" onClick={() => onDeleteProduct(p.id)} title="Delete Stock">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add New Product / Stock Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>

            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem' }}>Introduce New Product / Stock</h3>

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Product Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Italian Onyx Vitrified"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Category *</label>
                  <select 
                    value={newCategory}
                    onChange={e => {
                      setNewCategory(e.target.value);
                      if (e.target.value.includes('tiles') || e.target.value.includes('kitchen')) setNewUnit('sq.ft');
                      else setNewUnit('piece');
                    }}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    <option value="floor-tiles">Floor Tiles</option>
                    <option value="wall-tiles">Wall Tiles</option>
                    <option value="bathroom-fittings">Bathroom Fittings</option>
                    <option value="kitchen-solutions">Kitchen Solutions</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Price (₹) *</label>
                  <input 
                    type="number"
                    required
                    placeholder="65"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Unit *</label>
                  <select 
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    <option value="sq.ft">per sq.ft</option>
                    <option value="piece">per piece</option>
                    <option value="box">per box</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Initial Stock *</label>
                  <input 
                    type="number"
                    required
                    placeholder="1000"
                    value={newStock}
                    onChange={e => setNewStock(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Dimensions</label>
                  <input 
                    type="text"
                    placeholder="2x4 ft (600x1200 mm)"
                    value={newDimensions}
                    onChange={e => setNewDimensions(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Finish & Polish</label>
                  <input 
                    type="text"
                    placeholder="High Gloss Polished"
                    value={newFinish}
                    onChange={e => setNewFinish(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Photo / Image URL</label>
                <input 
                  type="text"
                  placeholder="images/regal-white-marble.png"
                  value={newImage}
                  onChange={e => setNewImage(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Description</label>
                <textarea 
                  rows="2"
                  placeholder="High quality vitrified floor tile with anti-stain glaze..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit', color: '#0f172a' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={16} /> Add Product to Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
