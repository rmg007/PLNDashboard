const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration for Supabase
const dbConfig = {
  host: process.env.DB_HOST || 'db.laahepxmxohncqwjbuim.supabase.co',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '9FqrN0ilLwLfhqPn',
  ssl: {
    rejectUnauthorized: false
  }
};

async function deploy() {
  console.log('🚀 Starting deployment...');
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Setup database schema
    console.log('📊 Setting up database schema...');
    try {
      // Drop existing schema if it exists
      await client.query(`
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA IF NOT EXISTS public;
        GRANT ALL ON SCHEMA public TO postgres;
        GRANT ALL ON SCHEMA public TO public;
      `);
      console.log('✅ Dropped and recreated schema');
      
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('✅ Database schema created');
    } catch (error) {
      console.error('❌ Schema setup failed:', error);
      throw error;
    }
    
    // Import data
    console.log('📥 Importing data...');
    
    // Import yearly data
    const yearlyDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitYearlyJson.json');
    const yearlyData = JSON.parse(fs.readFileSync(yearlyDataPath, 'utf8'));
    
    for (const item of yearlyData) {
      await client.query(`
        INSERT INTO unique_permits_yearly (fiscal_year, permit_count)
        VALUES ($1, $2)
        ON CONFLICT (fiscal_year) DO UPDATE SET
          permit_count = EXCLUDED.permit_count
      `, [item.FiscalYear, item.PermitCount]);
    }
    console.log(`✅ Imported ${yearlyData.length} yearly records`);
    
    // Import quarterly data
    const quarterlyDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitQuarterlyJson.json');
    const quarterlyData = JSON.parse(fs.readFileSync(quarterlyDataPath, 'utf8'));
    
    for (const item of quarterlyData) {
      await client.query(`
        INSERT INTO unique_permits_quarterly (year, quarter, permit_count)
        VALUES ($1, $2, $3)
        ON CONFLICT (quarter, year) DO UPDATE SET
          permit_count = EXCLUDED.permit_count
      `, [item.FiscalYear, item.FiscalQuarter, item.PermitCount]);
    }
    console.log(`✅ Imported ${quarterlyData.length} quarterly records`);
    
    // Import monthly data
    const monthlyDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitMonthlyJson.json');
    const monthlyData = JSON.parse(fs.readFileSync(monthlyDataPath, 'utf8'));
    
    for (const item of monthlyData) {
      await client.query(`
        INSERT INTO unique_permits_monthly (year, month, permit_count)
        VALUES ($1, $2, $3)
        ON CONFLICT (month, year) DO UPDATE SET
          permit_count = EXCLUDED.permit_count
      `, [item.FiscalYear, item.FiscalMonth, item.PermitCount]);
    }
    console.log(`✅ Imported ${monthlyData.length} monthly records`);
    
    // Import yearly bins data
    const yearlyBinsDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitYearlyBinsJson.json');
    const yearlyBinsData = JSON.parse(fs.readFileSync(yearlyBinsDataPath, 'utf8'));
    
    for (const item of yearlyBinsData) {
      await client.query(`
        INSERT INTO unique_permits_yearly_bins (year, bin_range, permit_count)
        VALUES ($1, $2, $3)
        ON CONFLICT (bin_range, year) DO UPDATE SET
          permit_count = EXCLUDED.permit_count
      `, [item.year, item.permit_range, item.count]);
    }
    console.log(`✅ Imported ${yearlyBinsData.length} yearly bins records`);
    
    console.log('🎉 Deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  deploy();
}

module.exports = { deploy }; 