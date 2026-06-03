import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import plantRoutes from './routes/plants.js';
import observationRoutes from './routes/observations.js';
import harvestGroupRoutes from './routes/harvest-groups.js';
import mlDatasetRoutes from './routes/ml-datasets.js';
import uploadsRoutes from './routes/uploads.js';

dotenv.config();

const app = express();
app.disable('x-powered-by');

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests and local/dev usage when CORS_ORIGIN is unset.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
});
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grimlock';
mongoose.connect(mongoUri)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    console.error('⚠ API is running in setup mode. Configure MONGODB_URI to enable data routes.');
  });

// Return a clear setup response when API routes are hit before MongoDB connects.
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    next();
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: 'Database not connected. Configure MONGODB_URI in .env and restart the server.',
      setup: {
        requiredEnv: ['MONGODB_URI'],
        optionalEnv: ['LOCAL_ADMIN_TOKEN', 'OBSERVATION_WRITE_TOKEN', 'OBSERVATION_READ_TOKEN', 'OBSERVATION_SECURE_READS']
      }
    });
    return;
  }

  next();
});

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/harvest-groups', harvestGroupRoutes);
app.use('/api/ml-datasets', mlDatasetRoutes);
app.use('/api/uploads', uploadsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api`);
});
