import { detectEquipment, guessEmoji } from './parser.js?v=20260523-schedule';

const LEGACY_STEP_LIBRARY = [
  { name: 'Breath + Intention', detail: 'Settle in, hands at heart and belly. Take 8 full breaths.', category: 'warmup', disciplines: ['yoga', 'pilates'], equipment: [], emoji: '🫁' },
  { name: 'Cat/Cow Circles', detail: 'Move through cat/cow, then circle ribs and hips both directions.', category: 'warmup', disciplines: ['yoga', 'pilates'], equipment: [], emoji: '🐈' },
  { name: 'Side Bend + Twist', detail: 'Reach long through each side, then rotate open through the chest.', category: 'warmup', disciplines: ['yoga', 'pilates'], equipment: [], emoji: '🙆‍♀️' },
  { name: 'Sun Salutations', detail: 'Flow through 3 rounds, adding breath-led pace and optional vinyasa.', category: 'standing', disciplines: ['yoga'], equipment: [], emoji: '☀️' },
  { name: 'Chair Twist Pulses', detail: 'Hold chair, twist right and left, add small controlled pulses.', category: 'standing', disciplines: ['yoga'], equipment: ['weights'], pulse: true },
  { name: 'Crescent Lunge Kickbacks', detail: 'Hinge in crescent, tricep kickbacks with steady core.', category: 'arms', disciplines: ['yoga'], equipment: ['weights'] },
  { name: 'Warrior 3 Taps', detail: 'Tap down from warrior 3 and lift back to balance.', category: 'balance', disciplines: ['yoga', 'pilates'], equipment: [] },
  { name: 'Wide Second Pulses', detail: 'Sink into wide second, pulse down and hold low.', category: 'standing', disciplines: ['yoga', 'pilates'], equipment: ['weights'], pulse: true },
  { name: 'Bridge Full Range', detail: 'Lift and lower hips with control, ribs knit down.', category: 'bridge', disciplines: ['pilates', 'yoga'], equipment: [] },
  { name: 'Bridge Pulses', detail: 'Hold at the top and pulse through the glutes.', category: 'bridge', disciplines: ['pilates', 'yoga'], equipment: [], pulse: true },
  { name: 'Skull Crushers in Bridge', detail: 'Keep hips lifted while elbows bend and extend.', category: 'bridge', disciplines: ['pilates'], equipment: ['weights'], scoreBoost: 6 },
  { name: 'Ball Roll-Ups', detail: 'Ball behind low back, curl up and down through full range.', category: 'core', disciplines: ['pilates', 'yoga'], equipment: ['ball'] },
  { name: 'Seated Twist Pulses', detail: 'Hold a C-curve, rotate side to side, then pulse in the twist.', category: 'core', disciplines: ['pilates'], equipment: [], pulse: true },
  { name: 'Dead Bug Press', detail: 'Press ball or hands into thighs, alternate leg lowers.', category: 'core', disciplines: ['pilates'], equipment: ['ball'] },
  { name: 'Plank Knee Drives', detail: 'High plank, drive knee to chest and tap back with control.', category: 'core', disciplines: ['yoga', 'pilates'], equipment: [] },
  { name: 'Serve the Platter', detail: 'Arms reach forward and return, shoulders soft.', category: 'arms', disciplines: ['pilates'], equipment: ['weights'] },
  { name: 'Tricep Kickbacks', detail: 'Hinge forward, extend arms back, then hold and pulse.', category: 'arms', disciplines: ['yoga', 'pilates'], equipment: ['weights'], pulse: true },
  { name: 'Donkey Kicks', detail: 'Tabletop, press heel up through full range.', category: 'glute', disciplines: ['pilates'], equipment: ['band'] },
  { name: 'Fire Hydrant Pulses', detail: 'Open knee to the side, hold high and pulse.', category: 'glute', disciplines: ['pilates'], equipment: ['band'], pulse: true },
  { name: 'Rainbow Taps', detail: 'Sweep the leg over and tap side to side.', category: 'glute', disciplines: ['pilates'], equipment: [] },
  { name: 'Clam Shells', detail: 'Side lying, open and close top knee without rolling hips.', category: 'side', disciplines: ['pilates'], equipment: ['band'] },
  { name: 'Side-Lying Leg Circles', detail: 'Circle the top leg forward and back with steady hips.', category: 'side', disciplines: ['pilates'], equipment: [] },
  { name: 'Teaser Lifts', detail: 'Lift into teaser, lower slowly, then hold to finish.', category: 'core', disciplines: ['pilates'], equipment: [] },
  { name: 'Pigeon Hold', detail: 'Settle into pigeon, soften shoulders, breathe.', category: 'cooldown', disciplines: ['yoga'], equipment: [] },
  { name: 'Happy Baby', detail: 'Draw knees wide, release low back and hips.', category: 'cooldown', disciplines: ['yoga', 'pilates'], equipment: [] },
  { name: 'Supine Twists', detail: 'Drop knees side to side and breathe into the ribs.', category: 'cooldown', disciplines: ['yoga', 'pilates'], equipment: [] },
  { name: 'Bound Angle Breaths', detail: 'Soles together, knees wide, slow breath to close class.', category: 'cooldown', disciplines: ['yoga', 'pilates'], equipment: [] },
];

