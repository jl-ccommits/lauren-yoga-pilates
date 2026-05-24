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

test('parseQuickBuild handles Lauren-style Apple Notes with counts, equipment, and blank-line sections', () => {
  const parsed = parseQuickBuild(`Grab ball - ankle weights on
Upper body lifts up with the ball, forward fold roll it back x 16
Upper body stays down lift right leg, ball rolls up and down x 8
Hold up leg and pulse x 8
Lift and lower the left leg x 8
Keep both legs hovering x 8
Ball under legs and scissor x8
Repeat on left x 8

Seated roll up
Hands back lift up legs to teaser, reverse table top repeat x 8
Hold the teaser
Lower and lift the legs x 8
Rotate to the left bend and straighten in teaser x 8
Rotate to the right bend and straighten in teaser x 8
Seated twist right, extend the right leg x 8
Hold and pulse x 8
Twist left and extend right x 8
Hold left and twist x 8
Repeat in on the left

Table top
Ball under left hand, teaser bend in the left hand and lengthen the right leg long x 8
Pulse x 8
Lengthen, bend, thread needle, bend, x 8
Bend arm back on the ball
Tap and lift x 8
Pulse x 8
Circles left and right x 8
Pulse x 8
Hydrants and lift x 8
Pulse x 8

Grab onto ring, hinge lunge press the ring out, drop the knee and twist right, repeat x 8
Hold hinge lunge, shoulder press x 8
Lunge to warrior 3 x 8
Hold warrior pulse x 8
Narrow row x 8
Tricep x 8
One row one tricep x 8
Skaters x 8
obliques full range/pulse x 8
Courtsey to shoulder press x 8

Open wide second
Squat and front press x 8
Pulse x 8
Lunge right, kick out right leg shoulder press x 8
Courtsey with the left and kick out x 8

Pushups
Shoulder taps
Pushups
Toe taps
Pushups
Rocks
Hips dips

Repeat sequences on the left
Ring in the right hand, right left down
Side line, inner thighs only left/right

Back body work

Stretch`, 'pilates');

  assert.equal(parsed.blocks[0].type, 'transition');
  assert.equal(parsed.blocks[0].title, 'Grab ball - ankle weights on');
  assert.deepEqual(parsed.blocks[0].equipment, ['ball', 'weights']);
  assert.equal(parsed.blocks[1].title, 'Ball Core');
  assert.deepEqual(parsed.blocks[1].equipment, ['ball', 'weights']);
  assert.equal(parsed.blocks[1].steps[0].name, 'Upper body lifts up with the ball, forward fold roll it back');
  assert.equal(parsed.blocks[1].steps[0].detail, '16 reps');
  assert.deepEqual(parsed.blocks[1].steps[2].tags, ['pulse']);
  assert.equal(parsed.blocks[2].title, 'Seated roll up');
  assert.equal(parsed.blocks[3].title, 'Table top');
  assert.equal(parsed.blocks[4].title, 'Ring Standing Work');
  assert.deepEqual(parsed.blocks[4].equipment, ['ring']);
  assert.equal(parsed.blocks[4].steps[0].detail, '8 reps');
  assert.equal(parsed.blocks[5].title, 'Open wide second');
  assert.equal(parsed.blocks[6].title, 'Pushups');
  assert.equal(parsed.blocks[7].title, 'Repeat sequences on the left');
  assert.deepEqual(parsed.blocks[7].equipment, ['ring']);
  assert.equal(parsed.blocks.at(-1).title, 'Stretch');
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
