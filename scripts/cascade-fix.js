#!/usr/bin/env node
/**
 * SPDX-License-Identifier: MIT
 *
 * Auto refactor script for Windsurf Cascade integration.
 * Supports input from Biome, TypeScript, or custom static analyzers.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const args = process.argv.slice(2);
const options = {
  apply: args.includes('--apply'),
  dry: args.includes('--dry'),
  input: getArgValue('--from') || 'typecheck.json', // default
};

// Helper to get CLI argument value
function getArgValue(flag) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : null;
}

// Helper: check if cascade CLI is available
function checkCascade() {
  try {
    const result = spawnSync('cascade', ['--version'], { encoding: 'utf-8' });
    return result.status === 0;
  } catch {
    return false;
  }
}

// Helper: run Cascade prompt on code block
function runCascadePrompt({ filePath, line, message }) {
  const prompt = `Refactor the following code to fix this issue:\n\n// ${message}\n`;

  const fileContent = fs.readFileSync(filePath, 'utf-8').split('\n');
  const context = fileContent.slice(Math.max(0, line - 5), line + 5).join('\n');

  const fullPrompt = `${prompt}\n\`\`\`ts\n${context}\n\`\`\``;

  const result = spawnSync(
    'cascade',
    ['--prompt', fullPrompt, '--file', filePath, '--line', String(line)],
    { encoding: 'utf-8' }
  );

  return result.stdout;
}

// Main logic
function run() {
  if (!fs.existsSync(options.input)) {
    console.error(`❌ Cannot find file: ${options.input}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(options.input, 'utf-8');
  let issues = [];

  try {
    issues = JSON.parse(raw);
  } catch {
    console.error('❌ Invalid JSON input file.');
    process.exit(1);
  }

  const applicable = issues.filter((i) => i.file && i.message && i.line);
  if (applicable.length === 0) {
    console.log('✅ No fixable issues found.');
    return;
  }

  const cascadeAvailable = checkCascade();
  if (!cascadeAvailable) {
    console.warn('⚠️ Cascade CLI not found. Skipping auto fix.');
  }

  for (const issue of applicable) {
    const filePath = path.resolve(issue.file);
    const message = issue.message;
    const line = issue.line;

    console.log(`🔧 Refactoring ${filePath}:${line} - ${message}`);

    if (options.dry || !options.apply || !cascadeAvailable) {
      console.log(`📝 Suggested fix: [${message}]`);
      continue;
    }

    const result = runCascadePrompt({ filePath, line, message });
    console.log(result.trim());
  }

  console.log(`✨ Done. ${options.apply ? 'Fixes applied.' : 'Dry run.'}`);
}

run();
