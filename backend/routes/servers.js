import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// Get all servers with stats
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as total_ports,
        COUNT(DISTINCT pa.id) as total_patches,
        COUNT(DISTINCT v.id) as total_vulnerabilities
      FROM servers s
      LEFT JOIN ports p ON s.id = p.server_id
      LEFT JOIN patches pa ON s.id = pa.server_id
      LEFT JOIN vulnerabilities v ON s.id = v.server_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get single server
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create server
router.post('/', async (req, res, next) => {
  try {
    const { name, ip, status, vulnerabilities, critical } = req.body;
    
    // Basic validation
    if (!name || !ip) {
      return res.status(400).json({ error: 'Name and IP are required' });
    }
    
    const result = await query(
      `INSERT INTO servers (name, ip, status, vulnerabilities, critical) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, ip, status || 'offline', vulnerabilities || 0, critical || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update server
router.put('/:id', async (req, res, next) => {
  try {
    const { name, ip, status, vulnerabilities, critical } = req.body;
    
    const result = await query(
      `UPDATE servers 
       SET name = COALESCE($1, name),
           ip = COALESCE($2, ip),
           status = COALESCE($3, status),
           vulnerabilities = COALESCE($4, vulnerabilities),
           critical = COALESCE($5, critical)
       WHERE id = $6
       RETURNING *`,
      [name, ip, status, vulnerabilities, critical, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete server
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM servers WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get server statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'online') as online,
        COALESCE(SUM(vulnerabilities), 0) as vulnerabilities,
        COALESCE(SUM(critical), 0) as critical,
        COUNT(DISTINCT pa.id) as patches
      FROM servers s
      LEFT JOIN patches pa ON s.id = pa.server_id AND pa.status = 'pending'
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