const GENERATED_STEP_FAMILIES = [
  {
    base: 'Breath Map',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🫁',
    variants: [
      ['Seated', 'Sit tall with both feet or shins grounded. Feel the ribs expand, then soften the shoulders.'],
      ['Supine', 'Lie on the back with knees bent. Breathe into the side ribs and let the low back get heavy.'],
      ['One Hand Belly', 'Place one hand on the belly and one on the chest. Keep the chest quiet while the belly rises and falls.'],
      ['Counted Breath', 'Inhale for 4 counts and exhale for 6 counts. Use the longer exhale to settle the room.'],
    ],
  },
  {
    base: 'Cat/Cow',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🐈',
    variants: [
      ['Slow Rounds', 'Start on hands and knees. Arch and round the spine slowly, one breath per movement.'],
      ['Tiny Range', 'Stay in a small range. Move only the upper back first, then include the whole spine.'],
      ['Hip Circles', 'From tabletop, circle the hips around the knees. Keep the movement smooth and easy.'],
      ['Thread the Needle Prep', 'Round the spine, then open one arm to the side. Keep the hips steady as the chest rotates.'],
    ],
  },
  {
    base: 'Hip Circles',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '⭕',
    variants: [
      ['Tabletop', 'Start on hands and knees. Circle the hips over the knees, then reverse direction.'],
      ['Seated', 'Sit tall and circle the ribs over the hips. Keep both sitting bones heavy.'],
      ['Standing', 'Stand with soft knees. Circle the pelvis slowly like drawing a small circle with the tailbone.'],
      ['Child Pose', 'From child pose, shift the hips right and left. Let the low back open gradually.'],
    ],
  },
  {
    base: 'Shoulder Rolls',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🙆‍♀️',
    variants: [
      ['Seated', 'Sit tall and roll shoulders up, back, and down. Keep the neck long.'],
      ['With Breath', 'Inhale shoulders up, exhale them down. Make the movement slow enough to calm the room.'],
      ['Single Arm', 'Roll one shoulder at a time. Notice if one side feels tighter.'],
      ['Wide Arm Sweep', 'Circle the arms out and around. Keep ribs soft instead of flaring forward.'],
    ],
  },
  {
    base: 'Seated Side Bend',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '↔️',
    variants: [
      ['Reach Over', 'Sit tall, reach one arm overhead, and lean to the side. Keep both hips grounded.'],
      ['Add Twist', 'Side bend first, then rotate the chest slightly up. Keep the breath easy.'],
      ['Elbow to Mat', 'Place one forearm down and reach the other arm long. Keep the opposite hip heavy.'],
      ['Pulse Open', 'Hold the side bend and make tiny lifts through the top ribs.', { pulse: true }],
    ],
  },
  {
    base: 'Wrist Warm-Up',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🤲',
    variants: [
      ['Palm Press', 'Press palms together at the chest. Gently lower hands until the wrists feel a stretch.'],
      ['Tabletop Rocks', 'Place hands under shoulders and rock forward and back. Keep pressure even through the fingers.'],
      ['Finger Turns', 'Turn fingers slightly out, then slightly toward knees. Move slowly and keep it pain free.'],
      ['Fist Option', 'Make soft fists under shoulders. Use this if flat palms feel tender.'],
    ],
  },
  {
    base: 'Spinal Roll Down',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🌊',
    variants: [
      ['Standing', 'Stand with soft knees. Roll down one bone at a time, then stack back up slowly.'],
      ['Halfway Lift', 'Roll down, then lengthen the spine halfway. Keep the neck in line with the back.'],
      ['With Arm Hang', 'Let the arms hang heavy. Shake the head gently yes and no.'],
      ['Slow Stack', 'Take extra time to rebuild posture from the feet to the crown of the head.'],
    ],
  },
  {
    base: 'Ankle and Knee Warm-Up',
    category: 'warmup',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🦶',
    variants: [
      ['Heel Lifts', 'Stand tall and lift heels up and down. Keep the movement smooth and controlled.'],
      ['Toe Taps', 'Tap toes forward one foot at a time. Keep weight even through the standing leg.'],
      ['Knee Bends', 'Bend and straighten both knees. Track knees over the middle toes.'],
      ['Ankle Circles', 'Lift one foot and circle the ankle both directions. Use a wall or chair if balance feels shaky.'],
    ],
  },
  {
    base: 'Chair Pose',
    category: 'standing',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🪑',
    variants: [
      ['Hold', 'Sit hips back like a chair. Keep chest lifted and weight in the heels.'],
      ['Pulses', 'Hold chair and pulse an inch down and up. Keep knees tracking forward.', { pulse: true }],
      ['Twist', 'Bring hands to heart and rotate the chest to one side. Keep both knees even.'],
      ['Heel Lift', 'Hold chair and lift heels. Keep inner thighs drawing toward each other.'],
    ],
  },
  {
    base: 'Warrior Two',
    category: 'standing',
    disciplines: ['yoga'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Hold', 'Open to warrior two. Stack shoulders over hips and look over the front hand.'],
      ['Straighten and Bend', 'Straighten the front leg, then bend back into warrior two. Keep arms long.'],
      ['Reach Forward and Back', 'Reach front arm forward, then return to center. Keep the front knee steady.'],
      ['Pulse Low', 'Stay in warrior two and pulse the front knee deeper and lighter.', { pulse: true }],
    ],
  },
  {
    base: 'Crescent Lunge',
    category: 'standing',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Hold', 'Step one foot back and lift the back heel. Bend the front knee over the ankle.'],
      ['Knee Taps', 'Lower the back knee toward the mat, then lift. Keep the front foot grounded.'],
      ['Twist', 'Bring hands to heart and rotate toward the front leg. Keep hips square.'],
      ['Reach and Pull', 'Reach arms overhead, then pull elbows down by the ribs. Keep the core steady.'],
    ],
  },
  {
    base: 'Wide Second',
    category: 'standing',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Full Range', 'Turn toes slightly out. Bend and straighten the knees with a tall spine.'],
      ['Pulses', 'Hold low and pulse. Keep knees pointing the same direction as toes.', { pulse: true }],
      ['Heel Lifts', 'Stay low and lift one heel, then the other. Keep hips level.'],
      ['Side Reach', 'Hold wide second and reach side to side. Keep the low body steady.'],
    ],
  },
  {
    base: 'Goddess Squat',
    category: 'standing',
    disciplines: ['yoga'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Hold', 'Step wide with toes turned out. Bend knees and stack shoulders over hips.'],
      ['Oblique Reach', 'Hold goddess and reach one elbow toward the same knee. Alternate sides slowly.'],
      ['Calf Raises', 'Stay low and lift both heels. Keep the inner thighs active.'],
      ['Arm Goalposts', 'Hold arms in goalpost shape. Squeeze shoulder blades gently together.'],
    ],
  },
  {
    base: 'Squat',
    category: 'standing',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Sit Back', 'Stand feet hip width. Sit hips back, then press through heels to stand.'],
      ['Pulse Low', 'Hold the bottom of the squat and pulse in a tiny range.', { pulse: true }],
      ['Knee Lift', 'Stand from the squat and lift one knee. Alternate sides with control.'],
      ['Reach Forward', 'Reach arms forward as hips sit back. Keep the chest broad.'],
    ],
  },
  {
    base: 'Sun A',
    category: 'standing',
    disciplines: ['yoga'],
    equipment: [],
    emoji: '☀️',
    variants: [
      ['Slow Flow', 'Move from mountain to forward fold, halfway lift, plank, and back. Match movement to breath.'],
      ['No Pushup', 'Step back to plank, then step forward again. Skip the pushup for a simpler flow.'],
      ['Knees Down', 'Lower knees in plank before moving through the transition. Keep shoulders away from ears.'],
      ['Strong Pace', 'Flow one breath per movement. Keep cues short so students can stay with you.'],
    ],
  },
  {
    base: 'Step-Back Lunge',
    category: 'standing',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Alternating', 'Step one foot back to a lunge, then return to standing. Alternate sides.'],
      ['Tap Back', 'Tap the foot back without dropping low. Keep it simple for balance.'],
      ['Pulse Back', 'Step back and pulse the back knee down and up.', { pulse: true }],
      ['Knee Drive', 'Step back, then drive the back knee forward. Stand tall at the top.'],
    ],
  },
  {
    base: 'Bicep Curls',
    category: 'arms',
    disciplines: ['pilates', 'yoga'],
    equipment: ['weights'],
    emoji: '💪',
    variants: [
      ['Full Range', 'Hold light weights by your sides. Bend elbows, then lower with control.'],
      ['Halfway Hold', 'Hold elbows at 90 degrees. Keep shoulders soft and ribs down.'],
      ['Tiny Pulses', 'Hold halfway and pulse the weights up one inch.', { pulse: true }],
      ['Wide Curl', 'Open elbows wider and curl toward shoulders. Keep wrists straight.'],
    ],
  },
  {
    base: 'Tricep Kickbacks',
    category: 'arms',
    disciplines: ['pilates', 'yoga'],
    equipment: ['weights'],
    emoji: '💪',
    variants: [
      ['Hinge', 'Hinge forward with a long spine. Extend elbows back, then bend slowly.'],
      ['Hold Long', 'Hold arms straight behind you. Keep the neck relaxed.'],
      ['Pulse Back', 'Hold arms long and pulse them slightly higher.', { pulse: true }],
      ['One Arm', 'Work one arm at a time. Keep the opposite hand on hip for balance.'],
    ],
  },
  {
    base: 'Lateral Raises',
    category: 'arms',
    disciplines: ['pilates', 'yoga'],
    equipment: ['weights'],
    emoji: '💪',
    variants: [
      ['Shoulder Height', 'Lift weights out to shoulder height, then lower slowly. Keep elbows soft.'],
      ['Low Pulses', 'Lift halfway and pulse in a small range.', { pulse: true }],
      ['Hold and Lower', 'Hold at shoulder height for one breath, then lower with control.'],
      ['Alternating', 'Lift one arm at a time. Keep the torso still.'],
    ],
  },
  {
    base: 'Overhead Press',
    category: 'arms',
    disciplines: ['pilates', 'yoga'],
    equipment: ['weights'],
    emoji: '💪',
    variants: [
      ['Full Press', 'Start weights at shoulders. Press overhead, then return slowly.'],
      ['Single Arm', 'Press one arm overhead at a time. Keep ribs from popping forward.'],
      ['Goalpost Pulses', 'Hold elbows wide at shoulder height and pulse up.', { pulse: true }],
      ['Narrow Press', 'Keep elbows forward and press weights straight up. Stay tall through the spine.'],
    ],
  },
  {
    base: 'Serve the Platter',
    category: 'arms',
    disciplines: ['pilates'],
    equipment: ['weights'],
    emoji: '💪',
    variants: [
      ['Forward Reach', 'Start elbows by ribs. Reach weights forward like offering a tray, then pull back.'],
      ['Hold Forward', 'Hold arms forward and keep collarbones wide. Breathe without lifting shoulders.'],
      ['Pulse Forward', 'Hold arms forward and pulse one inch.', { pulse: true }],
      ['Open and Close', 'Reach forward, open arms slightly, then close and return. Keep wrists long.'],
    ],
  },
  {
    base: 'Hug a Tree',
    category: 'arms',
    disciplines: ['pilates'],
    equipment: ['weights'],
    emoji: '💪',
    variants: [
      ['Round Arms', 'Open arms wide with soft elbows. Close arms like hugging a tree.'],
      ['High Hold', 'Hold arms rounded at chest height. Keep shoulders dropped.'],
      ['Small Squeeze', 'Close arms halfway and pulse inward.', { pulse: true }],
      ['One Foot Balance', 'Repeat the arm pattern while one heel lifts. Keep the movement small.'],
    ],
  },
  {
    base: 'Plank Shoulder Taps',
    category: 'arms',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '💪',
    variants: [
      ['High Plank', 'Start in high plank. Tap one hand to the opposite shoulder without rocking hips.'],
      ['Knees Down', 'Lower knees and tap shoulders. Keep the core gently pulled in.'],
      ['Slow Count', 'Pause after each tap. Make the body quiet before switching sides.'],
      ['Wide Feet', 'Step feet wider for more support. Keep shoulders over wrists.'],
    ],
  },
  {
    base: 'Tree Pose',
    category: 'balance',
    disciplines: ['yoga'],
    equipment: [],
    emoji: '⚖️',
    variants: [
      ['Kickstand', 'Keep toes on the floor and heel at the ankle. Hands can stay at heart.'],
      ['Calf', 'Place foot at calf height. Press foot and leg gently into each other.'],
      ['Arms Overhead', 'Hold tree and reach arms overhead. Keep the standing knee soft.'],
      ['Sway Test', 'Hold tree and slowly turn the head side to side. Keep breath steady.'],
    ],
  },
  {
    base: 'Warrior 3',
    category: 'balance',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '⚖️',
    variants: [
      ['Tap and Lift', 'Hinge forward and lift the back leg. Tap toes down, then lift again.'],
      ['Airplane Arms', 'Reach arms back by hips. Keep chest broad and standing leg strong.'],
      ['Knee Drive', 'Move from warrior 3 to knee drive. Stand tall before hinging again.'],
      ['Tiny Pulses', 'Hold warrior 3 and pulse the lifted leg up one inch.', { pulse: true }],
    ],
  },
  {
    base: 'Airplane Balance',
    category: 'balance',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '⚖️',
    variants: [
      ['Open Chest', 'Hinge forward with arms wide. Keep hips as level as possible.'],
      ['Bend Standing Knee', 'Hold airplane and bend the standing knee slightly, then straighten.'],
      ['Reach Forward', 'Reach both arms forward while the back leg stays lifted. Keep the neck long.'],
      ['Tap Back', 'Tap the lifted foot down behind you, then float it back up.'],
    ],
  },
  {
    base: 'Half Moon Prep',
    category: 'balance',
    disciplines: ['yoga'],
    equipment: [],
    emoji: '⚖️',
    variants: [
      ['Hand to Block Shape', 'Place fingertips toward the floor or shin. Open the top hip and chest.'],
      ['Wall Option', 'Imagine the back body against a wall. Stack hips and keep the lifted foot active.'],
      ['Top Arm Reach', 'Reach top arm up after the chest opens. Keep gaze wherever balance feels steady.'],
      ['Tiny Leg Lifts', 'Hold the shape and lift the top leg one inch.', { pulse: true }],
    ],
  },
  {
    base: 'Standing Knee Lift',
    category: 'balance',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '⚖️',
    variants: [
      ['Hold Knee', 'Stand tall and lift one knee to hip height. Keep the standing foot rooted.'],
      ['Toe Tap', 'Tap toes down, then lift the knee again. Move slowly.'],
      ['Twist Toward Knee', 'Lift knee and rotate chest toward it. Keep hips facing forward.'],
      ['Reach and Pull', 'Reach arms up, then pull elbows down as the knee lifts.'],
    ],
  },
  {
    base: 'Single-Leg Deadlift',
    category: 'balance',
    disciplines: ['pilates', 'yoga'],
    equipment: ['weights'],
    emoji: '⚖️',
    variants: [
      ['Light Weights', 'Hold weights at thighs. Hinge forward and float one leg back, then stand.'],
      ['Tap Back', 'Keep back toes close to the floor for support. Hinge and return slowly.'],
      ['Row Add-On', 'Hold the hinge and pull elbows back for one row. Keep spine long.'],
      ['Pulse Lifted Leg', 'Hold the hinge and pulse the back leg up one inch.', { pulse: true }],
    ],
  },
  {
    base: 'Figure Four Chair',
    category: 'balance',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '⚖️',
    variants: [
      ['Hold', 'Cross one ankle over the opposite thigh. Sit hips back and keep the foot flexed.'],
      ['Tiny Squat', 'Stay crossed and bend the standing knee a little deeper, then lift.'],
      ['Hands to Heart', 'Bring hands to heart and keep the spine long. Breathe into the outer hip.'],
      ['Reach Forward', 'Reach arms forward while hips sit back. Keep balance steady before going lower.'],
    ],
  },
  {
    base: 'Bridge',
    category: 'bridge',
    disciplines: ['pilates', 'yoga'],
    equipment: [],
    emoji: '🍑',
    variants: [
      ['Articulation', 'Lie on back with knees bent. Roll hips up and down one bone at a time.'],
      ['Full Range', 'Lift hips and lower as one piece. Keep ribs soft and knees forward.'],
      ['Top Hold', 'Hold hips high. Squeeze glutes and keep weight across both feet.'],
      ['Pulses', 'Hold at the top and pulse hips up one inch.', { pulse: true }],
    ],
  },
  {
    base: 'Single-Leg Bridge',
    category: 'bridge',
    disciplines: ['pilates', 'yoga'],
    equipment: [],
    emoji: '🍑',
    variants: [
      ['Foot Flexed', 'Lift one leg with foot flexed. Bridge up and down without dropping one hip.'],
      ['Toe to Ceiling', 'Reach one leg up. Lift and lower hips while both hip points stay level.'],
      ['Figure Four', 'Cross one ankle over the opposite thigh. Bridge up through the standing heel.'],
      ['Tiny Pulses', 'Hold single-leg bridge and pulse hips up one inch.', { pulse: true }],
    ],
  },
  {
    base: 'Marching Bridge',
    category: 'bridge',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🍑',
    variants: [
      ['Slow March', 'Hold bridge and lift one foot at a time. Keep hips quiet.'],
      ['Toe Tap', 'Lift one knee, tap toes down, then switch. Keep the pelvis steady.'],
      ['Heel Dig', 'Dig one heel down as the other knee lifts. Keep hamstrings active.'],
      ['Hold and Switch', 'Pause with each knee lifted before changing sides.'],
    ],
  },
  {
    base: 'Bridge with Ball',
    category: 'bridge',
    disciplines: ['pilates'],
    equipment: ['ball'],
    emoji: '🏐',
    variants: [
      ['Ball Between Knees', 'Place ball between knees. Bridge up and gently squeeze the ball.'],
      ['Squeeze Pulses', 'Hold bridge and pulse the knees into the ball.', { pulse: true }],
      ['Feet on Ball', 'Place feet on the ball if steady. Lift hips carefully and keep the ball still.'],
      ['Hamstring Curl', 'Feet on ball, roll ball in and out. Keep hips lifted if control is there.'],
    ],
  },
  {
    base: 'Bridge with Band',
    category: 'bridge',
    disciplines: ['pilates'],
    equipment: ['band'],
    emoji: '🔗',
    variants: [
      ['Knees Press Out', 'Band above knees. Bridge up and press knees gently wide.'],
      ['Out-Out-In', 'Hold bridge. Press knees out twice, then return to center.'],
      ['Pulse Knees Wide', 'Hold knees wide and pulse against the band.', { pulse: true }],
      ['Bridge March', 'Keep band active while lifting one foot at a time. Keep hips level.'],
    ],
  },
  {
    base: 'Bridge with Weights',
    category: 'bridge',
    disciplines: ['pilates'],
    equipment: ['weights'],
    emoji: '🏋️',
    variants: [
      ['Chest Press', 'Hold bridge and press weights over chest. Keep hips lifted.'],
      ['Skull Crusher', 'Hold weights over shoulders. Bend elbows, then straighten while hips stay high.'],
      ['Pullover', 'Reach weights overhead and return over chest. Keep ribs heavy.'],
      ['Chest Fly', 'Open weights wide, then close over chest. Keep shoulders grounded.'],
    ],
  },
  {
    base: 'Shoulder Bridge',
    category: 'bridge',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🍑',
    variants: [
      ['Kick Up', 'Hold bridge with one leg lifted. Kick the leg up and lower to hip height.'],
      ['Point Flex', 'Hold leg high and point then flex the foot. Keep hips steady.'],
      ['Lower Lift', 'Lower the lifted leg slightly and lift again. Keep pelvis quiet.'],
      ['Switch Sides', 'Lower the first foot and repeat on the other side with control.'],
    ],
  },
  {
    base: 'Dead Bug',
    category: 'core',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🔥',
    variants: [
      ['Arms Only', 'Lie on back, knees bent. Reach arms overhead and return while ribs stay heavy.'],
      ['Legs Only', 'Hold tabletop legs. Lower one heel toward the mat, then switch.'],
      ['Opposite Arm Leg', 'Reach opposite arm and leg away. Keep the low back steady.'],
      ['Slow Count', 'Move for four counts out and four counts back. Keep breathing.'],
    ],
  },
  {
    base: 'Hundred',
    category: 'core',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🔥',
    variants: [
      ['Bent Knees', 'Curl head and shoulders up, knees bent. Pump arms while breathing in and out.'],
      ['Tabletop', 'Lift legs to tabletop. Keep the curl small and steady.'],
      ['Legs Long', 'Extend legs on a diagonal only if the back stays steady.'],
      ['Ball Under Sacrum', 'Place ball under hips for support. Pump arms and keep breath rhythmic.', { equipment: ['ball'] }],
    ],
  },
  {
    base: 'Roll-Up',
    category: 'core',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🌀',
    variants: [
      ['Half Roll Back', 'Sit tall with knees bent. Roll halfway back, then return upright.'],
      ['Full Roll-Up', 'Lie down with arms overhead. Roll up slowly and reach past toes.'],
      ['With Ball', 'Hold the ball in hands. Use it as a reach point as you roll up and down.', { equipment: ['ball'] }],
      ['With Weights', 'Hold light weights and keep the movement small. Curl with control.', { equipment: ['weights'] }],
    ],
  },
  {
    base: 'Plank',
    category: 'core',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🔥',
    variants: [
      ['High Hold', 'Set shoulders over wrists and step feet back. Press the floor away.'],
      ['Knees Down', 'Lower knees for support. Keep hips forward and core active.'],
      ['Toe Taps', 'Hold plank and tap one foot wider, then back to center.'],
      ['Knee Drives', 'Drive one knee toward chest, then step back. Alternate sides.'],
    ],
  },
  {
    base: 'Forearm Plank',
    category: 'core',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🔥',
    variants: [
      ['Hold', 'Place forearms down and step feet back. Keep head, ribs, and hips in one line.'],
      ['Hip Dips', 'Rotate hips slightly side to side. Keep shoulders steady.'],
      ['Knee Taps', 'Tap knees down lightly, then lift. Keep the spine long.'],
      ['Reach Forward', 'Reach one hand forward, then return. Keep hips from rocking.'],
    ],
  },
  {
    base: 'Teaser Prep',
    category: 'core',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🔥',
    variants: [
      ['Hands Behind Thighs', 'Sit behind sitting bones and hold thighs. Lift chest while legs float.'],
      ['One Leg Extend', 'Hold teaser shape and extend one leg at a time. Keep the chest lifted.'],
      ['Arms Reach', 'Reach arms forward without rounding shoulders. Keep the low belly active.'],
      ['Tiny Lower Lift', 'Lower the torso one inch, then lift back up.', { pulse: true }],
    ],
  },
  {
    base: 'Criss Cross',
    category: 'core',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🌀',
    variants: [
      ['Slow Twist', 'Curl up with hands behind head. Rotate one shoulder toward opposite knee.'],
      ['Toe Tap', 'Keep knees bent and tap one toe as you twist. Switch sides slowly.'],
      ['Leg Long', 'Extend one leg as you rotate. Keep elbows wide.'],
      ['Pulse Twist', 'Hold one twist and pulse slightly deeper.', { pulse: true }],
    ],
  },
  {
    base: 'Tabletop Toe Taps',
    category: 'core',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🔥',
    variants: [
      ['Single Toe', 'Lie on back with legs in tabletop. Tap one toe down and return.'],
      ['Double Toe', 'Tap both toes down together only as low as the back stays steady.'],
      ['Alternating Arms', 'Add opposite arm reaching overhead as one toe taps.'],
      ['Ball Squeeze', 'Hold ball between knees and tap toes while keeping the squeeze light.', { equipment: ['ball'] }],
    ],
  },
  {
    base: 'Ball Pass',
    category: 'core',
    disciplines: ['pilates', 'yoga'],
    equipment: ['ball'],
    emoji: '🏐',
    variants: [
      ['Hands to Knees', 'Curl up and pass the ball from hands to knees. Lower with control.'],
      ['Hands to Ankles', 'Pass the ball farther down the legs if the back stays steady.'],
      ['Single Leg', 'Pass the ball toward one leg, then switch sides. Keep the curl small.'],
      ['Hold and Squeeze', 'Hold the curl and squeeze the ball lightly for three breaths.'],
    ],
  },
  {
    base: 'Side Plank',
    category: 'core',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🔥',
    variants: [
      ['Knee Down', 'Set bottom knee down and lift hips. Reach top arm up.'],
      ['Full Hold', 'Stack feet or stagger them. Lift hips and keep chest open.'],
      ['Thread Through', 'Reach top arm under the ribs, then open back up.'],
      ['Hip Dips', 'Lower hips one inch, then lift again.', { pulse: true }],
    ],
  },
  {
    base: 'Donkey Kick',
    category: 'glute',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Full Range', 'Start in tabletop. Bend one knee and press the heel up, then lower.'],
      ['Tiny Pulses', 'Hold the heel high and pulse up one inch.', { pulse: true }],
      ['Straighten Bend', 'Hold thigh lifted. Bend and straighten the knee without dropping the leg.'],
      ['Band Press', 'Add band above knees and press up against the band.', { equipment: ['band'] }],
    ],
  },
  {
    base: 'Fire Hydrant',
    category: 'glute',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Open Close', 'From tabletop, open one knee to the side and lower. Keep hips quiet.'],
      ['Pulses', 'Hold the knee open and pulse up one inch.', { pulse: true }],
      ['Extend Side', 'Open knee, then extend the leg to the side. Bend and return.'],
      ['Band Open', 'Use a band above knees and open against the band with control.', { equipment: ['band'] }],
    ],
  },
  {
    base: 'Tabletop Leg Extension',
    category: 'glute',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Reach Back', 'From tabletop, reach one leg straight back and return knee under hip.'],
      ['Lift Lower', 'Keep leg long and lift it up and down. Keep hips level.'],
      ['Tap Corners', 'Tap toes to the back corner of the mat, then lift center.'],
      ['Rainbow', 'Sweep the long leg in an arc from one side to the other.'],
    ],
  },
  {
    base: 'Kneeling Side Kick',
    category: 'glute',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Forward Back', 'Kneel with one hand down. Kick the top leg forward and back.'],
      ['Lift Lower', 'Keep leg to the side and lift it up and down. Keep waist long.'],
      ['Small Circles', 'Circle the top leg in both directions. Keep the pelvis steady.'],
      ['Pulse High', 'Hold leg lifted and pulse one inch.', { pulse: true }],
    ],
  },
  {
    base: 'Standing Glute Kickback',
    category: 'glute',
    disciplines: ['pilates', 'yoga'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Tap Back', 'Stand tall and tap one foot back, then lift slightly. Keep hips forward.'],
      ['Hinge Kick', 'Hinge forward and press the back leg up. Keep the standing knee soft.'],
      ['Band Kickback', 'Place band above knees and kick back against the band.', { equipment: ['band'] }],
      ['Pulse Back', 'Hold leg back and pulse up one inch.', { pulse: true }],
    ],
  },
  {
    base: 'Squat to Leg Lift',
    category: 'glute',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🦵',
    variants: [
      ['Side Lift', 'Squat down, stand up, and lift one leg to the side. Alternate sides.'],
      ['Back Lift', 'Squat down, stand up, and lift one leg behind you. Keep torso tall.'],
      ['Band Side Lift', 'Use band above knees and lift the leg to the side after each squat.', { equipment: ['band'] }],
      ['Pulse Squat', 'Add two small pulses at the bottom before standing.', { pulse: true }],
    ],
  },
  {
    base: 'Band Walk',
    category: 'glute',
    disciplines: ['pilates'],
    equipment: ['band'],
    emoji: '🔗',
    variants: [
      ['Side Steps', 'Band above knees. Step side to side with knees slightly bent.'],
      ['Low Walk', 'Stay low in a mini squat and take small side steps.'],
      ['Forward Back', 'Step forward and back with tension on the band. Keep knees apart.'],
      ['Pulse Out', 'Hold feet wide and pulse knees out against the band.', { pulse: true }],
    ],
  },
  {
    base: 'Clam Shells',
    category: 'side',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🐚',
    variants: [
      ['Full Range', 'Lie on side with knees bent. Open top knee without rolling hips back.'],
      ['Pulses', 'Hold the top knee open and pulse in a tiny range.', { pulse: true }],
      ['Band Open', 'Add band above knees and open against the band.', { equipment: ['band'] }],
      ['Feet Lifted', 'Keep feet lifted while the top knee opens and closes.'],
    ],
  },
  {
    base: 'Side Leg Lift',
    category: 'side',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🤸‍♀️',
    variants: [
      ['Full Range', 'Lie on side with legs long. Lift and lower the top leg with hips stacked.'],
      ['Pulses', 'Hold the leg high and pulse one inch.', { pulse: true }],
      ['Toe Down', 'Turn toes slightly toward the floor and lift from the outer hip.'],
      ['Band Lift', 'Add band above ankles or knees and lift with control.', { equipment: ['band'] }],
    ],
  },
  {
    base: 'Inner Thigh Lift',
    category: 'side',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🤸‍♀️',
    variants: [
      ['Bottom Leg', 'Lie on side, top foot in front. Lift the bottom leg up and down.'],
      ['Pulse High', 'Hold bottom leg lifted and pulse one inch.', { pulse: true }],
      ['Circle', 'Keep bottom leg lifted and draw small circles both directions.'],
      ['Ball Squeeze', 'Place ball between ankles or knees and squeeze gently.', { equipment: ['ball'] }],
    ],
  },
  {
    base: 'Side Kick',
    category: 'side',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '🤸‍♀️',
    variants: [
      ['Forward Back', 'Lie on side and kick the top leg forward, then sweep it back. Keep torso still.'],
      ['Small Kicks', 'Kick forward twice, then reach back once. Keep the movement controlled.'],
      ['Lift Kick', 'Lift top leg, kick forward, then return to center.'],
      ['Slow Sweep', 'Move the leg forward and back slowly enough to keep hips stacked.'],
    ],
  },
  {
    base: 'Side Plank Series',
    category: 'side',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🤸‍♀️',
    variants: [
      ['Knee Down Lift', 'Set bottom knee down and lift hips. Lower and lift with control.'],
      ['Top Leg Lift', 'Hold side plank and lift the top leg. Keep the chest open.'],
      ['Reach Under', 'Thread top arm under the ribs, then open back up.'],
      ['Hip Pulse', 'Hold side plank and pulse hips higher.', { pulse: true }],
    ],
  },
  {
    base: 'Mermaid',
    category: 'side',
    disciplines: ['pilates', 'yoga'],
    equipment: [],
    emoji: '🧜‍♀️',
    variants: [
      ['Side Reach', 'Sit with knees folded to one side. Reach the top arm overhead and breathe.'],
      ['Add Rotation', 'Side bend first, then rotate the chest toward the mat.'],
      ['Forearm Down', 'Lower to one forearm and reach the top arm long. Keep both hips heavy.'],
      ['Breath Hold', 'Hold the stretch for three slow breaths before switching sides.'],
    ],
  },
  {
    base: 'Side-Lying Circles',
    category: 'side',
    disciplines: ['pilates'],
    equipment: [],
    emoji: '⭕',
    variants: [
      ['Small Forward', 'Lie on side and circle the top leg forward. Keep the waist lifted.'],
      ['Small Backward', 'Circle the top leg backward with the same small range.'],
      ['Big Circle', 'Draw a larger circle only if hips can stay stacked.'],
      ['Band Circle', 'Add band above knees or ankles and keep the circle controlled.', { equipment: ['band'] }],
    ],
  },
  {
    base: 'Child Pose',
    category: 'cooldown',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🧘‍♀️',
    variants: [
      ['Wide Knees', 'Bring big toes together and knees wide. Rest hips back and breathe.'],
      ['Side Reach', 'Walk hands to one side and breathe into the opposite ribs.'],
      ['Forehead Stack', 'Stack hands or fists under forehead if the floor feels far away.'],
      ['Thread Arm', 'Slide one arm under the other and rest the shoulder down gently.'],
    ],
  },
  {
    base: 'Figure Four Stretch',
    category: 'cooldown',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🧘‍♀️',
    variants: [
      ['Supine', 'Lie on back and cross ankle over thigh. Pull legs in only as far as comfortable.'],
      ['Seated', 'Sit tall and cross ankle over thigh. Hinge forward with a long spine.'],
      ['Rock Side to Side', 'Hold supine figure four and rock gently side to side.'],
      ['Breath Hold', 'Stay for five slow breaths and soften the jaw.'],
    ],
  },
  {
    base: 'Hamstring Stretch',
    category: 'cooldown',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🧘‍♀️',
    variants: [
      ['Supine Leg Up', 'Lie on back and extend one leg up. Hold behind thigh or calf, not the knee.'],
      ['Point Flex', 'Keep leg lifted and point then flex the foot slowly.'],
      ['Bent Knee', 'Bend the knee as much as needed. Focus on length behind the leg.'],
      ['Strap Shape', 'Use hands behind thigh like a strap. Keep shoulders relaxed.'],
    ],
  },
  {
    base: 'Supine Twist',
    category: 'cooldown',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🌀',
    variants: [
      ['Knees Together', 'Drop both knees to one side and open arms wide. Breathe into the ribs.'],
      ['Single Knee', 'Draw one knee across the body. Keep the opposite shoulder heavy.'],
      ['Figure Four Twist', 'Cross one ankle over thigh, then let the shape rotate to the side.'],
      ['Slow Switch', 'Move knees side to side slowly before holding the second side.'],
    ],
  },
  {
    base: 'Pigeon Prep',
    category: 'cooldown',
    disciplines: ['yoga'],
    equipment: [],
    emoji: '🧘‍♀️',
    variants: [
      ['Folded', 'Bring one shin forward and fold over it. Keep the back leg relaxed.'],
      ['Upright', 'Stay upright with hands under shoulders. Lengthen the chest forward.'],
      ['Figure Four Option', 'Use supine figure four instead if pigeon feels too intense.'],
      ['Breath Count', 'Hold for five slow breaths, then switch sides carefully.'],
    ],
  },
  {
    base: 'Happy Baby',
    category: 'cooldown',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🧘‍♀️',
    variants: [
      ['Hold Feet', 'Lie on back and hold feet or behind thighs. Let knees drop wide.'],
      ['Rock', 'Rock gently side to side. Keep shoulders heavy on the mat.'],
      ['One Leg', 'Hold one leg in happy baby while the other foot rests down. Switch sides.'],
      ['Long Exhale', 'Stay still and use long exhales to release the low back.'],
    ],
  },
  {
    base: 'Neck and Shoulder Release',
    category: 'cooldown',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🧘‍♀️',
    variants: [
      ['Ear to Shoulder', 'Sit tall and let one ear move toward the shoulder. Keep both shoulders low.'],
      ['Chin to Chest', 'Drop chin toward chest and breathe across the back of the neck.'],
      ['Hand Behind Back', 'Take one hand behind the back and tilt head away. Keep it gentle.'],
      ['Shoulder Squeeze', 'Interlace hands behind back or hold elbows. Open the chest softly.'],
    ],
  },
];

