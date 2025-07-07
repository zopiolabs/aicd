#!/usr/bin/env node
/**
 * SPDX-License-Identifier: MIT
 *
 * Proactive performance-based refactor tool using Cascade CLI.
 * Scans entire repo by default, or limited via --include=path
 */

const fs = require('node:fs');
const path = require('node:path');
const glob = require('fast-glob');
const { spawnSync } = require('node:child_process');

// ----------------------------
// CLI Options
// ----------------------------
const args = process.argv.slice(2);
const targetDir = getArgValue('--include') || '.'; // scan entire repo by default
const strategy = getArgValue('--strategy') || 'performance';
const shouldApply = args.includes('--apply');
const shouldDry = args.includes('--dry');

function getArgValue(flag) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}

function checkCascade() {
  try {
    const result = spawnSync('cascade', ['--version'], { encoding: 'utf-8' });
    return result.status === 0;
  } catch {
    return false;
  }
}

// ----------------------------
// Pattern matchers (basic)
// ----------------------------
function findSuspiciousLines(content) {
  const lines = content.split('\n');
  const matches = [];

  lines.forEach((line, i) => {
    if (line.includes('.map(') && (line.includes('.filter(') || line.includes('.reduce('))) {
      matches.push({ line: i + 1, content: line.trim() });
    }

    if (line.match(/for\s*\(\s*let\s+[a-z]+\s*=\s*0;/)) {
      matches.push({ line: i + 1, content: line.trim() });
    }
  });

  return matches;
}

function runCascade({ filePath, line, codeBlock }) {
  const prompt = `Refactor the following code to optimize runtime performance.
Avoid redundant array operations or nested loops.
Ensure the logic remains the same and behavior is preserved.

\`\`\`ts
${codeBlock}
\`\`\`
`;

  const result = spawnSync(
    'cascade',
    ['--prompt', prompt, '--file', filePath, '--line', String(line)],
    { encoding: 'utf-8' }
  );

  return result.stdout;
}

// ----------------------------
// Main
// ----------------------------
async function run() {
  const cascadeAvailable = checkCascade();
  if (!cascadeAvailable) {
    console.error('❌ Cascade CLI not found.');
    process.exit(1);
  }

  const files = await glob([`${targetDir}/**/*.ts`, `${targetDir}/**/*.tsx`], {
    ignore: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/.git/**',
      '**/build/**',
      '**/out/**',
      '**/coverage/**',
    ],
  });

  for (const file of files) {
    const fullPath = path.resolve(file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const suspicious = findSuspiciousLines(content);

    if (suspicious.length === 0) continue;

    console.log(`🔍 Found ${suspicious.length} performance candidate(s) in ${file}`);

    for (const match of suspicious) {
      const { line, content: codeLine } = match;
      console.log(`⚡ Refactoring ${file}:${line}`);

      if (shouldDry) {
        console.log(`📝 Suspicious code: ${codeLine}`);
        continue;
      }

      if (shouldApply) {
        const result = runCascade({
          filePath: fullPath,
          line,
          codeBlock: codeLine,
        });

        console.log(result.trim());
      }
    }
  }

  console.log('✅ Cascade performance refactor complete.');
}

run();
