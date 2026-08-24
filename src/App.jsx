import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import CustomerStore from './components/CustomerStore.jsx';
import AdminPortal from './components/AdminPortal.jsx';
import TileCalculatorModal from './components/TileCalculatorModal.jsx';
import InquiryModal from './components/InquiryModal.jsx';
import { DEFAULT_PRODUCTS } from './data/defaultProducts.js';

// Absolute Production Server API Endpoint for M R Tiles & Sanitation
const LIVE_RENDER_API_URL = 'https://mr-tiles-sanitation.onrender.com/api/products';

export default function App() {
  const [currentView, setCurrentView] = useState('store');
  
  // Safe Product State Loader with Permanent Local Fallback
  const [allProducts, setAllProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('mr_tiles_permanent_catalog_v12');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PRODUCTS;
  });

  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  // Category State Loader
  const [categories, setCategories] = useState(() => {
    try {
      const savedCats = localStorage.getItem('mr_tiles_custom_categories_v10');
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

  // Safe Admin Token State
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

  // Clean Server Master SSOT Sync Logic (Prevents deleted items from resurrecting)
  const fetchLiveCloudProducts = async () => {
    try {
      const targetUrl = window.location.hostname.includes('onrender.com') 
        ? '/api/products' 
        : LIVE_RENDER_API_URL;

      const res = await fetch(targetUrl);
      if (res.ok) {
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
    } catch (err) {}
  };

  // Poll central Render backend server every 4 seconds for real-time cross-device updates
  useEffect(() => {
    fetchLiveCloudProducts();
    const timer = setInterval(fetchLiveCloudProducts, 4000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically sync custom categories across devices based on product catalog
  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const knownIds = new Set(categories.map(c => c.id));
      const newFoundCats = [];

      allProducts.forEach(p => {
        if (p.category && !knownIds.has(p.category)) {
          knownIds.add(p.category);
          newFoundCats.push({
            id: p.category,
            label: p.categoryLabel || p.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
          });
        }
      });

      if (newFoundCats.length > 0) {
        const updated = [...categories, ...newFoundCats];
        setCategories(updated);
        try {
          localStorage.setItem('mr_tiles_custom_categories_v10', JSON.stringify(updated));
        } catch (e) {}
      }
    }
  }, [allProducts]);

  // Save Products to State, Local Storage & Central Render Server Database
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

    const targetUrl = window.location.hostname.includes('onrender.com') 
      ? '/api/products' 
      : LIVE_RENDER_API_URL;

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedList)
      });
    } catch (err) {
      console.error('Failed to sync changes to Render Cloud DB:', err);
    }
  };

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
    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    setActiveCategory(newCat.id);
    try {
      localStorage.setItem('mr_tiles_custom_categories_v10', JSON.stringify(updatedCats));
    } catch (e) {}
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
          <h1>M R TILES AND SANITATION</h1>
          <p>Trinayani Ln, near Karan TVS Showroom, Kanakpur, Silchar, Assam - 788006 • Phone/WhatsApp: +91 60013 99842</p>
          <h3>Official Product & Price Catalog</h3>
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

  // Admin Update Product
  const handleUpdateProduct = async (id, updatePayload) => {
    const updatedList = allProducts.map(p => p.id === id ? { 
      ...p, 
      ...updatePayload, 
      unit: updatePayload.unit || p.unit || 'sq.ft',
      image: updatePayload.image || p.image || 'images/regal-white-marble.png'
    } : p);
    await saveProductsList(updatedList);
  };

  // Admin Add Product
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

  // Admin Delete Product (Explicit HTTP DELETE)
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from stock inventory?')) return;
    
    const updatedList = allProducts.filter(p => p.id !== id);
    setAllProducts(updatedList);

    try {
      localStorage.setItem('mr_tiles_permanent_catalog_v12', JSON.stringify(updatedList));
    } catch (e) {}

    const targetUrl = window.location.hostname.includes('onrender.com') 
      ? `/api/products/${id}` 
      : `https://mr-tiles-sanitation.onrender.com/api/products/${id}`;

    try {
      await fetch(targetUrl, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete item from server:', err);
    }
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
        />
      )}

      {/* Modals */}
      {showCalcModal && (
        <TileCalculatorModal 
          product={calcProduct}
          onClose={() => setShowCalcModal(false)}
          onInquire={(p, note) => openInquiry(p, note)}
        />
      )}

      {showInquireModal && (
        <InquiryModal 
          product={inquireProduct}
          initialNote={inquireNote}
          onClose={() => setShowInquireModal(false)}
        />
      )}

      <footer className="footer">
        <div className="footer-content">
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.75rem' }}>M R TILES AND SANITATION</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Your trusted partner for residential & commercial flooring, wall cladding, and luxury bathroom sanitaryware.
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
              Phone: +91 60013 99842<br />
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
