import { execSync } from 'child_process';

// Database Configuration
const envVars = {
  DB_HOST: 'db.laahepxmxohncqwjbuim.supabase.co',
  DB_PORT: '5432',
  DB_NAME: 'postgres',
  DB_USER: 'postgres',
  DB_PASSWORD: "BecauseI'mHappy1980",
  DATABASE_URL: "postgresql://postgres:BecauseI'mHappy1980@db.laahepxmxohncqwjbuim.supabase.co:5432/postgres",
  
  // Server Configuration
  PORT: '5000',
  NODE_ENV: 'production',
  
  // CORS Configuration
  CORS_ORIGIN: 'https://pln-dashboard-q6z4.vercel.app',
  
  // JWT Configuration
  JWT_SECRET: 'your_jwt_secret_key_here',
  JWT_EXPIRES_IN: '24h',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100'
};

console.log('Adding environment variables to Vercel...');

// Function to escape special characters in the value
function escapeValue(value) {
  // Escape quotes and other special characters
  return value.replace(/'/g, "'\\''");
}

// Add each environment variable
for (const [key, value] of Object.entries(envVars)) {
  try {
    console.log(`Adding ${key}...`);
    const escapedValue = escapeValue(value);
    const command = `npx vercel env rm ${key} production -y || true && echo "${escapedValue}" | npx vercel env add ${key} production`;
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error adding ${key}: ${error.message}`);
  }
}

console.log('Done! Environment variables have been added to Vercel.'); 