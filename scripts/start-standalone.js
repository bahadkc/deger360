#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const standaloneServerPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  console.error('\n❌ Error: Standalone server not found.');
  console.error('   The project needs to be built first.\n');
  console.error('   Please run: npm run build\n');
  process.exit(1);
}

// Set environment variables to bind to localhost
// These must be set before requiring the server
process.env.HOSTNAME = 'localhost';
process.env.PORT = process.env.PORT || '3000';
process.env.HOST = 'localhost';

// Start the standalone server
require(standaloneServerPath);

