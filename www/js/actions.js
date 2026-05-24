import { TEMPLATES } from './templates.js?v=20260524-llmark';
import {
  detectEquipment,
  formatQuickBuildText,
  parseQuickBuild,
  parseStepLine,
  routineToText,
} from './parser.js?v=20260524-llmark';
import { isBlockCollapsed, render, renderProgress } from './render.js?v=20260524-llmark';
import {
  createScheduleItem,
  deleteScheduleItem,
  deleteRoutineFromLibrary,
  duplicateRoutineFromLibrary,
  exportBackup,
  getRoutines,
  getStorageRevision,
  getScheduleItems,
  importBackup,
  loadRoutineFromLibrary,
  resetRoutine,
  S,
  saveRoutineToLibrary,
  saveState,
  updateScheduleOccurrence,
  updateScheduleItem,
} from './store.js?v=20260524-llmark';
import { suggestRoutineCompletion, suggestStepsForBlock } from './suggestions.js?v=20260524-llmark';
import {
  closeLibrary,
  closeModal,
  closeSheet,
  openBlockSheet,
  openFinishRoutineSheet,
  openPlanningGoalsSheet,
  openQuickAddSheet,
  openQuickBuildSheet,
  openStepSheet,
  openStepSuggestionsSheet,
  sheetContext,
  showConfirm,
  showDisciplineModal,
  showLibrary,
  showModal,
  showScheduleForm,
  showSchedulePanel,
  showFirstRunTour,
  showNoticeSnackbar,
  showUndoSnackbar,
  showSaveModal,
  dismissFirstRunTour,
} from './ui.js?v=20260524-llmark';
import { esc } from './utils.js?v=20260524-llmark';

if (typeof window !== 'undefined') {
  window.addEventListener('planner-storage-error', () => {
    const now = Date.now();
    if (now - lastStorageWarningAt < 3000) return;
    lastStorageWarningAt = now;
    showNoticeSnackbar('This device had trouble saving locally. Export a backup if this keeps happening.', { timeout: 14000 });
  });
}

function contextFrom(el, event) {
  return {
    el,
    event,
    bi: el.dataset.bi != null ? parseInt(el.dataset.bi, 10) : null,
    si: el.dataset.si != null ? parseInt(el.dataset.si, 10) : null,
  };
}

function finishRender() {
  saveState();
  render();
}

let pendingBackupPayload = null;
let lastStorageWarningAt = 0;
let quickBuildDraft = '';

function captureUndoSnapshot() {
  return {
    backup: JSON.parse(JSON.stringify(exportBackup())),
    ui: {
      editMode: S.editMode,
      quizMode: { ...S.quizMode },
      quizRevealed: { ...S.quizRevealed },
      collapsed: { ...S.collapsed },
      eqFilter: [...S.eqFilter],
      teachMode: S.teachMode,
      memorizeMode: S.memorizeMode,
    },
  };
}

function restoreUndoSnapshot(snapshot, options = {}) {
  importBackup(snapshot.backup);
  S.editMode = snapshot.ui.editMode === true;
  S.quizMode = { ...(snapshot.ui.quizMode || {}) };
  S.quizRevealed = { ...(snapshot.ui.quizRevealed || {}) };
  S.collapsed = { ...(snapshot.ui.collapsed || {}) };
  S.eqFilter = new Set(snapshot.ui.eqFilter || []);
  S.teachMode = snapshot.ui.teachMode === true;
  S.memorizeMode = snapshot.ui.memorizeMode === true;
  saveState();
  render();
  if (options.refreshSchedule) showSchedulePanel();
  else if (options.refreshLibrary) showLibrary();
}

function showUndo(message, snapshot, options = {}) {
  const validRevision = getStorageRevision();
  showUndoSnackbar(message, () => {
    if (getStorageRevision() !== validRevision) {
      showNoticeSnackbar('Undo expired because you made more changes.');
      return;
    }
    restoreUndoSnapshot(snapshot, options);
  });
}

function clearIndexedInteractionState() {
  S.checked = {};
  S.quizRevealed = {};
}

function mergeDetectedEquipment(block) {
  const text = `${block.title || ''} ${(block.steps || []).map(step => `${step.name} ${step.detail}`).join(' ')}`;
  block.equipment = [...new Set([...(block.equipment || []), ...detectEquipment(text)])];
}

function keepEditingIfNeeded(wasEditing) {
  S.editMode = wasEditing;
  if (S.editMode) S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
}

function closeNewMenu() {
  document.getElementById('newMenu')?.classList.add('hidden');
}

function loadDefaultRoutine(data, name, discipline, options = {}) {
  resetRoutine(data, name, discipline);
  keepEditingIfNeeded(options.keepEditMode === true);
  finishRender();
}

function findTemplate(key) {
  return TEMPLATES.find(item => item.key === key);
}

function loadTemplate(tmpl, options = {}) {
  loadDefaultRoutine(tmpl.data(), tmpl.name, tmpl.discipline, options);
}

function scheduleItemById(id) {
  return getScheduleItems().find(item => item.id === id);
}