function expandStepFamilies(families) {
  return families.flatMap(family => family.variants.map(([variant, detail, options = {}]) => ({
    name: `${family.base} - ${variant}`,
    detail,
    category: family.category,
    disciplines: family.disciplines,
    equipment: [...new Set([...(family.equipment || []), ...(options.equipment || [])])],
    emoji: family.emoji,
    pulse: options.pulse === true,
  })));
}

export const STEP_LIBRARY = Object.freeze([
  ...LEGACY_STEP_LIBRARY,
  ...expandStepFamilies(GENERATED_STEP_FAMILIES),
  {
    name: 'Final Class Reset',
    detail: 'Have students place one hand on heart and one on belly. Take one quiet breath before sitting up.',
    category: 'cooldown',
    disciplines: ['yoga', 'pilates'],
    equipment: [],
    emoji: '🫁',
  },
]);

export function getSuggestionLibraryStats() {
  const categories = new Set(STEP_LIBRARY.map(step => step.category));
  const yogaCompatible = STEP_LIBRARY.filter(step => step.disciplines.includes('yoga')).length;
  const pilatesCompatible = STEP_LIBRARY.filter(step => step.disciplines.includes('pilates')).length;
  const shared = STEP_LIBRARY.filter(step => step.disciplines.includes('yoga') && step.disciplines.includes('pilates')).length;
  return {
    total: STEP_LIBRARY.length,
    categories: categories.size,
    yogaCompatible,
    pilatesCompatible,
    shared,
  };
}

