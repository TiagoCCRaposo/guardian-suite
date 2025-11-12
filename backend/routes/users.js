import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db/connection.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.created_at,
        array_agg(ur.role) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      GROUP BY u.id, u.email, u.name, u.created_at
      ORDER BY u.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { email, password, name, role = 'viewer' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }
    
    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, password_hash, name]
    );
    
    const user = result.rows[0];
    
    // Assign role
    await query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [user.id, role]
    );
    
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Update user (admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, password, role } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(password_hash);
    }
    
    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }
    
    // Update role if provided
    if (role) {
      await query('DELETE FROM user_roles WHERE user_id = $1', [id]);
      await query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2)', [id, role]);
    }
    
    const result = await query('SELECT id, email, name FROM users WHERE id = $1', [id]);
    const rolesResult = await query('SELECT role FROM user_roles WHERE user_id = $1', [id]);
    
    res.json({
      ...result.rows[0],
      roles: rolesResult.rows.map(r => r.role)
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

export default router;