function scheduleOccurrenceFromElement(el) {
  const item = scheduleItemById(el.dataset.sid);
  if (!item) return null;
  const occurrenceDate = el.dataset.date || item.date;
  if (item.repeat !== 'weekly') return { ...item, occurrenceDate: item.date, isRecurring: false };
  return {
    ...item,
    ...(item.occurrences?.[occurrenceDate] || {}),
    occurrenceDate,
    isRecurring: true,
  };
}

function formatScheduleDateForName(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function scheduleRoutineName(item, occurrenceDate) {
  const date = formatScheduleDateForName(occurrenceDate);
  return date ? `${item.title} - ${date}` : item.title;
}

function mostRecentRoutineForSchedule(item) {
  const routines = getRoutines().sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
  if (item.discipline === 'custom') return routines[0] || null;
  return routines.find(routine => routine.discipline === item.discipline) || null;
}

function blankTemplateForSchedule(item) {
  if (item.discipline === 'yoga') return findTemplate('blank-yoga');
  if (item.discipline === 'pilates') return findTemplate('blank-pilates');
  return findTemplate('blank-pilates') || TEMPLATES[0];
}

function openPlannedScheduleRoutine(item) {
  if (!item?.routineId || !loadRoutineFromLibrary(item.routineId)) return false;
  closeLibrary();
  S.editMode = false;
  render();
  return true;
}

function saveScheduleRoutineLink(item, routineId, status = 'ready', occurrenceDate = item.date) {
  if (item.repeat === 'weekly') updateScheduleOccurrence(item.id, occurrenceDate, { routineId, status });
  else updateScheduleItem(item.id, { routineId, status });
}

function prepareScheduleFromRoutine(item, sourceRoutine, occurrenceDate) {
  if (!item || !sourceRoutine) return;
  if (!duplicateRoutineFromLibrary(sourceRoutine.id)) return;
  S.routineName = scheduleRoutineName(item, occurrenceDate);
  S.classDate = occurrenceDate;
  if (['pilates', 'yoga'].includes(item.discipline)) S.discipline = item.discipline;
  S.routineId = saveRoutineToLibrary(S.routineName);
  saveScheduleRoutineLink(item, S.routineId, 'ready', occurrenceDate);
  closeLibrary();
  S.editMode = true;
  S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
  finishRender();
}

function prepareBlankScheduleRoutine(item, occurrenceDate) {
  const tmpl = blankTemplateForSchedule(item);
  if (!item || !tmpl) return;
  resetRoutine(tmpl.data(), scheduleRoutineName(item, occurrenceDate), item.discipline);
  S.classDate = occurrenceDate;
  S.routineId = saveRoutineToLibrary(S.routineName);
  saveScheduleRoutineLink(item, S.routineId, 'ready', occurrenceDate);
  closeLibrary();
  S.editMode = true;
  S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
  finishRender();
}

function suggestedStepPayload(step) {
  const { category, equipment, score, ...payload } = step;
  return {
    name: payload.name,
    detail: payload.detail,
    emoji: payload.emoji,
    tags: [...(payload.tags || [])],
  };
}

function showCopyFallback(text) {
  showModal(`
    <h3>Copy Plan</h3>
    <div class="modal-form">
      <textarea class="form-input" style="min-height:220px">${esc(text)}</textarea>
      <div class="modal-btns"><button class="btn primary" data-action="close-modal">Done</button></div>
    </div>
  `);
}

function normalizedSaveName(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

function routineSaveConflict(name, classDate) {
  const targetName = normalizedSaveName(name);
  return getRoutines().find(routine =>
    routine.id !== S.routineId
    && normalizedSaveName(routine.name) === targetName
    && routine.classDate === classDate
    && routine.discipline === S.discipline,
  );
}

function isBlankStep(step) {
  return !String(step?.name || '').trim()
    && !String(step?.detail || '').trim()
    && (!step?.tags || step.tags.length === 0);
}

function cleanupEmptyDraftSheet() {
  if (!sheetContext) return false;
  if (sheetContext.type === 'step' && sheetContext.isNewStep) {
    const steps = S.blocks[sheetContext.bi]?.steps;
    if (steps?.[sheetContext.si] && isBlankStep(steps[sheetContext.si])) {
      steps.splice(sheetContext.si, 1);
      return true;
    }
  }
  if (sheetContext.type === 'block' && sheetContext.isNewBlock) {
    const block = S.blocks[sheetContext.bi];
    if (
      block
      && String(block.title || '').trim() === 'New Section'
      && (!block.steps || block.steps.length === 0)
      && (!block.equipment || block.equipment.length === 0)
    ) {
      S.blocks.splice(sheetContext.bi, 1);
      return true;
    }
  }
  return false;
}

function closeSheetAndFinish() {
  cleanupEmptyDraftSheet();
  closeSheet();
  finishRender();
}

function backupPreview(payload) {
  const routineCount = Array.isArray(payload)
    ? payload.length
    : Array.isArray(payload?.routines) ? payload.routines.length : null;
  const scheduleCount = Array.isArray(payload?.schedule)
    ? payload.schedule.length
    : Array.isArray(payload?.scheduleItems) ? payload.scheduleItems.length : null;
  const hasCurrentState = Boolean(payload?.currentState || payload?.state || (!Array.isArray(payload) && Array.isArray(payload?.blocks)));
  return { routineCount, scheduleCount, hasCurrentState };
}

function rememberQuickBuildDraft() {
  if (sheetContext?.type !== 'quickbuild') return;
  quickBuildDraft = quickBuildTextArea()?.value || '';
}

function maybeCloseSheet() {
  if (sheetContext?.type === 'quickbuild') {
    rememberQuickBuildDraft();
    if (quickBuildDraft.trim()) {
      showConfirm('Keep these pasted notes for later?', 'Keep Notes', () => {
        closeSheetAndFinish();
        showNoticeSnackbar('Quick Build notes kept.');
      });
      return;
    }
  }
  closeSheetAndFinish();
}

function stepToQuickBuildLine(step) {
  const tag = (step.tags || []).includes('pulse') ? ' [pulse]' : '';
  return `- ${step.name}${step.detail ? ` | ${step.detail}` : ''}${tag}`;
}

function blockToQuickBuildText(block) {
  const lines = [`## ${block.title || 'Section'}`];
  if ((block.equipment || []).length) lines.push(`@equipment: ${block.equipment.join(', ')}`);
  (block.steps || []).forEach(step => lines.push(stepToQuickBuildLine(step)));
  return lines.join('\n');
}

function quickBuildTextArea() {
  return document.getElementById('sheetQuickBuildText');
}

function setQuickBuildStatus(message, type = 'success') {
  const status = document.getElementById('quickBuildStatus');
  if (status) status.innerHTML = `<div class="${type === 'error' ? 'error' : 'success'}">${esc(message)}</div>`;
}

function defaultQuickBuildName() {
  if (S.discipline === 'yoga') return 'New Yoga Class';
  if (S.discipline === 'pilates') return 'New Pilates Class';
  return 'New Class';
}

function quickBuildDraftState(text) {
  const parsed = parseQuickBuild(text, S.discipline);
  return {
    ...S,
    routineName: parsed.name || S.routineName,
    discipline: parsed.discipline || S.discipline || 'custom',
    planningPrefs: S.planningPrefs,
    blocks: parsed.blocks.length ? parsed.blocks : [],
  };
}

function appendQuickBuildText(addition, options = {}) {
  const textarea = quickBuildTextArea();
  if (!textarea || !addition.trim()) return;
  const existing = textarea.value.trim();
  const prefix = options.includeTitle && !/^#/m.test(existing)
    ? `# ${defaultQuickBuildName()}\n\n`
    : '';
  textarea.value = existing
    ? `${existing}\n\n${addition.trim()}`
    : `${prefix}${addition.trim()}`;
  textarea.focus();
}

function copyPlanText() {
  const text = routineToText(S);
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showModal(`
          <h3>Plan Copied</h3>
          <p>${esc(S.routineName)} is ready to paste into notes or a message.</p>
          <div class="modal-btns"><button class="btn primary" data-action="close-modal">Done</button></div>
        `);
      })
      .catch(() => showCopyFallback(text));
    return;
  }
  showCopyFallback(text);
}

