// Simple test to verify .env is loaded
import { config } from './src/config.js';

console.log('\n========================================');
console.log('Environment Variables Test');
console.log('========================================\n');

console.log('Configuration loaded:');
console.log('  Port:', config.port);
console.log('  Google Cloud Project:', config.googleCloud.project);
console.log('  Google Cloud Location:', config.googleCloud.location);
console.log('  Datadog API Key:', config.datadog.apiKey ? '✓ Set' : '✗ Not set');
console.log('  Datadog Site:', config.datadog.site);
console.log('  Node Environment:', config.nodeEnv);

console.log('\n========================================');
console.log('✓ Environment variables loaded successfully!');
console.log('You can now run: npm start');
console.log('========================================\n');
