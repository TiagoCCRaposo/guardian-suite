import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get patches for a server
router.get('/server/:serverId', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM patches WHERE server_id = $1 ORDER BY release_date DESC',
      [req.params.serverId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Add patch
router.post('/', async (req, res, next) => {
  try {
    const { server_id, name, severity, release_date, status } = req.body;
    
    if (!server_id || !name) {
      return res.status(400).json({ error: 'Server ID and patch name are required' });
    }
    
    const result = await query(
      `INSERT INTO patches (server_id, name, severity, release_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [server_id, name, severity, release_date, status || 'pending']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update patch status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const result = await query(
      'UPDATE patches SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patch not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
