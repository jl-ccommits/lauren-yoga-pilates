import { EQUIPMENT, TEMPLATES } from './templates.js?v=20260523-notes';
import { detectEquipment } from './parser.js?v=20260523-notes';
import { S } from './store.js?v=20260523-notes';
import { inferBlockCategory } from './suggestions.js?v=20260523-notes';
import { esc, assertElement, markerFrom } from './utils.js?v=20260523-notes';

const CATEGORY_LABELS = {
  arms: 'Arms',
  balance: 'Balance',
  bridge: 'Bridge',
  cooldown: 'Stretch',
  core: 'Core',
  glute: 'Glutes',
  side: 'Side',
  standing: 'Standing',
  warmup: 'Warm-up',
};

const ENERGY_LABELS = {
  arms: 'build',
  balance: 'steady',
  bridge: 'burn',
  cooldown: 'recover',
  core: 'burn',
  glute: 'burn',
  side: 'steady',
  standing: 'build',
  warmup: 'warm',
};

export function getDisciplineLabel() {
  if (S.discipline === 'yoga') return 'Yoga';
  if (S.discipline === 'pilates') return 'Pilates';
  return 'Custom';
}

function getTemplatePickerLabel() {
  return 'Templates';
}

export function getRoutineStats() {
  let blocks = 0;
  let steps = 0;
  let pulses = 0;
  const equipment = new Set();

  S.blocks.forEach(block => {
    if (block.type === 'transition') {
      detectEquipment(block.title).forEach(item => equipment.add(item));
      return;
    }
    blocks++;
    (block.equipment || []).forEach(item => equipment.add(item));
    (block.steps || []).forEach(step => {
      steps++;
      if ((step.tags || []).includes('pulse') || /pulse/i.test(`${step.name} ${step.detail}`)) pulses++;
      detectEquipment(`${block.title} ${step.name} ${step.detail}`).forEach(item => equipment.add(item));
    });
  });

  return { blocks, steps, pulses, equipment: [...equipment].sort() };
}

export function getEquipmentList() {
  const eq = new Set();
  S.blocks.forEach(block => (block.equipment || []).forEach(item => eq.add(item)));
  return [...eq].sort();
}

function safeCssColor(value) {
  const color = String(value || '');
  if (/^var\(--[a-z0-9-]+\)$/i.test(color) || /^#[0-9a-f]{3,8}$/i.test(color)) return color;
  return 'var(--slate)';
}

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || 'Work';
}

function getBlockEquipment(block) {
  const eq = new Set(block?.equipment || []);
  detectEquipment(block?.title || '').forEach(item => eq.add(item));
  (block?.steps || []).forEach(step => {
    detectEquipment(`${step.name || ''} ${step.detail || ''}`).forEach(item => eq.add(item));
  });
  return [...eq].sort();
}

function equipmentText(items) {
  if (!items.length) return 'Mat only';
  return items.map(item => (EQUIPMENT[item] || { label: item }).label).join(', ');
}

function equipmentChips(items, className = 'eq-badge') {
  const list = items.length ? items : ['mat'];
  return list.map(item => {
    const label = item === 'mat' ? 'Mat only' : (EQUIPMENT[item] || { label: item }).label;
    return `<span class="${className}">${esc(label)}</span>`;
  }).join('');
}

function shortTitle(title) {
  const cleaned = String(title || 'Section').replace(/^Block\s+\d+\s*[·.-]\s*/i, '').trim();
  return cleaned.length > 28 ? `${cleaned.slice(0, 25).trim()}...` : cleaned;
}

function displayBlockTitle(title) {
  return String(title || 'Section').replace(/^Block\s+(\d+)\s*[·.-]\s*/i, 'Part $1 · ');
}

function sideLabel(block) {
  const title = String(block?.title || '');
  if (/\bright\b/i.test(title)) return 'Right Side';
  if (/\bleft\b/i.test(title)) return 'Left Side';
  if (block?.mirrorOf) return 'Mirror Side';
  return '';
}