const COMPLETION_BLUEPRINTS = {
  pilates: [
    { category: 'warmup', title: 'Warm-up', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)', count: 3 },
    { category: 'core', title: 'Core Primer', emoji: '🔥', equipment: ['ball'], color: 'var(--slate)', count: 4 },
    { category: 'bridge', title: 'Bridge Series', emoji: '🍑', equipment: ['weights'], color: 'var(--rose)', count: 4 },
    { category: 'glute', title: 'Tabletop Glute', emoji: '🦵', equipment: ['band'], color: 'var(--sage)', count: 4 },
    { category: 'side', title: 'Side Body', emoji: '🤸‍♀️', equipment: [], color: 'var(--teal)', count: 4 },
    { category: 'cooldown', title: 'Stretch', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)', count: 3 },
  ],
  yoga: [
    { category: 'warmup', title: 'Warm-up', emoji: '🌅', equipment: [], color: 'var(--amber)', count: 3 },
    { category: 'standing', title: 'Standing Flow', emoji: '☀️', equipment: ['weights'], color: 'var(--sage)', count: 4 },
    { category: 'balance', title: 'Balance Flow', emoji: '⚖️', equipment: ['weights'], color: 'var(--teal)', count: 3 },
    { category: 'core', title: 'Core Intermission', emoji: '🔥', equipment: ['ball'], color: 'var(--slate)', count: 3 },
    { category: 'cooldown', title: 'Cool Down', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)', count: 3 },
  ],
  custom: [
    { category: 'warmup', title: 'Warm-up', emoji: '🌅', equipment: [], color: 'var(--amber)', count: 3 },
    { category: 'core', title: 'Core', emoji: '🔥', equipment: [], color: 'var(--slate)', count: 3 },
    { category: 'standing', title: 'Standing Work', emoji: '🦵', equipment: [], color: 'var(--sage)', count: 3 },
    { category: 'cooldown', title: 'Cool Down', emoji: '🧘‍♀️', equipment: [], color: 'var(--amber)', count: 3 },
  ],
};

