import assert from 'node:assert/strict';
import test from 'node:test';

import { formatQuickBuildText, parseQuickBuild, parseStepLine, routineToText } from '../www/js/parser.js';

test('parseStepLine extracts detail and pulse tags', () => {
  assert.deepEqual(parseStepLine('Bridge | lift and lower'), {
    name: 'Bridge',
    detail: 'lift and lower',
    emoji: '🍑',
    tags: [],
  });

  const pulse = parseStepLine('- Pulses [pulse]');
  assert.equal(pulse.name, 'Pulses');
  assert.deepEqual(pulse.tags, ['pulse']);
});

test('parseQuickBuild creates title, blocks, transition, equipment, and pulse metadata', () => {
  const parsed = parseQuickBuild(`# Friday Yoga Sculpt

## Warm-up
Breath work
Cat/Cow

## Ball Core
Bridge | lift and lower
Pulses [pulse]

--- Grab weights

## Standing Legs
Lunges
Warrior 3`, 'pilates');

  assert.equal(parsed.name, 'Friday Yoga Sculpt');
  assert.equal(parsed.discipline, 'yoga');
  assert.equal(parsed.blocks.length, 4);
  assert.equal(parsed.blocks[1].title, 'Ball Core');
  assert.deepEqual(parsed.blocks[1].equipment, ['ball']);
  assert.equal(parsed.blocks[1].steps[0].detail, 'lift and lower');
  assert.deepEqual(parsed.blocks[1].steps[1].tags, ['pulse']);
  assert.equal(parsed.blocks[2].type, 'transition');
  assert.equal(parsed.blocks[2].title, 'Grab weights');
});

test('parseQuickBuild accepts Apple Notes style sections and transitions', () => {
  const parsed = parseQuickBuild(`Tuesday Pilates
Warm-up
Breath work
Cat/Cow

Core with ball
Bridge
Pulses

Grab weights

Standing glute
Lunges
Warrior 3`, 'pilates');

  assert.equal(parsed.name, 'Tuesday Pilates');
  assert.equal(parsed.discipline, 'pilates');
  assert.equal(parsed.blocks.length, 4);
  assert.equal(parsed.blocks[0].title, 'Warm-up');
  assert.equal(parsed.blocks[0].steps.map(step => step.name).join('|'), 'Breath work|Cat/Cow');
  assert.equal(parsed.blocks[1].title, 'Core with ball');
  assert.deepEqual(parsed.blocks[1].equipment, ['ball']);
  assert.deepEqual(parsed.blocks[1].steps[1].tags, ['pulse']);
  assert.equal(parsed.blocks[2].type, 'transition');
  assert.equal(parsed.blocks[2].title, 'Grab weights');
  assert.equal(parsed.blocks[3].title, 'Standing glute');
});

test('formatQuickBuildText translates Apple Notes into canonical class format', () => {
  const formatted = formatQuickBuildText(`Thursday Yoga
Opening:
Child's Pose
Cat Cow

Standing Flow
Sun A
Warrior 3

Switch to floor

Cool Down
Happy Baby`, 'yoga');

  assert.match(formatted, /^# Thursday Yoga/);
  assert.match(formatted, /## Opening/);
  assert.match(formatted, /- Child's Pose/);
  assert.match(formatted, /--- Switch to floor/);
  assert.match(formatted, /## Cool Down/);
});

test('routineToText exports a plan that can round trip through quick build conventions', () => {
  const text = routineToText({
    routineName: 'Mini Flow',
    blocks: [
      {
        type: 'block',
        title: 'Ball Core',
        equipment: ['ball'],
        steps: [{ name: 'Bridge', detail: 'lift and lower', emoji: '🍑', tags: [] }],
      },
      { type: 'transition', title: 'Grab weights', emoji: '🔀', equipment: [], steps: [] },
    ],
  });

  assert.match(text, /^# Mini Flow/);
  assert.match(text, /## Ball Core/);
  assert.match(text, /@equipment: ball/);
  assert.match(text, /- Bridge \| lift and lower/);
  assert.match(text, /--- Grab weights/);
});

test('routine text preserves no-detail step names that contain separators', () => {
  const text = routineToText({
    routineName: 'Separator Names',
    blocks: [
      {
        type: 'block',
        title: 'Arms',
        equipment: [],
        steps: [
          { name: 'Full Range — Arms Extended', detail: '', emoji: '💪', tags: [] },
          { name: 'Press - Hold', detail: 'with weights', emoji: '💪', tags: [] },
          { name: 'Curl :: Hold', detail: '', emoji: '💪', tags: [] },
        ],
      },
    ],
  });

  const parsed = parseQuickBuild(text, 'pilates');

  assert.equal(parsed.blocks[0].steps[0].name, 'Full Range — Arms Extended');
  assert.equal(parsed.blocks[0].steps[0].detail, '');
  assert.equal(parsed.blocks[0].steps[1].name, 'Press - Hold');
  assert.equal(parsed.blocks[0].steps[1].detail, 'with weights');
  assert.equal(parsed.blocks[0].steps[2].name, 'Curl :: Hold');
  assert.equal(parsed.blocks[0].steps[2].detail, '');
});
