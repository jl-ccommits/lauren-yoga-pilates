export const EQUIPMENT = {
  ball: { label: 'Ball', icon: '🏐' },
  band: { label: 'Band', icon: '🔗' },
  weights: { label: 'Weights', icon: '🏋️' },
};

export const PILATES_DEFAULT = {
  name: 'Mat Pilates - Core + Glutes',
  discipline: 'pilates',
  blocks: [
    {
      type: 'block', id: 'warmup', title: 'Warm-up', emoji: '🧘‍♀️', equipment: [],
      color: 'var(--amber)',
      steps: [
        { name: 'Seated Cross-Legged', detail: 'Hand at heart, hand at belly. Find your breath.', emoji: '🫁', tags: [] },
        { name: 'Seated Cat/Cow', detail: 'Flow through spinal flexion and extension.', emoji: '🐈', tags: [] },
        { name: 'Rolls L & R', detail: 'Gentle lateral rolls, left and right.', emoji: '↔️', tags: [] },
        { name: 'Cat/Cow Again', detail: 'Repeat the seated cat/cow flow.', emoji: '🐈', tags: [] },
        { name: 'Side Arm Stretch & Twist R&L', detail: 'Right and left sides. Open through the chest.', emoji: '🙆‍♀️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block1', title: 'Block 1 · Seated Ball Work + Weights', emoji: '🎯', equipment: ['ball', 'weights'],
      color: 'var(--slate)',
      steps: [
        { name: 'Full Range Curl — Hands at Chest', detail: 'Ball behind back, feet flat on mat. Curl up and down through full range.', emoji: '🫃', tags: [] },
        { name: 'Pulses — Hands at Chest', detail: 'Small pulse at the top of the curl.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Full Range — Arms Extended', detail: 'Same curl, arms extended out in front.', emoji: '💪', tags: [] },
        { name: 'Pulses — Arms Extended', detail: 'Pulse with arms extended.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Twist Right — Full Range', detail: 'Rotate to the right, full range curl.', emoji: '🌀', tags: [] },
        { name: 'Hold Twist + Pulse', detail: 'Hold the right twist, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Add Right Leg Lift + Twist', detail: 'Lift right leg as you twist, full range.', emoji: '🦵', tags: [] },
        { name: 'Pulse — Leg Up, Hold Twist', detail: 'Pulse with right leg up, holding the twist.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Extend Arms & Knee in Twist', detail: 'Extend both arms and knee while holding the twist.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Pulse — Fully Extended', detail: 'Pulse with everything extended.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hold Wide', detail: 'Open wide and hold.', emoji: '🧎‍♀️', tags: [] },
        { name: 'Repeat on Left', detail: 'Start with center work again, then full left side sequence.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'transition', id: 't1', title: 'Transition: Remove ball, grab band', emoji: '🔀', equipment: [], color: 'var(--surface2)', steps: []
    },
    {
      type: 'block', id: 'block2', title: 'Block 2 · Bridge Series — Band + Weights', emoji: '🍑', equipment: ['band', 'weights'],
      color: 'var(--rose)',
      steps: [
        { name: 'Arms Overhead with Weights', detail: 'Extend arms over head holding weights.', emoji: '🏋️‍♀️', tags: [] },
        { name: 'Full Range Bridge', detail: 'Full range bridge pose — lift and lower.', emoji: '🍑', tags: [] },
        { name: '2 Up, 2 Down', detail: '2 counts to lift, 2 counts to lower.', emoji: '⏱️', tags: [] },
        { name: 'Pulses', detail: 'Pulse at the top of the bridge.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Add Skull Crushers', detail: 'Repeat bridge + skull crushers with weights as glutes drop.', emoji: '💀', tags: [] },
        { name: 'Hold Weights High', detail: 'Lock arms extended, hold weights high.', emoji: '🏋️‍♀️', tags: [] },
        { name: 'Knees Push Out on Band — Full Range', detail: 'Press knees out against the band, full range.', emoji: '🦵', tags: [] },
        { name: 'Pulses — Knees Out', detail: 'Pulse knees out against the band.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Tap R + Lift, Tap L + Lift', detail: 'Alternate toe taps with lifts.', emoji: '🦶', tags: [] },
        { name: 'Circles Right', detail: 'Circle the hips to the right.', emoji: '⭕', tags: [] },
        { name: 'Circles Left', detail: 'Circle the hips to the left.', emoji: '⭕', tags: [] },
        { name: 'Full Range Bridge', detail: 'End with full range bridge.', emoji: '🍑', tags: [] },
        { name: 'Pulses', detail: 'Final bridge pulses.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hold at Top', detail: 'Hold the bridge at the top. Squeeze.', emoji: '💎', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block3', title: 'Block 3 · Tabletop Glute — Right', emoji: '🦵', equipment: ['band', 'ball'],
      color: 'var(--teal)',
      steps: [
        { name: 'Setup', detail: 'Ball under left hand. Tabletop position.', emoji: '🤲', tags: [] },
        { name: 'Donkey Kicks — Left Leg', detail: 'Full range donkey kicks, left leg.', emoji: '🦵', tags: [] },
        { name: 'Up an Inch, Down an Inch', detail: 'Tiny controlled range at the top.', emoji: '📐', tags: [] },
        { name: 'Pulses', detail: 'Pulse at the top.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hold Kick + Tricep Pushup', detail: 'Hold the kick, tricep pushup with hand on ball. Full range.', emoji: '💪', tags: [] },
        { name: 'Tricep Pushup Pulses', detail: 'Pulse the tricep pushup.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Extend Arm & Leg', detail: 'Extend opposite arm and leg long.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Hold + Pulse Back In', detail: 'Hold extension, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Rainbows R & L', detail: 'Palm on ball, rainbow the leg right and left.', emoji: '🌈', tags: [] },
        { name: 'Full Range Lift', detail: 'Lift the leg through full range.', emoji: '⬆️', tags: [] },
        { name: 'Pulses', detail: 'Pulse the lift.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Elbow to Knee + Extend', detail: 'Draw elbow to knee, then extend long.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Taps to Corner + Lift', detail: 'Tap to corner of mat, lift. End with hold.', emoji: '💎', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block4', title: 'Block 4 · Standing Glute — Right', emoji: '🏃‍♀️', equipment: ['band', 'ball'],
      color: 'var(--sage)',
      steps: [
        { name: 'Full Range Lunge — Lift & Lower', detail: 'Full range lunge with lift/lower + hinge.', emoji: '🦵', tags: [] },
        { name: 'Single Pulses', detail: 'Pulse in the lunge.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Lift/Lower Front Heel', detail: 'Heel raises in lunge position.', emoji: '🦶', tags: [] },
        { name: 'Warrior 3 — Tap & Lift', detail: 'Hinge to Warrior 3, tap down and lift.', emoji: '🧘‍♀️', tags: [] },
        { name: 'Warrior 3 Pulses', detail: 'Hold Warrior 3, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Back to Lunge — Twists', detail: 'Return to lunge, full range rotational twists.', emoji: '🌀', tags: [] },
        { name: 'Hold Twist + Pulse', detail: 'Hold the twist, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Flow Sequence', detail: 'Lunge → Inhale W3 arms up → Exhale twist → Back to lunge.', emoji: '🌊', tags: [] },
      ]
    },
    {
      type: 'transition', id: 't2', title: 'Transition: Standing mountain knee drives with ball → high plank', emoji: '🔀', equipment: [], color: 'var(--surface2)', steps: []
    },
    {
      type: 'block', id: 'block5', title: 'Block 5 · Core/Arm Series — Both Sides', emoji: '💪', equipment: [],
      color: 'var(--slate)',
      steps: [
        { name: 'High Plank — Knee Drives + Toe Taps', detail: 'x3 each side from high plank.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Serve the Platter — Both Arms', detail: 'Both arms serve the platter.', emoji: '🙌', tags: [] },
        { name: 'Alternate Serves R & L', detail: 'Alternate right and left arm serves.', emoji: '↔️', tags: [] },
        { name: 'Hold Out + Pulse', detail: 'Hold arms extended, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Flip Up & Down', detail: 'Flip hands/arms up and down.', emoji: '🔃', tags: [] },
        { name: 'Over Under', detail: 'Over-under arm pattern.', emoji: '↕️', tags: [] },
        { name: 'Open Wide', detail: 'Repeat series with arms out wide.', emoji: '🙆‍♀️', tags: [] },
        { name: 'End with a Hold', detail: 'Hold the final position. Breathe.', emoji: '💎', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block6', title: 'Block 6 · Tabletop Glute — Left', emoji: '🦵', equipment: ['band', 'ball'],
      color: 'var(--teal)', mirrorOf: 'block3',
      steps: [
        { name: 'Setup', detail: 'Ball under right hand. Tabletop position.', emoji: '🤲', tags: [] },
        { name: 'Donkey Kicks — Right Leg', detail: 'Full range donkey kicks, right leg.', emoji: '🦵', tags: [] },
        { name: 'Up an Inch, Down an Inch', detail: 'Tiny controlled range at the top.', emoji: '📐', tags: [] },
        { name: 'Pulses', detail: 'Pulse at the top.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hold Kick + Tricep Pushup', detail: 'Hold the kick, tricep pushup with hand on ball. Full range.', emoji: '💪', tags: [] },
        { name: 'Tricep Pushup Pulses', detail: 'Pulse the tricep pushup.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Extend Arm & Leg', detail: 'Extend opposite arm and leg long.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Hold + Pulse Back In', detail: 'Hold extension, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Rainbows R & L', detail: 'Palm on ball, rainbow the leg right and left.', emoji: '🌈', tags: [] },
        { name: 'Full Range Lift', detail: 'Lift the leg through full range.', emoji: '⬆️', tags: [] },
        { name: 'Pulses', detail: 'Pulse the lift.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Elbow to Knee + Extend', detail: 'Draw elbow to knee, then extend long.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Taps to Corner + Lift', detail: 'Tap to corner of mat, lift. End with hold.', emoji: '💎', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block7', title: 'Block 7 · Standing Glute — Left', emoji: '🏃‍♀️', equipment: ['band', 'ball'],
      color: 'var(--sage)', mirrorOf: 'block4',
      steps: [
        { name: 'Full Range Lunge — Lift & Lower', detail: 'Full range lunge with lift/lower + hinge. Left side.', emoji: '🦵', tags: [] },
        { name: 'Single Pulses', detail: 'Pulse in the lunge.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Lift/Lower Front Heel', detail: 'Heel raises in lunge position.', emoji: '🦶', tags: [] },
        { name: 'Warrior 3 — Tap & Lift', detail: 'Hinge to Warrior 3, tap down and lift.', emoji: '🧘‍♀️', tags: [] },
        { name: 'Warrior 3 Pulses', detail: 'Hold Warrior 3, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Back to Lunge — Twists', detail: 'Return to lunge, full range rotational twists.', emoji: '🌀', tags: [] },
        { name: 'Hold Twist + Pulse', detail: 'Hold the twist, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Flow Sequence', detail: 'Lunge → Inhale W3 arms up → Exhale twist → Back to lunge.', emoji: '🌊', tags: [] },
      ]
    },
    {
      type: 'transition', id: 't3', title: 'Transition: Side plank high L→R, land on left side', emoji: '🔀', equipment: [], color: 'var(--surface2)', steps: []
    },
    {
      type: 'block', id: 'block8', title: 'Block 8 · Sideline — Right', emoji: '🤸‍♀️', equipment: [],
      color: 'var(--rose)',
      steps: [
        { name: 'Up for 3, Down Fast', detail: 'Slow lift 3 counts, quick lower.', emoji: '⬆️', tags: [] },
        { name: 'Up Fast, Down for 3', detail: 'Quick lift, slow lower 3 counts.', emoji: '⬇️', tags: [] },
        { name: 'Pulses for 8', detail: '8 quick pulses at the top.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Circles Front & Back', detail: 'Small circles with top leg, both directions.', emoji: '⭕', tags: [] },
        { name: 'Pulses', detail: 'Pulse at the top.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Front Leg Extends — Full Range', detail: 'Back leg flat to back of mat. Front leg extends and raises.', emoji: '🦵', tags: [] },
        { name: 'Pulses', detail: 'Pulse the front leg raises.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Teaser Lifts', detail: 'Add teaser lifts.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Teaser Pulses', detail: 'Pulse in the teaser.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Inner Thigh — Full Range', detail: 'Back leg in front of mat. Inner thigh lifts, full range.', emoji: '🦵', tags: [] },
        { name: 'Pulses — Inner Thigh', detail: 'Inner thigh pulses.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Circles Front & Back', detail: 'Inner thigh circles, both directions.', emoji: '⭕', tags: [] },
        { name: 'Swings Forward & Back', detail: 'Swing bottom leg forward and back.', emoji: '🦿', tags: [] },
        { name: 'Teaser Lifts — Hold to Finish', detail: 'Teaser lifts, hold full teaser to finish.', emoji: '💎', tags: [] },
      ]
    },
    {
      type: 'transition', id: 't4', title: 'Transition: Side plank high L→R, land on right side', emoji: '🔀', equipment: [], color: 'var(--surface2)', steps: []
    },
    {
      type: 'block', id: 'block9', title: 'Block 9 · Sideline — Left', emoji: '🤸‍♀️', equipment: [],
      color: 'var(--rose)', mirrorOf: 'block8',
      steps: [
        { name: 'Up for 3, Down Fast', detail: 'Slow lift 3 counts, quick lower.', emoji: '⬆️', tags: [] },
        { name: 'Up Fast, Down for 3', detail: 'Quick lift, slow lower 3 counts.', emoji: '⬇️', tags: [] },
        { name: 'Pulses for 8', detail: '8 quick pulses at the top.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Circles Front & Back', detail: 'Small circles with top leg, both directions.', emoji: '⭕', tags: [] },
        { name: 'Pulses', detail: 'Pulse at the top.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Front Leg Extends — Full Range', detail: 'Back leg flat to back of mat. Front leg extends and raises.', emoji: '🦵', tags: [] },
        { name: 'Pulses', detail: 'Pulse the front leg raises.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Teaser Lifts', detail: 'Add teaser lifts.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Teaser Pulses', detail: 'Pulse in the teaser.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Inner Thigh — Full Range', detail: 'Back leg in front of mat. Inner thigh lifts, full range.', emoji: '🦵', tags: [] },
        { name: 'Pulses — Inner Thigh', detail: 'Inner thigh pulses.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Circles Front & Back', detail: 'Inner thigh circles, both directions.', emoji: '⭕', tags: [] },
        { name: 'Swings Forward & Back', detail: 'Swing bottom leg forward and back.', emoji: '🦿', tags: [] },
        { name: 'Teaser Lifts — Hold to Finish', detail: 'Teaser lifts, hold full teaser to finish.', emoji: '💎', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block10', title: 'Block 10 · Final Core & Stretch', emoji: '🧘‍♀️', equipment: [],
      color: 'var(--amber)',
      steps: [
        { name: 'Hip Lifts × 8', detail: '8 controlled hip lifts.', emoji: '🍑', tags: [] },
        { name: 'Pulses Up × 16', detail: '16 pulses lifting up.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Pulses — Legs Down × 16', detail: '16 pulses lowering legs.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Low Hold', detail: 'Hold low. Engage core. Breathe.', emoji: '💎', tags: [] },
        { name: 'Stretch — Side Twists', detail: 'Gentle side twists to release.', emoji: '🌀', tags: [] },
        { name: 'Happy Baby', detail: 'Happy baby pose. Let go.', emoji: '👶', tags: [] },
        { name: 'Glute Bridge', detail: 'Gentle glute bridge stretch.', emoji: '🍑', tags: [] },
        { name: 'Bound Angle', detail: 'Bound angle pose. Breathe and release.', emoji: '🦋', tags: [] },
      ]
    },
  ]
};

export const YOGA_DEFAULT = {
  name: 'Yoga Sculpt - Ball + Weights',
  discipline: 'yoga',
  blocks: [
    {
      type: 'block', id: 'warmup', title: 'Warm-up', emoji: '🌅', equipment: [], color: 'var(--amber)',
      steps: [
        { name: 'Heart Bench', detail: 'Start in heart bench. Hand at heart, hand at belly.', emoji: '🫀', tags: [] },
        { name: 'Bound Angle', detail: 'Settle into bound angle. Feel the hips open.', emoji: '🦋', tags: [] },
        { name: '8 Deep Breaths', detail: 'Take 8 deep breaths. Set your intention for class.', emoji: '🫁', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block1', title: 'Block 1 · Core with Ball + Bridge Series', emoji: '🎯', equipment: ['ball'],
      color: 'var(--slate)',
      steps: [
        { name: 'Right Leg — Roll Ball Up & Down', detail: 'Lift right leg, roll ball up and down the leg. Can hover bottom leg after 4th rep.', emoji: '🏐', tags: [] },
        { name: 'Hold & Pulse × 8', detail: 'Hold position, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hold on Right × 8', detail: 'Hold on the right side × 8.', emoji: '💎', tags: [] },
        { name: 'Ball Weaves In & Out', detail: 'Weave ball in and out of legs.', emoji: '🏐', tags: [] },
        { name: 'Repeat on Left', detail: 'Full sequence on left leg.', emoji: '🔄', tags: [] },
        { name: 'Both Legs Straight', detail: 'Straighten both legs, repeat sequence with both legs up.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Bridge — Arms Rise with Ball', detail: 'Come to bridge. Arms rise with ball on the way up.', emoji: '🌉', tags: [] },
        { name: 'Bridge Full Range', detail: 'Full range bridge — lift and lower.', emoji: '🍑', tags: [] },
        { name: 'Bridge Pulses', detail: 'Pulse at the top of bridge.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Right Leg Lift — Full Range', detail: 'Lift right leg, continue bridge full range.', emoji: '🦵', tags: [] },
        { name: 'Right Leg Pulses', detail: 'Pulse with right leg lifted.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Extend Arm & Leg', detail: 'Extend opposite arm and right leg long.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Hold Out & Pulse × 8', detail: 'Hold extension, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Repeat on Left', detail: 'Full bridge sequence on left leg.', emoji: '🔄', tags: [] },
        { name: 'Roll Ups to Top of Mat', detail: 'Roll all the way up to standing at the top of mat.', emoji: '⬆️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block2', title: 'Block 2 · Tabletop with Weights', emoji: '🏋️', equipment: ['weights'],
      color: 'var(--rose)',
      steps: [
        { name: 'Cat/Cow', detail: 'Flow through cat and cow in tabletop.', emoji: '🐈', tags: [] },
        { name: 'Side Twist with Weights', detail: 'Side twist holding weights. Hold, then extend leg.', emoji: '🌀', tags: [] },
        { name: 'Bird Dog — Full Range', detail: 'Full range bird dog. Extend opposite arm and leg.', emoji: '🐦', tags: [] },
        { name: 'Bird Dog Pulses', detail: 'Pulse at the extended position.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Elbow to Knee — Hold & Pulse', detail: 'Draw elbow to knee, hold, pulse.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Repeat Left Side', detail: 'Full sequence on left side.', emoji: '🔄', tags: [] },
        { name: 'Top of Mat', detail: 'Make your way to top of mat for Block 3.', emoji: '⬆️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block3', title: 'Block 3 · Sun Sals + Chair Series', emoji: '☀️', equipment: ['weights'],
      color: 'var(--teal)',
      steps: [
        { name: '3 Sun Salutations', detail: '3 sun salutations with options. Build heat.', emoji: '☀️', tags: [] },
        { name: 'Hold Forward Fold — Grab Weights', detail: 'Hold forward fold on last salutation. Grab weights, half lift.', emoji: '🏋️', tags: [] },
        { name: 'Chair Pose — Lower & Lift Arms', detail: 'Rise to stand, come to chair. Lower and lift arms staying low.', emoji: '🪑', tags: [] },
        { name: 'Twist Right — Full Range × 8', detail: 'Add twist to the right, stand at center. × 8.', emoji: '🌀', tags: [] },
        { name: 'Hold Twist Right × 8', detail: 'Hold twist to the right × 8.', emoji: '💎', tags: [] },
        { name: 'Pulse in Twist × 8', detail: 'Pulse in the held twist × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Repeat on Left', detail: 'Full chair twist sequence on left side.', emoji: '🔄', tags: [] },
        { name: 'Vinyasa', detail: 'Flow through vinyasa to transition.', emoji: '🌊', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block4', title: 'Block 4 · Right Side Flow (Long Series)', emoji: '🏃‍♀️', equipment: ['weights'],
      color: 'var(--sage)',
      steps: [
        { name: 'Lunge — Arms Back × 8', detail: 'Step right foot forward. Lunge with weights, arms flow back × 8.', emoji: '🦵', tags: [] },
        { name: 'Twist Right — Full Range × 8', detail: 'Twist to the right, full range × 8.', emoji: '🌀', tags: [] },
        { name: 'Hold Twist Right × 8', detail: 'Hold twist to the right × 8.', emoji: '💎', tags: [] },
        { name: 'Warrior 3 to Lunge × 8', detail: 'Flow from warrior 3 to lunge × 8.', emoji: '✈️', tags: [] },
        { name: 'Hold Warrior 3 — Pulse × 8', detail: 'Hold warrior 3, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'High Lunge to Twist with Arms × 8', detail: 'High lunge, twist with arms × 8.', emoji: '🌀', tags: [] },
        { name: 'Hold Arms & Twist × 8', detail: 'Hold arms and twist × 8.', emoji: '💎', tags: [] },
        { name: 'Radiant Warrior', detail: 'Flow through radiant warrior.', emoji: '✨', tags: [] },
        { name: 'Skandasana', detail: 'Skandasana with arms extended, then bent and extended.', emoji: '🧘‍♀️', tags: [] },
        { name: 'Warrior 2', detail: 'Warrior 2 — hips open, arms wide.', emoji: '⚔️', tags: [] },
        { name: 'Dancing Warrior', detail: 'Flow through dancing warrior.', emoji: '💃', tags: [] },
        { name: 'Arms Up Pulses × 8', detail: 'Arms up, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Arms Down Pulses × 8', detail: 'Arms down, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Arm Circles Forward & Back × 8', detail: 'Arm circles forward and back × 8.', emoji: '⭕', tags: [] },
        { name: 'Curl & Extend × 8', detail: 'Curl and extend × 8.', emoji: '💪', tags: [] },
        { name: 'Frame Foot', detail: 'Frame the foot. Transition to plank.', emoji: '🖼️', tags: [] },
        { name: 'Side Plank Right — Twist with Weights × 8', detail: 'High plank → side plank right. Full range twist with weights × 8.', emoji: '💪', tags: [] },
        { name: 'Hip Lifts × 8', detail: 'Hip lifts in side plank × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Knees Pull In × 8', detail: 'Drop weights, knees pull in × 8.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Hip Lifts with Weights Down × 8', detail: 'Hip lifts × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Vinyasa', detail: 'Drop weights. Vinyasa to transition.', emoji: '🌊', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block5', title: 'Block 5 · Left Side Flow', emoji: '🏃‍♀️', equipment: ['weights'],
      color: 'var(--sage)', mirrorOf: 'block4',
      steps: [
        { name: 'Repeat Full Block 4 on Left', detail: 'Mirror all of Block 4 on the left side.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'transition', id: 't1', title: 'Transition: Repeat flow faster — 4 pulses for everything', emoji: '⚡', equipment: [], color: 'var(--surface2)', steps: []
    },
    {
      type: 'block', id: 'block6', title: 'Block 6 · Core Intermission', emoji: '🏐', equipment: ['ball'],
      color: 'var(--slate)',
      steps: [
        { name: 'Pulses with Hip Lift × 16', detail: 'Pulse with hip lift × 16.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Pulse Hold × 16', detail: 'Hold and pulse × 16.', emoji: '💎', tags: [] },
        { name: 'Plus Extended Leg × 16', detail: 'Extend leg, continue pulses × 16.', emoji: '🦵', tags: [] },
        { name: 'Full Roll-Ups × 16', detail: 'Full roll-ups × 16.', emoji: '⬆️', tags: [] },
        { name: 'Chaturanga', detail: 'Transition through chaturanga.', emoji: '💪', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block7', title: 'Block 7 · Balancing Flow — Right', emoji: '⚖️', equipment: ['weights'],
      color: 'var(--teal)',
      steps: [
        { name: 'High Lunge — Hinge Forward', detail: 'High lunge, hinge forward.', emoji: '🦵', tags: [] },
        { name: 'Tricep Kickbacks — Full Range', detail: 'Tricep quick backs, full range.', emoji: '💪', tags: [] },
        { name: 'Tricep Kickbacks — Pulses', detail: 'Pulse the tricep kickbacks.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Squeeze In', detail: 'Squeeze in through the movement.', emoji: '💎', tags: [] },
        { name: 'Drop & Fill Bucket', detail: 'Drop and fill bucket.', emoji: '🪣', tags: [] },
        { name: 'Standing Mountain — Arms Rise', detail: 'Standing mountain with arms rising. Back to airplane.', emoji: '🏔️', tags: [] },
        { name: 'Figure 4 Stretch', detail: 'Hold standing mountain → figure 4 stretch.', emoji: '🧘‍♀️', tags: [] },
        { name: 'Tree Pose — Hold', detail: 'Tree pose hold.', emoji: '🌳', tags: [] },
        { name: 'Balancing Half Moon', detail: 'Balancing half moon. Open up to warrior 2.', emoji: '🌙', tags: [] },
        { name: 'Extended Side Angle', detail: 'Extended side angle.', emoji: '🌿', tags: [] },
        { name: 'Revolved Warrior', detail: 'Revolved warrior.', emoji: '🌀', tags: [] },
        { name: 'Triangle Pose', detail: 'Triangle pose.', emoji: '🔺', tags: [] },
        { name: 'Drop Weights', detail: 'Set weights down.', emoji: '🏋️', tags: [] },
        { name: 'Side Plank — Lift Leg', detail: 'Side plank, lift top leg.', emoji: '💪', tags: [] },
        { name: 'Fallen Triangle to Flip Dog × 3', detail: 'Fallen triangle, flow to flip dog × 3.', emoji: '🌊', tags: [] },
        { name: 'Pigeon Pose', detail: 'Settle into pigeon pose. Hold and breathe.', emoji: '🕊️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block8', title: 'Block 8 · Balancing Flow — Left', emoji: '⚖️', equipment: ['weights'],
      color: 'var(--teal)', mirrorOf: 'block7',
      steps: [
        { name: 'Repeat Full Block 7 on Left', detail: 'Mirror all of Block 7 on the left side.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block9', title: 'Block 9 · Optional Boat Pose', emoji: '⛵', equipment: [],
      color: 'var(--rose)',
      steps: [
        { name: 'Boat Pose Sequence', detail: 'Optional boat pose sequence if more core work is needed.', emoji: '⛵', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block10', title: 'Block 10 · Cool Down', emoji: '🧘‍♀️', equipment: [],
      color: 'var(--amber)',
      steps: [
        { name: 'Bridge Lifts', detail: 'Gentle bridge lifts to release the spine.', emoji: '🌉', tags: [] },
        { name: 'Side Twists', detail: 'Supine side twists — both sides.', emoji: '🌀', tags: [] },
        { name: 'Final Rest / Savasana', detail: 'Final rest. Let everything go. Breathe and release.', emoji: '✨', tags: [] },
      ]
    },
  ]
};

export const YOGA_SCULPT_2_DEFAULT = {
  name: 'Yoga Sculpt - Flow + Strength',
  discipline: 'yoga',
  blocks: [
    {
      type: 'block', id: 'warmup', title: 'Warm-up', emoji: '🌅', equipment: ['weights'], color: 'var(--amber)',
      steps: [
        { name: "Child's Pose — Arm Walks", detail: 'Arms extend long. Walk right and hold, then walk left and hold.', emoji: '🧘‍♀️', tags: [] },
        { name: 'Cat Cow Circles L & R', detail: 'Cat/cow into lateral circles left and right.', emoji: '🐈', tags: [] },
        { name: 'Neck Circle', detail: 'Slow neck circle to release tension.', emoji: '⭕', tags: [] },
        { name: 'Bear Lift Taps', detail: 'Bear position — lift and tap opposite hand and knee.', emoji: '🐻', tags: [] },
        { name: 'Bear Swing R & L', detail: 'Swing right and left from bear.', emoji: '🐻', tags: [] },
        { name: 'Bear Lift Walk Outs to High Plank', detail: 'Walk out from bear to high plank.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Down Dog to High Plank', detail: 'Flow down dog to high plank. Add opposite arm tapping ankle.', emoji: '🐕', tags: [] },
        { name: 'Forward Fold — Sway & Grab Weight', detail: 'Walk to forward fold, sway, pick up weight. Shoulder press up, fold back down.', emoji: '🏋️', tags: [] },
        { name: 'Standing Mountain Knee Drives', detail: 'Rise to standing mountain, alternate knee drives.', emoji: '🏔️', tags: [] },
        { name: 'Chair Pose Series with Open Twists', detail: 'Sit into chair, open twist right and left.', emoji: '🪑', tags: [] },
        { name: '3 Sun Salutations → Down Dog', detail: 'Three full sun salutations. End in down dog.', emoji: '☀️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block1', title: 'Block 1 · Mandala Flow — Right', emoji: '🌀', equipment: ['weights'], color: 'var(--slate)',
      steps: [
        { name: 'Crescent Warrior — Tilted Lunge', detail: 'Step right foot forward, high crescent warrior with slight tilt.', emoji: '🦵', tags: [] },
        { name: 'Tricep Kickbacks × 8 — Leg In', detail: 'Hinge forward, pull left leg in, tricep kickbacks × 8.', emoji: '💪', tags: [] },
        { name: 'Wide Second Lunge — Arms Extend', detail: 'Open to wide second lunge, arms extend wide.', emoji: '⚔️', tags: [] },
        { name: 'To Crescent → Hold to the Back', detail: 'Return to crescent, hold and reach back.', emoji: '🌙', tags: [] },
        { name: 'Standing Mountain Knee Drive Lifts', detail: 'Rise to standing mountain, knee drive lifts.', emoji: '🏔️', tags: [] },
        { name: 'Hold the Twist → Turn Back to Center', detail: 'Hold the twist, then unwind back to center.', emoji: '🌀', tags: [] },
        { name: 'Vinyasa', detail: 'Flow through vinyasa.', emoji: '🌊', tags: [] },
        { name: 'Repeat on Left', detail: 'Full mandala flow on left side.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block2', title: 'Block 2 · Add-On Flow', emoji: '➕', equipment: ['weights'], color: 'var(--rose)',
      steps: [
        { name: 'Crescent Warrior Kickbacks → Balance & Pulse', detail: 'Crescent warrior, tricep kickbacks, hold leg up and balance, pulse.', emoji: '💪', tags: ['pulse'] },
        { name: 'Kick Through Leg Forward', detail: 'Kick leg through to the front.', emoji: '🦵', tags: [] },
        { name: 'Warrior 3 × 8', detail: 'Hinge to Warrior 3, × 8.', emoji: '✈️', tags: [] },
        { name: 'Hold Forward & Pulse', detail: 'Hold Warrior 3 hinging forward, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hold Back & Pulse', detail: 'Hold Warrior 3 reaching back, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Wide Second — Pulse Both Arms', detail: 'Open to wide second, pulse both arms simultaneously.', emoji: '🔥', tags: ['pulse'] },
        { name: 'One Arm at a Time — Goal Post', detail: 'Alternate arms in goal post position.', emoji: '🥅', tags: [] },
        { name: 'Open & Extend, Pulse', detail: 'Open and extend arms, pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Flip Dip', detail: 'Flip and dip through the movement.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block3', title: 'Block 3 · Warrior 2 Series — Right', emoji: '⚔️', equipment: ['weights'], color: 'var(--teal)',
      steps: [
        { name: 'Warrior 2 Facing Back', detail: 'Open to warrior 2 facing the back of the mat.', emoji: '⚔️', tags: [] },
        { name: 'Extended Side — Full Range × 8', detail: 'Extended side angle, full range warrior 2 × 8.', emoji: '🌿', tags: [] },
        { name: 'Side Waist Pulse Up × 8', detail: 'Side waist pulse up × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Extend Bottom Arm, Pulse × 8', detail: 'Extend bottom arm long, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Arms Down → Side Plank Pulses', detail: 'Lower arms, come into side plank, pulse.', emoji: '💪', tags: ['pulse'] },
        { name: 'Knee Drive → Hold', detail: 'Drive top knee in, hold.', emoji: '🦵', tags: [] },
        { name: 'Lizard Lunge → Grab Back Knee', detail: 'Drop into lizard lunge, grab the back knee.', emoji: '🦎', tags: [] },
        { name: 'Vinyasa', detail: 'Flow through vinyasa.', emoji: '🌊', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block4', title: 'Block 4 · Warrior 2 Series — Left', emoji: '⚔️', equipment: ['weights'], color: 'var(--teal)', mirrorOf: 'block3',
      steps: [
        { name: 'Repeat Block 3 on Left', detail: 'Full warrior 2 series on the left side.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block5', title: 'Block 5 · Wide Second Leg Series', emoji: '🦵', equipment: ['weights'], color: 'var(--sage)',
      steps: [
        { name: 'Wide Second Pulses', detail: 'Wide second stance, pulse down and up.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Lift Heels — Both', detail: 'Lift both heels in wide second, balance.', emoji: '🦶', tags: [] },
        { name: 'Balance & Hold', detail: 'Hold the balance on tiptoes.', emoji: '💎', tags: [] },
        { name: 'Repeat Blocks 3-4 — 4-Count Pulses', detail: 'Repeat warrior 2 series right and left with 4-count pulses throughout.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block6', title: 'Block 6 · Core Series', emoji: '🔥', equipment: [], color: 'var(--slate)',
      steps: [
        { name: 'Core Series', detail: 'Core sequence here — add exercises as needed.', emoji: '💪', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block7', title: 'Block 7 · Balancing Flow — Right', emoji: '⚖️', equipment: ['weights'], color: 'var(--rose)',
      steps: [
        { name: 'Crescent Warrior → Standing Mountain', detail: 'Flow from crescent warrior to standing mountain.', emoji: '🏔️', tags: [] },
        { name: 'Grab Knee / Leg — Extend to Side', detail: 'From standing mountain, grab knee or leg, option to extend out to the side.', emoji: '🦵', tags: [] },
        { name: 'Half Moon', detail: 'Extend into half moon pose.', emoji: '🌙', tags: [] },
        { name: 'Triangle Pose', detail: 'Triangle pose. Open chest up.', emoji: '🔺', tags: [] },
        { name: 'Side Plank', detail: 'Side plank hold.', emoji: '💪', tags: [] },
        { name: 'Lizard Lunge', detail: 'Drop into lizard lunge.', emoji: '🦎', tags: [] },
        { name: 'Twist', detail: 'Twist in the lunge.', emoji: '🌀', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block7b', title: 'Tummy Work & Shoulder Opening', emoji: '🐍', equipment: [], color: 'var(--amber)',
      steps: [
        { name: 'Shalabhasana', detail: 'Locust pose — lift chest, arms, and legs. Use between flows as needed.', emoji: '🐍', tags: [] },
        { name: 'Shoulder Opening', detail: 'Shoulder stretches and opening movements on the belly.', emoji: '🙆‍♀️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block8', title: 'Block 8 · Balancing Flow — Left', emoji: '⚖️', equipment: ['weights'], color: 'var(--rose)', mirrorOf: 'block7',
      steps: [
        { name: 'Repeat Block 7 on Left', detail: 'Full balancing flow on the left side.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block9', title: 'Block 9 · Cool Down', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)',
      steps: [
        { name: 'Bridge', detail: 'Gentle bridge lifts to release the spine.', emoji: '🌉', tags: [] },
        { name: 'Happy Baby', detail: 'Happy baby pose. Let the hips open.', emoji: '👶', tags: [] },
        { name: 'Final Rest / Savasana', detail: 'Final rest. Let everything go.', emoji: '✨', tags: [] },
      ]
    },
  ]
};

export const MAT_PILATES_2_DEFAULT = {
  name: 'Mat Pilates - Full Body',
  discipline: 'pilates',
  blocks: [
    {
      type: 'block', id: 'warmup', title: 'Warm-up', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)',
      steps: [
        { name: 'Crossed Legged — Deep Breaths', detail: 'Hands on chest, settle in, root to mat. Find your breath.', emoji: '🫁', tags: [] },
        { name: 'Cat/Cow Seated', detail: 'Seated cat/cow, rolls right and left, circle it out.', emoji: '🐈', tags: [] },
        { name: 'Arm Stretches R & L', detail: 'Side arm stretches right and left.', emoji: '🙆‍♀️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block1', title: 'Block 1 · Roll Ups & Twists', emoji: '🌀', equipment: [], color: 'var(--slate)',
      steps: [
        { name: 'Half Roll — Twist R & L', detail: 'Roll halfway back with arms, twist left and right.', emoji: '🌀', tags: [] },
        { name: 'Hold & Pulse Right × 8', detail: 'Hold the right twist, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hold & Pulse Left × 8', detail: 'Hold the left twist, pulse × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Roll All the Way Down — Full Roll Ups × 8', detail: 'Roll all the way down, full roll ups × 8.', emoji: '⬆️', tags: [] },
        { name: 'Sit Up — Full Twists R & L', detail: 'Sit up, full twists left and right seated.', emoji: '🌀', tags: [] },
        { name: 'Add Pulses → Roll All the Way Down', detail: 'Add pulses to each twist, then come all the way down.', emoji: '🔥', tags: ['pulse'] },
      ]
    },
    {
      type: 'block', id: 'block2', title: 'Block 2 · Bridge Series', emoji: '🍑', equipment: ['weights'], color: 'var(--rose)',
      steps: [
        { name: 'Extend Arms Full Range × 8', detail: 'Bridge up, extend arms full range × 8.', emoji: '🏋️‍♀️', tags: [] },
        { name: 'Pulse × 8', detail: 'Pulse at the top × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Open Arms Full Range × 8', detail: 'Open arms wide full range × 8.', emoji: '🙆‍♀️', tags: [] },
        { name: 'Pulse × 8', detail: 'Pulse with arms open × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Skull Crushers Full Range × 8', detail: 'Skull crushers with weights, full range × 8.', emoji: '💀', tags: [] },
        { name: 'Pulse × 8', detail: 'Pulse skull crushers × 8.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Repeat Full Sequence', detail: 'Repeat all three arm series again.', emoji: '🔄', tags: [] },
        { name: 'Chest Press — Full Range', detail: 'Chest press full range.', emoji: '💪', tags: [] },
        { name: 'Hold Arms — R, L, Both', detail: 'Hold just the arms: right, left, then both.', emoji: '💎', tags: [] },
        { name: 'Add Pulse', detail: 'Add pulse to the hold.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Hip Pulses with Skull Crushers', detail: 'Add hip pulses while doing skull crushers. Keep hips lifted.', emoji: '🍑', tags: ['pulse'] },
        { name: 'Walk Feet Out with Hips Up', detail: 'Walk feet out while keeping hips lifted.', emoji: '🦶', tags: [] },
        { name: 'Hold at Top — Flares', detail: 'Hold at top, knee flares.', emoji: '💎', tags: [] },
        { name: 'Heel Lifts', detail: 'Heel lifts in bridge hold.', emoji: '🦶', tags: [] },
        { name: 'Roll Down → Flip to Belly', detail: 'Roll all the way down, flip onto belly.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block3', title: 'Block 3 · Upper Back', emoji: '🏋️', equipment: ['weights'], color: 'var(--teal)',
      steps: [
        { name: 'Lift & Lower — Hands by Side', detail: 'Weights come to top of mat. Lift and lower chest with hands at sides, hold and pulse.', emoji: '⬆️', tags: [] },
        { name: 'Right Hand Roll on Weight — Hold & Pulse', detail: 'Right hand rolling on weight only, hold and pulse.', emoji: '🏋️', tags: ['pulse'] },
        { name: 'Left Hand Roll on Weight — Hold & Pulse', detail: 'Repeat on left hand.', emoji: '🏋️', tags: ['pulse'] },
        { name: 'Both Arms Extend & Roll Out Weight', detail: 'Both arms extended, roll out weight, hold.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Arms Squeeze In & Out', detail: 'Squeeze arms in and out, hold, pulse in, lift.', emoji: '💎', tags: ['pulse'] },
        { name: 'Full Range Shoulder Press', detail: 'Lower down, full range shoulder press with just the legs lift and lower.', emoji: '🏋️‍♀️', tags: [] },
        { name: 'Swimmers', detail: 'Swimmers — alternate arms and legs.', emoji: '🏊‍♀️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block4', title: 'Block 4 · Tabletop Glute — Right', emoji: '🦵', equipment: ['weights'], color: 'var(--sage)',
      steps: [
        { name: 'Donkey Kick + Tricep — Full Range', detail: 'Tabletop, donkey kick with tricep extension, full range.', emoji: '🦵', tags: [] },
        { name: 'Pulse', detail: 'Pulse at the top.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Repeat Donkey Kick + Tricep', detail: 'Repeat the donkey kick + tricep full range series.', emoji: '🔄', tags: [] },
        { name: 'Tricep Kickback — Extends, Pulses, Circles', detail: 'Tricep kickback: arm extends, pulses, circles.', emoji: '💪', tags: [] },
        { name: 'Rainbows', detail: 'Arm lowers, rainbows with the leg.', emoji: '🌈', tags: [] },
        { name: 'Full Range Tap Lift — Pulses, Circles', detail: 'Full range tap and lift, pulses, circles.', emoji: '⭕', tags: [] },
        { name: 'Open & Close Arm and Leg to Side', detail: 'Come back, open and close arm and leg out to the side.', emoji: '🙆‍♀️', tags: [] },
        { name: 'Left Elbow — Full Range, Kick & Bend', detail: 'Come to left elbow, full range kick and bend.', emoji: '🦵', tags: [] },
        { name: 'Pulse, Tap & Lift, Circle', detail: 'Pulse, tap and lift, circle.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Kneeling Side Plank — Full Range with Weight', detail: 'Kneeling side plank, full range dips with weight.', emoji: '💪', tags: [] },
        { name: 'Pull Weight Under', detail: 'Pull the weight under the body.', emoji: '🏋️', tags: [] },
        { name: 'Lift Leg — Tap Lift, Pulses, Crunch In', detail: 'Lift top leg: tap and lift, pulses, crunch in.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Drop Weight → Kick Bottom Leg Out', detail: 'Drop weight, kick bottom leg out, repeat, side stretch.', emoji: '🦵', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block5', title: 'Block 5 · Arm Work', emoji: '💪', equipment: ['weights'], color: 'var(--slate)',
      steps: [
        { name: 'Serve the Platter Series', detail: 'Serve platter arm series and variations.', emoji: '🙌', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block6', title: 'Block 6 · Tabletop Glute — Left', emoji: '🦵', equipment: ['weights'], color: 'var(--sage)', mirrorOf: 'block4',
      steps: [
        { name: 'Repeat Block 4 on Left', detail: 'Full donkey kick series on the left leg.', emoji: '🔄', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block7', title: 'Block 7 · Standing Glute + Wide Second', emoji: '🏃‍♀️', equipment: ['weights'], color: 'var(--teal)',
      steps: [
        { name: 'Arms Extend — Knee Drives × 8', detail: 'Standing, arms extend, knee drives in × 8.', emoji: '🦵', tags: [] },
        { name: 'Pulse — Foot at Center', detail: 'Pulse with foot at center.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Open Arms — Curtsy Taps', detail: 'Open arms wide, curtsy tap left and right.', emoji: '🙆‍♀️', tags: [] },
        { name: 'Hold Curtsy — Lift Top Foot, Pulse', detail: 'Hold the curtsy, lift top foot and pulse.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Twist Over to the Right', detail: 'Twist upper body to the right.', emoji: '🌀', tags: [] },
        { name: 'Warrior 2 Full Range Lunge', detail: 'Open to warrior 2 full range lunge.', emoji: '⚔️', tags: [] },
        { name: 'Full Range Lunge', detail: 'Full range lunge.', emoji: '🦵', tags: [] },
        { name: 'Pulse — Front Toes Lift, 3 Down / 1 Up', detail: 'Pulse with front toes lifted, 3 counts down 1 count up.', emoji: '🔥', tags: ['pulse'] },
        { name: '1 Down / 3 Up', detail: '1 count down, 3 counts up.', emoji: '⬆️', tags: [] },
        { name: 'Lunge to Wide Second → Left Side', detail: 'Transition lunge to wide second, pivot to left.', emoji: '🔄', tags: [] },
        { name: 'Repeat Full Series on Left', detail: 'All of the above on the left side.', emoji: '🔄', tags: [] },
        { name: 'End — Wide Second or Shoulder Press Lunge', detail: 'End with wide second or full lunge shoulder press.', emoji: '💎', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block8', title: 'Block 8 · Clam Shell Series', emoji: '🐚', equipment: ['weights'], color: 'var(--rose)',
      steps: [
        { name: 'Clam Shell — Full Range', detail: 'Side lying, full range clam shell opens.', emoji: '🐚', tags: [] },
        { name: 'Half Way Pulse', detail: 'Pulse at the halfway point.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Add Leg Extension', detail: 'Add leg extension to the clam shell.', emoji: '🦵', tags: [] },
        { name: 'Hold Leg — Pulse Up with Weight', detail: 'Hold leg extended, pulse up with weight.', emoji: '🔥', tags: ['pulse'] },
        { name: 'Both Legs Extend — Bottom Finds Top', detail: 'Both legs extend, bring bottom leg up to meet the top.', emoji: '🤸‍♀️', tags: [] },
        { name: 'Teasers', detail: 'Teaser lifts.', emoji: '🤸‍♀️', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block9', title: 'Block 9 · Core Series × 2', emoji: '🔥', equipment: [], color: 'var(--slate)',
      steps: [
        { name: 'Core Series', detail: 'Core sequence — repeat twice.', emoji: '💪', tags: [] },
      ]
    },
    {
      type: 'block', id: 'block10', title: 'Block 10 · Stretch', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)',
      steps: [
        { name: 'Full Body Stretch', detail: 'Cool down stretching sequence. Release everything.', emoji: '✨', tags: [] },
      ]
    },
  ]
};

export const BLANK_PILATES_DEFAULT = {
  name: 'Blank Pilates Class',
  discipline: 'pilates',
  blocks: [
    { type: 'block', id: 'warmup', title: 'Warm-up', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)', steps: [] },
    { type: 'block', id: 'block1', title: 'Main Pilates Work', emoji: '✨', equipment: [], color: 'var(--slate)', steps: [] },
  ],
};

export const BLANK_YOGA_DEFAULT = {
  name: 'Blank Yoga Class',
  discipline: 'yoga',
  blocks: [
    { type: 'block', id: 'warmup', title: 'Opening', emoji: '🌅', equipment: [], color: 'var(--amber)', steps: [] },
    { type: 'block', id: 'block1', title: 'Main Yoga Flow', emoji: '🌊', equipment: [], color: 'var(--teal)', steps: [] },
  ],
};


export const TEMPLATES = [
  {
    key: 'pilates-core-glutes',
    name: 'Mat Pilates - Core + Glutes',
    description: 'Ball, band, bridges, tabletop glutes, sideline work, and a final core stretch.',
    discipline: 'pilates',
    data: () => PILATES_DEFAULT,
  },
  {
    key: 'pilates-full-body',
    name: 'Mat Pilates - Full Body',
    description: 'Weights-focused full-body class with roll-ups, bridge, upper back, arms, glutes, and core.',
    discipline: 'pilates',
    data: () => MAT_PILATES_2_DEFAULT,
  },
  {
    key: 'yoga-ball-weights',
    name: 'Yoga Sculpt - Ball + Weights',
    description: 'Sculpt template with ball core, bridge work, tabletop weights, sun salutations, and standing flow.',
    discipline: 'yoga',
    data: () => YOGA_DEFAULT,
  },
  {
    key: 'yoga-flow-strength',
    name: 'Yoga Sculpt - Flow + Strength',
    description: 'Mandala flow, warrior series, wide second legs, core, balance work, and cool down.',
    discipline: 'yoga',
    data: () => YOGA_SCULPT_2_DEFAULT,
  },
  {
    key: 'blank-pilates',
    name: 'Blank Pilates Class',
    description: 'Empty Pilates starter with warm-up and main work sections ready to fill in.',
    discipline: 'pilates',
    data: () => BLANK_PILATES_DEFAULT,
  },
  {
    key: 'blank-yoga',
    name: 'Blank Yoga Class',
    description: 'Empty Yoga starter with opening and main flow sections ready to fill in.',
    discipline: 'yoga',
    data: () => BLANK_YOGA_DEFAULT,
  },
];

export const BLOCK_COLORS = [
  { name: 'Slate', var: 'var(--slate)', hex: '#dbe4ef' },
  { name: 'Rose', var: 'var(--rose)', hex: '#f0cfc4' },
  { name: 'Teal', var: 'var(--teal)', hex: '#cde8e3' },
  { name: 'Sage', var: 'var(--sage)', hex: '#dce7c8' },
  { name: 'Amber', var: 'var(--amber)', hex: '#efe1a8' },
];

export const EMOJI_OPTIONS = [
  '🧘‍♀️','🏋️','💪','🦵','🍑','🔥','🌀','🤸‍♀️','✨','🎯',
  '⚖️','☀️','🌅','🌊','🏐','🐈','💎','🌈','⬆️','⭕',
  '🕊️','🌙','🌳','💃','🫁','🦋','⛵','🪑','🐦','🫀',
];

export const COLOR_CYCLE = [
  'var(--amber)', 'var(--slate)', 'var(--rose)', 'var(--teal)', 'var(--sage)'
];
