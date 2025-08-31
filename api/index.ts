import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { errorHandler } from '../src/middleware/errorHandler';
import authRoutes from '../src/routes/auth';
import customerRoutes from '../src/routes/customers';
import invoiceRoutes from '../src/routes/invoices';
import quoteRoutes from '../src/routes/quotes';
import settingsRoutes from '../src/routes/settings';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration for Vercel
app.use(cors({
  origin: true, // Allow all origins for Vercel
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Rate limiting for Vercel
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes - no /api prefix needed since we're already under /api/*
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/quotes', quoteRoutes);
app.use('/settings', settingsRoutes);

// Health check endpoint for debugging
app.get('/', (req, res) => {
  res.json({ message: 'API is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// For Vercel, export the app
export default app;
