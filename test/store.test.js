import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';

import {
  CURRENT_STATE_KEY,
  ROUTINES_LIBRARY_KEY,
  SCHEDULE_KEY,
  S,
  createScheduleItem,
  deleteRoutineFromLibrary,
  deleteScheduleItem,
  duplicateRoutineFromLibrary,
  exportBackup,
  getRoutines,
  getScheduleItems,
  getUpcomingSchedule,
  importBackup,
  loadRoutineFromLibrary,
  loadState,
  resetRoutine,
  saveRoutineToLibrary,
  saveState,
  updateScheduleItem,
} from '../www/js/store.js';

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
  removeItem(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
  resetRoutine({ name: 'Test', discipline: 'custom', blocks: [] }, 'Test', 'custom');
});

function isoInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test('saveState stores a versioned local payload', () => {
  S.routineName = 'Saved Locally';
  S.classDate = '2026-05-16';
  S.teachMode = true;
  S.memorizeMode = true;
  S.planningPrefs = { duration: '60', focus: 'core', intensity: 'strong', equipment: ['weights'] };
  saveState();

  const payload = JSON.parse(localStorage.getItem(CURRENT_STATE_KEY));
  assert.equal(payload.version, 1);
  assert.equal(payload.state.routineName, 'Saved Locally');
  assert.equal(payload.state.classDate, '2026-05-16');
  assert.equal(payload.state.teachMode, true);
  assert.equal(payload.state.memorizeMode, true);
  assert.deepEqual(payload.state.planningPrefs, { duration: '60', focus: 'core', intensity: 'strong', equipment: ['weights'] });
});

test('50 minute class goals save and reload locally', () => {
  S.routineName = 'Lauren Standard Class';
  S.planningPrefs = { duration: '50', focus: 'glute', intensity: 'steady', equipment: ['ball', 'ring'] };
  saveState();

  resetRoutine({ name: 'Reset', discipline: 'custom', blocks: [] }, 'Reset', 'custom');
  assert.equal(loadState(), true);
  assert.deepEqual(S.planningPrefs, { duration: '50', focus: 'glute', intensity: 'steady', equipment: ['ball', 'ring'] });
});

test('loadState migrates legacy localStorage shape', () => {
  localStorage.setItem(CURRENT_STATE_KEY, JSON.stringify({
    routineName: 'Legacy',
    classDate: '2026-05-15',
    discipline: 'pilates',
    blocks: [{ type: 'block', title: 'Warm-up', steps: [] }],
    checked: {},
    collapsed: {},
  }));

  assert.equal(loadState(), true);
  assert.equal(S.routineName, 'Legacy');
  assert.equal(S.classDate, '2026-05-15');
  assert.equal(S.blocks.length, 1);
});

test('saving an existing routine updates instead of duplicating', () => {
  S.routineName = 'Friday Flow';
  S.classDate = '2026-05-16';
  S.planningPrefs = { duration: '60', focus: 'glute', intensity: 'strong', equipment: ['band'] };
  S.blocks = [{ type: 'block', title: 'Warm-up', equipment: [], steps: [] }];
  const id = saveRoutineToLibrary('Friday Flow');
  S.routineId = id;
  S.blocks.push({ type: 'block', title: 'Core', equipment: [], steps: [] });
  saveRoutineToLibrary('Friday Flow');

  assert.equal(getRoutines().length, 1);
  assert.equal(getRoutines()[0].blocks.length, 2);
  assert.equal(getRoutines()[0].classDate, '2026-05-16');
  assert.deepEqual(getRoutines()[0].planningPrefs, { duration: '60', focus: 'glute', intensity: 'strong', equipment: ['band'] });
});