const CATEGORY_EMOJI = {
  arms: '💪',
  balance: '⚖️',
  bridge: '🍑',
  cooldown: '🧘‍♀️',
  core: '🔥',
  glute: '🦵',
  side: '🤸‍♀️',
  standing: '🦵',
  warmup: '🌅',
};

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function usedStepNames(state) {
  return new Set(
    state.blocks
      .flatMap(block => block.steps || [])
      .map(step => normalize(step.name)),
  );
}

function focusedCategory(focus) {
  if (focus === 'stretch') return 'cooldown';
  if (['arms', 'balance', 'core', 'glute'].includes(focus)) return focus;
  return null;
}

function preferredEquipment(state) {
  return new Set(state.planningPrefs?.equipment || []);
}

function completionLimit(state, fallbackLimit) {
  if (Number.isFinite(fallbackLimit)) return fallbackLimit;
  if (state.planningPrefs?.duration === '30') return 2;
  if (state.planningPrefs?.duration === '60') return 4;
  return 3;
}

export function inferBlockCategory(block) {
  const text = normalize(`${block?.title || ''} ${(block?.steps || []).map(step => `${step.name} ${step.detail}`).join(' ')}`);
  if (/warm|breath|cat cow|intention/.test(text)) return 'warmup';
  if (/cool|stretch|savasana|happy baby|pigeon|bound angle/.test(text)) return 'cooldown';
  if (/bridge|skull crusher|hip/.test(text)) return 'bridge';
  if (/glute|donkey|fire hydrant|kick|tabletop/.test(text)) return 'glute';
  if (/side|clam|sideline|inner thigh/.test(text)) return 'side';
  if (/core|plank|teaser|roll up|ab/.test(text)) return 'core';
  if (/arm|tricep|serve|curl|press/.test(text)) return 'arms';
  if (/balance|warrior 3|tree|half moon/.test(text)) return 'balance';
  if (/standing|lunge|warrior|chair|sun|flow/.test(text)) return 'standing';
  return 'core';
}

