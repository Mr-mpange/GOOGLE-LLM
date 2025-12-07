import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

console.log('========================================');
console.log('Environment Variables Check');
console.log('========================================\n');

const requiredVars = [
  'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_CLOUD_LOCATION',
  'DATADOG_API_KEY',
  'PORT'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✓ ${varName}: ${value}`);
  } else {
    console.log(`✗ ${varName}: NOT SET`);
    allGood = false;
  }
});

console.log('\n========================================');

if (allGood) {
  console.log('✓ All required environment variables are set!');
  console.log('You can now run: npm start');
} else {
  console.log('✗ Some environment variables are missing!');
  console.log('Please check your .env file in the backend folder.');
}

console.log('========================================\n');

process.exit(allGood ? 0 : 1);
