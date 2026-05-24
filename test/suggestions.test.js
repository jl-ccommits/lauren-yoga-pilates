import assert from 'node:assert/strict';
import test from 'node:test';

import {
  STEP_LIBRARY,
  getSuggestionLibraryStats,
  inferBlockCategory,
  suggestRoutineCompletion,
  suggestStepsForBlock,
} from '../www/js/suggestions.js';

test('suggestion library has 300 simple local exercises across both disciplines', () => {
  const stats = getSuggestionLibraryStats();
  const names = new Set(STEP_LIBRARY.map(step => step.name));

  assert.equal(stats.total, 300);
  assert.equal(names.size, 300);
  assert.equal(stats.categories, 9);
  assert.ok(stats.pilatesCompatible >= 230);
  assert.ok(stats.yogaCompatible >= 170);
  assert.ok(stats.shared >= 120);
  assert.equal(
    STEP_LIBRARY.every(step =>
      step.name
      && step.detail
      && step.detail.length <= 140
      && Array.isArray(step.equipment)
      && step.disciplines.length > 0,
    ),
    true,
  );
});

test('inferBlockCategory recognizes common class sections', () => {
  assert.equal(inferBlockCategory({ title: 'Warm-up', steps: [] }), 'warmup');
  assert.equal(inferBlockCategory({ title: 'Bridge Series', steps: [] }), 'bridge');
  assert.equal(inferBlockCategory({ title: 'Cool Down Stretch', steps: [] }), 'cooldown');
});

test('suggestStepsForBlock favors matching category and avoids duplicates', () => {
  const block = {
    type: 'block',
    title: 'Bridge Series',
    equipment: ['weights'],
    steps: [{ name: 'Bridge Full Range', detail: '', emoji: '🍑', tags: [] }],
  };
  const state = { discipline: 'pilates', blocks: [block] };
  const suggestions = suggestStepsForBlock(state, block, 3);

  assert.equal(suggestions[0].name, 'Skull Crushers in Bridge');
  assert.equal(suggestions.some(step => step.name === 'Bridge Full Range'), false);
  assert.equal(suggestions.every(step => step.name && step.detail && step.emoji), true);
});

test('suggestRoutineCompletion returns only missing routine parts first', () => {
  const state = {
    discipline: 'pilates',
    blocks: [
      { type: 'block', title: 'Warm-up', equipment: [], steps: [] },
      { type: 'block', title: 'Core Primer', equipment: ['ball'], steps: [] },
      { type: 'block', title: 'Bridge Series', equipment: ['weights'], steps: [] },
      { type: 'block', title: 'Tabletop Glute', equipment: ['band'], steps: [] },
      { type: 'block', title: 'Side Body', equipment: [], steps: [] },
    ],
  };

  const suggestions = suggestRoutineCompletion(state, 3);

  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].title, 'Stretch');
  assert.equal(suggestions[0].steps.length > 0, true);
});

test('suggestRoutineCompletion returns no blocks when the routine arc is complete', () => {
  const state = {
    discipline: 'yoga',
    blocks: [
      { type: 'block', title: 'Warm-up', equipment: [], steps: [] },
      { type: 'block', title: 'Standing Flow', equipment: [], steps: [] },
      { type: 'block', title: 'Balance Flow', equipment: [], steps: [] },
      { type: 'block', title: 'Core Intermission', equipment: [], steps: [] },
      { type: 'block', title: 'Cool Down', equipment: [], steps: [] },
    ],
  };

  assert.deepEqual(suggestRoutineCompletion(state, 3), []);
});

test('planning goals shape routine completion suggestions', () => {
  const state = {
    discipline: 'pilates',
    planningPrefs: { duration: '30', focus: 'glute', intensity: 'strong', equipment: ['band'] },
    blocks: [
      { type: 'block', title: 'Warm-up', equipment: [], steps: [] },
      { type: 'block', title: 'Core Primer', equipment: ['ball'], steps: [] },
    ],
  };

  const suggestions = suggestRoutineCompletion(state);

  assert.equal(suggestions.length, 2);
  assert.equal(suggestions[0].title, 'Tabletop Glute');
});

test('planning equipment preference influences step suggestions', () => {
  const block = {
    type: 'block',
    title: 'Arms',
    equipment: [],
    steps: [],
  };
  const state = {
    discipline: 'pilates',
    planningPrefs: { duration: '45', focus: 'arms', intensity: 'strong', equipment: ['weights'] },
    blocks: [block],
  };

  const suggestions = suggestStepsForBlock(state, block, 2);

  assert.equal(suggestions.some(step => step.equipment.includes('weights')), true);
});
