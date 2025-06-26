#!/usr/bin/env node

/**
 * AICD CLI - Command Line Interface for AI-powered continuous deployment
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory of this script
const __dirname = dirname(fileURLToPath(import.meta.url));

// Read version from package.json
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`AICD CLI v${version}`);
console.log('AI-powered continuous deployment platform');

// Simple CLI implementation for testing the release workflow
const args = process.argv.slice(2);

// Check for version flags first
if (args.includes('--version') || args.includes('-v')) {
  console.log(version);
  process.exit(0);
}

if (args.length === 0) {
  console.log('\nUsage: aicd [command] [options]');
  console.log('\nCommands:');
  console.log('  version    Show version information');
  console.log('  help       Show this help message');
  console.log('\nOptions:');
  console.log('  --version, -v    Display version number');
  process.exit(0);
}

const command = args[0];

switch (command) {
  case 'version':
    console.log(`\nVersion: ${version}`);
    break;
  case 'help':
    console.log('\nUsage: aicd [command] [options]');
    console.log('\nCommands:');
    console.log('  version    Show version information');
    console.log('  help       Show this help message');
    console.log('\nOptions:');
    console.log('  --version, -v    Display version number');
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.log('Run "aicd help" for usage information');
    process.exit(1);
}
