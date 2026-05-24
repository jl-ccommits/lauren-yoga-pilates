import { expect, test } from '@playwright/test';

async function freshPage(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/?button-surface=${Date.now()}`);
  const tourButton = page.getByRole('button', { name: 'Got It' });
  if (await tourButton.count()) await tourButton.click();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

test('top-level phone navigation, class switching, and overlays are forgiving', async ({ page }) => {
  await freshPage(page);

  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('#routineName')).toHaveText('Mat Pilates - Core + Glutes');
  await expect(page.locator('#disciplineBadge')).toHaveText('Templates');
  await expect(page.locator('[data-action="load-routines"]')).toHaveText('Saved');
  await expect(page.locator('[data-action="load-schedule"]')).toHaveText('Classes');
  await expect(page.locator('[data-action="show-tour"]')).toHaveText('?');
  await expect(page.locator('#studyToggle')).toHaveText('Preview');
  await expect(page.locator('#teachToggle')).toHaveText('Teach Mode');
  await expect(page.locator('#headerActions .btn')).toHaveText(['Saved', 'Preview', 'Teach Mode', 'Classes', '?']);
  await expect(page.locator('#editToggle')).toHaveText('Edit Plan');
  await expectNoHorizontalOverflow(page);

  await page.locator('[data-action="load-schedule"]').click();
  await expect(page.locator('#libraryPanel')).not.toHaveClass(/hidden/);
  await expect(page.locator('#libraryTitle')).toHaveText('Schedule');
  await expect(page.getByText('No classes scheduled yet.')).toBeVisible();
  await page.locator('#libraryPanel [data-action="close-library"]').click();

  await page.locator('[data-action="show-tour"]').click();
  await expect(page.getByText('Quick Tour')).toBeVisible();
  await expect(page.getByText('Paste messy Apple Notes and turn them into a teachable class plan. Everything saves on this device. No account needed.')).toBeVisible();
  await page.getByRole('button', { name: 'Got It' }).click();
  await expect(page.locator('#modalContainer')).toBeEmpty();

  await page.locator('[data-action="switch-discipline"]').click();
  await expect(page.locator('#modalContainer')).toContainText('Choose Starter Class');
  await page.locator('[data-action="switch-template"][data-tkey="yoga-flow-strength"]').click();
  await expect(page.getByText('Switch to Yoga Sculpt - Flow + Strength? Unsaved changes will be lost.')).toBeVisible();
  await page.locator('#confirmCancel').click();
  await page.locator('#modalContainer').getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('#routineName')).toHaveText('Mat Pilates - Core + Glutes');

  await page.locator('[data-action="load-routines"]').click();
  await expect(page.locator('#libraryPanel')).not.toHaveClass(/hidden/);
  await page.locator('[data-action="load-template"][data-tkey="blank-yoga"]').click();
  await expect(page.getByText('Open Blank Yoga Class? Unsaved changes will be lost.')).toBeVisible();
  await page.locator('#confirmOk').click();
  await expect(page.locator('#routineName')).toHaveText('Blank Yoga Class');
  await expect(page.locator('#disciplineBadge')).toHaveText('Templates');

  await page.locator('[data-action="load-routines"]').click();
  await page.locator('#libraryPanel [data-action="close-library"]').click();
  await expect(page.locator('#libraryPanel')).toHaveClass(/hidden/);
  await expectNoHorizontalOverflow(page);
});

test('planning editor secondary controls work without losing nearby work', async ({ page }) => {
  await freshPage(page);
  await page.locator('#editToggle').click();
  await expect(page.locator('body')).toHaveClass(/editing-mode/);

  await page.locator('[data-action="add-block"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/open/);
  await page.locator('#sheetBlockTitle').fill('Teacher Test Section');
  await page.locator('[data-action="sheet-color"][data-color="var(--rose)"]').click();
  await page.locator('[data-action="sheet-eq"][data-eq="ball"]').click();
  await page.locator('[data-action="sheet-move-up"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/open/);
  await page.locator('[data-action="sheet-move-down"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/open/);
  await page.locator('[data-action="sheet-duplicate"]').click();
  await expect(page.locator('#blocks').getByText('Teacher Test Section (copy)')).toBeVisible();
  await page.locator('.block-header').filter({ hasText: 'Teacher Test Section (copy)' }).click();
  await page.locator('[data-action="sheet-delete-block"]').click();
  await expect(page.getByText('Delete this section?')).toBeVisible();
  await page.locator('#confirmOk').click();
  await expect(page.getByText('Teacher Test Section (copy)')).toHaveCount(0);
  await expect(page.locator('#undoSnackbar')).toContainText('Deleted section.');
  await page.locator('#undoSnackbar .undo-button').click();
  await expect(page.locator('#blocks').getByText('Teacher Test Section (copy)')).toBeVisible();

  await page.locator('[data-action="open-step-sheet"][data-bi="0"][data-si="0"]').click();
  await page.locator('#sheetStepName').fill('Edited Teacher Cue');
  await page.locator('#sheetStepDetail').fill('Simple cue Lauren can say out loud.');
  await page.locator('[data-action="sheet-toggle-pulse"]').click();
  await page.locator('[data-action="sheet-step-move-down"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/open/);
  await page.locator('[data-action="sheet-step-move-up"]').click();
  await expect(page.locator('#sheetStepName')).toHaveValue('Edited Teacher Cue');
  await page.locator('[data-action="sheet-add-another"]').click();
  await page.locator('#sheetStepName').fill('New Tiny Test Move');
  await page.locator('#sheetStepDetail').fill('A short recovery cue.');
  await page.locator('[data-action="close-sheet"]').click();
  await expect(page.getByText('New Tiny Test Move')).toBeVisible();
  await page.locator('.step-edit-row').filter({ hasText: 'New Tiny Test Move' }).click();
  await page.locator('[data-action="sheet-delete-step"]').click();
  await expect(page.getByText('Delete this exercise?')).toBeVisible();
  await page.locator('#confirmOk').click();
  await expect(page.getByText('New Tiny Test Move')).toHaveCount(0);
  await expect(page.locator('#undoSnackbar')).toContainText('Deleted exercise.');
  await page.locator('#undoSnackbar .undo-button').click();
  await expect(page.getByText('New Tiny Test Move')).toBeVisible();

  await page.locator('[data-action="open-quick-add"][data-bi="0"]').click();
  await page.locator('#sheetQuickAddText').fill('Replacement Only Move | clean replacement check');
  await page.locator('#quickAddReplace').check();
  await page.locator('[data-action="confirm-quick-add"]').click();
  await expect(page.locator('#blocks')).toContainText('Replacement Only Move');
  await expect(page.locator('#blocks')).not.toContainText('Seated Cross-Legged');
  await expect(page.locator('#undoSnackbar')).toContainText('Replaced section exercises.');
  await page.locator('#undoSnackbar .undo-button').click();
  await expect(page.locator('#blocks')).toContainText('Edited Teacher Cue');
  await expect(page.locator('#blocks')).not.toContainText('Replacement Only Move');

  await page.locator('[data-action="open-step-sheet"][data-bi="0"][data-si="0"]').click();
  const originalStepName = await page.locator('#sheetStepName').inputValue();
  await page.locator('[data-action="suggest-step-swap"]').click();
  await expect(page.locator('[data-action="replace-suggested-step"]').first()).toBeVisible();
  await page.locator('[data-action="replace-suggested-step"]').first().click();
  await expect(page.locator('#undoSnackbar')).toContainText('Replaced exercise.');
  await page.locator('#undoSnackbar .undo-button').click();
  await expect(page.locator('#blocks')).toContainText(originalStepName);

  await page.locator('[data-action="open-quick-build"]').click();
  await page.locator('#quickBuildReplace').uncheck();
  await page.locator('#sheetQuickBuildText').fill(`Append Test Class
Append Section
Append Move | keep existing replacement too`);
  await page.locator('[data-action="confirm-quick-build"]').click();
  await expect(page.locator('#blocks')).toContainText('Edited Teacher Cue');
  await expect(page.locator('#blocks')).toContainText('Append Move');
});

test('whole-class quick build replace can be undone', async ({ page }) => {
  await freshPage(page);
  await page.locator('#editToggle').click();
  await expect(page.locator('#blocks')).toContainText('Seated Cross-Legged');

  await page.locator('[data-action="open-quick-build"]').click();
  await page.locator('#sheetQuickBuildText').fill(`Undo Replace Class
Single Section
Only Replacement Move | should disappear after undo`);
  await page.locator('[data-action="confirm-quick-build"]').click();
  await expect(page.locator('#blocks')).toContainText('Only Replacement Move');
  await expect(page.locator('#blocks')).not.toContainText('Seated Cross-Legged');
  await expect(page.locator('#undoSnackbar')).toContainText('Class built from notes.');

  await page.locator('#undoSnackbar .undo-button').click();
  await expect(page.locator('#blocks')).toContainText('Seated Cross-Legged');
  await expect(page.locator('#blocks')).not.toContainText('Only Replacement Move');
  await expect(page.locator('#editToggle')).toHaveText(/Done/);
});

test('review and teach buttons stay clear, reversible, and persistent', async ({ page }) => {
  await freshPage(page);

  await expect(page.locator('.class-glance')).toContainText('moves');
  await expect(page.locator('.class-map')).toContainText('Class Map');
  await expect(page.locator('.routine-arc')).toBeHidden();
  await page.locator('.class-map-summary').click();
  await expect(page.locator('.routine-arc')).toBeVisible();
  await expect(page.locator('[data-action="toggle-quiz"][data-bi="0"]')).toHaveText('Quiz');
  await page.locator('[data-action="toggle-collapse"][data-bi="0"]').click();
  await expect(page.locator('.block-card[data-bi="0"] .block-content')).toHaveClass(/collapsed/);
  await page.locator('[data-action="toggle-collapse"][data-bi="0"]').click();
  await expect(page.locator('.block-card[data-bi="0"] .block-content')).not.toHaveClass(/collapsed/);

  await page.locator('.filter-panel summary').click();
  const firstFilter = page.locator('.eq-chip').first();
  await expect(firstFilter).toBeVisible();
  await firstFilter.click();
  await expect(firstFilter).toHaveClass(/active/);
  await firstFilter.click();
  await expect(firstFilter).not.toHaveClass(/active/);

  await page.locator('[data-action="toggle-quiz"][data-bi="0"]').click();
  await expect(page.locator('[data-action="toggle-quiz"][data-bi="0"]')).toHaveText('List');
  await page.locator('[data-action="reveal-quiz"][data-bi="0"][data-si="0"]').click();
  await expect(page.locator('.quiz-card.revealed')).toHaveCount(1);
  await page.locator('[data-action="toggle-quiz"][data-bi="0"]').click();
  await expect(page.locator('[data-action="toggle-quiz"][data-bi="0"]')).toHaveText('Quiz');

  await page.locator('#studyToggle').click();
  await expect(page.locator('body')).toHaveClass(/study-mode/);
  await expect(page.locator('.memory-card').first()).toBeVisible();
  await page.locator('#teachToggle').click();
  await expect(page.locator('body')).toHaveClass(/teach-mode/);
  await expect(page.locator('body')).not.toHaveClass(/study-mode/);
  await page.locator('input.step-checkbox').first().check();
  await expect(page.getByText(/complete · 1\//)).toBeVisible();
  await page.locator('[data-action="start-fresh"]').click();
  await expect(page.getByText('Reset all progress?')).toBeVisible();
  await page.locator('#confirmOk').click();
  await expect(page.getByText(/complete · 0\//)).toBeVisible();

  await page.locator('#editToggle').click();
  await page.locator('[data-action="copy-plan"]').click();
  await expect(page.locator('#modalContainer')).toContainText(/Plan Copied|Copy Plan/);
  await page.locator('#modalContainer').getByRole('button', { name: 'Done' }).click();
  await expect(page.locator('#modalContainer')).toBeEmpty();
});

test('sheet overlay dismissal saves typed edits and leaves the app usable', async ({ page }) => {
  await freshPage(page);
  await page.locator('#editToggle').click();

  await page.locator('[data-action="open-step-sheet"][data-bi="0"][data-si="0"]').click();
  await page.locator('#sheetStepName').fill('Overlay Saved Move');
  await page.locator('#sheetOverlay').click({ position: { x: 10, y: 10 } });
  await expect(page.locator('#sheet')).not.toHaveClass(/open/);
  await expect(page.getByText('Overlay Saved Move')).toBeVisible();

  await page.locator('[data-action="open-quick-build"]').click();
  await page.locator('#sheetQuickBuildText').fill('Dismissed Draft Should Not Build');
  await page.locator('#sheetOverlay').click({ position: { x: 10, y: 10 } });
  await expect(page.getByText('Keep these pasted notes for later?')).toBeVisible();
  await page.locator('#confirmOk').click();
  await expect(page.locator('#sheet')).not.toHaveClass(/open/);
  await expect(page.getByText('Dismissed Draft Should Not Build')).toHaveCount(0);
  await page.locator('[data-action="open-quick-build"]').click();
  await expect(page.locator('#sheetQuickBuildText')).toHaveValue('Dismissed Draft Should Not Build');
  await page.locator('#sheetQuickBuildText').fill('');
  await page.locator('[data-action="close-sheet"]').click();
  await expectNoHorizontalOverflow(page);
});