function downloadBackup() {
  const backup = exportBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `lauren-class-planner-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const actionHandlers = {
  'toggle-edit': () => {
    S.editMode = !S.editMode;
    if (S.editMode) {
      S.teachMode = false;
      S.memorizeMode = false;
    }
    if (S.editMode) S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
    else S.collapsed = {};
    finishRender();
  },

  'switch-discipline': () => showDisciplineModal(),

  'toggle-teach-mode': () => {
    S.teachMode = !S.teachMode;
    if (S.teachMode) {
      S.memorizeMode = false;
      S.eqFilter = new Set();
      S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
    }
    finishRender();
  },

  'toggle-study-mode': () => {
    S.memorizeMode = !S.memorizeMode;
    if (S.memorizeMode) {
      S.teachMode = false;
      S.eqFilter = new Set();
      S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
    }
    finishRender();
  },

  'toggle-collapse': ({ bi }) => {
    if (bi == null) return;
    S.collapsed[bi] = !isBlockCollapsed(bi);
    saveState();
    render();
  },

  'toggle-step': () => {},

  'toggle-eq': ({ el }) => {
    const eq = el.dataset.eq;
    S.eqFilter.has(eq) ? S.eqFilter.delete(eq) : S.eqFilter.add(eq);
    finishRender();
  },

  'toggle-quiz': ({ bi, event }) => {
    event.stopPropagation();
    if (bi == null) return;
    S.quizMode[bi] = !S.quizMode[bi];
    S.quizRevealed = {};
    render();
  },

  'reveal-quiz': ({ bi, si }) => {
    if (bi == null || si == null) return;
    const key = `${bi}_${si}`;
    S.quizRevealed[key] = !S.quizRevealed[key];
    render();
  },

  'start-fresh': () => {
    showConfirm('Reset all progress?', 'Reset', () => {
      S.checked = {};
      S.quizRevealed = {};
      finishRender();
    });
  },

  'add-step': ({ bi }) => {
    if (bi == null) return;
    S.blocks[bi].steps.push({ name: '', detail: '', emoji: '✨', tags: [] });
    const newSi = S.blocks[bi].steps.length - 1;
    openStepSheet(bi, newSi, { isNewStep: true });
  },

  'add-block': () => {
    const newBi = S.blocks.length;
    S.blocks.push({
      type: 'block',
      id: `block${Date.now()}`,
      title: 'New Section',
      emoji: '✨',
      equipment: [],
      color: 'var(--slate)',
      steps: [],
    });
    openBlockSheet(newBi, { isNewBlock: true });
  },

  'save-routine': () => showSaveModal(),

  'confirm-save': () => {
    const input = document.getElementById('saveNameInput');
    const dateInput = document.getElementById('saveDateInput');
    const name = input?.value.trim();
    if (!name) return;
    const classDate = dateInput?.value || S.classDate;
    const conflict = routineSaveConflict(name, classDate);
    if (conflict) {
      document.getElementById('saveStatus').innerHTML = '<div class="error">A saved class already uses that name and date. Change the name, or open that saved class to update it.</div>';
      return;
    }
    S.routineName = name;
    S.classDate = classDate;
    S.routineId = saveRoutineToLibrary(name);
    saveState();
    render();
    document.getElementById('saveStatus').innerHTML = '<div class="success">Saved!</div>';
    setTimeout(closeModal, 1000);
  },

  'load-routines': () => {
    closeNewMenu();
    if (sheetContext) closeSheet();
    showLibrary();
  },
  'load-schedule': () => {
    closeNewMenu();
    if (sheetContext) closeSheet();
    showSchedulePanel();
  },
  'close-library': () => closeLibrary(),

  'open-schedule-form': () => showScheduleForm(),

  'save-schedule-class': () => {
    const title = document.getElementById('scheduleTitleInput')?.value.trim();
    if (!title) {
      const status = document.getElementById('scheduleFormStatus');
      if (status) status.innerHTML = '<div class="error">Add a class name.</div>';
      return;
    }
    createScheduleItem({
      title,
      discipline: document.getElementById('scheduleDisciplineInput')?.value || 'custom',
      date: document.getElementById('scheduleDateInput')?.value,
      time: document.getElementById('scheduleTimeInput')?.value,
      duration: document.getElementById('scheduleDurationInput')?.value,
      repeat: document.getElementById('scheduleRepeatInput')?.checked ? 'weekly' : 'once',
      note: document.getElementById('scheduleNoteInput')?.value || '',
    });
    closeModal();
    showSchedulePanel();
  },

  'schedule-open-routine': ({ el }) => {
    const item = scheduleOccurrenceFromElement(el);
    if (!openPlannedScheduleRoutine(item)) {
      showModal(`
        <h3>Plan Not Found</h3>
        <p>That saved plan is missing. Choose Use Recent or Start Blank to make a fresh one.</p>
        <div class="modal-btns"><button class="btn primary" data-action="close-modal">Done</button></div>
      `);
    }
  },

  'schedule-use-recent': ({ el }) => {
    const item = scheduleItemById(el.dataset.sid);
    const source = item ? mostRecentRoutineForSchedule(item) : null;
    if (!item) return;
    if (!source) {
      showModal(`
        <h3>No Saved Classes Yet</h3>
        <p>Save a class first, use the current class, or start blank for this scheduled class.</p>
        <div class="modal-btns"><button class="btn primary" data-action="close-modal">Done</button></div>
      `);
      return;
    }
    prepareScheduleFromRoutine(item, source, el.dataset.date || item.date);
  },

  'schedule-start-blank': ({ el }) => {
    const item = scheduleItemById(el.dataset.sid);
    if (item) prepareBlankScheduleRoutine(item, el.dataset.date || item.date);
  },

  'schedule-use-current': ({ el }) => {
    const item = scheduleItemById(el.dataset.sid);
    if (!item) return;
    S.classDate = el.dataset.date || item.date || S.classDate;
    if (!S.routineName || S.routineName === 'My Routine') S.routineName = scheduleRoutineName(item, S.classDate);
    S.routineId = saveRoutineToLibrary(S.routineName);
    saveScheduleRoutineLink(item, S.routineId, 'ready', S.classDate);
    closeLibrary();
    S.editMode = true;
    S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
    finishRender();
  },

  'schedule-mark-ready': ({ el }) => {
    const item = scheduleItemById(el.dataset.sid);
    if (!item) return;
    const updated = item.repeat === 'weekly'
      ? updateScheduleOccurrence(item.id, el.dataset.date || item.date, { status: 'ready' })
      : updateScheduleItem(item.id, { status: 'ready' });
    if (!updated) return;
    showSchedulePanel();
  },

  'schedule-mark-taught': ({ el }) => {
    const item = scheduleItemById(el.dataset.sid);
    if (!item) return;
    const updated = item.repeat === 'weekly'
      ? updateScheduleOccurrence(item.id, el.dataset.date || item.date, { status: 'taught' })
      : updateScheduleItem(item.id, { status: 'taught' });
    if (!updated) return;
    showSchedulePanel();
  },

  'delete-schedule-class': ({ el }) => {
    const snapshot = captureUndoSnapshot();
    const item = scheduleItemById(el.dataset.sid);
    const message = item?.repeat === 'weekly'
      ? 'Delete this weekly class from the schedule? This removes the whole weekly series.'
      : 'Delete this scheduled class?';
    showConfirm(message, 'Delete', () => {
      deleteScheduleItem(el.dataset.sid);
      showSchedulePanel();
      showUndo('Deleted scheduled class.', snapshot, { refreshSchedule: true });
    });
  },

  'load-template': ({ el }) => {
    const tmpl = findTemplate(el.dataset.tkey);
    if (!tmpl) return;
    showConfirm(`Open ${tmpl.name}? Unsaved changes will be lost.`, 'Open Template', () => {
      const wasEditing = S.editMode;
      resetRoutine(tmpl.data(), tmpl.name, tmpl.discipline);
      keepEditingIfNeeded(wasEditing);
      closeLibrary();
      finishRender();
    });
  },

  'load-routine': ({ el }) => {
    loadRoutineFromLibrary(el.dataset.rid);
    closeLibrary();
    S.editMode = false;
    render();
  },

  'duplicate-routine': ({ el }) => {
    if (!duplicateRoutineFromLibrary(el.dataset.rid)) return;
    closeLibrary();
    S.editMode = true;
    S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
    finishRender();
  },

  'delete-routine': ({ el }) => {
    showConfirm('Delete this saved class?', 'Delete', () => {
      const snapshot = captureUndoSnapshot();
      deleteRoutineFromLibrary(el.dataset.rid);
      saveState();
      showLibrary();
      showUndo('Deleted saved class.', snapshot, { refreshLibrary: true });
    });
  },

  'new-template': ({ el }) => {
    const tmpl = findTemplate(el.dataset.tkey);
    if (!tmpl) return;
    const isBlank = tmpl.key.startsWith('blank-');
    showConfirm(`Start ${tmpl.name}? Unsaved changes will be lost.`, isBlank ? 'Start Blank' : 'Start New', () => {
      loadTemplate(tmpl, { keepEditMode: true });
    });
  },

  'switch-template': ({ el }) => {
    const tmpl = findTemplate(el.dataset.tkey);
    if (!tmpl) return;
    showConfirm(`Switch to ${tmpl.name}? Unsaved changes will be lost.`, 'Switch', () => {
      loadTemplate(tmpl, { keepEditMode: S.editMode });
      closeModal();
    });
  },

  'close-modal': () => closeModal(),
  'show-tour': () => showFirstRunTour(),
  'dismiss-tour': () => dismissFirstRunTour(),
  'close-sheet': () => maybeCloseSheet(),

  'sheet-color': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'block') return;
    S.blocks[sheetContext.bi].color = el.dataset.color;
    el.closest('.color-swatches').querySelectorAll('.color-swatch').forEach(item => item.classList.remove('selected'));
    el.classList.add('selected');
    saveState();
  },

  'sheet-eq': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'block') return;
    const block = S.blocks[sheetContext.bi];
    if (!block.equipment) block.equipment = [];
    const idx = block.equipment.indexOf(el.dataset.eq);
    idx >= 0 ? block.equipment.splice(idx, 1) : block.equipment.push(el.dataset.eq);
    el.classList.toggle('active');
    saveState();
  },

  'sheet-emoji': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'block') return;
    S.blocks[sheetContext.bi].emoji = el.dataset.emoji;
    el.closest('.emoji-grid').querySelectorAll('.emoji-pick').forEach(item => item.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('sheetBlockEmojiCustom').value = el.dataset.emoji;
    saveState();
  },

  'sheet-step-emoji': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'step') return;
    S.blocks[sheetContext.bi].steps[sheetContext.si].emoji = el.dataset.emoji;
    el.closest('.emoji-grid').querySelectorAll('.emoji-pick').forEach(item => item.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('sheetStepEmojiCustom').value = el.dataset.emoji;
    saveState();
  },

  'sheet-toggle-pulse': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'step') return;
    const step = S.blocks[sheetContext.bi].steps[sheetContext.si];
    const tags = step.tags || [];
    const idx = tags.indexOf('pulse');
    idx >= 0 ? tags.splice(idx, 1) : tags.push('pulse');
    step.tags = tags;
    el.classList.toggle('active');
    el.querySelector('span:last-child').textContent = tags.includes('pulse') ? 'ON' : 'OFF';
    saveState();
  },

  'sheet-move-up': () => {
    if (!sheetContext || sheetContext.bi <= 0) return;
    const sbi = sheetContext.bi;
    [S.blocks[sbi - 1], S.blocks[sbi]] = [S.blocks[sbi], S.blocks[sbi - 1]];
    clearIndexedInteractionState();
    closeSheet();
    finishRender();
    openBlockSheet(sbi - 1);
  },

  'sheet-move-down': () => {
    if (!sheetContext || sheetContext.bi >= S.blocks.length - 1) return;
    const sbi = sheetContext.bi;
    [S.blocks[sbi], S.blocks[sbi + 1]] = [S.blocks[sbi + 1], S.blocks[sbi]];
    clearIndexedInteractionState();
    closeSheet();
    finishRender();
    openBlockSheet(sbi + 1);
  },

  'sheet-duplicate': () => {
    if (!sheetContext || sheetContext.type !== 'block') return;
    const sbi = sheetContext.bi;
    const copy = JSON.parse(JSON.stringify(S.blocks[sbi]));
    copy.id = `block${Date.now()}`;
    copy.title = `${copy.title} (copy)`;
    delete copy.mirrorOf;
    S.blocks.splice(sbi + 1, 0, copy);
    clearIndexedInteractionState();
    closeSheet();
    finishRender();
  },

  'sheet-delete-block': () => {
    if (!sheetContext) return;
    const sbi = sheetContext.bi;
    showConfirm('Delete this section?', 'Delete', () => {
      const snapshot = captureUndoSnapshot();
      S.blocks.splice(sbi, 1);
      clearIndexedInteractionState();
      closeSheet();
      finishRender();
      showUndo('Deleted section.', snapshot);
    });
  },

  'sheet-step-move-up': () => {
    if (!sheetContext || sheetContext.si <= 0) return;
    const { bi: sbi, si: ssi } = sheetContext;
    const steps = S.blocks[sbi].steps;
    [steps[ssi - 1], steps[ssi]] = [steps[ssi], steps[ssi - 1]];
    clearIndexedInteractionState();
    closeSheet();
    finishRender();
    openStepSheet(sbi, ssi - 1);
  },

  'sheet-step-move-down': () => {
    if (!sheetContext) return;
    const { bi: sbi, si: ssi } = sheetContext;
    const steps = S.blocks[sbi].steps;
    if (ssi >= steps.length - 1) return;
    [steps[ssi], steps[ssi + 1]] = [steps[ssi + 1], steps[ssi]];
    clearIndexedInteractionState();
    closeSheet();
    finishRender();
    openStepSheet(sbi, ssi + 1);
  },

  'sheet-add-another': () => {
    if (!sheetContext) return;
    const sbi = sheetContext.bi;
    S.blocks[sbi].steps.push({ name: '', detail: '', emoji: '✨', tags: [] });
    const newSi = S.blocks[sbi].steps.length - 1;
    closeSheet();
    finishRender();
    openStepSheet(sbi, newSi, { isNewStep: true });
  },

  'sheet-delete-step': () => {
    if (!sheetContext) return;
    const { bi: sbi, si: ssi } = sheetContext;
    showConfirm('Delete this exercise?', 'Delete', () => {
      const snapshot = captureUndoSnapshot();
      S.blocks[sbi].steps.splice(ssi, 1);
      clearIndexedInteractionState();
      closeSheet();
      finishRender();
      showUndo('Deleted exercise.', snapshot);
    });
  },

  'open-block-sheet': ({ bi, event }) => {
    if (bi == null) return;
    event.stopPropagation();
    openBlockSheet(bi);
  },

  'open-step-sheet': ({ bi, si }) => {
    if (bi != null && si != null) openStepSheet(bi, si);
  },

  'copy-plan': () => copyPlanText(),
  'open-planning-goals': () => openPlanningGoalsSheet(),
  'open-quick-add': ({ bi }) => { if (bi != null) openQuickAddSheet(bi); },
  'open-quick-build': () => openQuickBuildSheet(quickBuildDraft),
  'finish-routine': () => openFinishRoutineSheet(suggestRoutineCompletion(S)),
  'suggest-step': ({ bi }) => {
    if (bi == null) return;
    openStepSuggestionsSheet(bi, suggestStepsForBlock(S, S.blocks[bi], 4));
  },

  'suggest-step-swap': ({ bi, si }) => {
    if (bi == null || si == null) return;
    closeSheet();
    openStepSuggestionsSheet(bi, suggestStepsForBlock(S, S.blocks[bi], 4), { mode: 'swap', si });
  },

  'add-suggested-step': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'suggest-step') return;
    const index = parseInt(el.dataset.suggestionIndex, 10);
    const suggestion = sheetContext.suggestions[index];
    const block = S.blocks[sheetContext.bi];
    if (!suggestion || !block) return;

    block.steps.push(suggestedStepPayload(suggestion));
    block.equipment = [
      ...new Set([
        ...(block.equipment || []),
        ...(suggestion.equipment || []),
        ...detectEquipment(`${suggestion.name} ${suggestion.detail}`),
      ]),
    ];
    closeSheet();
    finishRender();
  },

  'replace-suggested-step': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'swap-step') return;
    const index = parseInt(el.dataset.suggestionIndex, 10);
    const suggestion = sheetContext.suggestions[index];
    const block = S.blocks[sheetContext.bi];
    if (!suggestion || !block || !block.steps[sheetContext.si]) return;

    const snapshot = captureUndoSnapshot();
    block.steps[sheetContext.si] = suggestedStepPayload(suggestion);
    block.equipment = [
      ...new Set([
        ...(block.equipment || []),
        ...(suggestion.equipment || []),
        ...detectEquipment(`${suggestion.name} ${suggestion.detail}`),
      ]),
    ];
    clearIndexedInteractionState();
    closeSheet();
    finishRender();
    showUndo('Replaced exercise.', snapshot);
  },

  'add-suggested-blocks': () => {
    if (!sheetContext || sheetContext.type !== 'finish-routine') return;
    const blocks = sheetContext.suggestions.map((block, index) => ({
      ...JSON.parse(JSON.stringify(block)),
      id: `${block.id}_${index}`,
    }));
    if (blocks.length === 0) return;
    S.blocks.push(...blocks);
    S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
    closeSheet();
    finishRender();
  },

  'planning-eq': ({ el }) => {
    if (!sheetContext || sheetContext.type !== 'planning-goals') return;
    el.classList.toggle('active');
  },

  'save-planning-goals': () => {
    if (!sheetContext || sheetContext.type !== 'planning-goals') return;
    S.planningPrefs = {
      duration: document.getElementById('planningDuration')?.value || '45',
      focus: document.getElementById('planningFocus')?.value || 'balanced',
      intensity: document.getElementById('planningIntensity')?.value || 'steady',
      equipment: [...document.querySelectorAll('#sheet .eq-toggle.active')].map(el => el.dataset.eq),
    };
    closeSheet();
    finishRender();
  },

  'format-quick-build-notes': () => {
    if (!sheetContext || sheetContext.type !== 'quickbuild') return;
    const textarea = quickBuildTextArea();
    if (!textarea) return;
    const formatted = formatQuickBuildText(textarea.value, S.discipline, S.routineName || defaultQuickBuildName());
    if (!formatted) return;
    textarea.value = formatted;
    textarea.focus();
    setQuickBuildStatus('Formatted from notes.');
  },

  'suggest-quick-build-routine': () => {
    if (!sheetContext || sheetContext.type !== 'quickbuild') return;
    const textarea = quickBuildTextArea();
    const draftState = quickBuildDraftState(textarea?.value || '');
    const suggestions = suggestRoutineCompletion(draftState);
    if (!suggestions.length) {
      setQuickBuildStatus('This draft already has a complete class arc.');
      return;
    }
    appendQuickBuildText(suggestions.map(blockToQuickBuildText).join('\n\n'), { includeTitle: true });
    setQuickBuildStatus('Added routine suggestions.');
  },

  'suggest-quick-build-exercise': () => {
    if (!sheetContext || sheetContext.type !== 'quickbuild') return;
    const textarea = quickBuildTextArea();
    const draftState = quickBuildDraftState(textarea?.value || '');
    const blocks = draftState.blocks.filter(block => block.type !== 'transition');
    const targetBlock = blocks[blocks.length - 1] || {
      type: 'block',
      title: S.discipline === 'yoga' ? 'Warm-up Flow' : 'Warm-up',
      equipment: [],
      steps: [],
    };
    const suggestion = suggestStepsForBlock(draftState, targetBlock, 1)[0];
    if (!suggestion) return;
    const existing = textarea?.value.trim() || '';
    const needsBlock = blocks.length === 0;
    appendQuickBuildText(`${needsBlock ? `## ${targetBlock.title}\n` : ''}${stepToQuickBuildLine(suggestion)}`, { includeTitle: !existing });
    setQuickBuildStatus('Added an exercise suggestion.');
  },

  'confirm-quick-add': () => {
    if (!sheetContext || sheetContext.type !== 'quickadd') return;
    const text = document.getElementById('sheetQuickAddText')?.value || '';
    const steps = text.split('\n').map(line => line.trim()).filter(Boolean).map(parseStepLine);
    if (steps.length === 0) return;
    const sbi = sheetContext.bi;
    const replacing = document.getElementById('quickAddReplace')?.checked;
    const snapshot = replacing ? captureUndoSnapshot() : null;
    if (replacing) {
      S.blocks[sbi].steps = [];
      clearIndexedInteractionState();
    }
    S.blocks[sbi].steps.push(...steps);
    S.blocks[sbi].equipment = [
      ...new Set([
        ...(S.blocks[sbi].equipment || []),
        ...steps.flatMap(step => detectEquipment(`${step.name} ${step.detail}`)),
      ]),
    ];
    closeSheet();
    finishRender();
    if (snapshot) showUndo('Replaced section exercises.', snapshot);
  },

  'confirm-quick-build': () => {
    if (!sheetContext || sheetContext.type !== 'quickbuild') return;
    const text = document.getElementById('sheetQuickBuildText')?.value || '';
    const parsed = parseQuickBuild(text, S.discipline);
    if (parsed.blocks.length === 0) {
      setQuickBuildStatus('Paste notes first, then I will build the class.', 'error');
      return;
    }
    quickBuildDraft = '';

    const replacing = document.getElementById('quickBuildReplace')?.checked;
    const snapshot = replacing ? captureUndoSnapshot() : null;
    if (replacing) {
      S.blocks = parsed.blocks;
      S.routineName = parsed.name || S.routineName || 'My Routine';
      S.discipline = parsed.discipline || S.discipline || 'custom';
      S.routineId = null;
      S.checked = {};
      S.quizMode = {};
      S.quizRevealed = {};
      S.eqFilter = new Set();
    } else {
      S.blocks.push(...parsed.blocks);
      if (parsed.name) S.routineName = parsed.name;
      if (parsed.discipline) S.discipline = parsed.discipline;
    }
    S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
    closeSheet();
    finishRender();
    if (snapshot) showUndo('Class built from notes.', snapshot);
    else showNoticeSnackbar('Class notes added.');
  },

  'export-backup': () => downloadBackup(),
  'choose-import-backup': () => document.getElementById('backupFileInput')?.click(),
  'cancel-import-backup': () => {
    pendingBackupPayload = null;
    closeModal();
  },
  'confirm-import-backup': () => {
    if (!pendingBackupPayload) return;
    try {
      const result = importBackup(pendingBackupPayload);
      pendingBackupPayload = null;
      showLibrary();
      render();
      showModal(`
        <h3>Backup Imported</h3>
        <p>Imported ${result.routines} saved class${result.routines === 1 ? '' : 'es'} and ${result.schedule} scheduled class${result.schedule === 1 ? '' : 'es'}.</p>
        <div class="modal-btns"><button class="btn primary" data-action="close-modal">Done</button></div>
      `);
    } catch (error) {
      pendingBackupPayload = null;
      showModal(`
        <h3>Import Failed</h3>
        <p>${esc(error.message || 'The selected file could not be imported. Your existing classes were kept.')}</p>
        <div class="modal-btns"><button class="btn primary" data-action="close-modal">Done</button></div>
      `);
    }
  },
};

export function initActions() {
  document.addEventListener('click', event => {
    if (event.target.id === 'sheetOverlay') {
      maybeCloseSheet();
      return;
    }
    const el = event.target.closest('[data-action]');
    if (!el) return;
    if (el.classList.contains('modal-overlay') && event.target.closest('.modal')) return;
    const handler = actionHandlers[el.dataset.action];
    if (handler) handler(contextFrom(el, event));
  });

  document.addEventListener('change', event => {
    if (event.target.classList.contains('step-checkbox')) {
      const bi = parseInt(event.target.dataset.bi, 10);
      const si = parseInt(event.target.dataset.si, 10);
      const key = `${bi}_${si}`;
      event.target.checked ? (S.checked[key] = true) : delete S.checked[key];
      saveState();
      renderProgress();
      event.target.closest('.step-row')?.classList.toggle('checked', event.target.checked);
      return;
    }

    if (event.target.id === 'backupFileInput') {
      const [file] = event.target.files || [];
      if (!file) return;
      file.text()
        .then(text => {
          pendingBackupPayload = JSON.parse(text);
          const preview = backupPreview(pendingBackupPayload);
          showModal(`
            <h3>Import Backup?</h3>
            <p>This will replace the local planner data on this device with the selected backup.</p>
            <div class="routine-card-meta">
              ${preview.hasCurrentState ? 'Current class included. ' : ''}
              ${preview.routineCount == null ? '' : `${preview.routineCount} saved class${preview.routineCount === 1 ? '' : 'es'}. `}
              ${preview.scheduleCount == null ? '' : `${preview.scheduleCount} scheduled class${preview.scheduleCount === 1 ? '' : 'es'}.`}
            </div>
            <div class="modal-btns">
              <button class="btn" data-action="cancel-import-backup">Cancel</button>
              <button class="btn primary" data-action="confirm-import-backup">Import Backup</button>
            </div>
          `);
        })
        .catch(() => {
          showModal(`
            <h3>Import Failed</h3>
            <p>The selected file was not a valid class planner backup.</p>
            <div class="modal-btns"><button class="btn primary" data-action="close-modal">Done</button></div>
          `);
        })
        .finally(() => {
          event.target.value = '';
        });
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'routineNameInput') {
      S.routineName = event.target.value;
      saveState();
      return;
    }

    if (event.target.id === 'sheetBlockTitle' && sheetContext?.type === 'block') {
      S.blocks[sheetContext.bi].title = event.target.value;
      saveState();
      return;
    }
    if (event.target.id === 'sheetBlockEmojiCustom' && sheetContext?.type === 'block') {
      S.blocks[sheetContext.bi].emoji = event.target.value;
      saveState();
      return;
    }
    if (event.target.id === 'sheetStepName' && sheetContext?.type === 'step') {
      S.blocks[sheetContext.bi].steps[sheetContext.si].name = event.target.value;
      mergeDetectedEquipment(S.blocks[sheetContext.bi]);
      saveState();
      return;
    }
    if (event.target.id === 'sheetStepDetail' && sheetContext?.type === 'step') {
      S.blocks[sheetContext.bi].steps[sheetContext.si].detail = event.target.value;
      mergeDetectedEquipment(S.blocks[sheetContext.bi]);
      saveState();
      return;
    }
    if (event.target.id === 'sheetStepEmojiCustom' && sheetContext?.type === 'step') {
      S.blocks[sheetContext.bi].steps[sheetContext.si].emoji = event.target.value;
      saveState();
    }
  });

  document.addEventListener('click', event => {
    const newBtn = document.getElementById('newBtn');
    const newMenu = document.getElementById('newMenu');
    if (!newBtn || !newMenu) return;
    if (event.target === newBtn || newBtn.contains(event.target)) {
      event.stopPropagation();
      newMenu.classList.toggle('hidden');
    } else if (!newMenu.contains(event.target)) {
      newMenu.classList.add('hidden');
    }
  });
}
