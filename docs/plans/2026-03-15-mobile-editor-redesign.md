# Mobile Editor Redesign — Bottom Sheet Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the cramped inline editing experience with mobile-friendly bottom sheet editors for blocks and steps, plus expose missing block property editing (title, emoji, color, equipment).

**Architecture:** All changes are in the single file `www/index.html`. We add a reusable bottom sheet CSS component, then JS functions to open/populate/close it for block editing and step editing. The existing inline edit rendering (`renderEditSteps`) is replaced with tap-to-open-sheet rows. Data format in localStorage is unchanged (fully backward compatible).

**Tech Stack:** Vanilla HTML/CSS/JS (single file), CSS transitions for sheet animation, no dependencies.

---

### Task 1: Add Bottom Sheet CSS

**Files:**
- Modify: `www/index.html:7-285` (inside `<style>` tag)

**Step 1: Add the bottom sheet CSS at the end of the `<style>` block (before the closing `</style>` on line 285)**

Insert before line 285 (`</style>`):

```css
/* ---- Bottom Sheet ---- */
.sheet-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 9500; opacity: 0; transition: opacity 0.25s;
  pointer-events: none;
}
.sheet-overlay.open { opacity: 1; pointer-events: auto; }

.sheet {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: var(--surface); border-top: 1px solid var(--border-bright);
  border-radius: 16px 16px 0 0; z-index: 9600;
  transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  max-height: 85vh; overflow-y: auto; padding-bottom: env(safe-area-inset-bottom, 16px);
  -webkit-overflow-scrolling: touch;
}
.sheet.open { transform: translateY(0); }
.sheet-handle {
  width: 36px; height: 4px; background: var(--text-dim); border-radius: 2px;
  margin: 10px auto 8px;
}
.sheet-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 20px 12px; border-bottom: 1px solid var(--border);
}
.sheet-header h3 { font-size: 16px; font-weight: 700; }
.sheet-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
.sheet-field label {
  display: block; font-size: 12px; font-weight: 600; color: var(--text-mid);
  margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;
}
.sheet-field input[type="text"],
.sheet-field textarea {
  width: 100%; background: var(--surface2); color: var(--text);
  border: 1px solid var(--border-bright); padding: 12px;
  border-radius: var(--radius-sm); font: 15px 'Inter', sans-serif;
  -webkit-appearance: none;
}
.sheet-field textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
.sheet-field input:focus,
.sheet-field textarea:focus { outline: none; border-color: var(--accent); }

/* Color swatches */
.color-swatches { display: flex; gap: 10px; flex-wrap: wrap; }
.color-swatch {
  width: 40px; height: 40px; border-radius: 50%; border: 3px solid transparent;
  cursor: pointer; transition: border-color 0.2s, transform 0.15s;
}
.color-swatch:active { transform: scale(0.9); }
.color-swatch.selected { border-color: var(--accent); }

/* Equipment chips */
.eq-toggles { display: flex; gap: 8px; flex-wrap: wrap; }
.eq-toggle {
  padding: 10px 16px; background: var(--surface2); border: 1px solid var(--border-bright);
  border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s; color: var(--text);
  -webkit-tap-highlight-color: transparent;
}
.eq-toggle.active { background: var(--accent); border-color: var(--accent); color: var(--bg); }

/* Emoji picker grid */
.emoji-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.emoji-pick {
  width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
  font-size: 22px; background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius-sm); cursor: pointer; transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.emoji-pick:active { transform: scale(0.9); }
.emoji-pick.selected { border-color: var(--accent); background: rgba(124,106,247,0.15); }

/* Sheet actions */
.sheet-actions {
  display: flex; flex-direction: column; gap: 10px;
  padding: 16px 20px; border-top: 1px solid var(--border); margin-top: 8px;
}
.sheet-actions .btn { min-height: 48px; font-size: 15px; }
.sheet-row-actions { display: flex; gap: 10px; }
.sheet-row-actions .btn { flex: 1; }

/* Pulse toggle in sheet */
.pulse-toggle {
  display: flex; align-items: center; gap: 12px; padding: 12px;
  background: var(--surface2); border: 1px solid var(--border-bright);
  border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.pulse-toggle.active { border-color: #ff6b6b; background: rgba(255,107,107,0.1); }

/* Edit mode step rows — tappable */
.step-edit-row {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  border-top: 1px solid var(--border); cursor: pointer;
  transition: background 0.15s; min-height: 52px;
  -webkit-tap-highlight-color: transparent;
}
.step-edit-row:active { background: var(--surface2); }
.step-edit-row .step-emoji { font-size: 20px; min-width: 28px; text-align: center; }
.step-edit-row .step-name { font-weight: 500; font-size: 14px; flex: 1; }
.step-edit-row .step-name.empty { color: var(--text-dim); font-style: italic; }
.step-edit-row .step-chevron { color: var(--text-dim); font-size: 16px; }

/* Larger add buttons for mobile */
.add-step-btn {
  min-height: 48px; display: flex; align-items: center; justify-content: center;
}
.add-block-btn {
  min-height: 52px; display: flex; align-items: center; justify-content: center;
}

/* Block header tappable indicator in edit mode */
.block-header.editable { position: relative; }
.block-header.editable::after {
  content: ''; position: absolute; right: 40px; top: 50%; transform: translateY(-50%);
  width: 20px; height: 20px; opacity: 0.4;
}
```

