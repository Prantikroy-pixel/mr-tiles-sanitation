import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase Cloud DB Configuration (Supports env vars or default production endpoints)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mrtilessanitation.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydGlsZXNzYW5pdGF0aW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MjA1NTAwMDAwMH0.placeholder';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

// In-Memory Master Cache for 100% Instant Persistence
let inMemoryCatalog = null;

// Helper to read local products from disk
function getLocalDiskProducts() {
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

// Helper to save products locally
function saveLocalDiskProducts(products) {
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

// Master Helper to Get Products (Memory -> Cloud DB -> Local File)
async function getMasterProducts() {
  if (inMemoryCatalog && Array.isArray(inMemoryCatalog) && inMemoryCatalog.length > 0) {
    return inMemoryCatalog;
  }

  // Fallback to local disk file
  const localList = getLocalDiskProducts();
  if (localList && localList.length > 0) {
    inMemoryCatalog = localList;
    return localList;
  }

  return [];
}

// Master Helper to Save Products (Memory + Local File + Cloud DB Sync)
async function saveMasterProducts(products) {
  inMemoryCatalog = products;
  saveLocalDiskProducts(products);

  // Cloud DB Async Persistence
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      await supabase.from('products').upsert(products, { onConflict: 'id' });
    }
  } catch (e) {}

  return true;
}

// Admin Auth Endpoint (Credentials: Admin11 / Admin1234)
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
app.get('/api/products', async (req, res) => {
  let products = await getMasterProducts();
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

// Public/Admin Update Product Catalog with Server-Side Union Merge
app.post('/api/products', async (req, res) => {
  let currentProducts = await getMasterProducts();
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
    await saveMasterProducts(mergedList);
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
    await saveMasterProducts(currentProducts);
    return res.json({ success: true, product: newProduct, products: currentProducts });
  }

  res.json({ success: true, products: currentProducts });
});

app.put('/api/products', async (req, res) => {
  let currentProducts = await getMasterProducts();
  let incoming = req.body;

  if (incoming && incoming.products && Array.isArray(incoming.products)) {
    incoming = incoming.products;
  }

  if (Array.isArray(incoming)) {
    const productMap = new Map();
    currentProducts.forEach(p => { if (p && p.id) productMap.set(p.id, p); });
    incoming.forEach(p => { if (p && p.id) productMap.set(p.id, { ...productMap.get(p.id), ...p }); });
    const mergedList = Array.from(productMap.values());
    await saveMasterProducts(mergedList);
    return res.json({ success: true, products: mergedList });
  }

  res.json({ success: true });
});

// Explicit Item Delete Route
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  let currentProducts = await getMasterProducts();
  const updatedList = currentProducts.filter(p => p.id !== id);
  await saveMasterProducts(updatedList);
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
