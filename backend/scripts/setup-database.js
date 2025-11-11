import { readFileSync } from 'fs';
import { pool } from '../db/connection.js';
import bcrypt from 'bcrypt';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Read and execute schema
    const schema = readFileSync('./db/schema.sql', 'utf-8');
    await pool.query(schema);
    console.log('✅ Database schema created');
    
    // Create admin user
    const adminEmail = 'admin@vanaciprime.com';
    const adminPassword = 'admin123'; // Change this!
    const adminName = 'System Administrator';
    
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (existingUser.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const userResult = await pool.query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
        [adminEmail, passwordHash, adminName]
      );
      
      const userId = userResult.rows[0].id;
      
      // Assign admin role
      await pool.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [userId, 'admin']
      );
      
      console.log('✅ Admin user created');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log('   ⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