**Step 2: Verify the CSS was added correctly**

Open the dev server and check the page loads without errors. The sheet styles won't be visible yet since no HTML uses them.

**Step 3: Commit**

```bash
git add www/index.html
git commit -m "feat: add bottom sheet CSS for mobile editor redesign"
```

---

### Task 2: Add Bottom Sheet HTML Containers

**Files:**
- Modify: `www/index.html:298-308` (after the main container div, before `<script>`)

**Step 1: Add sheet overlay and sheet container elements**

Insert after line 307 (after the library panel closing `</div>`) and before `<script>`:

```html
<!-- Bottom Sheet -->
<div class="sheet-overlay" id="sheetOverlay"></div>
<div class="sheet" id="sheet">
  <div class="sheet-handle"></div>
  <div id="sheetContent"></div>
</div>
```

**Step 2: Commit**

```bash
git add www/index.html
git commit -m "feat: add bottom sheet HTML containers"
```

---

### Task 3: Add Sheet Open/Close JS Functions

**Files:**
- Modify: `www/index.html` (inside `<script>`, after the `closeLibrary` function around line 989)

**Step 1: Add the sheet open/close/render functions**

Insert after `closeLibrary()` function (around line 989):

```javascript
// ===== BOTTOM SHEET =====

const BLOCK_COLORS = [
  { name: 'Slate', var: 'var(--slate)', hex: '#3b4a6b' },
  { name: 'Rose', var: 'var(--rose)', hex: '#6b3b5a' },
  { name: 'Teal', var: 'var(--teal)', hex: '#2d5a5a' },
  { name: 'Sage', var: 'var(--sage)', hex: '#3b5a3b' },
  { name: 'Amber', var: 'var(--amber)', hex: '#5a4a2d' },
];

const EMOJI_OPTIONS = [
  '🧘‍♀️','🏋️','💪','🦵','🍑','🔥','🌀','🤸‍♀️','✨','🎯',
  '⚖️','☀️','🌅','🌊','🏐','🐈','💎','🌈','⬆️','⭕',
  '🕊️','🌙','🌳','💃','🫁','🦋','⛵','🪑','🐦','🫀',
];

let sheetContext = null; // { type: 'block'|'step', bi, si }

function openSheet(html) {
  document.getElementById('sheetContent').innerHTML = html;
  requestAnimationFrame(() => {
    document.getElementById('sheetOverlay').classList.add('open');
    document.getElementById('sheet').classList.add('open');
  });
}

function closeSheet() {
  document.getElementById('sheetOverlay').classList.remove('open');
  document.getElementById('sheet').classList.remove('open');
  sheetContext = null;
}

function openBlockSheet(bi) {
  const block = S.blocks[bi];
  if (!block) return;
  sheetContext = { type: 'block', bi };

  const colorSwatches = BLOCK_COLORS.map(c =>
    `<div class="color-swatch ${block.color === c.var ? 'selected' : ''}" style="background:${c.hex}" data-action="sheet-color" data-color="${c.var}"></div>`
  ).join('');

  const eqToggles = Object.entries(EQUIPMENT).map(([key, info]) =>
    `<button class="eq-toggle ${(block.equipment||[]).includes(key) ? 'active' : ''}" data-action="sheet-eq" data-eq="${key}">${info.icon} ${info.label}</button>`
  ).join('');

  const emojiGrid = EMOJI_OPTIONS.map(e =>
    `<div class="emoji-pick ${block.emoji === e ? 'selected' : ''}" data-action="sheet-emoji" data-emoji="${e}">${e}</div>`
  ).join('');

  openSheet(`
    <div class="sheet-header">
      <h3>Edit Block</h3>
      <button class="btn" data-action="close-sheet">Done</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Block Title</label>
        <input type="text" id="sheetBlockTitle" value="${esc(block.title)}" placeholder="Block name...">
      </div>
      <div class="sheet-field">
        <label>Emoji</label>
        <div class="emoji-grid">${emojiGrid}</div>
        <input type="text" id="sheetBlockEmojiCustom" value="${esc(block.emoji)}" placeholder="Or type any emoji" style="margin-top:8px">
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
      <button class="btn lg" data-action="sheet-duplicate" data-bi="${bi}">📋 Duplicate Block</button>
      <button class="btn lg" data-action="sheet-mirror" data-bi="${bi}">${block.mirrorOf ? '🔗 Unlink Mirror' : '🔗 Mirror Block...'}</button>
      <button class="btn lg danger" data-action="sheet-delete-block" data-bi="${bi}">🗑️ Delete Block</button>
    </div>
  `);
}

function openStepSheet(bi, si) {
  const block = S.blocks[bi];
  if (!block) return;
  const step = block.steps[si];
  if (!step) return;
  sheetContext = { type: 'step', bi, si };
  const hasPulse = (step.tags || []).includes('pulse');

  const emojiGrid = EMOJI_OPTIONS.map(e =>
    `<div class="emoji-pick ${step.emoji === e ? 'selected' : ''}" data-action="sheet-step-emoji" data-emoji="${e}">${e}</div>`
  ).join('');

  openSheet(`
    <div class="sheet-header">
      <h3>Edit Step</h3>
      <button class="btn" data-action="close-sheet">Done</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Step Name</label>
        <input type="text" id="sheetStepName" value="${esc(step.name)}" placeholder="Step name...">
      </div>
      <div class="sheet-field">
        <label>Detail / Cues</label>
        <textarea id="sheetStepDetail" placeholder="Instructions, cues, notes...">${esc(step.detail)}</textarea>
      </div>
      <div class="sheet-field">
        <label>Emoji</label>
        <div class="emoji-grid">${emojiGrid}</div>
        <input type="text" id="sheetStepEmojiCustom" value="${esc(step.emoji)}" placeholder="Or type any emoji" style="margin-top:8px">
      </div>
      <div class="sheet-field">
        <label>Tags</label>
        <div class="pulse-toggle ${hasPulse ? 'active' : ''}" data-action="sheet-toggle-pulse">
          🔥 <span style="font-weight:600">Pulse</span>
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
      <button class="btn lg primary" data-action="sheet-add-another" data-bi="${bi}">+ Add Another Step</button>
      <button class="btn lg danger" data-action="sheet-delete-step" data-bi="${bi}" data-si="${si}">🗑️ Delete Step</button>
    </div>
  `);
}
```

