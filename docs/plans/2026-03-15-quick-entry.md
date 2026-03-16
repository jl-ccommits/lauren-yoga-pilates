# Quick-Entry Text Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Quick-Entry text mode so Lauren can type exercise names as a text list (one per line) to rapidly create steps and blocks, replacing her Apple Notes workflow.

**Architecture:** Two new bottom sheet variants reusing the existing sheet component in `www/index.html`. Per-block "Quick Add Steps" parses lines into steps. Routine-level "Quick Build" parses `## Block` / `---` / plain lines into blocks, transitions, and steps. All changes in the single HTML file.

**Tech Stack:** Vanilla HTML/CSS/JS, single file (`www/index.html`), CSS from existing bottom sheet styles, localStorage for persistence.

---

### Task 1: Add Quick Add Steps (Per-Block)

**Files:**
- Modify: `www/index.html` — CSS, JS (openQuickAddSheet function, event handlers, renderBlocks button)

**Step 1: Add the Quick Add sheet opener function**

Add after the `openStepSheet` function (around line ~1140 in current file). Insert this new function:

```javascript
function openQuickAddSheet(bi) {
  const block = S.blocks[bi];
  if (!block) return;
  sheetContext = { type: 'quickadd', bi };

  openSheet(`
    <div class="sheet-header">
      <h3>Quick Add Steps</h3>
      <button class="btn" data-action="close-sheet">Cancel</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Type one exercise per line</label>
        <textarea id="sheetQuickAddText" placeholder="Cat/Cow\nRolls L & R\nSide Arm Stretch\nBridge\nPulses" style="min-height:200px"></textarea>
      </div>
    </div>
    <div class="sheet-actions">
      <button class="btn lg primary block" data-action="confirm-quick-add" data-bi="${bi}">Add Steps</button>
    </div>
  `);
  // Auto-focus the textarea
  setTimeout(() => document.getElementById('sheetQuickAddText')?.focus(), 300);
}
```

**Step 2: Add the event handler for `confirm-quick-add`**

Add this case inside the main click event handler's switch statement, in the sheet actions section:

```javascript
    case 'confirm-quick-add': {
      if (sheetContext && sheetContext.type === 'quickadd') {
        const text = document.getElementById('sheetQuickAddText')?.value || '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) break;
        const sbi = sheetContext.bi;
        lines.forEach(line => {
          S.blocks[sbi].steps.push({ name: line, detail: '', emoji: '✨', tags: [] });
        });
        closeSheet(); saveState(); render();
      }
      break;
    }
```

**Step 3: Add the "Quick Add Steps" button to each block in edit mode**

In the `renderBlocks` function, find the existing add-step button line:

```javascript
      content += `<button class="add-step-btn" data-action="add-step" data-bi="${bi}">+ Add Step</button>`;
```

Replace with:

```javascript
      content += `<div style="display:flex;gap:8px;padding:8px 16px">
        <button class="add-step-btn" style="flex:1" data-action="add-step" data-bi="${bi}">+ Add Step</button>
        <button class="add-step-btn" style="flex:1;border-color:var(--accent);color:var(--accent)" data-action="open-quick-add" data-bi="${bi}">⚡ Quick Add</button>
      </div>`;
```

**Step 4: Add the `open-quick-add` action to the click handler**

Add this case in the switch statement:

```javascript
    case 'open-quick-add':
      if (bi !== null) openQuickAddSheet(bi);
      break;
```

**Step 5: Verify**

- Open app, toggle Edit mode
- Scroll to a block, tap "Quick Add"
- Type 3 exercise names on separate lines
- Tap "Add Steps" — 3 new steps should appear in the block
- Tap a new step — step editor sheet should open with the name filled in

**Step 6: Commit**

```bash
git add www/index.html
git commit -m "feat: add per-block Quick Add Steps for rapid text entry"
```

---

### Task 2: Add Quick Build (Routine-Level)

**Files:**
- Modify: `www/index.html` — JS (openQuickBuildSheet function, parser, event handlers, edit bar button)

**Step 1: Add color cycling helper and Quick Build sheet opener**

Add after `openQuickAddSheet`:

