import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const paths = [
  'node_modules/@capacitor/ios',
  'ios/App/Pods',
  'build/DerivedData',
];

const existingPaths = paths.filter(path => existsSync(path));

if (!existingPaths.length) {
  console.log('No iOS dependency paths found for xattr cleanup.');
  process.exit(0);
}

const result = spawnSync('xattr', ['-cr', ...existingPaths], { stdio: 'inherit' });

if (result.status !== 0) {
  console.error('Failed to clear iOS extended attributes.');
  process.exit(result.status ?? 1);
}

console.log(`Cleared iOS extended attributes from ${existingPaths.join(', ')}`);