**Step 2: Commit**

```bash
git add www/index.html
git commit -m "feat: add sheet open/close/render functions for block and step editing"
```

---

### Task 4: Wire Up Sheet Event Handlers

**Files:**
- Modify: `www/index.html` (inside the main `document.addEventListener('click', ...)` handler, around line 1005-1213)

**Step 1: Add sheet-related cases to the click event handler**

Add these cases inside the main `switch (action)` block, before the closing `}` of the switch (around line 1212):

```javascript
    // ---- Sheet actions ----
    case 'close-sheet':
      closeSheet();
      saveState(); render();
      break;

    case 'sheet-color': {
      const color = el.dataset.color;
      if (sheetContext && sheetContext.type === 'block') {
        S.blocks[sheetContext.bi].color = color;
        el.closest('.color-swatches').querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        saveState();
      }
      break;
    }

    case 'sheet-eq': {
      const eq = el.dataset.eq;
      if (sheetContext && sheetContext.type === 'block') {
        const block = S.blocks[sheetContext.bi];
        if (!block.equipment) block.equipment = [];
        const idx = block.equipment.indexOf(eq);
        idx >= 0 ? block.equipment.splice(idx, 1) : block.equipment.push(eq);
        el.classList.toggle('active');
        saveState();
      }
      break;
    }

    case 'sheet-emoji': {
      const emoji = el.dataset.emoji;
      if (sheetContext && sheetContext.type === 'block') {
        S.blocks[sheetContext.bi].emoji = emoji;
        el.closest('.emoji-grid').querySelectorAll('.emoji-pick').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('sheetBlockEmojiCustom').value = emoji;
        saveState();
      }
      break;
    }

    case 'sheet-step-emoji': {
      const emoji = el.dataset.emoji;
      if (sheetContext && sheetContext.type === 'step') {
        S.blocks[sheetContext.bi].steps[sheetContext.si].emoji = emoji;
        el.closest('.emoji-grid').querySelectorAll('.emoji-pick').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('sheetStepEmojiCustom').value = emoji;
        saveState();
      }
      break;
    }

    case 'sheet-toggle-pulse': {
      if (sheetContext && sheetContext.type === 'step') {
        const step = S.blocks[sheetContext.bi].steps[sheetContext.si];
        const tags = step.tags || [];
        const idx = tags.indexOf('pulse');
        idx >= 0 ? tags.splice(idx, 1) : tags.push('pulse');
        step.tags = tags;
        el.classList.toggle('active');
        el.querySelector('span:last-child').textContent = tags.includes('pulse') ? 'ON' : 'OFF';
        saveState();
      }
      break;
    }

    case 'sheet-move-up': {
      if (sheetContext && sheetContext.bi > 0) {
        const bi = sheetContext.bi;
        [S.blocks[bi - 1], S.blocks[bi]] = [S.blocks[bi], S.blocks[bi - 1]];
        sheetContext.bi = bi - 1;
        closeSheet(); saveState(); render();
        openBlockSheet(bi - 1);
      }
      break;
    }

    case 'sheet-move-down': {
      if (sheetContext && sheetContext.bi < S.blocks.length - 1) {
        const bi = sheetContext.bi;
        [S.blocks[bi], S.blocks[bi + 1]] = [S.blocks[bi + 1], S.blocks[bi]];
        sheetContext.bi = bi + 1;
        closeSheet(); saveState(); render();
        openBlockSheet(bi + 1);
      }
      break;
    }

    case 'sheet-duplicate': {
      if (sheetContext && sheetContext.type === 'block') {
        const bi = sheetContext.bi;
        const copy = JSON.parse(JSON.stringify(S.blocks[bi]));
        copy.id = `block${Date.now()}`;
        copy.title = copy.title + ' (copy)';
        delete copy.mirrorOf;
        S.blocks.splice(bi + 1, 0, copy);
        closeSheet(); saveState(); render();
      }
      break;
    }

    case 'sheet-mirror': {
      if (sheetContext && sheetContext.type === 'block') {
        const block = S.blocks[sheetContext.bi];
        if (block.mirrorOf) {
          delete block.mirrorOf;
        } else {
          // Show a simple prompt for the source block
          const others = S.blocks.filter((b, i) => b.type === 'block' && i !== sheetContext.bi);
          if (others.length === 0) break;
          const names = others.map((b, i) => `${i}: ${b.title}`).join('\n');
          const choice = prompt(`Mirror which block?\n${names}`);
          if (choice != null) {
            const idx = parseInt(choice);
            if (!isNaN(idx) && others[idx]) {
              block.mirrorOf = others[idx].id;
            }
          }
        }
        closeSheet(); saveState(); render();
      }
      break;
    }

    case 'sheet-delete-block': {
      if (sheetContext && confirm('Delete this block?')) {
        S.blocks.splice(sheetContext.bi, 1);
        closeSheet(); saveState(); render();
      }
      break;
    }

    case 'sheet-step-move-up': {
      if (sheetContext && sheetContext.si > 0) {
        const { bi, si } = sheetContext;
        const steps = S.blocks[bi].steps;
        [steps[si - 1], steps[si]] = [steps[si], steps[si - 1]];
        closeSheet(); saveState(); render();
        openStepSheet(bi, si - 1);
      }
      break;
    }

    case 'sheet-step-move-down': {
      if (sheetContext) {
        const { bi, si } = sheetContext;
        const steps = S.blocks[bi].steps;
        if (si < steps.length - 1) {
          [steps[si], steps[si + 1]] = [steps[si + 1], steps[si]];
          closeSheet(); saveState(); render();
          openStepSheet(bi, si + 1);
        }
      }
      break;
    }

    case 'sheet-add-another': {
      if (sheetContext) {
        const { bi } = sheetContext;
        S.blocks[bi].steps.push({ name: '', detail: '', emoji: '✨', tags: [] });
        const newSi = S.blocks[bi].steps.length - 1;
        closeSheet(); saveState(); render();
        openStepSheet(bi, newSi);
      }
      break;
    }

    case 'sheet-delete-step': {
      if (sheetContext && confirm('Delete this step?')) {
        S.blocks[sheetContext.bi].steps.splice(sheetContext.si, 1);
        closeSheet(); saveState(); render();
      }
      break;
    }

    case 'open-block-sheet':
      if (bi !== null) openBlockSheet(bi);
      break;

    case 'open-step-sheet':
      if (bi !== null && si !== null) openStepSheet(bi, si);
      break;
```