test('duplicating a saved routine opens an editable local copy', () => {
  S.routineName = 'Original Class';
  S.classDate = '2026-05-16';
  S.discipline = 'pilates';
  S.planningPrefs = { duration: '30', focus: 'core', intensity: 'gentle', equipment: ['ball'] };
  S.blocks = [{ type: 'block', title: 'Warm-up', equipment: [], steps: [] }];
  const id = saveRoutineToLibrary('Original Class');

  assert.equal(duplicateRoutineFromLibrary(id), true);
  assert.equal(S.routineId, null);
  assert.equal(S.routineName, 'Original Class Copy');
  assert.match(S.classDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.notEqual(S.classDate, '2026-05-16');
  assert.equal(S.discipline, 'pilates');
  assert.deepEqual(S.planningPrefs, { duration: '30', focus: 'core', intensity: 'gentle', equipment: ['ball'] });
  assert.equal(S.blocks[0].title, 'Warm-up');
});

test('backup export and import preserve current routine and saved routines', () => {
  S.routineName = 'Current Plan';
  S.classDate = '2026-05-17';
  S.blocks = [{ type: 'block', title: 'Warm-up', equipment: [], steps: [] }];
  saveState();
  const routineId = saveRoutineToLibrary('Saved Plan');
  createScheduleItem({
    title: 'Friday Pilates',
    discipline: 'pilates',
    date: '2026-05-22',
    time: '09:00',
    repeat: 'weekly',
    routineId,
    status: 'ready',
  });

  const backup = exportBackup();
  localStorage.clear();
  const result = importBackup(backup);

  assert.equal(result.routines, 1);
  assert.equal(result.schedule, 1);
  assert.equal(JSON.parse(localStorage.getItem(ROUTINES_LIBRARY_KEY)).routines.length, 1);
  assert.equal(JSON.parse(localStorage.getItem(SCHEDULE_KEY)).items.length, 1);
  assert.equal(loadState(), true);
  assert.equal(S.routineName, 'Current Plan');
  assert.equal(S.classDate, '2026-05-17');
  assert.equal(loadRoutineFromLibrary(getRoutines()[0].id), true);
  assert.equal(S.routineName, 'Saved Plan');
  assert.equal(getScheduleItems()[0].title, 'Friday Pilates');
});

test('routines-only imports preserve the current routine', () => {
  S.routineName = 'Keep Me';
  S.blocks = [{ type: 'block', title: 'Current', equipment: [], steps: [] }];
  saveState();

  const result = importBackup({
    routines: [
      {
        id: 'legacy_saved',
        name: 'Imported Saved',
        classDate: '2026-05-18',
        discipline: 'pilates',
        blocks: [{ type: 'block', title: 'Saved', equipment: [], steps: [] }],
      },
    ],
  });

  assert.equal(result.hasCurrentState, false);
  assert.equal(loadState(), true);
  assert.equal(S.routineName, 'Keep Me');
  assert.equal(getRoutines().length, 1);
  assert.equal(getRoutines()[0].classDate, '2026-05-18');
});

test('legacy saved routines without ids get stable loadable ids', () => {
  localStorage.setItem(ROUTINES_LIBRARY_KEY, JSON.stringify([
    {
      name: 'Legacy Saved',
      discipline: 'yoga',
      savedAt: '2026-05-23T10:00:00.000Z',
      blocks: [{ type: 'block', title: 'Flow', equipment: [], steps: [] }],
    },
  ]));

  const first = getRoutines()[0].id;
  const second = getRoutines()[0].id;

  assert.equal(first, second);
  assert.equal(loadRoutineFromLibrary(first), true);
  assert.equal(S.routineName, 'Legacy Saved');
  assert.equal(S.classDate, '2026-05-23');
});

test('corrupted saved routine library fails closed without crashing', () => {
  localStorage.setItem(ROUTINES_LIBRARY_KEY, '{not valid json');
  assert.deepEqual(getRoutines(), []);

  localStorage.setItem(ROUTINES_LIBRARY_KEY, JSON.stringify({ version: 1, routines: 'not an array' }));
  assert.deepEqual(getRoutines(), []);
});

test('deleting the loaded saved routine clears the active saved id only', () => {
  S.routineName = 'Loaded Saved Class';
  S.blocks = [{ type: 'block', title: 'Warm-up', equipment: [], steps: [] }];
  const id = saveRoutineToLibrary('Loaded Saved Class');
  assert.equal(loadRoutineFromLibrary(id), true);
  assert.equal(S.routineId, id);

  deleteRoutineFromLibrary(id);

  assert.equal(S.routineId, null);
  assert.equal(S.routineName, 'Loaded Saved Class');
  assert.equal(getRoutines().length, 0);
});

test('rapid unsaved saves always create unique routine ids', () => {
  const originalNow = Date.now;
  Date.now = () => 1779557000000;
  try {
    S.routineName = 'Rapid Save One';
    S.routineId = null;
    S.blocks = [{ type: 'block', title: 'One', equipment: [], steps: [] }];
    const first = saveRoutineToLibrary('Rapid Save One');

    S.routineName = 'Rapid Save Two';
    S.routineId = null;
    S.blocks = [{ type: 'block', title: 'Two', equipment: [], steps: [] }];
    const second = saveRoutineToLibrary('Rapid Save Two');

    assert.notEqual(first, second);
    assert.equal(getRoutines().length, 2);
  } finally {
    Date.now = originalNow;
  }
});

test('invalid current-state imports do not replace the active routine', () => {
  S.routineName = 'Still Here';
  S.blocks = [{ type: 'block', title: 'Current', equipment: [], steps: [] }];
  saveState();

  assert.throws(() => importBackup({ currentState: { routineName: 'Bad', blocks: 'not an array' } }));
  assert.equal(loadState(), true);
  assert.equal(S.routineName, 'Still Here');
  assert.equal(S.blocks[0].title, 'Current');
});

test('current-state-only imports preserve saved routines', () => {
  S.routineName = 'Before Import';
  S.blocks = [{ type: 'block', title: 'Current', equipment: [], steps: [] }];
  saveRoutineToLibrary('Existing Saved');

  const result = importBackup({
    currentState: {
      routineName: 'Imported Current',
      discipline: 'yoga',
      blocks: [{ type: 'block', title: 'Imported', equipment: [], steps: [] }],
      checked: {},
      collapsed: {},
    },
  });

  assert.equal(result.routines, 0);
  assert.equal(result.hasCurrentState, true);
  assert.equal(S.routineName, 'Imported Current');
  assert.equal(getRoutines().length, 1);
  assert.equal(getRoutines()[0].name, 'Existing Saved');
});

test('schedule items save locally, update status, and delete cleanly', () => {
  const item = createScheduleItem({
    title: 'Saturday Sub Class',
    discipline: 'yoga',
    date: isoInDays(1),
    time: '08:30',
    duration: '50',
    note: 'Bring weights',
  });

  assert.equal(getScheduleItems().length, 1);
  assert.equal(getScheduleItems()[0].duration, '50');
  assert.equal(getScheduleItems()[0].status, 'needs-plan');
  assert.equal(getUpcomingSchedule(7)[0].title, 'Saturday Sub Class');

  updateScheduleItem(item.id, { status: 'taught', routineId: 'routine_1' });
  assert.equal(getScheduleItems()[0].status, 'taught');
  assert.equal(getScheduleItems()[0].routineId, 'routine_1');

  deleteScheduleItem(item.id);
  assert.equal(getScheduleItems().length, 0);
});

test('weekly schedule classes expand into upcoming occurrences', () => {
  const item = createScheduleItem({
    title: 'Friday Usual Pilates',
    discipline: 'pilates',
    date: isoInDays(0),
    time: '10:30',
    repeat: 'weekly',
  });

  const occurrences = getUpcomingSchedule(8).filter(occurrence => occurrence.id === item.id);
  assert.equal(occurrences.length, 2);
  assert.equal(occurrences[0].isRecurring, true);
  assert.equal(occurrences[0].time, '10:30');
});

test('weekly schedule classes wait for their first scheduled date', () => {
  const item = createScheduleItem({
    title: 'Future Weekly Yoga',
    discipline: 'yoga',
    date: isoInDays(10),
    time: '07:15',
    repeat: 'weekly',
  });

  assert.equal(getUpcomingSchedule(7).filter(occurrence => occurrence.id === item.id).length, 0);
  const occurrences = getUpcomingSchedule(14).filter(occurrence => occurrence.id === item.id);
  assert.equal(occurrences.length, 1);
  assert.equal(occurrences[0].occurrenceDate, isoInDays(10));
});

test('legacy or malformed schedule payloads normalize to safe local defaults', () => {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify([
    {
      name: ' Legacy Sub ',
      classDate: `${isoInDays(2)}T12:00:00Z`,
      time: '25:99',
      duration: '200',
      discipline: 'dance',
      repeat: 'daily',
      status: 'done',
      note: '  bring blocks  ',
    },
  ]));

  const [item] = getScheduleItems();
  assert.equal(item.title, 'Legacy Sub');
  assert.equal(item.date, isoInDays(2));
  assert.equal(item.time, '09:00');
  assert.equal(item.duration, '45');
  assert.equal(item.discipline, 'custom');
  assert.equal(item.repeat, 'once');
  assert.equal(item.status, 'needs-plan');
  assert.equal(item.note, 'bring blocks');
});
