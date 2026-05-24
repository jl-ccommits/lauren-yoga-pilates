import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';

import { parseQuickBuild } from '../www/js/parser.js';
import {
  S,
  duplicateRoutineFromLibrary,
  exportBackup,
  getRoutines,
  importBackup,
  loadRoutineFromLibrary,
  resetRoutine,
  saveRoutineToLibrary,
} from '../www/js/store.js';
import { suggestRoutineCompletion, suggestStepsForBlock } from '../www/js/suggestions.js';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  clear() {
    this.map.clear();
  }
}

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
  resetRoutine({ name: 'Empty', discipline: 'pilates', blocks: [] }, 'Empty', 'pilates');
});

test('teacher can build from notes, finish, save, duplicate, and preserve original', () => {
  S.planningPrefs = { duration: '60', focus: 'core', intensity: 'strong', equipment: ['weights'] };

  const parsed = parseQuickBuild(`
# Last Week Strong Core

## Warm-up
Breath + Intention | Settle students and preview core focus
Cat Cow | Mobilize spine

--- Grab weights

## Core Heat with Weights
Dead Bug Press | Hold weights over chest and alternate legs
Weighted Tabletop Pulses [pulse] | Small controlled pulses
`, 'pilates');

  resetRoutine({ blocks: parsed.blocks }, parsed.name, parsed.discipline);
  S.planningPrefs = { duration: '60', focus: 'core', intensity: 'strong', equipment: ['weights'] };

  const completion = suggestRoutineCompletion(S);
  assert.ok(completion.length >= 2);
  assert.ok(completion.some(block => /cool|stretch/i.test(block.title)));
  S.blocks.push(...completion);

  const coreBlock = S.blocks.find(block => /core/i.test(block.title));
  const stepSuggestions = suggestStepsForBlock(S, coreBlock, 4);
  assert.ok(stepSuggestions.length > 0);
  assert.ok(stepSuggestions.every(step => !coreBlock.steps.some(existing => existing.name === step.name)));

  const originalFirstStep = coreBlock.steps[0].name;
  const replacement = stepSuggestions[0];
  coreBlock.steps[0] = {
    name: replacement.name,
    detail: replacement.detail,
    emoji: replacement.emoji,
    tags: [],
  };
  assert.notEqual(coreBlock.steps[0].name, originalFirstStep);

  const originalId = saveRoutineToLibrary('Last Week Strong Core');
  assert.equal(getRoutines().length, 1);
  assert.deepEqual(getRoutines()[0].planningPrefs, S.planningPrefs);

  assert.equal(duplicateRoutineFromLibrary(originalId), true);
  assert.equal(S.routineName, 'Last Week Strong Core Copy');
  assert.equal(S.routineId, null);
  assert.deepEqual(S.planningPrefs, { duration: '60', focus: 'core', intensity: 'strong', equipment: ['weights'] });

  S.blocks[0].steps.push({
    name: 'Teacher Note: Slower Breath Count',
    detail: 'Use this if the room needs a calmer start.',
    emoji: '🫁',
    tags: [],
  });
  const copyId = saveRoutineToLibrary(S.routineName);

  assert.equal(getRoutines().length, 2);
  assert.equal(loadRoutineFromLibrary(originalId), true);
  assert.equal(S.routineName, 'Last Week Strong Core');
  assert.equal(S.blocks[0].steps.some(step => step.name === 'Teacher Note: Slower Breath Count'), false);

  assert.equal(loadRoutineFromLibrary(copyId), true);
  assert.equal(S.routineName, 'Last Week Strong Core Copy');
  assert.equal(S.blocks[0].steps.some(step => step.name === 'Teacher Note: Slower Breath Count'), true);
});

test('multiple teachers can save, duplicate, modify, and reload old routines safely', () => {
  const plans = [
    {
      name: 'Yoga Sculpt Balance',
      discipline: 'yoga',
      prefs: { duration: '45', focus: 'balance', intensity: 'steady', equipment: ['weights'] },
      notes: `
# Yoga Sculpt Balance

## Warm-up
Sun A | Three slow rounds

## Standing Flow
Warrior Two | Hold and breathe
Chair Pulses [pulse] | Strong legs
`,
      copyNote: 'Add eagle balance option',
    },
    {
      name: 'Pilates Glute Band',
      discipline: 'pilates',
      prefs: { duration: '30', focus: 'glute', intensity: 'strong', equipment: ['band'] },
      notes: `
# Pilates Glute Band

## Warm-up
Pelvic Tilts | Find neutral spine

## Glute Block
Bridge with Band | Press knees wide
Bridge Pulses [pulse] | Stay lifted
`,
      copyNote: 'Add clamshell finisher',
    },
  ];

  const ids = [];
  const copyIds = [];

  plans.forEach(plan => {
    const parsed = parseQuickBuild(plan.notes, plan.discipline);
    resetRoutine({ blocks: parsed.blocks }, parsed.name, parsed.discipline);
    S.planningPrefs = plan.prefs;
    S.blocks.push(...suggestRoutineCompletion(S));

    const originalId = saveRoutineToLibrary(plan.name);
    ids.push(originalId);

    assert.equal(duplicateRoutineFromLibrary(originalId), true);
    assert.equal(S.routineName, `${plan.name} Copy`);
    assert.deepEqual(S.planningPrefs, plan.prefs);
    S.blocks[0].steps.push({
      name: plan.copyNote,
      detail: 'Teacher-specific modification for the next class.',
      emoji: '📝',
      tags: [],
    });
    copyIds.push(saveRoutineToLibrary(S.routineName));
  });

  const routines = getRoutines();
  assert.equal(routines.length, 4);
  assert.equal(new Set(routines.map(routine => routine.id)).size, 4);

  plans.forEach((plan, index) => {
    assert.equal(loadRoutineFromLibrary(ids[index]), true);
    assert.equal(S.routineName, plan.name);
    assert.equal(S.blocks[0].steps.some(step => step.name === plan.copyNote), false);
    assert.deepEqual(S.planningPrefs, plan.prefs);

    assert.equal(loadRoutineFromLibrary(copyIds[index]), true);
    assert.equal(S.routineName, `${plan.name} Copy`);
    assert.equal(S.blocks[0].steps.some(step => step.name === plan.copyNote), true);
    assert.deepEqual(S.planningPrefs, plan.prefs);
  });

  const backup = exportBackup();
  localStorage.clear();
  const result = importBackup(backup);

  assert.equal(result.routines, 4);
  assert.equal(getRoutines().length, 4);
  plans.forEach((plan, index) => {
    assert.equal(loadRoutineFromLibrary(ids[index]), true);
    assert.equal(S.routineName, plan.name);
    assert.deepEqual(S.planningPrefs, plan.prefs);
  });
});
