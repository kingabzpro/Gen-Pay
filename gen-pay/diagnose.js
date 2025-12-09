const fs = require('fs');
const path = require('path');

console.log('=== Gen-Pay Local Development Diagnosis ===\n');

// Check if node_modules exists
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`1. Dependencies installed: ${nodeModulesExists ? '✅ YES' : '❌ NO'}`);

// Check environment variables
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const supabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  const supabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  const tronKey = envContent.includes('TRON_GRID_API_KEY=your_trongrid_api_key');
  
  console.log(`2. Supabase URL configured: ${!supabaseUrl ? '✅ YES' : '❌ NO (placeholder)'}`);
  console.log(`3. Supabase Anon Key configured: ${!supabaseKey ? '✅ YES' : '❌ NO (placeholder)'}`);
  console.log(`4. TronGrid API Key configured: ${!tronKey ? '✅ YES' : '❌ NO (placeholder)'}`);
} else {
  console.log('2. .env.local file exists: ❌ NO');
}

// Check if package.json exists
const packageJsonExists = fs.existsSync(path.join(__dirname, 'package.json'));
console.log(`5. package.json exists: ${packageJsonExists ? '✅ YES' : '❌ NO'}`);

console.log('\n=== Recommended Actions ===');
if (!nodeModulesExists) {
  console.log('• Run: npm install');
}
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_supabase_project_url') || 
      envContent.includes('your_supabase_anon_key') || 
      envContent.includes('your_trongrid_api_key')) {
    console.log('• Configure environment variables in .env.local');
  }
}
console.log('• After fixing issues, run: npm run dev');