function stepFromLibrary(item) {
  return {
    name: item.name,
    detail: item.detail,
    emoji: item.emoji || CATEGORY_EMOJI[item.category] || guessEmoji(`${item.name} ${item.detail}`),
    tags: item.pulse ? ['pulse'] : [],
  };
}

export function suggestStepsForBlock(state, block, limit = 4) {
  const category = inferBlockCategory(block);
  const used = usedStepNames(state);
  const blockEquipment = new Set(block?.equipment || []);
  const discipline = state.discipline || 'custom';
  const focusCategory = focusedCategory(state.planningPrefs?.focus);
  const equipmentPrefs = preferredEquipment(state);
  const intensity = state.planningPrefs?.intensity || 'steady';

  return STEP_LIBRARY
    .filter(item => !used.has(normalize(item.name)))
    .map(item => {
      const equipmentOverlap = item.equipment.filter(eq => blockEquipment.has(eq)).length;
      const blockHasAllEquipment = item.equipment.every(eq => blockEquipment.has(eq));
      let score = 0;
      if (item.category === category) score += 30;
      if (item.disciplines.includes(discipline)) score += 12;
      if (discipline === 'custom') score += 4;
      if (focusCategory && item.category === focusCategory) score += 14;
      if (intensity === 'gentle' && !item.pulse && ['warmup', 'balance', 'cooldown'].includes(item.category)) score += 8;
      if (intensity === 'gentle' && item.pulse) score -= 8;
      if (intensity === 'strong' && (item.pulse || ['core', 'standing', 'glute'].includes(item.category))) score += 8;
      if (blockHasAllEquipment) score += 8;
      score += equipmentOverlap * 5;
      if (equipmentPrefs.size > 0) {
        const preferredOverlap = item.equipment.filter(eq => equipmentPrefs.has(eq)).length;
        score += preferredOverlap * 7;
        if (item.equipment.length && preferredOverlap === 0) score -= 4;
      }
      if (item.equipment.length === 0 && blockEquipment.size === 0) score += 4;
      if (item.pulse) score += 1;
      score += item.scoreBoost || 0;
      return { ...stepFromLibrary(item), category: item.category, equipment: item.equipment, score };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function routineCategories(state) {
  return new Set(
    state.blocks
      .filter(block => block.type !== 'transition')
      .map(inferBlockCategory),
  );
}

export function suggestRoutineCompletion(state, limit) {
  const discipline = COMPLETION_BLUEPRINTS[state.discipline] ? state.discipline : 'custom';
  const categories = routineCategories(state);
  const focusCategory = focusedCategory(state.planningPrefs?.focus);
  const equipmentPrefs = preferredEquipment(state);
  const missing = COMPLETION_BLUEPRINTS[discipline]
    .filter(part => !categories.has(part.category))
    .map((part, index) => {
      let score = 100 - index;
      if (focusCategory && part.category === focusCategory) score += 50;
      if (equipmentPrefs.size > 0) {
        score += part.equipment.filter(eq => equipmentPrefs.has(eq)).length * 8;
      }
      return { ...part, score };
    })
    .sort((a, b) => b.score - a.score);
  if (missing.length === 0) return [];

  return missing.slice(0, completionLimit(state, limit)).map(part => {
    const blockShell = {
      title: part.title,
      equipment: part.equipment,
      steps: [],
    };
    const steps = suggestStepsForBlock(state, { ...blockShell, title: part.title }, part.count)
      .filter(step => step.category === part.category || part.category === 'standing');

    const fallbackSteps = STEP_LIBRARY
      .filter(item => item.category === part.category && item.disciplines.includes(discipline))
      .slice(0, part.count)
      .map(stepFromLibrary);

    return {
      type: 'block',
      id: `suggested_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: part.title,
      emoji: part.emoji,
      equipment: [...new Set([...part.equipment, ...steps.flatMap(step => detectEquipment(`${step.name} ${step.detail}`))])],
      color: part.color,
      steps: (steps.length ? steps : fallbackSteps).map(({ category, equipment, score, ...step }) => step),
    };
  });
}