**Step 2: Add input listeners for sheet text fields**

Add to the existing `document.addEventListener('input', ...)` handler (around line 1231), inside the function before the closing `}`:

```javascript
  // Sheet block title
  if (e.target.id === 'sheetBlockTitle' && sheetContext && sheetContext.type === 'block') {
    S.blocks[sheetContext.bi].title = e.target.value;
    saveState();
    return;
  }
  // Sheet block custom emoji
  if (e.target.id === 'sheetBlockEmojiCustom' && sheetContext && sheetContext.type === 'block') {
    S.blocks[sheetContext.bi].emoji = e.target.value;
    saveState();
    return;
  }
  // Sheet step name
  if (e.target.id === 'sheetStepName' && sheetContext && sheetContext.type === 'step') {
    S.blocks[sheetContext.bi].steps[sheetContext.si].name = e.target.value;
    saveState();
    return;
  }
  // Sheet step detail
  if (e.target.id === 'sheetStepDetail' && sheetContext && sheetContext.type === 'step') {
    S.blocks[sheetContext.bi].steps[sheetContext.si].detail = e.target.value;
    saveState();
    return;
  }
  // Sheet step custom emoji
  if (e.target.id === 'sheetStepEmojiCustom' && sheetContext && sheetContext.type === 'step') {
    S.blocks[sheetContext.bi].steps[sheetContext.si].emoji = e.target.value;
    saveState();
    return;
  }
```

