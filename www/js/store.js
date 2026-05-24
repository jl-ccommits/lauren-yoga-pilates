import { PILATES_DEFAULT } from './templates.js?v=20260523-notes';
import { clone } from './utils.js?v=20260523-notes';

export const STORAGE_VERSION = 1;
export const CURRENT_STATE_KEY = 'current_state';
export const ROUTINES_LIBRARY_KEY = 'routines_library';
export const SCHEDULE_KEY = 'class_schedule';

const DEFAULT_PLANNING_PREFS = {
  duration: '45',
  intensity: 'steady',
  focus: 'balanced',
  equipment: [],
};

let generatedRoutineCounter = 0;
let generatedScheduleCounter = 0;

export const S = createDefaultState();

function createDefaultState() {
  return {
    routineId: null,
    routineName: PILATES_DEFAULT.name,
    classDate: todayISO(),
    discipline: 'pilates',
    blocks: clone(PILATES_DEFAULT.blocks),
    checked: {},
    collapsed: {},
    editMode: false,
    quizMode: {},
    quizRevealed: {},
    eqFilter: new Set(),
    teachMode: false,
    memorizeMode: false,
    planningPrefs: { ...DEFAULT_PLANNING_PREFS },
  };
}

function storage() {
  if (!globalThis.localStorage) throw new Error('localStorage is not available');
  return globalThis.localStorage;
}

