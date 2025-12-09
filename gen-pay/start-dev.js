#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Gen-Pay Development Server...\n');

// Check for common issues
const issues = [];

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  issues.push('Dependencies not installed. Run: npm install');
}

// Check environment variables
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your_supabase_project_url')) {
    issues.push('Supabase URL not configured in .env.local');
  }
  if (envContent.includes('your_supabase_anon_key')) {
    issues.push('Supabase Anon Key not configured in .env.local');
  }
  if (envContent.includes('your_trongrid_api_key')) {
    issues.push('TronGrid API Key not configured in .env.local');
  }
} else {
  issues.push('.env.local file not found');
}

// If there are issues, show them and exit
if (issues.length > 0) {
  console.log('❌ Configuration issues found:\n');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
  console.log('\nPlease fix these issues before running the development server.');
  console.log('See LOCAL_SETUP_GUIDE.md for detailed instructions.\n');
  process.exit(1);
}

console.log('✅ Configuration looks good!\n');

// Start the development server
console.log('Starting Next.js development server...');
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devServer.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});

devServer.on('error', (err) => {
  console.error('Failed to start development server:', err);
});