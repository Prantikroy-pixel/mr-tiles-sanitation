import React, { useState } from 'react';
import { Download, Plus, Trash2, Edit2, Check, X, AlertTriangle, Settings, Save, Tag } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

export default function AdminPortal({ 
  products, 
  categories, 
  adminToken, 
  onLogin, 
  onUpdateProduct, 
  onAddProduct, 
  onDeleteProduct, 
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Stock Edit States
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editUnit, setEditUnit] = useState('sq.ft');

  // Add Product Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(categories[1]?.id || 'floor-tiles');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newUnit, setNewUnit] = useState('sq.ft');
  const [newDimensions, setNewDimensions] = useState('');
  const [newFinish, setNewFinish] = useState('');
  const [newImage, setNewImage] = useState('images/regal-white-marble.png');
  const [newDescription, setNewDescription] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Category Manager States
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showManageCatsModal, setShowManageCatsModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');

  // Handle Photo Upload with HTML5 Canvas Compression
  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImageFile(file, 800, 800, 0.75);
      setNewImage(compressedBase64);
    } catch (err) {
      alert('Failed to process image file. Please try a different photo.');
    } finally {
      setIsCompressing(false);
    }
  };

  const exportLeadsCsv = () => {
    const csvHeader = 'Item Name,Category,Price (INR),Stock Quantity,Unit,Status\n';
    const csvRows = products.map(p => {
      const status = p.stock <= 0 ? 'Out of Stock' : (p.stock <= (p.minStock || 10) ? 'Low Stock' : 'In Stock');
      return `"${p.name}","${p.categoryLabel || p.category}",${p.price},${p.stock},"${p.unit || 'sq.ft'}","${status}"`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MR_Tiles_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    if (username === 'Admin11' && password === 'Admin1234') {
      onLogin('mr_admin_token_' + Date.now());
    } else {
      setLoginError('Invalid Admin Username or Password!');
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(p.price);
    setEditStock(p.stock);
    setEditUnit(p.unit || 'sq.ft');
  };

  const saveEdit = (id) => {
    onUpdateProduct(id, {
      name: editName,
      price: Number(editPrice),
      stock: Number(editStock),
      unit: editUnit || 'sq.ft'
    });
    setEditingId(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) {
      alert('Please fill in product name, price, and stock!');
      return;
    }

    const matchedCat = categories.find(c => c.id === newCategory);

    onAddProduct({
      name: newName,
      category: newCategory,
      categoryLabel: matchedCat ? matchedCat.label : newCategory,
      price: Number(newPrice),
      unit: newUnit || 'sq.ft',
      stock: Number(newStock),
      dimensions: newDimensions || 'Standard',
      finish: newFinish || 'High Gloss',
      image: newImage || 'images/regal-white-marble.png',
      description: newDescription || 'Premium quality product from M R Tiles & Sanitation.'
    });

    setShowAddModal(false);
    setNewName('');
    setNewPrice('');
    setNewStock('');
    setNewDescription('');
    setNewImage('images/regal-white-marble.png');
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const catId = newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '-');
    onAddCategory({ id: catId, label: newCatLabel });
    setShowAddCatModal(false);
    setNewCatLabel('');
  };

  const handleSaveCatRename = (catId) => {
    if (!editingCatLabel.trim()) return;
    if (onUpdateCategory) {
      onUpdateCategory(catId, editingCatLabel);
    }
    setEditingCatId(null);
    setEditingCatLabel('');
  };

  // Smartphone Responsive Admin Login View
  if (!adminToken) {
    return (
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '100%', maxWidth: '380px', background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '1rem', textAlign: 'center', fontWeight: '700' }}>Admin Portal Login</h2>
          
          {loginError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>Username</label>
              <input 
                type="text" 
                required 
                placeholder="Enter admin username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '1rem', WebkitAppearance: 'none' }} 
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '0.3rem', fontWeight: '600' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="Enter admin password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '1rem', WebkitAppearance: 'none' }} 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}>
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate Low Stock Safety Items
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10));
  const outOfStockItems = products.filter(p => p.stock <= 0);

  return (
    <div className="admin-container" style={{ padding: '1rem' }}>
      <div className="admin-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Stock & Price Control Center</h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Manage inventory, delete items, edit category names, and export leads</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', marginTop: '0.75rem' }}>
          <button className="btn-secondary" onClick={exportLeadsCsv} style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn-secondary" onClick={() => setShowManageCatsModal(true)} style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}>
            <Settings size={14} /> Edit Category Names
          </button>
          <button className="btn-secondary" onClick={() => setShowAddCatModal(true)} style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}>
            <Plus size={14} /> Add Category
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem', flex: 1, justifyContent: 'center' }}>
            <Plus size={16} /> Add Tile / Stock
          </button>
        </div>
      </div>

      {/* Low Stock Safety Warning Banner */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertTriangle size={18} style={{ color: '#b45309', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
            <strong>Safety Warning:</strong> {outOfStockItems.length} out of stock, {lowStockItems.length} low stock (&lt; 100 sq.ft).
          </div>
        </div>
      )}

      {/* Main Screen Category Rename Toolbar */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Tag size={16} style={{ color: '#2563eb' }} />
          <h3 style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '700', margin: 0 }}>Category Names Control (Click Edit to Rename Any Category)</h3>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {categories.filter(c => c.id !== 'all').map(c => {
            const isEditingThis = editingCatId === c.id;

            return (
              <div key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}>
                {isEditingThis ? (
                  <>
                    <input 
                      type="text" 
                      value={editingCatLabel} 
                      onChange={e => setEditingCatLabel(e.target.value)} 
                      style={{ padding: '0.2rem 0.4rem', border: '1px solid #2563eb', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', width: '140px', color: '#0f172a' }}
                    />
                    <button className="btn-icon" style={{ background: '#16a34a', color: '#fff', width: '24px', height: '24px', padding: 0 }} onClick={() => handleSaveCatRename(c.id)} title="Save Category Name">
                      <Save size={12} />
                    </button>
                    <button className="btn-icon" style={{ width: '24px', height: '24px', padding: 0 }} onClick={() => setEditingCatId(null)}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{c.label}</span>
                    <button 
                      className="btn-icon" 
                      style={{ width: '24px', height: '24px', padding: 0, border: 'none', background: '#f1f5f9', color: '#2563eb' }} 
                      onClick={() => { setEditingCatId(c.id); setEditingCatLabel(c.label); }} 
                      title={`Edit name for ${c.label}`}
                    >
                      <Edit2 size={12} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Touch Responsive Table */}
      <div className="admin-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: '550px' }}>
          <thead>
            <tr>
              <th>Item / Image</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const isEditing = editingId === p.id;
              const displayUnit = p.unit || 'sq.ft';

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img 
                        src={p.image || 'images/regal-white-marble.png'} 
                        alt={p.name} 
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }} 
                      />
                      <div>
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{ padding: '0.25rem', border: '1px solid #2563eb', borderRadius: '4px', color: '#0f172a', fontWeight: 'bold', width: '120px' }}
                          />
                        ) : (
                          <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '0.85rem' }}>{p.name}</div>
                        )}
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.dimensions}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ fontSize: '0.8rem' }}>{p.categoryLabel || p.category}</td>

                  <td>
                    {isEditing ? (
                      <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ width: '65px', padding: '0.2rem' }} />
                    ) : (
                      `₹${p.price.toLocaleString('en-IN')}/${displayUnit}`
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} style={{ width: '65px', padding: '0.2rem' }} />
                    ) : (
                      `${p.stock} ${displayUnit}`
                    )}
                  </td>

                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button className="btn-icon" style={{ background: '#16a34a', color: '#fff' }} onClick={() => saveEdit(p.id)} title="Save">
                            <Check size={16} />
                          </button>
                          <button className="btn-icon" onClick={() => setEditingId(null)} title="Cancel">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon" onClick={() => startEdit(p)} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon delete" onClick={() => onDeleteProduct(p.id)} title="Delete Item">
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

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>

            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.85rem' }}>Introduce New Product / Stock</h3>

            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Product Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Italian Onyx Vitrified"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Category Section *</label>
                <select 
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                >
                  {categories.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>Upload Product Photo from Device *</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', background: '#f8fafc' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageFileUpload}
                    id="device-photo-input"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="device-photo-input" 
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 'bold', fontSize: '0.85rem' }}
                  >
                    📸 Select Photo from Device
                  </label>
                  {newImage && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <img src={newImage} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 'bold' }}>✓ Photo Loaded</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Price (₹)</label>
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
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Unit</label>
                  <select 
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                  >
                    <option value="sq.ft">sq.ft</option>
                    <option value="piece">piece</option>
                    <option value="box">box</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Stock</label>
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

              <button type="submit" disabled={isCompressing} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
                <Plus size={16} /> {isCompressing ? 'Processing Photo...' : 'Add Product to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Category Modal */}
      {showAddCatModal && (
        <div className="modal-overlay" onClick={() => setShowAddCatModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', width: '92%' }}>
            <button className="modal-close" onClick={() => setShowAddCatModal(false)}>✕</button>

            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.85rem' }}>Add New Section / Category</h3>

            <form onSubmit={handleAddCategorySubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>Category Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Granite & Marble"
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.9rem' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
                <Plus size={16} /> Add Category Section
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Customize & Rename Existing Categories Modal */}
      {showManageCatsModal && (
        <div className="modal-overlay" onClick={() => setShowManageCatsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', width: '92%' }}>
            <button className="modal-close" onClick={() => setShowManageCatsModal(false)}>✕</button>

            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.3rem' }}>Edit Category Names</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Rename any category section (e.g. change "Floor Tiles" to "Italian Floor Tiles")</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {categories.filter(c => c.id !== 'all').map(c => {
                const isEditingThis = editingCatId === c.id;

                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                    {isEditingThis ? (
                      <input 
                        type="text" 
                        value={editingCatLabel} 
                        onChange={e => setEditingCatLabel(e.target.value)} 
                        style={{ padding: '0.3rem 0.5rem', border: '1px solid #2563eb', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', width: '220px', color: '#0f172a' }}
                      />
                    ) : (
                      <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#0f172a' }}>{c.label}</span>
                    )}

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {isEditingThis ? (
                        <>
                          <button className="btn-icon" style={{ background: '#16a34a', color: '#fff' }} onClick={() => handleSaveCatRename(c.id)}>
                            <Save size={14} />
                          </button>
                          <button className="btn-icon" onClick={() => setEditingCatId(null)}>
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon" onClick={() => { setEditingCatId(c.id); setEditingCatLabel(c.label); }} title="Rename Category">
                            <Edit2 size={14} />
                          </button>
                          {onDeleteCategory && (
                            <button className="btn-icon delete" onClick={() => onDeleteCategory(c.id)} title="Delete Category">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