function readJSON(key, fallback = null) {
  try {
    const raw = storage().getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function todayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localDateFromISO(value) {
  const [year, month, day] = normalizeClassDate(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function isoFromLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(value, days) {
  const date = localDateFromISO(value);
  date.setDate(date.getDate() + days);
  return isoFromLocalDate(date);
}

function isWithinDateWindow(value, start, end) {
  return value >= start && value <= end;
}

function normalizeClassDate(value, fallback = todayISO()) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
  return fallback;
}

function normalizeTime(value) {
  if (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return value;
  return '09:00';
}

function normalizeScheduleStatus(value) {
  if (['needs-plan', 'ready', 'taught'].includes(value)) return value;
  return 'needs-plan';
}

function normalizeState(data) {
  if (!data || typeof data !== 'object') return null;
  const source = data.version ? data.state || data : data;
  if (!Object.prototype.hasOwnProperty.call(source, 'blocks')) return null;
  if (!Array.isArray(source.blocks)) return null;
  return {
    routineId: source.routineId || null,
    routineName: source.routineName || 'My Routine',
    classDate: normalizeClassDate(source.classDate || source.savedAt),
    discipline: source.discipline || 'pilates',
    blocks: clone(source.blocks),
    checked: source.checked && typeof source.checked === 'object' ? source.checked : {},
    collapsed: source.collapsed && typeof source.collapsed === 'object' ? source.collapsed : {},
    teachMode: source.teachMode === true,
    memorizeMode: source.memorizeMode === true,
    planningPrefs: normalizePlanningPrefs(source.planningPrefs),
  };
}

function normalizePlanningPrefs(prefs = {}) {
  const duration = ['30', '45', '60'].includes(String(prefs.duration)) ? String(prefs.duration) : DEFAULT_PLANNING_PREFS.duration;
  const intensity = ['gentle', 'steady', 'strong'].includes(prefs.intensity) ? prefs.intensity : DEFAULT_PLANNING_PREFS.intensity;
  const focus = ['balanced', 'core', 'glute', 'arms', 'balance', 'stretch'].includes(prefs.focus) ? prefs.focus : DEFAULT_PLANNING_PREFS.focus;
  const equipment = Array.isArray(prefs.equipment)
    ? prefs.equipment.filter(item => ['ball', 'band', 'weights', 'ring'].includes(item))
    : [];
  return { duration, intensity, focus, equipment: [...new Set(equipment)] };
}

function hashString(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function routineId(routine, index = 0) {
  if (routine.id) return routine.id;
  return `r_${hashString(`${index}|${routine.name || ''}|${routine.savedAt || ''}|${JSON.stringify(routine.blocks || [])}`)}`;
}

function normalizeRoutine(routine, index = 0) {
  if (!routine || typeof routine !== 'object') return null;
  if (!Array.isArray(routine.blocks)) return null;
  return {
    id: routineId(routine, index),
    name: routine.name || 'Untitled Routine',
    classDate: normalizeClassDate(routine.classDate || routine.savedAt),
    discipline: routine.discipline || 'custom',
    savedAt: routine.savedAt || new Date().toISOString(),
    planningPrefs: normalizePlanningPrefs(routine.planningPrefs),
    blocks: clone(routine.blocks),
  };
}

function createRoutineId(existingRoutines) {
  let id;
  do {
    generatedRoutineCounter += 1;
    id = `r_${Date.now()}_${generatedRoutineCounter.toString(36)}`;
  } while (existingRoutines.some(routine => routine.id === id));
  return id;
}

function scheduleId(item, index = 0) {
  if (item.id) return item.id;
  return `s_${hashString(`${index}|${item.title || ''}|${item.date || ''}|${item.time || ''}|${item.repeat || ''}`)}`;
}

function createScheduleId(existingItems) {
  let id;
  do {
    generatedScheduleCounter += 1;
    id = `s_${Date.now()}_${generatedScheduleCounter.toString(36)}`;
  } while (existingItems.some(item => item.id === id));
  return id;
}

function normalizeScheduleItem(item, index = 0) {
  if (!item || typeof item !== 'object') return null;
  const date = normalizeClassDate(item.date || item.classDate);
  const title = String(item.title || item.name || '').trim() || 'Class';
  return {
    id: scheduleId(item, index),
    title,
    discipline: ['pilates', 'yoga', 'custom'].includes(item.discipline) ? item.discipline : 'custom',
    date,
    time: normalizeTime(item.time),
    duration: ['30', '45', '60', '75', '90'].includes(String(item.duration)) ? String(item.duration) : '45',
    repeat: item.repeat === 'weekly' ? 'weekly' : 'once',
    note: String(item.note || '').trim(),
    routineId: item.routineId || null,
    status: normalizeScheduleStatus(item.status),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

function serializeCurrentState() {
  return {
    version: STORAGE_VERSION,
    state: {
      routineId: S.routineId,
      routineName: S.routineName,
      classDate: normalizeClassDate(S.classDate),
      discipline: S.discipline,
      blocks: S.blocks,
      checked: S.checked,
      collapsed: S.editMode ? {} : S.collapsed,
      teachMode: S.teachMode,
      memorizeMode: S.memorizeMode,
      planningPrefs: normalizePlanningPrefs(S.planningPrefs),
    },
  };
}

function replaceState(next) {
  const defaults = createDefaultState();
  Object.assign(S, defaults, next, {
    editMode: false,
    quizMode: {},
    quizRevealed: {},
    eqFilter: new Set(),
    memorizeMode: next?.memorizeMode === true,
    classDate: normalizeClassDate(next?.classDate),
    planningPrefs: normalizePlanningPrefs(next?.planningPrefs),
  });
}

function saveRoutines(routines) {
  storage().setItem(
    ROUTINES_LIBRARY_KEY,
    JSON.stringify({ version: STORAGE_VERSION, routines: routines.map(normalizeRoutine).filter(Boolean) }),
  );
}

function saveScheduleItems(items) {
  storage().setItem(
    SCHEDULE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, items: items.map(normalizeScheduleItem).filter(Boolean) }),
  );
}

export function saveState() {
  storage().setItem(CURRENT_STATE_KEY, JSON.stringify(serializeCurrentState()));
}

export function loadState() {
  const state = normalizeState(readJSON(CURRENT_STATE_KEY));
  if (!state) return false;
  replaceState(state);
  return true;
}

export function getRoutines() {
  const payload = readJSON(ROUTINES_LIBRARY_KEY, []);
  const routines = Array.isArray(payload) ? payload : payload?.routines;
  if (!Array.isArray(routines)) return [];
  const normalized = routines.map(normalizeRoutine).filter(Boolean);
  const needsMigration = normalized.some((routine, index) =>
    routine.id !== routines[index]?.id || routine.classDate !== routines[index]?.classDate,
  );
  if (needsMigration) saveRoutines(normalized);
  return normalized;
}

export function getScheduleItems() {
  const payload = readJSON(SCHEDULE_KEY, []);
  const items = Array.isArray(payload) ? payload : payload?.items;
  if (!Array.isArray(items)) return [];
  const normalized = items.map(normalizeScheduleItem).filter(Boolean);
  const needsMigration = normalized.some((item, index) =>
    item.id !== items[index]?.id
    || item.date !== items[index]?.date
    || item.time !== items[index]?.time
    || item.status !== items[index]?.status,
  );
  if (needsMigration) saveScheduleItems(normalized);
  return normalized;
}

export function getUpcomingSchedule(days = 14) {
  const start = todayISO();
  const end = addDays(start, Math.max(1, days) - 1);
  const occurrences = [];

  getScheduleItems().forEach(item => {
    if (item.repeat === 'weekly') {
      const firstDate = item.date;
      const firstLocal = localDateFromISO(firstDate);
      const targetDay = firstLocal.getDay();
      let cursor = localDateFromISO(start);
      const offset = (targetDay - cursor.getDay() + 7) % 7;
      cursor.setDate(cursor.getDate() + offset);
      while (isoFromLocalDate(cursor) < firstDate) cursor.setDate(cursor.getDate() + 7);
      while (isoFromLocalDate(cursor) <= end) {
        occurrences.push({ ...item, occurrenceDate: isoFromLocalDate(cursor), isRecurring: true });
        cursor.setDate(cursor.getDate() + 7);
      }
      return;
    }

    if (isWithinDateWindow(item.date, start, end)) {
      occurrences.push({ ...item, occurrenceDate: item.date, isRecurring: false });
    }
  });

  return occurrences.sort((a, b) => `${a.occurrenceDate}T${a.time}`.localeCompare(`${b.occurrenceDate}T${b.time}`));
}

export function createScheduleItem(data) {
  const items = getScheduleItems();
  const item = normalizeScheduleItem({
    ...data,
    id: createScheduleId(items),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  if (!item) throw new Error('Schedule item is invalid');
  items.push(item);
  saveScheduleItems(items);
  return item;
}

export function updateScheduleItem(id, patch) {
  const items = getScheduleItems();
  const index = items.findIndex(item => item.id === id);
  if (index < 0) return false;
  const updated = normalizeScheduleItem({
    ...items[index],
    ...patch,
    id: items[index].id,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return false;
  items[index] = updated;
  saveScheduleItems(items);
  return updated;
}

export function deleteScheduleItem(id) {
  saveScheduleItems(getScheduleItems().filter(item => item.id !== id));
}

export function saveRoutineToLibrary(name) {
  const routines = getRoutines();
  const now = new Date().toISOString();
  const existingIndex = S.routineId ? routines.findIndex(item => item.id === S.routineId) : -1;
  const routine = {
    id: existingIndex >= 0 ? S.routineId : createRoutineId(routines),
    name,
    classDate: normalizeClassDate(S.classDate),
    discipline: S.discipline,
    savedAt: now,
    planningPrefs: normalizePlanningPrefs(S.planningPrefs),
    blocks: clone(S.blocks),
  };

  if (existingIndex >= 0) routines[existingIndex] = routine;
  else routines.push(routine);

  saveRoutines(routines);
  return routine.id;
}

export function loadRoutineFromLibrary(id) {
  const routine = getRoutines().find(item => item.id === id);
  if (!routine) return false;
  replaceState({
    routineId: routine.id,
    routineName: routine.name,
    classDate: routine.classDate,
    discipline: routine.discipline,
    planningPrefs: routine.planningPrefs,
    blocks: clone(routine.blocks),
    checked: {},
    collapsed: {},
  });
  saveState();
  return true;
}

export function duplicateRoutineFromLibrary(id) {
  const routine = getRoutines().find(item => item.id === id);
  if (!routine) return false;
  replaceState({
    routineId: null,
    routineName: `${routine.name} Copy`,
    classDate: todayISO(),
    discipline: routine.discipline,
    planningPrefs: routine.planningPrefs,
    blocks: clone(routine.blocks),
    checked: {},
    collapsed: {},
  });
  saveState();
  return true;
}

export function deleteRoutineFromLibrary(id) {
  saveRoutines(getRoutines().filter(item => item.id !== id));
  if (S.routineId === id) S.routineId = null;
}

export function resetRoutine(data, name, discipline) {
  replaceState({
    routineId: null,
    routineName: name || data.name || 'My Routine',
    classDate: normalizeClassDate(data.classDate),
    discipline: discipline || data.discipline || 'custom',
    blocks: clone(data.blocks || []),
    checked: {},
    collapsed: {},
  });
}

export function exportBackup() {
  return {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    currentState: serializeCurrentState().state,
    routines: getRoutines(),
    schedule: getScheduleItems(),
  };
}

export function importBackup(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Backup file is not valid JSON');
  const currentState = normalizeState(payload.currentState || payload.state || payload);
  const hasRoutines = Array.isArray(payload) || Array.isArray(payload.routines);
  const routinesSource = Array.isArray(payload) ? payload : payload.routines || [];
  const routines = hasRoutines
    ? routinesSource.map(normalizeRoutine).filter(Boolean)
    : [];
  const hasSchedule = Array.isArray(payload.schedule) || Array.isArray(payload.scheduleItems);
  const scheduleSource = payload.schedule || payload.scheduleItems || [];
  const schedule = hasSchedule
    ? scheduleSource.map(normalizeScheduleItem).filter(Boolean)
    : [];

  if (!currentState && !hasRoutines && !hasSchedule) throw new Error('Backup does not contain a class, saved classes, or schedule');

  if (currentState) {
    storage().setItem(CURRENT_STATE_KEY, JSON.stringify({ version: STORAGE_VERSION, state: currentState }));
    replaceState(currentState);
  }
  if (hasRoutines) saveRoutines(routines);
  if (hasSchedule) saveScheduleItems(schedule);
  saveState();
  return { routines: routines.length, schedule: schedule.length, hasCurrentState: Boolean(currentState) };
}