function blockCompletion(block, bi) {
  const steps = block.steps || [];
  if (!steps.length) return { done: 0, total: 0, pct: 0 };
  const done = steps.filter((_, si) => S.checked[`${bi}_${si}`]).length;
  return { done, total: steps.length, pct: Math.round((done / steps.length) * 100) };
}

function cueLabels(step) {
  const text = `${step?.name || ''} ${step?.detail || ''}`.toLowerCase();
  const cues = [];
  if ((step?.tags || []).includes('pulse') || /\bpuls(e|es|ing)\b/.test(text)) cues.push('pulse');
  if (/\bhold|isometric\b/.test(text)) cues.push('hold');
  if (/\brepeat|x\s*\d|\brounds?\b/.test(text)) cues.push('repeat');
  if (/\bslow|control|controlled\b/.test(text)) cues.push('slow');
  if (/\bbalance|steady|warrior 3|tree\b/.test(text)) cues.push('balance');
  if (/\bbreath|breathe|inhale|exhale\b/.test(text)) cues.push('breath');
  return [...new Set(cues)].slice(0, 3);
}

function cueBadges(step) {
  const cues = cueLabels(step);
  if (!cues.length) return '';
  return `<div class="cue-badges">${cues.map(cue => `<span class="cue-badge">${esc(cue)}</span>`).join('')}</div>`;
}

function blockBadges(block) {
  const category = inferBlockCategory(block);
  const side = sideLabel(block);
  const energy = ENERGY_LABELS[category] || 'steady';
  const items = getBlockEquipment(block);
  return `
    ${side ? `<span class="side-badge">${esc(side)}</span>` : ''}
    <span class="energy-badge">${esc(energy)}</span>
    ${equipmentChips(items)}
  `;
}

function renderRoutineArc(blocks) {
  if (!blocks.length) return '';
  return `
    <div class="routine-arc" aria-label="Class shape">
      ${blocks.map(({ block, bi }) => {
        const category = inferBlockCategory(block);
        const completion = blockCompletion(block, bi);
        return `<div
          class="arc-segment"
          style="--arc-color:${safeCssColor(block.color)};--arc-fill:${completion.pct}%;--arc-size:${Math.max(1, (block.steps || []).length)}"
          title="${esc(`${block.title}: ${completion.done}/${completion.total} complete`)}">
          <span>${esc(categoryLabel(category))}</span>
        </div>`;
      }).join('')}
    </div>
  `;
}

function classFlowText(blocks) {
  const labels = blocks.map(({ block }) => categoryLabel(inferBlockCategory(block)));
  const uniqueLabels = labels.filter((label, index) => index === 0 || label !== labels[index - 1]);
  if (uniqueLabels.length <= 4) return uniqueLabels.join(', ');
  return `${uniqueLabels.slice(0, 3).join(', ')}, +${uniqueLabels.length - 3} more`;
}

