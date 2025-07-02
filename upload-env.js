import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to parse .env file content
function parseEnvFile(content) {
  const envVars = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') continue;
    
    // Extract key and value
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
    }
  }
  
  return envVars;
}

// Main function
async function main() {
  try {
    // Read root env.example
    console.log('Reading root env.example...');
    const rootEnvContent = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
    const rootEnvVars = parseEnvFile(rootEnvContent);
    
    // Read server env.example
    console.log('Reading server/env.example...');
    const serverEnvContent = fs.readFileSync(path.join(__dirname, 'server', 'env.example'), 'utf8');
    const serverEnvVars = parseEnvFile(serverEnvContent);
    
    // Merge environment variables (server vars take precedence)
    const mergedEnvVars = { ...rootEnvVars, ...serverEnvVars };
    
    console.log('\n=== Environment Variables to Add to Vercel ===');
    console.log('Run the following commands to add each variable:');
    console.log('Replace the example values with your actual production values.\n');
    
    for (const [key, value] of Object.entries(mergedEnvVars)) {
      console.log(`npx vercel env add ${key}`);
      console.log(`# Example value from env.example: ${value}`);
      console.log('');
    }
    
    console.log('\nTo add a variable in one command (not recommended for secrets):');
    console.log('npx vercel env add VARIABLE_NAME production --value=YOUR_VALUE');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 