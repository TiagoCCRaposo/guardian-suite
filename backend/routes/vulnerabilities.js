import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get vulnerabilities for a server
router.get('/server/:serverId', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM vulnerabilities WHERE server_id = $1 ORDER BY discovered_at DESC',
      [req.params.serverId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Add vulnerability
router.post('/', async (req, res, next) => {
  try {
    const { server_id, title, severity, description, cve_id } = req.body;
    
    if (!server_id || !title) {
      return res.status(400).json({ error: 'Server ID and title are required' });
    }
    
    const result = await query(
      `INSERT INTO vulnerabilities (server_id, title, severity, description, cve_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [server_id, title, severity, description, cve_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete vulnerability
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM vulnerabilities WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vulnerability not found' });
    }
    
    res.json({ message: 'Vulnerability deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
