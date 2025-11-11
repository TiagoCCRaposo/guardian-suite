import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/connection.js';
import serversRouter from './routes/servers.js';
import vulnerabilitiesRouter from './routes/vulnerabilities.js';
import portsRouter from './routes/ports.js';
import patchesRouter from './routes/patches.js';
import logsRouter from './routes/logs.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/servers', serversRouter);
app.use('/api/vulnerabilities', vulnerabilitiesRouter);
app.use('/api/ports', portsRouter);
app.use('/api/patches', patchesRouter);
app.use('/api/logs', logsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vanaci Audit API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await pool.end();
  process.exit(0);
});
