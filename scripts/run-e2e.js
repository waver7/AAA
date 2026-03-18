#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

try {
  require.resolve('@playwright/test');
} catch {
  console.log('⚠️ @playwright/test is not installed. E2E tests are optional. Install with: npm i @playwright/test playwright');
  process.exit(0);
}

const result = spawnSync('npx', ['playwright', 'test'], { stdio: 'inherit', shell: true });
process.exit(result.status ?? 1);
