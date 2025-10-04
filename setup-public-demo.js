const fs = require('fs');
const path = require('path');

console.log('🚀 ExpenseFlow Public Demo Setup');
console.log('================================\n');

console.log('For a complete public demo, you need both frontend and backend accessible online.\n');

console.log('📋 OPTION 1: Sequential ngrok (Free Account)');
console.log('1. Start backend tunnel: ngrok http 5001');
console.log('2. Copy backend URL and run: node configure-ngrok.js <backend-url>');
console.log('3. Stop backend tunnel');
console.log('4. Start frontend tunnel: ngrok http 3000');
console.log('5. Share the frontend URL\n');

console.log('📋 OPTION 2: Mixed Setup (Recommended)');
console.log('1. Backend: ngrok http 5001 (public API)');
console.log('2. Frontend: localhost:3000 (for development)');
console.log('3. Share backend API URL for testing\n');

console.log('📋 OPTION 3: Alternative Free Services');
console.log('Backend: ngrok http 5001');
console.log('Frontend: Use Vercel/Netlify for free hosting\n');

console.log('🔧 Quick Setup Commands:');
console.log('Backend tunnel: ngrok http 5001');
console.log('Configure: node configure-ngrok.js <ngrok-url>');
console.log('Frontend tunnel: ngrok http 3000');

// Create a complete configuration script
const configScript = `
const fs = require('fs');
const path = require('path');

const backendUrl = process.argv[2];
const frontendUrl = process.argv[3];

if (!backendUrl) {
  console.log('Usage: node configure-demo.js <backend-url> [frontend-url]');
  console.log('Example: node configure-demo.js https://abc.ngrok.io https://def.ngrok.io');
  process.exit(1);
}

const cleanBackendUrl = backendUrl.replace(/\\/$/, '');
const cleanFrontendUrl = frontendUrl ? frontendUrl.replace(/\\/$/, '') : 'http://localhost:3000';

try {
  // Update frontend .env.local
  const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
  const frontendEnv = \`NEXT_PUBLIC_API_URL=\${cleanBackendUrl}/api\\n\`;
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Updated frontend/.env.local');

  // Update backend .env
  const backendEnvPath = path.join(__dirname, 'backend', '.env');
  let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  backendEnv = backendEnv.replace(/FRONTEND_URL=.*/, \`FRONTEND_URL=\${cleanFrontendUrl}\`);
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Updated backend/.env');

  console.log('\\n🚀 Public Demo Configuration Complete!');
  console.log(\`Backend API: \${cleanBackendUrl}/api\`);
  console.log(\`Frontend: \${cleanFrontendUrl}\`);
  console.log('\\n📱 Share these URLs for public access!');

} catch (error) {
  console.error('❌ Error:', error.message);
}
`;

fs.writeFileSync(path.join(__dirname, 'configure-demo.js'), configScript);
console.log('✅ Created configure-demo.js for complete setup\n');

console.log('🎯 For BOTH frontend and backend public:');
console.log('1. Terminal 1: ngrok http 5001');
console.log('2. Terminal 2: ngrok http 3000');  
console.log('3. Run: node configure-demo.js <backend-url> <frontend-url>');
console.log('4. Restart both servers');
console.log('5. Share frontend URL for complete demo! 🎉');