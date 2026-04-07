import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import plantRoutes from './routes/plants.js';
import observationRoutes from './routes/observations.js';
import concentrateRoutes from './routes/concentrates.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grimlock';
mongoose.connect(mongoUri)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/concentrates', concentrateRoutes);

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