**Step 3: Add overlay click-to-close**

Add to the main click handler, before the switch statement:

```javascript
  if (e.target.id === 'sheetOverlay') { closeSheet(); saveState(); render(); return; }
```

**Step 4: Commit**

```bash
git add www/index.html
git commit -m "feat: wire up all sheet event handlers for block and step editing"
```

---

### Task 5: Replace Inline Edit Rendering with Tappable Rows

**Files:**
- Modify: `www/index.html` — `renderEditSteps` function (lines 913-928) and `renderBlocks` function (lines 836-911)

**Step 1: Replace the `renderEditSteps` function**

Replace the entire function (lines 913-928) with:

```javascript
function renderEditSteps(block, bi) {
  if (block.steps.length === 0) {
    return `<div style="padding:16px;text-align:center;color:var(--text-mid);font-size:13px">No steps yet. Tap "+ Add Step" below.</div>`;
  }
  return block.steps.map((step, si) => {
    const hasPulse = (step.tags || []).includes('pulse');
    return `<div class="step-edit-row" data-action="open-step-sheet" data-bi="${bi}" data-si="${si}">
      <span class="step-emoji">${step.emoji}</span>
      <span class="step-name ${!step.name ? 'empty' : ''}">${step.name ? esc(step.name) : 'Tap to edit...'}${hasPulse ? ' <span class="pulse-badge">PULSE</span>' : ''}</span>
      <span class="step-chevron">›</span>
    </div>`;
  }).join('');
}
```

**Step 2: Make block headers open the block sheet in edit mode**

In the `renderBlocks` function, find this line (around line 892):

```javascript
      <div class="block-header" data-action="toggle-collapse" data-bi="${bi}">
```

Change the block header rendering so that in edit mode, tapping opens the block sheet instead of collapsing:

