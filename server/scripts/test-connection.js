const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('Testing database connection...');
    await client.connect();
    
    const result = await client.query('SELECT NOW()');
    console.log('✓ Successfully connected to database!');
    console.log('Current time from database:', result.rows[0].now);
    
    // Test if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\nExisting tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Count records in each data table
    const dataTables = [
      'unique_permits_yearly',
      'department_activity',
      'department_activity_weekday',
      'unique_permits_monthly',
      'unique_permits_quarterly',
      'unique_permits_yearly_bins'
    ];
    
    console.log('\nRecord counts:');
    for (const table of dataTables) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  - ${table}: ${count.rows[0].count} records`);
      } catch (e) {
        console.log(`  - ${table}: table not found`);
      }
    }
    
  } catch (error) {
    console.error('✗ Failed to connect to database:', error.message);
  } finally {
    await client.end();
  }
}

testConnection().catch(console.error); 