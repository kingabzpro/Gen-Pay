#!/usr/bin/env node

/**
 * GenPay Development Server Launcher
 * Starts the development server and provides testing instructions
 */

const { spawn } = require('child_process');
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, colors.green);
const logError = (message) => log(`❌ ${message}`, colors.red);
const logInfo = (message) => log(`ℹ️  ${message}`, colors.blue);
const logHeader = (message) => log(`\n${message}`, colors.bright + colors.cyan);

function startDevServer() {
  log('🚀 Starting GenPay Development Server', colors.bright + colors.green);
  log('==========================================\n', colors.cyan);

  logInfo('Starting Next.js development server...', colors.blue);

  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  devServer.on('spawn', () => {
    logSuccess('Development server starting...', colors.green);
    logInfo('Server will be available at: http://localhost:3000', colors.blue);
    
    logHeader('🧪 Testing Instructions');
    
    log('Once the server starts, follow these steps:', colors.yellow);
    log('1. Open http://localhost:3000 in your browser', colors.reset);
    log('2. Click "Sign up" to register a new merchant account', colors.reset);
    log('3. Fill in the registration form:', colors.reset);
    log('   • Business Name: Test Business', colors.reset);
    log('   • Email: test@example.com', colors.reset);
    log('   • Password: testpassword123', colors.reset);
    log('4. Submit the form and verify you reach the dashboard', colors.reset);
    log('5. Check that the dashboard loads without infinite loading', colors.reset);
    
    logHeader('🔍 What to Expect');
    
    log('✅ BEFORE (Broken):', colors.red);
    log('   • Infinite "Loading dashboard..." screen', colors.red);
    log('   • AppwriteException errors in console', colors.red);
    log('   • Unable to access authenticated features', colors.red);
    
    log('\n✅ AFTER (Fixed):', colors.green);
    log('   • Smooth registration flow', colors.green);
    log('   • Dashboard loads immediately after login', colors.green);
    log('   • No console errors', colors.green);
    log('   • Full access to wallet and payment features', colors.green);
    
    logHeader('⚠️  If Issues Persist');
    
    log('If you still see loading issues:', colors.yellow);
    log('1. Check browser console for JavaScript errors', colors.reset);
    log('2. Verify Appwrite project is accessible', colors.reset);
    log('3. Clear browser cache and reload', colors.reset);
    log('4. Check network tab for failed API requests', colors.reset);
    
    log('\n🎯 Success Indicators:', colors.cyan);
    log('• Registration completes without errors', colors.reset);
    log('• Dashboard shows merchant data and stats', colors.reset);
    log('• Wallet page loads with balance information', colors.reset);
    log('• No "Loading dashboard..." infinite loop', colors.reset);
    
    log('\n' + '='.repeat(60), colors.cyan);
    log('🚀 Server starting... Check http://localhost:3000', colors.green);
    log('='.repeat(60), colors.cyan);
  });

  devServer.on('error', (error) => {
    logError(`Failed to start development server: ${error.message}`, colors.red);
    process.exit(1);
  });

  devServer.on('exit', (code) => {
    if (code !== 0) {
      logError(`Development server exited with code ${code}`, colors.red);
    }
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    log('\n\n🛑 Shutting down development server...', colors.yellow);
    devServer.kill('SIGINT');
    process.exit(0);
  });
}

// Start the server
startDevServer();
