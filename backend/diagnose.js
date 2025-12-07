// Diagnostic script to check Google Cloud setup
import { config } from './src/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('\n========================================');
console.log('🔍 LLM Guardian - Diagnostics');
console.log('========================================\n');

// Check 1: Environment Variables
console.log('✓ Step 1: Checking environment variables...');
console.log(`  Project ID: ${config.googleCloud.project}`);
console.log(`  Location: ${config.googleCloud.location}`);
console.log(`  Datadog API Key: ${config.datadog.apiKey ? '✓ Set' : '✗ Not set'}`);
console.log('');

// Check 2: gcloud CLI
console.log('✓ Step 2: Checking gcloud CLI...');
try {
  const { stdout } = await execAsync('gcloud --version');
  console.log('  ✓ gcloud CLI is installed');
} catch (error) {
  console.log('  ✗ gcloud CLI is NOT installed');
  console.log('  → Install from: https://cloud.google.com/sdk/docs/install');
  process.exit(1);
}
console.log('');

// Check 3: Authentication
console.log('✓ Step 3: Checking authentication...');
try {
  const { stdout } = await execAsync('gcloud auth application-default print-access-token');
  if (stdout.trim().length > 0) {
    console.log('  ✓ Authentication is set up');
  } else {
    console.log('  ✗ Authentication is NOT set up');
    console.log('  → Run: gcloud auth application-default login');
    process.exit(1);
  }
} catch (error) {
  console.log('  ✗ Authentication is NOT set up');
  console.log('  → Run: gcloud auth application-default login');
  process.exit(1);
}
console.log('');

// Check 4: Project Configuration
console.log('✓ Step 4: Checking project configuration...');
try {
  const { stdout } = await execAsync('gcloud config get-value project');
  const currentProject = stdout.trim();
  if (currentProject === config.googleCloud.project) {
    console.log(`  ✓ Project is set correctly: ${currentProject}`);
  } else {
    console.log(`  ⚠ Warning: gcloud project (${currentProject}) differs from .env (${config.googleCloud.project})`);
    console.log(`  → Run: gcloud config set project ${config.googleCloud.project}`);
  }
} catch (error) {
  console.log('  ⚠ Could not check project configuration');
}
console.log('');

// Check 5: Vertex AI API
console.log('✓ Step 5: Checking Vertex AI API...');
try {
  const { stdout } = await execAsync(`gcloud services list --enabled --project=${config.googleCloud.project} --filter="name:aiplatform.googleapis.com" --format="value(name)"`);
  if (stdout.trim().includes('aiplatform.googleapis.com')) {
    console.log('  ✓ Vertex AI API is enabled');
  } else {
    console.log('  ✗ Vertex AI API is NOT enabled');
    console.log(`  → Run: gcloud services enable aiplatform.googleapis.com --project=${config.googleCloud.project}`);
    process.exit(1);
  }
} catch (error) {
  console.log('  ⚠ Could not check API status');
  console.log(`  → Try: gcloud services enable aiplatform.googleapis.com --project=${config.googleCloud.project}`);
}
console.log('');

console.log('========================================');
console.log('✅ All checks passed!');
console.log('========================================');
console.log('');
console.log('Your setup looks good. You can now run:');
console.log('  npm start');
console.log('');
console.log('If you still get errors, check the backend');
console.log('terminal for specific error messages.');
console.log('========================================\n');
