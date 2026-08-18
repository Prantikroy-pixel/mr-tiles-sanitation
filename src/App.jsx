import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import CustomerStore from './components/CustomerStore.jsx';
import AdminPortal from './components/AdminPortal.jsx';
import TileCalculatorModal from './components/TileCalculatorModal.jsx';
import InquiryModal from './components/InquiryModal.jsx';
import { DEFAULT_PRODUCTS } from './data/defaultProducts.js';

// Real-Time Free Cloud Database for M R Tiles & Sanitation (Cross-Device Global Sync)
const CLOUD_API_URL = 'https://api.npoint.io/9a85d34208bbdfc3c95a';

export default function App() {
  const [currentView, setCurrentView] = useState('store');
  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(DEFAULT_PRODUCTS);
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);

  // Category State
  const [categories, setCategories] = useState([
    { id: 'all', label: 'All Products' },
    { id: 'floor-tiles', label: 'Floor Tiles' },
    { id: 'wall-tiles', label: 'Wall Tiles' },
    { id: 'sanitary', label: 'Sanitary' },
    { id: 'doors', label: 'Doors' }
  ]);
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

  // Fetch Live Global Products from Cloud DB (Works across ALL devices worldwide)
  const fetchCloudProducts = async () => {
    try {
      const res = await fetch(CLOUD_API_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllProducts(data);
          setIsLoadingCloud(false);
          return;
        }
      }
    } catch (err) {
      console.log('Using default product catalog fallback');
    }

    // Backup LocalStorage Check
    try {
      const saved = localStorage.getItem('mr_tiles_catalog_local');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllProducts(parsed);
        }
      }
    } catch (e) {}
    setIsLoadingCloud(false);
  };

  useEffect(() => {
    fetchCloudProducts();
  }, []);

  // Save Products to Real-Time Cloud DB so ALL devices see the changes instantly
  const saveProductsToCloud = async (newProductsList) => {
    setAllProducts(newProductsList);
    try {
      localStorage.setItem('mr_tiles_catalog_local', JSON.stringify(newProductsList));
    } catch (e) {}

    try {
      await fetch(CLOUD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProductsList)
      });
    } catch (err) {
      console.error('Cloud Sync Error:', err);
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
        <td style="padding: 10px;">${p.colors ? p.colors.map(c => c.name).join(', ') : 'Standard'}</td>
        <td style="padding: 10px; font-weight: bold; color: #0f172a;">₹${p.price}/${p.unit}</td>
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
                <th>Color Choices</th>
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

  // Admin Update Product with Cross-Device Cloud Sync
  const handleUpdateProduct = async (id, updatePayload) => {
    const updatedList = allProducts.map(p => p.id === id ? { ...p, ...updatePayload } : p);
    await saveProductsToCloud(updatedList);
  };

  // Admin Add Product with Cross-Device Cloud Sync
  const handleAddProduct = async (productData) => {
    const newProd = {
      id: 'prod_' + Date.now(),
      ...productData,
      minStock: (productData.category && productData.category.includes('tiles')) ? 100 : 5
    };

    const updatedList = [newProd, ...allProducts];
    await saveProductsToCloud(updatedList);
  };

  // Admin Delete Product with Cross-Device Cloud Sync
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from stock inventory?')) return;
    const updatedList = allProducts.filter(p => p.id !== id);
    await saveProductsToCloud(updatedList);
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
