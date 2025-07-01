const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Database connection
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const dataPath = path.join(__dirname, '..', '..', 'public', 'data', 'UniquePermitsAnalysisData');

async function importUniquePermitsYearly() {
  const filePath = path.join(dataPath, 'UniquePermitYearlyJson.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('Importing Unique Permits Yearly data...');
  
  for (const item of data) {
    await client.query(
      `INSERT INTO unique_permits_yearly (fiscal_year, permit_count) 
       VALUES ($1, $2) 
       ON CONFLICT (fiscal_year) 
       DO UPDATE SET permit_count = $2`,
      [item.FiscalYear, item.PermitCount]
    );
  }
  
  console.log(`Imported ${data.length} yearly permit records`);
}

async function importDepartmentActivity() {
  const filePath = path.join(dataPath, 'DeptAnnualActivityJson.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('Importing Department Activity data...');
  
  for (const item of data) {
    await client.query(
      `INSERT INTO department_activity (year, activity_count, department) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (year, department) 
       DO UPDATE SET activity_count = $2`,
      [item.year, item.activity_count, item.department]
    );
  }
  
  console.log(`Imported ${data.length} department activity records`);
}

async function importDepartmentActivityWeekday() {
  const filePath = path.join(dataPath, 'DeptAnnualActivityWeekdayJson.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('Importing Department Activity Weekday data...');
  
  for (const item of data) {
    await client.query(
      `INSERT INTO department_activity_weekday (year, monday, tuesday, wednesday, thursday, friday, department) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (year, department) 
       DO UPDATE SET monday = $2, tuesday = $3, wednesday = $4, thursday = $5, friday = $6`,
      [item.year, item.monday, item.tuesday, item.wednesday, item.thursday, item.friday, item.department]
    );
  }
  
  console.log(`Imported ${data.length} department weekday activity records`);
}

async function importUniquePermitsMonthly() {
  const filePath = path.join(dataPath, 'UniquePermitMonthlyJson.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('Importing Unique Permits Monthly data...');
  
  for (const item of data) {
    await client.query(
      `INSERT INTO unique_permits_monthly (month, permit_count, year) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (month, year) 
       DO UPDATE SET permit_count = $2`,
      [item.FiscalMonth, item.PermitCount, item.FiscalYear]
    );
  }
  
  console.log(`Imported ${data.length} monthly permit records`);
}

async function importUniquePermitsQuarterly() {
  const filePath = path.join(dataPath, 'UniquePermitQuarterlyJson.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('Importing Unique Permits Quarterly data...');
  
  for (const item of data) {
    await client.query(
      `INSERT INTO unique_permits_quarterly (quarter, permit_count, year) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (quarter, year) 
       DO UPDATE SET permit_count = $2`,
      [item.FiscalQuarter.toString(), item.PermitCount, item.FiscalYear]
    );
  }
  
  console.log(`Imported ${data.length} quarterly permit records`);
}

async function importUniquePermitsYearlyBins() {
  const filePath = path.join(dataPath, 'UniquePermitYearlyBinsJson.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('Importing Unique Permits Yearly Bins data...');
  
  for (const item of data) {
    await client.query(
      `INSERT INTO unique_permits_yearly_bins (bin_range, permit_count, year) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (bin_range, year) 
       DO UPDATE SET permit_count = $2`,
      [item.permit_range, item.count, item.year]
    );
  }
  
  console.log(`Imported ${data.length} yearly bins records`);
}

async function importAllData() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Import all data
    await importUniquePermitsYearly();
    await importDepartmentActivity();
    await importDepartmentActivityWeekday();
    await importUniquePermitsMonthly();
    await importUniquePermitsQuarterly();
    await importUniquePermitsYearlyBins();
    
    console.log('\nAll data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await client.end();
  }
}

// Check the structure of the JSON files first
async function checkDataStructure() {
  console.log('Checking JSON file structures...\n');
  
  const files = [
    'UniquePermitYearlyJson.json',
    'DeptAnnualActivityJson.json',
    'DeptAnnualActivityWeekdayJson.json',
    'UniquePermitMonthlyJson.json',
    'UniquePermitQuarterlyJson.json',
    'UniquePermitYearlyBinsJson.json'
  ];
  
  for (const file of files) {
    const filePath = path.join(dataPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`${file}:`);
    console.log('Sample record:', JSON.stringify(data[0], null, 2));
    console.log('Total records:', data.length);
    console.log('---\n');
  }
}

// Run the import
(async () => {
  await checkDataStructure();
  await importAllData();
})().catch(console.error); 