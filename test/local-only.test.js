import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const runtimeRoots = ['www/index.html', 'www/js'];
const forbidden = [
  /\bfirebase\b/i,
  /\bsupabase\b/i,
  /\boauth\b/i,
  /\bauth\b/i,
  /\bsign\s*in\b/i,
  /\bsign\s*up\b/i,
  /\blog\s*in\b/i,
  /\bpassword\b/i,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\baxios\b/,
  /https?:\/\//,
];

function runtimeFiles(path) {
  const stat = statSync(path);
  if (stat.isFile()) return [path];
  return readdirSync(path).flatMap(entry => runtimeFiles(join(path, entry)));
}

test('runtime app stays local-only with no login or network dependencies', () => {
  const files = runtimeRoots.flatMap(runtimeFiles).filter(file => /\.(html|js)$/.test(file));
  const violations = [];

  files.forEach(file => {
    const content = readFileSync(file, 'utf8');
    forbidden.forEach(pattern => {
      if (pattern.test(content)) violations.push(`${file}: ${pattern}`);
    });
  });

  assert.deepEqual(violations, []);
});

test('entrypoint blocks network connections with CSP', () => {
  const html = readFileSync('www/index.html', 'utf8');
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
});
