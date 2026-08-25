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

// Paths to local data files
const DATA_FILE = path.join(__dirname, 'data', 'products.json');
const CATEGORIES_FILE = path.join(__dirname, 'data', 'categories.json');

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'floor-tiles', label: 'Floor Tiles' },
  { id: 'wall-tiles', label: 'Wall Tiles' },
  { id: 'sanitary', label: 'Sanitary' },
  { id: 'doors', label: 'Doors' }
];

// In-Memory Master Caches
let inMemoryCatalog = null;
let inMemoryCategories = null;

// Helper to read local products from disk
function getLocalDiskProducts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
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

// Master Helper to Get Products (Memory -> Local File)
function getMasterProducts() {
  if (inMemoryCatalog !== null && Array.isArray(inMemoryCatalog)) {
    return inMemoryCatalog;
  }
  const localList = getLocalDiskProducts();
  inMemoryCatalog = localList;
  return localList;
}

// Master Helper to Save Products (Memory + Local File)
function saveMasterProducts(products) {
  inMemoryCatalog = products;
  saveLocalDiskProducts(products);
  return true;
}

// Master Helper to Get Categories
function getMasterCategories() {
  if (inMemoryCategories !== null && Array.isArray(inMemoryCategories)) {
    return inMemoryCategories;
  }
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const content = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCategories = parsed;
        return parsed;
      }
    }
  } catch (err) {}
  inMemoryCategories = DEFAULT_CATEGORIES;
  return DEFAULT_CATEGORIES;
}

// Master Helper to Save Categories
function saveMasterCategories(categories) {
  inMemoryCategories = categories;
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {}
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

// Category Endpoints
app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories: getMasterCategories() });
});

app.post('/api/categories', (req, res) => {
  let newCats = req.body;
  if (newCats && newCats.categories && Array.isArray(newCats.categories)) {
    newCats = newCats.categories;
  }
  if (Array.isArray(newCats)) {
    saveMasterCategories(newCats);
    return res.json({ success: true, categories: newCats });
  }
  if (req.body && req.body.id && req.body.label) {
    const current = getMasterCategories();
    const updated = [...current, { id: req.body.id, label: req.body.label }];
    saveMasterCategories(updated);
    return res.json({ success: true, categories: updated });
  }
  res.status(400).json({ error: 'Invalid payload' });
});

app.delete('/api/categories/:id', (req, res) => {
  const catId = req.params.id;
  const current = getMasterCategories();
  const updated = current.filter(c => c.id !== catId);
  saveMasterCategories(updated);
  res.json({ success: true, categories: updated });
});

// Public: Get Catalog Products
app.get('/api/products', (req, res) => {
  let products = getMasterProducts();
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

// Public/Admin Update Product Catalog
app.post('/api/products', (req, res) => {
  let currentProducts = getMasterProducts();
  let incoming = req.body;

  if (incoming && incoming.products && Array.isArray(incoming.products)) {
    incoming = incoming.products;
  }

  if (Array.isArray(incoming)) {
    saveMasterProducts(incoming);
    return res.json({ success: true, products: incoming });
  }

  if (req.body && req.body.name) {
    const newProduct = {
      id: 'prod_' + Date.now(),
      unit: req.body.unit || 'sq.ft',
      image: req.body.image || 'images/regal-white-marble.png',
      ...req.body
    };
    currentProducts.unshift(newProduct);
    saveMasterProducts(currentProducts);
    return res.json({ success: true, product: newProduct, products: currentProducts });
  }

  res.json({ success: true, products: currentProducts });
});

app.put('/api/products', (req, res) => {
  let incoming = req.body;
  if (incoming && incoming.products && Array.isArray(incoming.products)) {
    incoming = incoming.products;
  }

  if (Array.isArray(incoming)) {
    saveMasterProducts(incoming);
    return res.json({ success: true, products: incoming });
  }

  res.json({ success: true, products: getMasterProducts() });
});

// Explicit Item Delete Route
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  let currentProducts = getMasterProducts();
  const updatedList = currentProducts.filter(p => p.id !== id);
  saveMasterProducts(updatedList);
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
