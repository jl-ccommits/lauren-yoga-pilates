import { BLOCK_COLORS, EQUIPMENT, TEMPLATES } from './templates.js?v=20260523-duration50';
import { getRoutines, getScheduleItems, getUpcomingSchedule, S } from './store.js?v=20260523-duration50';
import { esc, assertElement, markerFrom } from './utils.js?v=20260523-duration50';

export let sheetContext = null;

const TOUR_STORAGE_KEY = 'lauren_class_planner_tour_seen';
let undoTimer = null;

function shouldAutoFocusForms() {
  return window.matchMedia('(min-width: 700px) and (pointer: fine)').matches;
}

export function showModal(html, overlayAction = 'close-modal') {
  assertElement('modalContainer').innerHTML = `
    <div class="modal-overlay" data-action="${esc(overlayAction)}">
      <div class="modal">${html}</div>
    </div>`;
}

export function closeModal() {
  assertElement('modalContainer').innerHTML = '';
}

export function showSaveModal() {
  const updating = Boolean(S.routineId);
  showModal(`
    <h3>${updating ? 'Update Saved Class' : 'Save Class'}</h3>
    <p>${updating ? 'Keep the saved version in sync on this device.' : 'Save to this device for quick access anytime.'}</p>
    <div class="modal-form">
      <label class="modal-label" for="saveNameInput">Class name</label>
      <input type="text" class="form-input" id="saveNameInput" value="${esc(S.routineName)}">
      <label class="modal-label" for="saveDateInput">Class date</label>
      <input type="date" class="form-input" id="saveDateInput" value="${esc(S.classDate)}">
      <div class="modal-btns">
        <button class="btn" data-action="close-modal">Cancel</button>
        <button class="btn primary" data-action="confirm-save">${updating ? 'Update Class' : 'Save Class'}</button>
      </div>
      <div id="saveStatus"></div>
    </div>
  `);
  if (shouldAutoFocusForms()) assertElement('saveNameInput').select();
}

function disciplineLabel(discipline) {
  if (discipline === 'yoga') return 'yoga';
  if (discipline === 'pilates') return 'pilates';
  return 'custom';
}

function displayDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'No class date';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

function displayScheduleDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'No date';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function displayTime(value) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')) return '9:00 AM';
  const [hour, minute] = value.split(':').map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function sectionLabel(title) {
  return String(title || 'Section').replace(/^Block\s+(\d+)\s*[·.-]\s*/i, 'Part $1 · ');
}

function openLibraryPanel(title) {
  assertElement('libraryTitle').textContent = title;
  assertElement('libraryOverlay').classList.remove('hidden');
  assertElement('libraryPanel').classList.remove('hidden');
}

export function showLibrary() {
  openLibraryPanel('Saved Classes');
  const content = assertElement('libraryContent');
  const routines = getRoutines().sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));

  const templatesHtml = `
    <div class="library-section-title">Templates</div>
    ${TEMPLATES.map(t => `
      <div class="routine-card">
        <div class="routine-card-title">${esc(t.name)}</div>
        <div class="routine-card-meta">${esc(disciplineLabel(t.discipline))} template</div>
        ${t.description ? `<div class="routine-card-description">${esc(t.description)}</div>` : ''}
        <div class="routine-card-btns">
          <button class="btn" data-action="load-template" data-tkey="${t.key}">Open</button>
        </div>
      </div>
    `).join('')}
  `;

  const savedHtml = routines.length === 0
    ? '<div class="library-empty">No saved classes yet. Save your first class!</div>'
    : routines.map(r => `
        <div class="routine-card">
          <div class="routine-card-title">${esc(r.name)}</div>
          <div class="routine-card-meta">Class ${esc(displayDate(r.classDate))} · ${esc(disciplineLabel(r.discipline))} · saved ${new Date(r.savedAt).toLocaleDateString()}</div>
          <div class="routine-card-btns">
            <button class="btn" data-action="load-routine" data-rid="${r.id}">Open</button>
            <button class="btn" data-action="duplicate-routine" data-rid="${r.id}">Duplicate</button>
            <button class="btn danger" data-action="delete-routine" data-rid="${r.id}">Delete</button>
          </div>
        </div>
      `).join('');

  const backupHtml = `
    <div class="library-section-title">Backup</div>
      <div class="routine-card">
        <div class="routine-card-title">Local Backup</div>
      <div class="routine-card-meta">Export or import saved classes on this device.</div>
      <div class="routine-card-btns">
        <button class="btn" data-action="export-backup">Export Backup</button>
        <button class="btn" data-action="choose-import-backup">Import Backup</button>
      </div>
      <input id="backupFileInput" class="hidden" type="file" accept="application/json">
    </div>
  `;

  content.innerHTML = templatesHtml + '<div class="library-section-title">Saved</div>' + savedHtml + backupHtml;
}

