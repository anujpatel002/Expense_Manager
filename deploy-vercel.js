const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Deployment Setup for ExpenseFlow');
console.log('==========================================\n');

// Create deployment scripts
const deployBackend = `#!/bin/bash
echo "Deploying ExpenseFlow Backend to Vercel..."
cd backend
vercel --prod
echo "Backend deployed! Copy the URL for frontend configuration."`;

const deployFrontend = `#!/bin/bash
echo "Deploying ExpenseFlow Frontend to Vercel..."
cd frontend
vercel --prod
echo "Frontend deployed! Share this URL for public access."`;

fs.writeFileSync('deploy-backend.sh', deployBackend);
fs.writeFileSync('deploy-frontend.sh', deployFrontend);

console.log('📋 DEPLOYMENT STEPS:');
console.log('===================\n');

console.log('1. INSTALL VERCEL CLI:');
console.log('   npm install -g vercel\n');

console.log('2. LOGIN TO VERCEL:');
console.log('   vercel login\n');

console.log('3. DEPLOY BACKEND FIRST:');
console.log('   cd backend');
console.log('   vercel --prod');
console.log('   → Copy the backend URL\n');

console.log('4. UPDATE FRONTEND CONFIG:');
console.log('   Update frontend/.env.local:');
console.log('   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api\n');

console.log('5. DEPLOY FRONTEND:');
console.log('   cd frontend');
console.log('   vercel --prod');
console.log('   → Share this URL for public access!\n');

console.log('🔧 ENVIRONMENT VARIABLES:');
console.log('========================\n');

console.log('Backend Vercel Environment Variables:');
console.log('- NODE_ENV=production');
console.log('- MONGO_URI=your_mongodb_atlas_uri');
console.log('- JWT_SECRET=ExpenseFlow_2024_SuperSecure_JWT_Token_Key_9f8e7d6c5b4a3210fedcba0987654321abcdef1234567890');
console.log('- EMAIL_USER=swaminarayan2181@gmail.com');
console.log('- EMAIL_PASS=mkcqefgnceobnmej');
console.log('- FRONTEND_URL=https://your-frontend-url.vercel.app\n');

console.log('Frontend Vercel Environment Variables:');
console.log('- NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api\n');

console.log('⚠️  IMPORTANT NOTES:');
console.log('==================');
console.log('1. Use MongoDB Atlas (not local MongoDB)');
console.log('2. Update CORS settings in backend for Vercel URLs');
console.log('3. File uploads need Vercel-compatible storage');
console.log('4. Deploy backend first, then frontend');
console.log('5. Update environment variables in Vercel dashboard\n');

console.log('✅ Setup files created:');
console.log('- vercel.json (root)');
console.log('- backend/vercel.json');
console.log('- frontend/next.config.js');
console.log('- deploy-backend.sh');
console.log('- deploy-frontend.sh\n');

console.log('🎯 Quick Deploy Commands:');
console.log('bash deploy-backend.sh');
console.log('bash deploy-frontend.sh');