Replace the block header line inside the template literal with:

```javascript
      <div class="block-header ${S.editMode ? 'editable' : ''}" data-action="${S.editMode ? 'open-block-sheet' : 'toggle-collapse'}" data-bi="${bi}">
```

**Step 3: Remove the old inline edit toolbar from blocks**

Find the `editToolbar` variable (around line 882-887):

```javascript
    const editToolbar = S.editMode ? `<div class="edit-toolbar">
      <button class="btn" data-action="move-up" data-bi="${bi}">↑</button>
      <button class="btn" data-action="move-down" data-bi="${bi}">↓</button>
      <div style="flex:1"></div>
      <button class="btn danger" data-action="delete-block" data-bi="${bi}">🗑️</button>
    </div>` : '';
```

Replace with (remove the toolbar — all those actions are now in the block sheet):

```javascript
    const editToolbar = '';
```

**Step 4: Verify everything works**

Open the app, toggle edit mode, and verify:
- Tapping a block header opens the block sheet with title, emoji, color, equipment fields
- Tapping a step row opens the step sheet with name, detail, emoji, pulse fields
- All changes save to state and persist on reload
- Close sheet via Done button or tapping backdrop
- Add Step button still works and opens the new step in a sheet
- Move up/down, delete, and duplicate work from within sheets

**Step 5: Commit**

```bash
git add www/index.html
git commit -m "feat: replace inline editing with tappable rows that open bottom sheets"
```

---

### Task 6: Enlarge Touch Targets and Polish Mobile UX

**Files:**
- Modify: `www/index.html` — CSS section

**Step 1: Update existing button/input sizes for mobile**

Find and update these existing CSS rules to have larger touch targets:

In the `.add-step-btn` rule (around line 192-197), ensure min-height is 48px (the new CSS from Task 1 should already handle this, but verify the old rules are removed or overridden).

In the `.add-block-btn` rule (around line 199-204), ensure min-height is 52px.

In the edit bar buttons (`.edit-bar .btn`), increase padding:

```css
.edit-bar .btn { flex: 1; min-width: 80px; min-height: 44px; font-size: 14px; }
```

**Step 2: Add a small "edit" indicator on block headers in edit mode**

In the block header rendering (in `renderBlocks`), add a pencil icon when in edit mode. Update the block-actions section to show a pencil instead of the quiz toggle:

Find in renderBlocks template (around line 897-901):

```javascript
        <div class="block-actions">
          ${quizBtn}
          <div class="toggle-arrow ${isCollapsed ? 'collapsed' : ''}">▾</div>
        </div>
```

Change to:

```javascript
        <div class="block-actions">
          ${S.editMode ? '<span style="color:var(--text-dim);font-size:14px">✎</span>' : quizBtn}
          <div class="toggle-arrow ${isCollapsed ? 'collapsed' : ''}">▾</div>
        </div>
```

**Step 3: Commit**

```bash
git add www/index.html
git commit -m "feat: enlarge touch targets and add edit mode visual indicators"
```

---

### Task 7: Final Testing and Deploy

**Files:**
- Verify: `www/index.html`

**Step 1: Test the full editing workflow on mobile viewport**

Using the dev tools mobile simulator (or actual phone), test:
1. Toggle edit mode on
2. Tap a block header → block sheet opens with correct data
3. Change title, emoji, color, equipment → changes save
4. Close sheet → block renders with new values
5. Tap a step → step sheet opens
6. Edit name, detail, emoji, toggle pulse → changes save
7. Move step up/down → step reorders
8. Add another step from within sheet → new step sheet opens
9. Delete a step → step removed, sheet closes
10. Duplicate a block → new block appears below
11. Save routine to library → load it back → all changes preserved
12. Reload page → state persists from localStorage

**Step 2: Test backward compatibility**

Verify that routines saved before this change still load correctly (the data format hasn't changed).

**Step 3: Commit final version**

```bash
git add www/index.html
git commit -m "feat: mobile editor redesign — bottom sheet editors for blocks and steps

Replaces cramped inline editing with slide-up bottom sheet panels.
Block editor: title, emoji, color, equipment, move, duplicate, mirror, delete.
Step editor: name, detail, emoji, pulse toggle, move, add another, delete.
All touch targets are 48px+ for comfortable mobile use."
```