```javascript
const COLOR_CYCLE = [
  'var(--amber)', 'var(--slate)', 'var(--rose)', 'var(--teal)', 'var(--sage)'
];

function openQuickBuildSheet() {
  sheetContext = { type: 'quickbuild' };

  openSheet(`
    <div class="sheet-header">
      <h3>Quick Build</h3>
      <button class="btn" data-action="close-sheet">Cancel</button>
    </div>
    <div class="sheet-body">
      <div class="sheet-field">
        <label>Type your class plan</label>
        <textarea id="sheetQuickBuildText" placeholder="## Warm-up\nCat/Cow\nRolls L & R\n\n## Core with Ball\nBridge\nPulses\n\n---\n\n## Standing Glute\nLunges\nWarrior 3" style="min-height:280px"></textarea>
      </div>
      <div style="font-size:12px;color:var(--text-dim);line-height:1.5">
        <strong>## Block Name</strong> = new block<br>
        <strong>---</strong> = transition<br>
        Each line = one exercise
      </div>
    </div>
    <div class="sheet-actions">
      <button class="btn lg primary block" data-action="confirm-quick-build">Build Routine</button>
    </div>
  `);
  setTimeout(() => document.getElementById('sheetQuickBuildText')?.focus(), 300);
}
```

**Step 2: Add the parser and event handler for `confirm-quick-build`**

Add this case in the click handler switch:

```javascript
    case 'confirm-quick-build': {
      if (sheetContext && sheetContext.type === 'quickbuild') {
        const text = document.getElementById('sheetQuickBuildText')?.value || '';
        const lines = text.split('\n');
        const newBlocks = [];
        let currentBlock = null;
        let colorIdx = S.blocks.length; // continue color cycle from existing blocks

        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return; // skip empty lines

          if (trimmed === '---') {
            // Transition
            newBlocks.push({
              type: 'transition',
              id: `t${Date.now()}${Math.random().toString(36).slice(2,6)}`,
              title: 'Transition',
              emoji: '🔀',
              equipment: [],
              color: 'var(--surface2)',
              steps: []
            });
            currentBlock = null;
            return;
          }

          if (trimmed.startsWith('## ')) {
            // New block
            const title = trimmed.slice(3).trim();
            currentBlock = {
              type: 'block',
              id: `block${Date.now()}${Math.random().toString(36).slice(2,6)}`,
              title: title || 'New Block',
              emoji: '✨',
              equipment: [],
              color: COLOR_CYCLE[colorIdx % COLOR_CYCLE.length],
              steps: []
            };
            colorIdx++;
            newBlocks.push(currentBlock);
            return;
          }

          // Plain line = step
          if (!currentBlock) {
            // Auto-create a block if none exists yet
            currentBlock = {
              type: 'block',
              id: `block${Date.now()}${Math.random().toString(36).slice(2,6)}`,
              title: 'Block',
              emoji: '✨',
              equipment: [],
              color: COLOR_CYCLE[colorIdx % COLOR_CYCLE.length],
              steps: []
            };
            colorIdx++;
            newBlocks.push(currentBlock);
          }
          currentBlock.steps.push({ name: trimmed, detail: '', emoji: '✨', tags: [] });
        });

        if (newBlocks.length > 0) {
          S.blocks.push(...newBlocks);
          // Expand new blocks
          S.blocks.forEach((_, i) => { S.collapsed[i] = false; });
          closeSheet(); saveState(); render();
        }
      }
      break;
    }
```

**Step 3: Add the Quick Build button to the edit bar**

In the `renderHeader` function, find the edit bar HTML. Currently it has Save, Routines, and New dropdown. Add a Quick Build button. Find this line:

```javascript
      <button class="btn lg" data-action="load-routines">📂 Routines</button>
```

Add after it:

```javascript
      <button class="btn lg" data-action="open-quick-build">⚡ Quick Build</button>
```

**Step 4: Add the `open-quick-build` action**

Add to click handler switch:

```javascript
    case 'open-quick-build':
      openQuickBuildSheet();
      break;
```

**Step 5: Verify**

- Open app, toggle Edit mode
- Tap "Quick Build"
- Type:
  ```
  ## Warm-up
  Cat/Cow
  Rolls
  ---
  ## Core
  Bridge
  Pulses
  ```
- Tap "Build Routine"
- Verify: 2 blocks + 1 transition created, with correct titles and steps
- First block should be Amber, second should continue the color cycle
- Tap a block header — should open block editor sheet
- Tap a step — should open step editor sheet with name filled in

**Step 6: Commit**

```bash
git add www/index.html
git commit -m "feat: add routine-level Quick Build for creating full routines from text"
```

---

### Task 3: Sync iOS and Final Commit

**Files:**
- Modify: iOS Capacitor sync

**Step 1: Sync Capacitor**

```bash
npx cap sync ios
```

**Step 2: Verify iOS public matches www**

```bash
diff www/index.html ios/App/App/public/index.html
```

Expected: no output (files match).

**Step 3: Final commit with all changes**

```bash
git add www/index.html
git commit -m "feat: quick-entry text mode for rapid routine creation

- Per-block Quick Add: type exercise names one per line
- Routine-level Quick Build: ## Block / --- transition / exercise lines
- Auto-assigns colors cycling through theme palette
- Replaces Apple Notes workflow entirely"
```

**Step 4: Push**

```bash
git push
```
