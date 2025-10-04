const fs = require('fs');
const path = require('path');

// Get ngrok URL from command line argument
const ngrokUrl = process.argv[2];

if (!ngrokUrl) {
  console.log('Usage: node configure-ngrok.js <ngrok-backend-url>');
  console.log('Example: node configure-ngrok.js https://abc123.ngrok.io');
  process.exit(1);
}

// Remove trailing slash if present
const cleanUrl = ngrokUrl.replace(/\/$/, '');

try {
  // Update frontend .env.local
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  const frontendEnv = `NEXT_PUBLIC_API_URL=${cleanUrl}/api\n`;
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Updated frontend/.env.local');

  // Update backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  backendEnv = backendEnv.replace(/FRONTEND_URL=.*/, 'FRONTEND_URL=http://localhost:3000');
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Updated backend/.env');

  console.log('\n🚀 Configuration complete!');
  console.log(`Backend ngrok URL: ${cleanUrl}`);
  console.log('Frontend: http://localhost:3000');
  console.log('\nRestart your servers to apply changes.');

} catch (error) {
  console.error('❌ Error updating configuration:', error.message);
}