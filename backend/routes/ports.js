import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get ports for a server
router.get('/server/:serverId', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM ports WHERE server_id = $1 ORDER BY port ASC',
      [req.params.serverId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Add port to server
router.post('/', async (req, res, next) => {
  try {
    const { server_id, port, state, service, version } = req.body;
    
    if (!server_id || !port) {
      return res.status(400).json({ error: 'Server ID and port number are required' });
    }
    
    const result = await query(
      `INSERT INTO ports (server_id, port, state, service, version)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [server_id, port, state || 'closed', service, version]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete port
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM ports WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Port not found' });
    }
    
    res.json({ message: 'Port deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
