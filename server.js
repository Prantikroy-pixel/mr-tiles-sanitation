import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Path to persistent data store
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// Helper to read products
function getProducts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading products:', err);
  }
  return [];
}

// Helper to save products
function saveProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving products:', err);
    return false;
  }
}

// Admin Login Route (Credentials: Admin11 / Admin1234)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'Admin11' && password === 'Admin1234') {
    const token = 'mr_admin_token_' + Date.now();
    return res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  }

  return res.status(401).json({
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

// Public/Admin Update Product Catalog (Accepts Array or Single Product)
app.post('/api/products', (req, res) => {
  let currentProducts = getProducts();
  
  if (Array.isArray(req.body)) {
    saveProducts(req.body);
    return res.json({ success: true, products: req.body });
  }

  if (req.body && req.body.products && Array.isArray(req.body.products)) {
    saveProducts(req.body.products);
    return res.json({ success: true, products: req.body.products });
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
  if (Array.isArray(req.body)) {
    saveProducts(req.body);
    return res.json({ success: true, products: req.body });
  }
  if (req.body && req.body.products && Array.isArray(req.body.products)) {
    saveProducts(req.body.products);
    return res.json({ success: true, products: req.body.products });
  }
  res.json({ success: true, products: getProducts() });
});

// Serve Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`M R Tiles & Sanitation Server running on port ${PORT}`);
});