function statusLabel(status) {
  if (status === 'ready') return 'Ready';
  if (status === 'taught') return 'Taught';
  return 'Needs Plan';
}

function scheduleCard(item, routinesById) {
  const routine = item.routineId ? routinesById.get(item.routineId) : null;
  const repeat = item.isRecurring ? 'weekly' : 'one-time';
  const linked = routine
    ? `Linked plan: ${routine.name}`
    : 'No plan linked yet';
  return `
    <div class="routine-card schedule-card" data-sid="${esc(item.id)}">
      <div class="schedule-card-top">
        <div>
          <div class="routine-card-title">${esc(item.title)}</div>
          <div class="routine-card-meta">${esc(displayScheduleDate(item.occurrenceDate))} · ${esc(displayTime(item.time))} · ${esc(repeat)} · ${esc(disciplineLabel(item.discipline))}</div>
        </div>
        <span class="schedule-status status-${esc(item.status)}">${esc(statusLabel(item.status))}</span>
      </div>
      ${item.note ? `<div class="routine-card-description">${esc(item.note)}</div>` : ''}
      <div class="schedule-linked">${esc(linked)}</div>
      <div class="routine-card-btns schedule-actions">
        ${routine ? `<button class="btn primary" data-action="schedule-open-routine" data-sid="${esc(item.id)}">Open Plan</button>` : ''}
        <button class="btn ${routine ? '' : 'primary'}" data-action="schedule-use-recent" data-sid="${esc(item.id)}" data-date="${esc(item.occurrenceDate)}">Use Recent</button>
        <button class="btn" data-action="schedule-start-blank" data-sid="${esc(item.id)}" data-date="${esc(item.occurrenceDate)}">Start Blank</button>
        <button class="btn" data-action="schedule-use-current" data-sid="${esc(item.id)}" data-date="${esc(item.occurrenceDate)}">Use Current</button>
        ${item.status !== 'ready' ? `<button class="btn" data-action="schedule-mark-ready" data-sid="${esc(item.id)}">Ready</button>` : ''}
        ${item.status !== 'taught' ? `<button class="btn" data-action="schedule-mark-taught" data-sid="${esc(item.id)}">Taught</button>` : ''}
        <button class="btn danger" data-action="delete-schedule-class" data-sid="${esc(item.id)}">Delete</button>
      </div>
    </div>
  `;
}

export function showSchedulePanel() {
  openLibraryPanel('Schedule');
  const content = assertElement('libraryContent');
  const routines = getRoutines();
  const routinesById = new Map(routines.map(routine => [routine.id, routine]));
  const upcoming = getUpcomingSchedule(14);
  const scheduledCount = getScheduleItems().length;

  const scheduleHtml = upcoming.length
    ? upcoming.map(item => scheduleCard(item, routinesById)).join('')
    : `<div class="library-empty">${scheduledCount ? 'No classes in the next two weeks.' : 'No classes scheduled yet.'}</div>`;

  content.innerHTML = `
    <div class="schedule-intro">
      <strong>Upcoming Classes</strong>
      <span>Keep usual classes and sub classes in one place. Everything stays on this device.</span>
    </div>
    <button class="btn lg primary block schedule-add" data-action="open-schedule-form">+ Add Class</button>
    <div class="library-section-title">Next 2 Weeks</div>
    ${scheduleHtml}
  `;
}

export function closeLibrary() {
  assertElement('libraryPanel').classList.add('hidden');
  assertElement('libraryOverlay').classList.add('hidden');
}

export function openSheet(html) {
  assertElement('sheetContent').innerHTML = html;
  assertElement('sheetOverlay').removeAttribute('aria-hidden');
  assertElement('sheet').removeAttribute('aria-hidden');
  assertElement('sheetOverlay').classList.add('open');
  assertElement('sheet').classList.add('open');
}

export function closeSheet() {
  const sheet = assertElement('sheet');
  const overlay = assertElement('sheetOverlay');
  if (sheet.contains(document.activeElement)) document.activeElement.blur();
  overlay.classList.remove('open');
  sheet.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  sheet.setAttribute('aria-hidden', 'true');
  assertElement('sheetContent').innerHTML = '';
  sheetContext = null;
}

