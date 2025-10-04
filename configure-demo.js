
const fs = require('fs');
const path = require('path');

const backendUrl = process.argv[2];
const frontendUrl = process.argv[3];

if (!backendUrl) {
  console.log('Usage: node configure-demo.js <backend-url> [frontend-url]');
  console.log('Example: node configure-demo.js https://abc.ngrok.io https://def.ngrok.io');
  process.exit(1);
}

const cleanBackendUrl = backendUrl.replace(/\/$/, '');
const cleanFrontendUrl = frontendUrl ? frontendUrl.replace(/\/$/, '') : 'http://localhost:3000';

try {
  // Update frontend .env.local
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  const frontendEnv = `NEXT_PUBLIC_API_URL=${cleanBackendUrl}/api\n`;
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Updated frontend/.env.local');

  // Update backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  backendEnv = backendEnv.replace(/FRONTEND_URL=.*/, `FRONTEND_URL=${cleanFrontendUrl}`);
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Updated backend/.env');

  console.log('\n🚀 Public Demo Configuration Complete!');
  console.log(`Backend API: ${cleanBackendUrl}/api`);
  console.log(`Frontend: ${cleanFrontendUrl}`);
  console.log('\n📱 Share these URLs for public access!');

} catch (error) {
  console.error('❌ Error:', error.message);
}
