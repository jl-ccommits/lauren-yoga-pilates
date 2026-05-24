import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

function filesUnder(dir) {
  const stat = statSync(dir);
  if (stat.isFile()) return [dir];
  return readdirSync(dir).flatMap(entry => filesUnder(join(dir, entry)));
}

function runtimeTextFiles() {
  return ['www/index.html', ...filesUnder('www/js')]
    .filter(file => /\.(html|js)$/.test(file));
}

function actionHandlerNames() {
  const source = readFileSync('www/js/actions.js', 'utf8');
  return new Set([...source.matchAll(/^\s*'([^']+)':/gm)].map(match => match[1]));
}

const EXPECTED_ACTION_HANDLERS = [
  'add-block',
  'add-step',
  'add-suggested-blocks',
  'add-suggested-step',
  'choose-import-backup',
  'close-library',
  'close-modal',
  'close-sheet',
  'confirm-quick-add',
  'confirm-quick-build',
  'confirm-save',
  'copy-plan',
  'delete-routine',
  'delete-schedule-class',
  'dismiss-tour',
  'duplicate-routine',
  'export-backup',
  'finish-routine',
  'format-quick-build-notes',
  'load-routine',
  'load-routines',
  'load-schedule',
  'load-template',
  'new-template',
  'open-block-sheet',
  'open-planning-goals',
  'open-quick-add',
  'open-quick-build',
  'open-schedule-form',
  'open-step-sheet',
  'planning-eq',
  'replace-suggested-step',
  'reveal-quiz',
  'save-planning-goals',
  'save-routine',
  'save-schedule-class',
  'schedule-mark-ready',
  'schedule-mark-taught',
  'schedule-open-routine',
  'schedule-start-blank',
  'schedule-use-current',
  'schedule-use-recent',
  'sheet-add-another',
  'sheet-color',
  'sheet-delete-block',
  'sheet-delete-step',
  'sheet-duplicate',
  'sheet-emoji',
  'sheet-eq',
  'sheet-move-down',
  'sheet-move-up',
  'sheet-step-emoji',
  'sheet-step-move-down',
  'sheet-step-move-up',
  'sheet-toggle-pulse',
  'show-tour',
  'start-fresh',
  'suggest-quick-build-exercise',
  'suggest-quick-build-routine',
  'suggest-step',
  'suggest-step-swap',
  'switch-discipline',
  'switch-template',
  'toggle-collapse',
  'toggle-edit',
  'toggle-eq',
  'toggle-quiz',
  'toggle-step',
  'toggle-study-mode',
  'toggle-teach-mode',
];

test('literal data-action attributes have action handlers', () => {
  const handlers = actionHandlerNames();
  const actions = new Set();

  runtimeTextFiles().forEach(file => {
    const source = readFileSync(file, 'utf8');
    [...source.matchAll(/data-action="([^"$]+)"/g)].forEach(match => actions.add(match[1]));
  });

  const missing = [...actions].filter(action => !handlers.has(action)).sort();
  assert.deepEqual(missing, []);
});

test('core dynamic actions remain wired', () => {
  const handlers = actionHandlerNames();
  [
    'open-block-sheet',
    'toggle-collapse',
    'open-step-sheet',
    'toggle-step',
    'close-library',
    'confirm-quick-build',
    'confirm-quick-add',
    'add-suggested-step',
    'add-suggested-blocks',
    'toggle-teach-mode',
    'toggle-study-mode',
    'open-planning-goals',
    'duplicate-routine',
    'replace-suggested-step',
  ].forEach(action => assert.equal(handlers.has(action), true, action));
});

test('every action handler is intentionally accounted for', () => {
  const handlers = [...actionHandlerNames()].sort();
  assert.deepEqual(handlers, EXPECTED_ACTION_HANDLERS);
});