export function showConfirm(message, confirmLabel, onConfirm) {
  const el = document.createElement('div');
  el.className = 'confirm-overlay';
  el.innerHTML = `
    <div class="confirm-sheet">
      <p class="confirm-msg">${esc(message)}</p>
      <div class="confirm-btns">
        <button class="btn lg block danger" id="confirmOk">${esc(confirmLabel)}</button>
        <button class="btn lg block" id="confirmCancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  const cleanup = () => el.remove();
  el.querySelector('#confirmOk').addEventListener('click', () => { cleanup(); onConfirm(); });
  el.querySelector('#confirmCancel').addEventListener('click', cleanup);
  el.addEventListener('click', ev => { if (ev.target === el) cleanup(); });
}

export function showUndoSnackbar(message, onUndo, options = {}) {
  document.getElementById('undoSnackbar')?.remove();
  if (undoTimer) clearTimeout(undoTimer);

  const el = document.createElement('div');
  el.id = 'undoSnackbar';
  el.className = 'undo-snackbar';
  el.setAttribute('role', 'status');
  el.innerHTML = `
    <span class="undo-message">${esc(message)}</span>
    <div class="undo-actions">
      <button class="undo-button" type="button">Undo</button>
      <button class="undo-close" type="button" aria-label="Dismiss">×</button>
    </div>`;

  const cleanup = () => {
    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = null;
    el.remove();
  };

  el.querySelector('.undo-button').addEventListener('click', () => {
    cleanup();
    onUndo();
  });
  el.querySelector('.undo-close').addEventListener('click', cleanup);

  document.body.appendChild(el);
  undoTimer = setTimeout(cleanup, options.timeout || 12000);
}

export function dismissFirstRunTour() {
  try {
    globalThis.localStorage?.setItem(TOUR_STORAGE_KEY, 'true');
  } catch {
    // The app still works if storage is unavailable; the tour just cannot persist.
  }
  closeModal();
}

export function maybeShowFirstRunTour() {
  try {
    if (globalThis.localStorage?.getItem(TOUR_STORAGE_KEY) === 'true') return;
  } catch {
    return;
  }

  showFirstRunTour();
}

export function showFirstRunTour() {
  showModal(`
    <h3>Quick Tour</h3>
    <p class="tour-intro">Everything saves on this device. No account needed, no setup.</p>
    <div class="tour-list">
      <div class="tour-item">
        <strong>Plan</strong>
        <span>Edit the class, paste Apple Notes, add exercises, or ask for suggestions.</span>
      </div>
      <div class="tour-item">
        <strong>Saved</strong>
        <span>Open last week's class, duplicate it, or make a backup.</span>
      </div>
      <div class="tour-item">
        <strong>Review</strong>
        <span>Study the class shape before teaching.</span>
      </div>
      <div class="tour-item">
        <strong>Teach</strong>
        <span>Use bigger text and check off exercises during class.</span>
      </div>
      <div class="tour-item">
        <strong>Schedule</strong>
        <span>Track usual classes, sub classes, and which plans are ready.</span>
      </div>
    </div>
    <div class="modal-btns">
      <button class="btn" data-action="dismiss-tour">Skip</button>
      <button class="btn primary" data-action="dismiss-tour">Got It</button>
    </div>
  `, 'dismiss-tour');
}

export function showScheduleForm() {
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  showModal(`
    <h3>Add Class</h3>
    <p>Add a usual weekly class or a one-time sub class. You can connect a plan after saving.</p>
    <div class="modal-form">
      <label class="modal-label" for="scheduleTitleInput">Class name</label>
      <input type="text" class="form-input" id="scheduleTitleInput" value="" placeholder="Friday Pilates">
      <div id="scheduleFormStatus"></div>
      <div class="modal-btns modal-btns-inline">
        <button class="btn" data-action="close-modal">Cancel</button>
        <button class="btn primary" data-action="save-schedule-class">Save Class</button>
      </div>
      <label class="modal-label" for="scheduleDisciplineInput">Type</label>
      <select class="form-input" id="scheduleDisciplineInput">
        <option value="pilates">Pilates</option>
        <option value="yoga">Yoga</option>
        <option value="custom">Custom</option>
      </select>
      <label class="modal-label" for="scheduleDateInput">Next class date</label>
      <input type="date" class="form-input" id="scheduleDateInput" value="${esc(todayValue)}">
      <label class="modal-label" for="scheduleTimeInput">Time</label>
      <input type="time" class="form-input" id="scheduleTimeInput" value="09:00">
      <label class="modal-label" for="scheduleDurationInput">Length</label>
      <select class="form-input" id="scheduleDurationInput">
        <option value="30">30 minutes</option>
        <option value="45" selected>45 minutes</option>
        <option value="50">50 minutes</option>
        <option value="60">60 minutes</option>
        <option value="75">75 minutes</option>
        <option value="90">90 minutes</option>
      </select>
      <label class="switch-row">
        <input type="checkbox" id="scheduleRepeatInput">
        <span>Repeats every week</span>
      </label>
      <label class="modal-label" for="scheduleNoteInput">Teacher note</label>
      <textarea class="form-input" id="scheduleNoteInput" placeholder="Bring weights, subbing, room note..." style="min-height:80px"></textarea>
    </div>
  `);
  if (shouldAutoFocusForms()) assertElement('scheduleTitleInput').focus();
}

export function openBlockSheet(bi) {
  const block = S.blocks[bi];
  if (!block) return;
  sheetContext = { type: 'block', bi };

  const colorSwatches = BLOCK_COLORS.map(c =>
    `<div class="color-swatch ${block.color === c.var ? 'selected' : ''}" style="background:${c.hex}" data-action="sheet-color" data-color="${c.var}"></div>`,
  ).join('');

  const eqToggles = Object.entries(EQUIPMENT).map(([key, info]) =>
    `<button class="eq-toggle ${(block.equipment || []).includes(key) ? 'active' : ''}" data-action="sheet-eq" data-eq="${key}">${esc(info.label)}</button>`,
  ).join('');

  openSheet(`
    <div class="sheet-header">
      <h3>Section Details</h3>
      <button class="btn" data-action="close-sheet">Done</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Section name</label>
        <input type="text" id="sheetBlockTitle" value="${esc(block.title)}" placeholder="Section name...">
      </div>
      <div class="sheet-field">
        <label>Color</label>
        <div class="color-swatches">${colorSwatches}</div>
      </div>
      <div class="sheet-field">
        <label>Equipment</label>
        <div class="eq-toggles">${eqToggles}</div>
      </div>
    </div>
    <div class="sheet-actions">
      <div class="sheet-row-actions">
        <button class="btn lg" data-action="sheet-move-up" data-bi="${bi}">↑ Move Up</button>
        <button class="btn lg" data-action="sheet-move-down" data-bi="${bi}">↓ Move Down</button>
      </div>
      <button class="btn lg" data-action="sheet-duplicate" data-bi="${bi}">Duplicate Section</button>
      <button class="btn lg danger" data-action="sheet-delete-block" data-bi="${bi}">Delete Section</button>
    </div>
  `);
}

export function openStepSheet(bi, si) {
  const block = S.blocks[bi];
  if (!block) return;
  const step = block.steps[si];
  if (!step) return;
  sheetContext = { type: 'step', bi, si };
  const hasPulse = (step.tags || []).includes('pulse');
  openSheet(`
    <div class="sheet-header">
      <h3>Exercise Details</h3>
      <button class="btn" data-action="close-sheet">Done</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Exercise name</label>
        <input type="text" id="sheetStepName" value="${esc(step.name)}" placeholder="Exercise name...">
      </div>
      <div class="sheet-field">
        <label>Detail / Cues</label>
        <textarea id="sheetStepDetail" placeholder="Instructions, cues, notes...">${esc(step.detail)}</textarea>
      </div>
      <div class="sheet-field">
        <label>Tags</label>
        <div class="pulse-toggle ${hasPulse ? 'active' : ''}" data-action="sheet-toggle-pulse">
          <span style="font-weight:600">Pulse</span>
          <span style="flex:1"></span>
          <span>${hasPulse ? 'ON' : 'OFF'}</span>
        </div>
      </div>
    </div>
    <div class="sheet-actions">
      <div class="sheet-row-actions">
        <button class="btn lg" data-action="sheet-step-move-up" data-bi="${bi}" data-si="${si}">↑ Move Up</button>
        <button class="btn lg" data-action="sheet-step-move-down" data-bi="${bi}" data-si="${si}">↓ Move Down</button>
      </div>
      <button class="btn lg" data-action="suggest-step-swap" data-bi="${bi}" data-si="${si}">Suggest Replacement</button>
      <button class="btn lg primary" data-action="sheet-add-another" data-bi="${bi}">+ Add Another Exercise</button>
      <button class="btn lg danger" data-action="sheet-delete-step" data-bi="${bi}" data-si="${si}">Delete Exercise</button>
    </div>
  `);
}

export function openQuickAddSheet(bi) {
  const block = S.blocks[bi];
  if (!block) return;
  sheetContext = { type: 'quickadd', bi };

  openSheet(`
    <div class="sheet-header">
      <h3>Paste Exercises</h3>
      <button class="btn" data-action="close-sheet">Cancel</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Exercises</label>
        <textarea id="sheetQuickAddText" placeholder="Cat/Cow\nBridge | Lift and lower\nPulses [pulse]\nSide twist — open chest" style="min-height:200px"></textarea>
      </div>
      <label class="switch-row">
        <input type="checkbox" id="quickAddReplace">
        <span>Replace this section's exercises</span>
      </label>
    </div>
    <div class="sheet-actions">
      <button class="btn lg primary block" data-action="confirm-quick-add" data-bi="${bi}">Add Exercises</button>
    </div>
  `);
  setTimeout(() => document.getElementById('sheetQuickAddText')?.focus(), 300);
}

export function openQuickBuildSheet() {
  sheetContext = { type: 'quickbuild' };
  openSheet(`
    <div class="sheet-header">
      <h3>Quick Build</h3>
      <button class="btn" data-action="close-sheet">Cancel</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Apple Notes</label>
        <textarea id="sheetQuickBuildText" placeholder="Paste from Apple Notes or type like normal.\n\nGrab ball - ankle weights on\nUpper body lifts up with the ball x 16\nHold and pulse x 8\n\nSeated roll up\nHands back lift up legs to teaser x 8\n\nTable top\nBall under left hand, lengthen right leg x 8\n\nStretch" style="min-height:280px"></textarea>
      </div>
      <label class="switch-row">
        <input type="checkbox" id="quickBuildReplace" checked>
        <span>Replace current class</span>
      </label>
      <div id="quickBuildStatus"></div>
    </div>
    <div class="sheet-actions">
      <div class="sheet-row-actions quick-build-tools">
        <button class="btn lg" data-action="format-quick-build-notes">Format Notes</button>
        <button class="btn lg" data-action="suggest-quick-build-routine">Suggest Class</button>
        <button class="btn lg" data-action="suggest-quick-build-exercise">Suggest Exercise</button>
      </div>
      <button class="btn lg primary block" data-action="confirm-quick-build">Build Class</button>
    </div>
  `);
  setTimeout(() => document.getElementById('sheetQuickBuildText')?.focus(), 300);
}

export function openPlanningGoalsSheet() {
  const prefs = S.planningPrefs || {};
  const equipmentToggles = Object.entries(EQUIPMENT).map(([key, info]) =>
    `<button class="eq-toggle ${(prefs.equipment || []).includes(key) ? 'active' : ''}" data-action="planning-eq" data-eq="${key}">${esc(info.label)}</button>`,
  ).join('');

  sheetContext = { type: 'planning-goals' };
  openSheet(`
    <div class="sheet-header">
      <h3>Class Goals</h3>
      <button class="btn" data-action="close-sheet">Cancel</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Length</label>
        <select id="planningDuration">
          <option value="30" ${prefs.duration === '30' ? 'selected' : ''}>30 minutes</option>
          <option value="45" ${prefs.duration === '45' ? 'selected' : ''}>45 minutes</option>
          <option value="50" ${prefs.duration === '50' ? 'selected' : ''}>50 minutes</option>
          <option value="60" ${prefs.duration === '60' ? 'selected' : ''}>60 minutes</option>
        </select>
      </div>
      <div class="sheet-field">
        <label>Focus</label>
        <select id="planningFocus">
          <option value="balanced" ${prefs.focus === 'balanced' ? 'selected' : ''}>Balanced</option>
          <option value="core" ${prefs.focus === 'core' ? 'selected' : ''}>Core</option>
          <option value="glute" ${prefs.focus === 'glute' ? 'selected' : ''}>Glutes</option>
          <option value="arms" ${prefs.focus === 'arms' ? 'selected' : ''}>Arms</option>
          <option value="balance" ${prefs.focus === 'balance' ? 'selected' : ''}>Balance</option>
          <option value="stretch" ${prefs.focus === 'stretch' ? 'selected' : ''}>Stretch</option>
        </select>
      </div>
      <div class="sheet-field">
        <label>Intensity</label>
        <select id="planningIntensity">
          <option value="gentle" ${prefs.intensity === 'gentle' ? 'selected' : ''}>Gentle</option>
          <option value="steady" ${prefs.intensity !== 'gentle' && prefs.intensity !== 'strong' ? 'selected' : ''}>Steady</option>
          <option value="strong" ${prefs.intensity === 'strong' ? 'selected' : ''}>Strong</option>
        </select>
      </div>
      <div class="sheet-field">
        <label>Equipment</label>
        <div class="eq-toggles">${equipmentToggles}</div>
      </div>
    </div>
    <div class="sheet-actions">
      <button class="btn lg primary block" data-action="save-planning-goals">Save Goals</button>
    </div>
  `);
}

function equipmentLabel(items = []) {
  if (!items.length) return 'Mat only';
  return items
    .map(item => (EQUIPMENT[item] || { label: item }).label)
    .join(', ');
}

export function openStepSuggestionsSheet(bi, suggestions, options = {}) {
  const block = S.blocks[bi];
  if (!block) return;
  const action = options.mode === 'swap' ? 'replace-suggested-step' : 'add-suggested-step';
  const title = options.mode === 'swap' ? 'Suggest Replacement' : 'Suggest Exercise';
  sheetContext = { type: options.mode === 'swap' ? 'swap-step' : 'suggest-step', bi, si: options.si, suggestions };

  const body = suggestions.length === 0
    ? '<div class="library-empty">No fresh suggestions right now.</div>'
    : `<div class="suggestion-list">
        ${suggestions.map((step, index) => `
          <div class="suggestion-card">
            <div class="suggestion-emoji">${esc(markerFrom(step.name))}</div>
            <div class="suggestion-main">
              <div class="suggestion-title">${esc(step.name)}</div>
              <div class="suggestion-detail">${esc(step.detail)}</div>
              <div class="suggestion-meta">${esc(equipmentLabel(step.equipment))}</div>
            </div>
            <button class="btn primary" data-action="${action}" data-suggestion-index="${index}">${options.mode === 'swap' ? 'Swap' : 'Add'}</button>
          </div>
        `).join('')}
      </div>`;

  openSheet(`
    <div class="sheet-header">
      <h3>${title}</h3>
      <button class="btn" data-action="close-sheet">Cancel</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>${esc(sectionLabel(block.title))}</label>
        ${body}
      </div>
    </div>
  `);
}

export function openFinishRoutineSheet(suggestions) {
  sheetContext = { type: 'finish-routine', suggestions };
  const stepCount = suggestions.reduce((total, block) => total + (block.steps || []).length, 0);

  const body = suggestions.length === 0
    ? '<div class="library-empty">No missing sections found.</div>'
    : `<div class="suggestion-list">
        ${suggestions.map(block => `
          <div class="suggestion-card">
            <div class="suggestion-emoji">${esc(markerFrom(block.title))}</div>
            <div class="suggestion-main">
              <div class="suggestion-title">${esc(block.title)}</div>
              <div class="suggestion-detail">${esc((block.steps || []).map(step => step.name).join(' · '))}</div>
              <div class="suggestion-meta">${esc(equipmentLabel(block.equipment))}</div>
            </div>
          </div>
        `).join('')}
      </div>`;

  openSheet(`
    <div class="sheet-header">
      <h3>Suggested Missing Sections</h3>
      <button class="btn" data-action="close-sheet">Cancel</button>
    </div>
    <div class="sheet-body">${body}</div>
    ${suggestions.length ? `
      <div class="sheet-actions">
        <button class="btn lg primary block" data-action="add-suggested-blocks">
          Add Suggested Sections · ${suggestions.length} Section${suggestions.length === 1 ? '' : 's'} · ${stepCount} Exercise${stepCount === 1 ? '' : 's'}
        </button>
      </div>
    ` : ''}
  `);
}

export function showDisciplineModal() {
  showModal(`
    <h3>Choose Starter Class</h3>
    <p>Start from a Pilates, yoga, or blank class template.</p>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
      ${TEMPLATES.map(t => `<button class="btn lg block" data-action="switch-template" data-tkey="${esc(t.key)}">${esc(t.name)}</button>`).join('')}
    </div>
    <div class="modal-btns"><button class="btn" data-action="close-modal">Cancel</button></div>
  `);
}
