import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get logs for a server
router.get('/server/:serverId', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    
    const result = await query(
      `SELECT * FROM logs 
       WHERE server_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [req.params.serverId, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Add log entry
router.post('/', async (req, res, next) => {
  try {
    const { server_id, level, message } = req.body;
    
    if (!server_id || !message) {
      return res.status(400).json({ error: 'Server ID and message are required' });
    }
    
    const result = await query(
      `INSERT INTO logs (server_id, level, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [server_id, level || 'info', message]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