function renderEquipmentTimeline() {
  const items = S.blocks.map((block, index) => {
    if (block.type === 'transition') {
      const eq = detectEquipment(block.title || '');
      return {
        label: block.title || 'Transition',
        meta: 'Change',
        equipment: eq,
        isTransition: true,
        index,
      };
    }
    return {
      label: shortTitle(block.title),
        meta: `Part ${index + 1}`,
      equipment: getBlockEquipment(block),
      isTransition: false,
      index,
    };
  });

  if (!items.length) return '';
  return `
    <div class="equipment-timeline" aria-label="Equipment timeline">
      ${items.map(item => `
        <div class="equipment-stop ${item.isTransition ? 'transition-stop' : ''}">
          <span class="equipment-stop-meta">${esc(item.meta)}</span>
          <span class="equipment-stop-title">${esc(item.label)}</span>
          <span class="equipment-stop-chips">${equipmentChips(item.equipment, 'timeline-chip')}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderClassBalance(blocks) {
  const totals = new Map();
  let total = 0;
  blocks.forEach(({ block }) => {
    const count = Math.max(1, (block.steps || []).length);
    const category = inferBlockCategory(block);
    totals.set(category, (totals.get(category) || 0) + count);
    total += count;
  });
  if (!total) return '';

  return `
    <div class="class-balance" aria-label="Class balance">
      <span class="balance-label">Class Balance</span>
      ${[...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => `<span class="balance-chip">${esc(categoryLabel(category))} ${Math.round((count / total) * 100)}%</span>`)
        .join('')}
    </div>
  `;
}

function renderTeacherVisuals() {
  const el = assertElement('teacherVisuals');
  const blocks = S.blocks
    .map((block, bi) => ({ block, bi }))
    .filter(item => item.block.type !== 'transition');
  if (!blocks.length) {
    el.innerHTML = '';
    return;
  }

  const classMapOpen = S.memorizeMode === true && !S.teachMode ? ' open' : '';
  el.innerHTML = `
    <details class="class-map"${classMapOpen}>
      <summary class="class-map-summary">
        <span class="class-map-title">Class Map</span>
        <span class="class-map-flow">${esc(classFlowText(blocks))}</span>
        <span class="class-map-chevron">▾</span>
      </summary>
      <div class="class-map-body visual-panel">
        ${renderRoutineArc(blocks)}
        ${renderEquipmentTimeline()}
        ${renderClassBalance(blocks)}
      </div>
    </details>
  `;
}

function planningDuration() {
  return `${S.planningPrefs?.duration || '45'} min`;
}

function planningSummary() {
  const prefs = S.planningPrefs || {};
  const focusLabels = {
    arms: 'Arms',
    balance: 'Balance',
    balanced: 'Balanced',
    core: 'Core',
    glute: 'Glutes',
    stretch: 'Stretch',
  };
  const intensityLabels = {
    gentle: 'Gentle',
    steady: 'Steady',
    strong: 'Strong',
  };
  const equipment = (prefs.equipment || []).length
    ? prefs.equipment.map(item => (EQUIPMENT[item] || { label: item }).label).join(', ')
    : 'Any equipment';
  return `${prefs.duration || '45'} min · ${focusLabels[prefs.focus] || 'Balanced'} · ${intensityLabels[prefs.intensity] || 'Steady'} · ${equipment}`;
}

export function shouldShow(block) {
  if (S.eqFilter.size === 0) return true;
  if (block.type === 'transition') return true;
  return (block.equipment || []).some(item => S.eqFilter.has(item));
}

export function isBlockCollapsed(bi) {
  if (S.collapsed[bi] != null) return S.collapsed[bi] === true;
  const firstVisibleBlockIndex = S.blocks.findIndex(block => shouldShow(block) && block.type !== 'transition');
  return bi !== firstVisibleBlockIndex;
}

function renderHeader() {
  document.body.classList.toggle('teach-mode', S.teachMode === true && !S.editMode);
  document.body.classList.toggle('study-mode', S.memorizeMode === true && !S.editMode && !S.teachMode);
  document.body.classList.toggle('editing-mode', S.editMode === true);
  const nameEl = assertElement('routineName');
  if (S.editMode) {
    const existingInput = nameEl.querySelector('input');
    if (!existingInput) {
      nameEl.innerHTML = `<input type="text" value="${esc(S.routineName)}" id="routineNameInput">`;
    } else if (document.activeElement !== existingInput && existingInput.value !== S.routineName) {
      existingInput.value = S.routineName;
    }
  } else {
    nameEl.textContent = S.routineName;
  }

  const disciplineBadge = assertElement('disciplineBadge');
  disciplineBadge.textContent = getTemplatePickerLabel();
  disciplineBadge.title = 'Choose a starter class template';
  disciplineBadge.setAttribute('aria-label', `${getTemplatePickerLabel()}. Tap to choose a starter class template.`);

  const toggle = assertElement('editToggle');
  toggle.textContent = S.editMode ? 'Done' : 'Plan Class';
  toggle.title = S.editMode ? 'Finish planning' : 'Plan this class';
  toggle.classList.toggle('active', S.editMode);

  const editBar = assertElement('editBar');
  if (S.editMode) {
    editBar.classList.remove('hidden');
    editBar.innerHTML = `
      <button class="btn lg primary" data-action="save-routine">Save Class</button>
      <button class="btn lg" data-action="open-planning-goals">Class Goals</button>
      <button class="btn lg" data-action="open-quick-build">Quick Build</button>
      <button class="btn lg" data-action="finish-routine">Suggest Missing Sections</button>
      <button class="btn lg" data-action="copy-plan">Copy Plan</button>
      <div class="dropdown">
        <button class="btn lg" id="newBtn">New Class</button>
        <div id="newMenu" class="dropdown-menu hidden">
          ${TEMPLATES.map(t => `<button data-action="new-template" data-tkey="${esc(t.key)}">${esc(t.name)}</button>`).join('')}
        </div>
      </div>
    `;
  } else {
    editBar.classList.add('hidden');
  }

  let studyBtn = document.getElementById('studyToggle');
  if (!S.editMode && !studyBtn) {
    studyBtn = document.createElement('button');
    studyBtn.id = 'studyToggle';
    studyBtn.className = 'btn';
    studyBtn.dataset.action = 'toggle-study-mode';
    assertElement('headerActions').appendChild(studyBtn);
  }
  if (studyBtn) {
    if (S.editMode) {
      studyBtn.remove();
    } else {
      studyBtn.textContent = 'Review';
      studyBtn.title = 'Review before class';
      studyBtn.classList.toggle('active', S.memorizeMode === true);
    }
  }

  let teachBtn = document.getElementById('teachToggle');
  if (!S.editMode && !teachBtn) {
    teachBtn = document.createElement('button');
    teachBtn.id = 'teachToggle';
    teachBtn.className = 'btn';
    teachBtn.dataset.action = 'toggle-teach-mode';
    assertElement('headerActions').appendChild(teachBtn);
  }
  if (teachBtn) {
    if (S.editMode) {
      teachBtn.remove();
    } else {
      teachBtn.textContent = 'Teach';
      teachBtn.title = 'Teach from this class';
      teachBtn.classList.toggle('active', S.teachMode === true);
    }
  }

  const scheduleBtn = document.querySelector('[data-action="load-schedule"]');
  const headerActions = assertElement('headerActions');
  if (scheduleBtn) {
    const savedBtn = document.querySelector('[data-action="load-routines"]');
    const anchor = !S.editMode && teachBtn?.isConnected ? teachBtn : savedBtn;
    if (anchor?.parentElement === headerActions) {
      anchor.after(scheduleBtn);
    } else {
      headerActions.appendChild(scheduleBtn);
    }
  }

  let helpBtn = document.getElementById('helpToggle');
  if (!helpBtn) {
    helpBtn = document.createElement('button');
    helpBtn.id = 'helpToggle';
    helpBtn.className = 'btn help-button';
    helpBtn.dataset.action = 'show-tour';
    helpBtn.type = 'button';
  }
  helpBtn.textContent = '?';
  helpBtn.title = 'Open quick help';
  helpBtn.setAttribute('aria-label', 'Open quick help');
  headerActions.appendChild(helpBtn);
}

function renderClassSummary() {
  const el = assertElement('classSummary');
  if (S.editMode) {
    el.innerHTML = '';
    return;
  }
  const stats = getRoutineStats();
  const equipment = equipmentText(stats.equipment);

  el.innerHTML = `
    <div class="class-glance" aria-label="Class summary">
      <span><strong>${esc(planningDuration())}</strong><small>class</small></span>
      <span><strong>${stats.steps}</strong><small>moves</small></span>
      <span class="class-glance-secondary"><strong>${stats.blocks}</strong><small>sections</small></span>
      <span class="class-glance-equipment"><strong>${esc(equipment)}</strong><small>equipment</small></span>
    </div>
  `;
}

export function renderProgress() {
  const section = assertElement('progressSection');
  if (S.editMode) {
    section.innerHTML = '';
    return;
  }

  const visible = S.blocks.filter(shouldShow);
  let total = 0;
  let done = 0;
  visible.forEach(block => {
    if (block.type === 'transition') return;
    const bi = S.blocks.indexOf(block);
    block.steps.forEach((_, si) => {
      total++;
      if (S.checked[`${bi}_${si}`]) done++;
    });
  });
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  section.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="progress-row">
      <span class="progress-text">${pct}% complete · ${done}/${total} moves</span>
      <button class="btn" data-action="start-fresh">Clear Progress</button>
    </div>
  `;
}

function renderEqFilter() {
  const el = assertElement('eqFilter');
  const eqs = getEquipmentList();
  if (eqs.length === 0) {
    el.innerHTML = '';
    return;
  }
  const activeSummary = S.eqFilter.size
    ? [...S.eqFilter].map(item => (EQUIPMENT[item] || { label: item }).label).join(', ')
    : 'All equipment';
  const chips = eqs.map(item => {
    const info = EQUIPMENT[item] || { label: item };
    return `<button class="eq-chip ${S.eqFilter.has(item) ? 'active' : ''}" data-action="toggle-eq" data-eq="${item}">${esc(info.label)}</button>`;
  }).join('');
  el.innerHTML = `
    <details class="filter-panel" ${S.eqFilter.size ? 'open' : ''}>
      <summary>
        <span>Filter</span>
        <strong>${esc(activeSummary)}</strong>
      </summary>
      <div class="eq-filter-options">${chips}</div>
    </details>
  `;
}

function renderEditSteps(block, bi) {
  if (block.steps.length === 0) {
    return `<div style="padding:16px;text-align:center;color:var(--text-mid);font-size:13px">No exercises yet. Tap "+ Add Exercise" below.</div>`;
  }
  return block.steps.map((step, si) => {
    const hasPulse = (step.tags || []).includes('pulse');
    return `<div class="step-edit-row" data-action="open-step-sheet" data-bi="${bi}" data-si="${si}">
      <span class="step-emoji">${esc(markerFrom(step.name))}</span>
      <span class="step-name ${!step.name ? 'empty' : ''}">${step.name ? esc(step.name) : 'Tap to edit...'}${hasPulse ? ' <span class="pulse-badge">PULSE</span>' : ''}</span>
      <span class="step-chevron">›</span>
    </div>`;
  }).join('');
}

function renderMemoryBlock(block) {
  const steps = block.steps || [];
  const visibleSteps = steps.slice(0, 5);
  const more = steps.length > visibleSteps.length ? steps.length - visibleSteps.length : 0;
  const side = sideLabel(block);
  return `
    <div class="memory-card-body">
      <div class="memory-meta">
        ${side ? `<span class="side-badge">${esc(side)}</span>` : ''}
        ${equipmentChips(getBlockEquipment(block), 'memory-chip')}
      </div>
      <ol class="memory-steps">
        ${visibleSteps.map(step => `
          <li>
            <span>${esc(step.name || 'Untitled move')}</span>
            ${cueBadges(step)}
          </li>
        `).join('')}
      </ol>
      ${more ? `<div class="memory-more">+ ${more} more move${more === 1 ? '' : 's'}</div>` : ''}
    </div>
  `;
}

function renderBlocks() {
  const el = assertElement('blocks');
  const visible = S.blocks.filter(shouldShow);

  el.innerHTML = visible.map(block => {
    const bi = S.blocks.indexOf(block);
    if (block.type === 'transition') {
      const equipment = detectEquipment(block.title || '');
      return `<div class="transition-card">
        <span class="transition-label">Change</span>
        <span class="transition-title">${esc(block.title)}</span>
        <span class="transition-equipment">${equipmentChips(equipment, 'timeline-chip')}</span>
      </div>`;
    }

    const isCollapsed = isBlockCollapsed(bi);
    const isQuiz = S.quizMode[bi] === true;
    const isMemory = S.memorizeMode === true && !S.editMode && !S.teachMode;
    const eqHtml = blockBadges(block);

    let content = '';
    if (S.editMode) {
      content = renderEditSteps(block, bi);
      content += `<div class="block-edit-actions">
        <button class="add-step-btn" data-action="add-step" data-bi="${bi}">+ Add Exercise</button>
        <button class="add-step-btn quick-add" data-action="open-quick-add" data-bi="${bi}">Paste Exercises</button>
        <button class="add-step-btn suggest-add" data-action="suggest-step" data-bi="${bi}">Suggest Exercise</button>
      </div>`;
    } else if (isMemory) {
      content = renderMemoryBlock(block);
    } else {
      content = block.steps.map((step, si) => {
        const key = `${bi}_${si}`;
        const checked = S.checked[key];
        const hasPulse = (step.tags || []).includes('pulse');
        if (isQuiz) {
          const revealed = S.quizRevealed[key];
          return `<div class="step-row quiz-card ${revealed ? 'revealed' : ''}" data-action="reveal-quiz" data-bi="${bi}" data-si="${si}">
            <div class="step-content">
              <div class="step-emoji">${esc(markerFrom(step.name))}</div>
              <div class="step-name">${esc(step.name)}${hasPulse ? '<span class="pulse-badge">PULSE</span>' : ''}</div>
              <div class="step-detail">${esc(step.detail)}</div>
              ${cueBadges(step)}
            </div>
          </div>`;
        }
        return `<div class="step-row ${checked ? 'checked' : ''}" data-bi="${bi}" data-si="${si}">
          <input type="checkbox" class="step-checkbox" data-action="toggle-step" data-bi="${bi}" data-si="${si}" ${checked ? 'checked' : ''}>
          <div class="step-content">
            <div class="step-emoji">${esc(markerFrom(step.name))}</div>
            <div class="step-name">${esc(step.name)}${hasPulse ? '<span class="pulse-badge">PULSE</span>' : ''}</div>
            <div class="step-detail">${esc(step.detail)}</div>
            ${cueBadges(step)}
          </div>
        </div>`;
      }).join('');
    }

    const quizBtn = !S.editMode
      ? `<button class="quiz-toggle ${isQuiz ? 'active' : ''}" data-action="toggle-quiz" data-bi="${bi}">${isQuiz ? 'List' : 'Quiz'}</button>`
      : '';

    return `<div class="block-card ${isMemory ? 'memory-card' : ''}" data-bi="${bi}">
      <div class="block-header" data-action="${S.editMode ? 'open-block-sheet' : 'toggle-collapse'}" data-bi="${bi}">
        <span class="block-emoji">${esc(markerFrom(block.title))}</span>
        <div class="block-info">
          <div class="block-title">${esc(displayBlockTitle(block.title))}</div>
          <div class="eq-badges">${eqHtml}</div>
        </div>
        <div class="block-actions">
          ${S.editMode ? '<span style="color:var(--text-dim);font-size:14px">Plan</span>' : quizBtn}
          <div class="toggle-arrow ${isCollapsed ? 'collapsed' : ''}">▾</div>
        </div>
      </div>
      <div class="block-content ${isCollapsed ? 'collapsed' : ''}">${content}</div>
    </div>`;
  }).join('');

  if (S.editMode) {
    el.innerHTML += `<button class="add-block-btn" data-action="add-block">+ Add Section</button>`;
  }
}

export function render() {
  renderHeader();
  renderTeacherVisuals();
  renderClassSummary();
  renderProgress();
  renderEqFilter();
  renderBlocks();
}
