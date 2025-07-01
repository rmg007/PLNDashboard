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
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('✅ Database schema created');
    
    // Import data
    console.log('📥 Importing data...');
    
    // Import yearly data
    const yearlyDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitYearlyJson.json');
    const yearlyData = JSON.parse(fs.readFileSync(yearlyDataPath, 'utf8'));
    
    for (const item of yearlyData) {
      await client.query(`
        INSERT INTO yearly_permits (fiscal_year, permit_count, total_valuation)
        VALUES ($1, $2, $3)
        ON CONFLICT (fiscal_year) DO UPDATE SET
          permit_count = EXCLUDED.permit_count,
          total_valuation = EXCLUDED.total_valuation
      `, [item.fiscal_year, item.permit_count, item.total_valuation]);
    }
    console.log(`✅ Imported ${yearlyData.length} yearly records`);
    
    // Import quarterly data
    const quarterlyDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitQuarterlyJson.json');
    const quarterlyData = JSON.parse(fs.readFileSync(quarterlyDataPath, 'utf8'));
    
    for (const item of quarterlyData) {
      await client.query(`
        INSERT INTO quarterly_permits (fiscal_year, quarter, permit_count, total_valuation)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (fiscal_year, quarter) DO UPDATE SET
          permit_count = EXCLUDED.permit_count,
          total_valuation = EXCLUDED.total_valuation
      `, [item.fiscal_year, item.quarter, item.permit_count, item.total_valuation]);
    }
    console.log(`✅ Imported ${quarterlyData.length} quarterly records`);
    
    // Import monthly data
    const monthlyDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitMonthlyJson.json');
    const monthlyData = JSON.parse(fs.readFileSync(monthlyDataPath, 'utf8'));
    
    for (const item of monthlyData) {
      await client.query(`
        INSERT INTO monthly_permits (fiscal_year, month, permit_count, total_valuation)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (fiscal_year, month) DO UPDATE SET
          permit_count = EXCLUDED.permit_count,
          total_valuation = EXCLUDED.total_valuation
      `, [item.fiscal_year, item.month, item.permit_count, item.total_valuation]);
    }
    console.log(`✅ Imported ${monthlyData.length} monthly records`);
    
    // Import yearly bins data
    const yearlyBinsDataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData', 'UniquePermitYearlyBinsJson.json');
    const yearlyBinsData = JSON.parse(fs.readFileSync(yearlyBinsDataPath, 'utf8'));
    
    for (const item of yearlyBinsData) {
      await client.query(`
        INSERT INTO yearly_bins_permits (fiscal_year, bin_0_10k, bin_10k_100k, bin_100k_1m, bin_1m_10m)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (fiscal_year) DO UPDATE SET
          bin_0_10k = EXCLUDED.bin_0_10k,
          bin_10k_100k = EXCLUDED.bin_10k_100k,
          bin_100k_1m = EXCLUDED.bin_100k_1m,
          bin_1m_10m = EXCLUDED.bin_1m_10m
      `, [item.fiscal_year, item.bin_0_10k, item.bin_10k_100k, item.bin_100k_1m, item.bin_1m_10m]);
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