import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Global CORS Middleware for Cross-Domain Device Sync
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Path to local data file
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// Helper to read products from disk
function getProducts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {}
  return [];
}

// Helper to save products to disk
function saveProducts(products) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Admin Auth Endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Admin11' && password === 'Admin1234') {
    return res.json({
      success: true,
      token: 'mr_admin_token_' + Date.now(),
      message: 'Authentication successful'
    });
  }
  res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// Public: Get Catalog Products
app.get('/api/products', (req, res) => {
  let products = getProducts();
  const { category, search } = req.query;

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: products.length, products });
});

// Public/Admin Update Product Catalog with Server-Side Union Merge (Prevents accidental data wipes)
app.post('/api/products', (req, res) => {
  let currentProducts = getProducts();
  let incoming = req.body;

  if (incoming && incoming.products && Array.isArray(incoming.products)) {
    incoming = incoming.products;
  }

  if (Array.isArray(incoming)) {
    const productMap = new Map();

    // 1. Load existing server items first
    currentProducts.forEach(p => {
      if (p && p.id) {
        productMap.set(p.id, {
          ...p,
          unit: p.unit || 'sq.ft',
          image: p.image || 'images/regal-white-marble.png'
        });
      }
    });

    // 2. Union merge incoming items by ID
    incoming.forEach(p => {
      if (p && p.id) {
        const existing = productMap.get(p.id) || {};
        productMap.set(p.id, {
          ...existing,
          ...p,
          unit: p.unit || existing.unit || 'sq.ft',
          image: p.image || existing.image || 'images/regal-white-marble.png'
        });
      }
    });

    const mergedList = Array.from(productMap.values());
    saveProducts(mergedList);
    return res.json({ success: true, products: mergedList });
  }

  if (req.body && req.body.name) {
    const newProduct = {
      id: 'prod_' + Date.now(),
      unit: req.body.unit || 'sq.ft',
      image: req.body.image || 'images/regal-white-marble.png',
      ...req.body
    };
    currentProducts.unshift(newProduct);
    saveProducts(currentProducts);
    return res.json({ success: true, product: newProduct, products: currentProducts });
  }

  res.json({ success: true, products: currentProducts });
});

app.put('/api/products', (req, res) => {
  let currentProducts = getProducts();
  let incoming = req.body;

  if (incoming && incoming.products && Array.isArray(incoming.products)) {
    incoming = incoming.products;
  }

  if (Array.isArray(incoming)) {
    const productMap = new Map();
    currentProducts.forEach(p => { if (p && p.id) productMap.set(p.id, p); });
    incoming.forEach(p => { if (p && p.id) productMap.set(p.id, { ...productMap.get(p.id), ...p }); });
    const mergedList = Array.from(productMap.values());
    saveProducts(mergedList);
    return res.json({ success: true, products: mergedList });
  }

  res.json({ success: true });
});

// Explicit Item Delete Route
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  let currentProducts = getProducts();
  const updatedList = currentProducts.filter(p => p.id !== id);
  saveProducts(updatedList);
  res.json({ success: true, products: updatedList });
});

app.get('*', (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`M R Tiles & Sanitation Server running on port ${PORT}`);
});
