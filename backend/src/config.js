import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the backend root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Export configuration
export const config = {
  port: process.env.PORT || 8080,
  googleCloud: {
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
  },
  datadog: {
    apiKey: process.env.DATADOG_API_KEY,
    site: process.env.DATADOG_SITE || 'datadoghq.com'
  },
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate required environment variables (only Google Cloud is required)
const requiredVars = {
  'GOOGLE_CLOUD_PROJECT': config.googleCloud.project
};

const missingVars = Object.entries(requiredVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('\n❌ ERROR: Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Please check your backend/.env file\n');
  process.exit(1);
}

console.log('✓ Environment variables loaded successfully');
console.log(`✓ Project: ${config.googleCloud.project}`);
console.log(`✓ Location: ${config.googleCloud.location}`);

// Optional: Datadog integration
if (config.datadog.apiKey) {
  console.log('✓ Datadog integration: enabled');
} else {
  console.log('⚠ Datadog integration: disabled (API key not configured)');
}
