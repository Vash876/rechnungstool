import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import invoiceRoutes from './routes/invoices';
import quoteRoutes from './routes/quotes';
import settingsRoutes from './routes/settings';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', // Backend serving frontend
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'http://localhost:5177',
      'http://127.0.0.1:3000', // Backend serving frontend
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200 // for legacy browser support
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Rate limiting - lockerer für Desktop App
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // erhöht für Desktop App - mehr Requests erlaubt
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting für lokale Requests (Desktop App)
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Static file serving for uploads with CORS headers
app.use('/api/uploads', (req, res, next) => {
  // Set CORS headers specifically for uploaded files
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}, express.static('uploads'));

// Test route for CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS test successful', timestamp: new Date().toISOString() });
});

// Health check endpoint for Electron
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/settings', settingsRoutes);

// Serve frontend static files in production/Electron
const frontendPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
} else {
  // Development fallback - zeige Info-Seite
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rechnungstool Backend</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          .success { color: green; }
          .info { color: blue; }
          .error { color: red; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Rechnungstool Backend</h1>
          <p class="success">✅ Backend läuft erfolgreich!</p>
          <h3>Verfügbare Endpunkte:</h3>
          <ul>
            <li class="info">API: <a href="/api/health">/api/health</a></li>
            <li class="info">Test: <a href="/api/test">/api/test</a></li>
          </ul>
          <h3>Frontend-Modus:</h3>
          <p class="error">⚠️ Frontend dist/ Ordner nicht gefunden</p>
          <p>Für die Desktop-App muss das Frontend gebaut werden:</p>
          <pre>cd frontend && npm run build</pre>
          <h3>Entwicklungs-Setup:</h3>
          <p>Frontend läuft normalerweise auf: <a href="http://localhost:5175">http://localhost:5175</a></p>
        </div>
      </body>
      </html>
    `);
  });
  
  // 404 für andere Routen
  app.use('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>404 - Seite nicht gefunden</title></head>
        <body>
          <h1>404 - Seite nicht gefunden</h1>
          <p>Die Seite "${req.path}" existiert nicht.</p>
          <p><a href="/">Zurück zur Startseite</a></p>
        </body>
        </html>
      `);
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Server accessible from all interfaces`);
});
