#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 ExpenseFlow Setup Script');
console.log('============================\n');

// Check if .env files exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');

if (!fs.existsSync(backendEnvPath)) {
  console.log('⚠️  Backend .env file not found');
  console.log('📝 Please copy backend/.env.example to backend/.env and configure your settings\n');
} else {
  console.log('✅ Backend .env file found\n');
}

if (!fs.existsSync(frontendEnvPath)) {
  console.log('⚠️  Frontend .env.local file not found');
  console.log('📝 Please copy frontend/.env.example to frontend/.env.local and configure your settings\n');
} else {
  console.log('✅ Frontend .env.local file found\n');
}

console.log('📋 Next Steps:');
console.log('1. Ensure MongoDB is running');
console.log('2. Install dependencies: npm run install:all');
console.log('3. Start development: npm run dev');
console.log('4. Open http://localhost:3000 in your browser\n');

console.log('🔗 Useful Links:');
console.log('- MongoDB: https://www.mongodb.com/try/download/community');
console.log('- ExchangeRate API: https://exchangerate-api.com/');
console.log('- Documentation: README.md\n');

console.log('Happy coding! 🎉');