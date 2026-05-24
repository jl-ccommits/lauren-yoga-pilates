import assert from 'node:assert/strict';
import test from 'node:test';
import { TEMPLATES } from '../www/js/templates.js';

test('starter templates use teacher-friendly names and descriptions', () => {
  const names = TEMPLATES.map(template => template.name);
  assert.deepEqual(names, [
    'Mat Pilates - Core + Glutes',
    'Mat Pilates - Full Body',
    'Yoga Sculpt - Ball + Weights',
    'Yoga Sculpt - Flow + Strength',
    'Blank Pilates Class',
    'Blank Yoga Class',
  ]);

  TEMPLATES.forEach(template => {
    assert.equal(template.name.includes(' 2'), false, template.name);
    assert.equal(typeof template.description, 'string', template.name);
    assert.ok(template.description.length > 20, template.name);
    assert.equal(Array.isArray(template.data().blocks), true, template.name);
  });
});
