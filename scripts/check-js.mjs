import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['www/js', 'test', 'scripts'];
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (/\.(js|mjs)$/.test(path)) files.push(path);
  }
}

roots.forEach(walk);

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status);
}

console.log(`Checked ${files.length} JavaScript files`);
