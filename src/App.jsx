import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import CustomerStore from './components/CustomerStore.jsx';
import AdminPortal from './components/AdminPortal.jsx';
import TileCalculatorModal from './components/TileCalculatorModal.jsx';
import InquiryModal from './components/InquiryModal.jsx';
import { DEFAULT_PRODUCTS } from './data/defaultProducts.js';

export default function App() {
  const [currentView, setCurrentView] = useState('store');
  const isEditingRef = useRef(false);
  
  // Product State Loader (Local SSOT + Fallback)
  const [allProducts, setAllProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('mr_tiles_permanent_catalog_v12');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PRODUCTS;
  });

  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  // Category State Loader (Local SSOT + Fallback)
  const [categories, setCategories] = useState(() => {
    try {
      const savedCats = localStorage.getItem('mr_tiles_custom_categories_v12');
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 'all', label: 'All Products' },
      { id: 'floor-tiles', label: 'Floor Tiles' },
      { id: 'wall-tiles', label: 'Wall Tiles' },
      { id: 'sanitary', label: 'Sanitary' },
      { id: 'doors', label: 'Doors' }
    ];
  });

  const [activeCategory, setActiveCategory] = useState('all');

  // Admin Token State
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem('mr_admin_token') || '';
    } catch (e) {
      return '';
    }
  });

  // Modal States
  const [calcProduct, setCalcProduct] = useState(null);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [inquireProduct, setInquireProduct] = useState(null);
  const [inquireNote, setInquireNote] = useState('');
  const [showInquireModal, setShowInquireModal] = useState(false);

  // Master Category Persistence Helper (Instant Local + Immediate Cloud Sync)
  const saveCategoriesList = async (updatedCats) => {
    setCategories(updatedCats);
    try {
      localStorage.setItem('mr_tiles_custom_categories_v12', JSON.stringify(updatedCats));
    } catch (e) {}

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCats })
      });
    } catch (err) {}
  };

  // Master Product Persistence Helper (Instant Local + Immediate Cloud Sync)
  const saveProductsList = async (updatedList) => {
    const sanitizedList = updatedList.map(p => ({
      ...p,
      unit: p.unit || 'sq.ft',
      image: p.image || 'images/regal-white-marble.png'
    }));

    setAllProducts(sanitizedList);

    try {
      localStorage.setItem('mr_tiles_permanent_catalog_v12', JSON.stringify(sanitizedList));
    } catch (e) {}

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products: sanitizedList })
      });
    } catch (err) {}
  };

  // Real-Time Master Product Fetch (Exact Server SSOT for Cross-Device Deletions & Edits)
  const fetchLiveCloudProducts = async () => {
    if (isEditingRef.current) return; // Pause fetch while admin is actively typing in inputs
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await res.json();
          const cloudProdList = result.products || (Array.isArray(result) ? result : null);

          if (cloudProdList && Array.isArray(cloudProdList)) {
            const sanitizedList = cloudProdList.map(p => ({
              ...p,
              unit: p.unit || 'sq.ft',
              image: p.image || 'images/regal-white-marble.png'
            }));

            setAllProducts(sanitizedList);
            try {
              localStorage.setItem('mr_tiles_permanent_catalog_v12', JSON.stringify(sanitizedList));
            } catch (e) {}
          }
        }
      }
    } catch (err) {}
  };

  // Real-Time Master Category Fetch (Exact Server SSOT for Cross-Device Deletions & Edits)
  const fetchLiveCategories = async () => {
    if (isEditingRef.current) return; // Pause fetch while admin is actively typing
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await res.json();
          if (result.categories && Array.isArray(result.categories) && result.categories.length > 0) {
            setCategories(result.categories);
            try {
              localStorage.setItem('mr_tiles_custom_categories_v12', JSON.stringify(result.categories));
            } catch (e) {}
          }
        }
      }
    } catch (err) {}
  };

  // Cross-Device Real-Time Synchronization Interval (4-Second Heartbeat)
  useEffect(() => {
    fetchLiveCloudProducts();
    fetchLiveCategories();
    const interval = setInterval(() => {
      fetchLiveCloudProducts();
      fetchLiveCategories();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filter products based on active category
  useEffect(() => {
    let result = Array.isArray(allProducts) ? [...allProducts] : [];

    if (activeCategory && activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    setFilteredProducts(result);
  }, [allProducts, activeCategory]);

  // Handle Adding New Category Section from Admin
  const handleAddCategory = (newCat) => {
    if (!newCat || !newCat.label) return;
    let catId = newCat.id || newCat.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (!catId) catId = 'cat-' + Date.now();
    if (categories.some(c => c.id === catId)) {
      catId = `${catId}-${Date.now().toString().slice(-4)}`;
    }
    const finalCat = { id: catId, label: newCat.label.trim() };
    const updatedCats = [...categories, finalCat];
    saveCategoriesList(updatedCats);
    setActiveCategory(finalCat.id);
  };

  // Handle Category Rename Customization
  const handleUpdateCategory = async (catId, newLabel) => {
    const updatedCats = categories.map(c => c.id === catId ? { ...c, label: newLabel } : c);
    await saveCategoriesList(updatedCats);

    // Update matching products category labels
    const updatedProds = allProducts.map(p => p.category === catId ? { ...p, categoryLabel: newLabel } : p);
    await saveProductsList(updatedProds);
  };

  // Handle Category Deletion Across Devices
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category section? Products under this category will remain accessible under All Products.')) return;
    
    const updatedCats = categories.filter(c => c.id !== catId);
    if (activeCategory === catId) setActiveCategory('all');
    await saveCategoriesList(updatedCats);

    // Clean products pointing to deleted category
    const updatedProds = allProducts.map(p => p.category === catId ? { ...p, category: 'all', categoryLabel: 'All Products' } : p);
    await saveProductsList(updatedProds);

    try {
      await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // Download PDF Catalog Generator
  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF catalog!');
      return;
    }

    const rows = allProducts.map(p => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: bold;">${p.name}</td>
        <td style="padding: 10px;">${p.categoryLabel || p.category}</td>
        <td style="padding: 10px;">${p.dimensions}</td>
        <td style="padding: 10px; font-weight: bold; color: #0f172a;">₹${p.price}/${p.unit || 'sq.ft'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>M R Tiles & Sanitation - Product Catalog PDF</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 20px; color: #1e293b; }
            h1 { font-size: 22px; color: #0f172a; margin-bottom: 4px; }
            p { font-size: 13px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
            th { background: #f8fafc; padding: 10px; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 11px; }
            .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>M R TILES AND SANITATION SILCHAR</h1>
          <p>Trinayani Ln, near Karan TVS Showroom, Kanakpur, Silchar, Assam - 788006 • Phone/WhatsApp: +91 70993 13433 • Email: mrtilesandsanitation@gmail.com</p>
          <h3>Official Product & Price Catalogue</h3>
          <table>
            <thead>
              <tr>
                <th>Product Item</th>
                <th>Category Section</th>
                <th>Dimensions</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">
            © ${new Date().getFullYear()} BLUE LEAF TECH. All rights reserved.
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Admin Login Handler (Credentials: Admin11 / Admin1234)
  const handleAdminLogin = (token) => {
    setAdminToken(token);
    try {
      localStorage.setItem('mr_admin_token', token);
    } catch (e) {}
    setCurrentView('admin');
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setAdminToken('');
    try {
      localStorage.removeItem('mr_admin_token');
    } catch (e) {}
    setCurrentView('store');
  };

  // Admin Update Product Across Devices
  const handleUpdateProduct = async (id, updatePayload) => {
    const updatedList = allProducts.map(p => p.id === id ? { 
      ...p, 
      ...updatePayload, 
      unit: updatePayload.unit || p.unit || 'sq.ft',
      image: updatePayload.image || p.image || 'images/regal-white-marble.png'
    } : p);
    await saveProductsList(updatedList);
  };

  // Admin Add Product Across Devices
  const handleAddProduct = async (productData) => {
    const newProd = {
      id: 'prod_' + Date.now(),
      unit: productData.unit || 'sq.ft',
      image: productData.image || 'images/regal-white-marble.png',
      ...productData,
      minStock: (productData.category && productData.category.includes('tiles')) ? 100 : 5
    };

    const updatedList = [newProd, ...allProducts];
    await saveProductsList(updatedList);
  };

  // Admin Delete Product Across Devices
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from stock inventory?')) return;
    
    const updatedList = allProducts.filter(p => p.id !== id);
    await saveProductsList(updatedList);

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // Open Calculator Modal
  const openCalculator = (product) => {
    setCalcProduct(product);
    setShowCalcModal(true);
  };

  // Open Inquiry Modal
  const openInquiry = (product, note = '') => {
    setInquireProduct(product);
    setInquireNote(note);
    setShowInquireModal(true);
  };

  return (
    <div className="app-container">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        adminToken={adminToken}
        onLogout={handleAdminLogout}
      />

      {currentView === 'store' ? (
        <CustomerStore 
          products={filteredProducts}
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onOpenCalc={openCalculator}
          onInquire={openInquiry}
          onDownloadPdf={handleDownloadPdf}
        />
      ) : (
        <AdminPortal 
          products={allProducts}
          categories={categories}
          adminToken={adminToken}
          onLogin={handleAdminLogin}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* Modals */}
      {showCalcModal && (
        <TileCalculatorModal 
          product={calcProduct}
          onClose={() => setShowCalcModal(false)}
          onInquire={openInquiry}
        />
      )}

      {showInquireModal && (
        <InquiryModal 
          product={inquireProduct}
          initialNote={inquireNote}
          onClose={() => setShowInquireModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: '#0f172a', fontSize: '1.25rem', marginBottom: '0.75rem' }}>M R TILES AND SANITATION SILCHAR</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Your trusted partner for premium vitrified tiles, ceramic wall tiles, sanitaryware, and designer doors in Silchar, Assam.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Showroom Address</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Trinayani Ln, near Karan TVS Showroom,<br />
              Kanakpur, Silchar, Assam - 788006
            </p>
          </div>

          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Stock & Sales Desk</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Phone/WhatsApp: +91 70993 13433<br />
              Email: mrtilesandsanitation@gmail.com<br />
              Mon - Sat: 9:30 AM - 8:00 PM
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} BLUE LEAF TECH. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
