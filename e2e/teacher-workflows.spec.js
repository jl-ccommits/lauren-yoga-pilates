import { expect, test } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

async function dismissTourIfVisible(page) {
  const tourButton = page.getByRole('button', { name: 'Got It' });
  if (await tourButton.count()) await tourButton.click();
}

async function freshPage(page, path = '/', options = {}) {
  await page.goto(path);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${path}?e2e=${Date.now()}`);
  if (!options.keepTour) await dismissTourIfVisible(page);
}

async function saveRoutine(page, name, classDate) {
  await page.locator('[data-action="save-routine"]').click();
  await page.locator('#saveNameInput').fill(name);
  if (classDate) await page.locator('#saveDateInput').fill(classDate);
  await page.locator('[data-action="confirm-save"]').click();
  await expect(page.locator('#modalContainer')).toBeEmpty();
}

function exactText(value) {
  return new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

function isoInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function exactRoutineCard(page, routineName) {
  const title = page.locator('.routine-card-title').filter({ hasText: exactText(routineName) });
  await expect(title).toHaveCount(1);
  return title.locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " routine-card ")][1]');
}

async function clickSavedRoutineButton(page, routineName, buttonName) {
  const card = await exactRoutineCard(page, routineName);
  await card.getByRole('button', { name: buttonName }).click();
  if (buttonName === 'Open' && await page.locator('#confirmOk').isVisible().catch(() => false)) {
    await page.locator('#confirmOk').click();
  }
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

async function writeFixture(testInfo, fileName, contents) {
  const filePath = testInfo.outputPath(fileName);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
  return filePath;
}

test('teacher can type notes, save, duplicate, reload original, and teach from copy', async ({ page }) => {
  await freshPage(page);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);

  await page.locator('#editToggle').click();
  await expect(page.locator('#editToggle')).toHaveText(/Done/);

  await page.locator('[data-action="open-planning-goals"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/open/);
  await page.locator('#planningDuration').selectOption('60');
  await page.locator('#planningFocus').selectOption('core');
  await page.locator('#planningIntensity').selectOption('strong');
  await page.locator('#sheet [data-action="planning-eq"][data-eq="weights"]').click();
  await page.locator('[data-action="save-planning-goals"]').click();

  await page.locator('[data-action="open-quick-build"]').click();
  await page.locator('#sheetQuickBuildText').fill(`Friday Pilates Strong Core
Warm-up
Breath + Intention | Settle in and name the focus
Cat Cow | Mobilize spine

Grab weights

Core Heat with Weights
Dead Bug Press | Hold weights over chest and alternate legs
Weighted Tabletop Pulses | Small controlled pulses
`);
  await page.locator('[data-action="format-quick-build-notes"]').click();
  await expect(page.locator('#sheetQuickBuildText')).toHaveValue(/# Friday Pilates Strong Core/);
  await expect(page.locator('#sheetQuickBuildText')).toHaveValue(/## Core Heat with Weights/);
  await expect(page.locator('#sheetQuickBuildText')).toHaveValue(/--- Grab weights/);
  await page.locator('[data-action="suggest-quick-build-exercise"]').click();
  await expect(page.getByText('Added an exercise suggestion.')).toBeVisible();
  await page.locator('[data-action="confirm-quick-build"]').click();
  await expect(page.locator('#routineNameInput')).toHaveValue('Friday Pilates Strong Core');
  await expect(page.locator('#blocks').getByText('Core Heat with Weights')).toBeVisible();
  await expect(page.locator('.class-map')).toContainText('Class Map');
  await expect(page.locator('.routine-arc')).toBeHidden();
  await page.locator('.class-map-summary').click();
  await expect(page.locator('.routine-arc')).toBeVisible();
  await expect(page.locator('.equipment-timeline')).toBeVisible();
  await expect(page.locator('.class-balance')).toContainText('Class Balance');
  await expect(page.locator('[data-action="finish-routine"]')).toHaveText('Suggest Missing Sections');

  await page.locator('[data-action="open-quick-add"][data-bi="0"]').click();
  await page.locator('#sheetQuickAddText').fill('Shoulder Rolls | reset posture\nStanding Breath [pulse] | energize the room');
  await page.locator('[data-action="confirm-quick-add"]').click();
  await expect(page.getByText('Shoulder Rolls')).toBeVisible();

  await page.locator('[data-action="open-step-sheet"][data-bi="0"][data-si="0"]').click();
  await page.locator('#sheetStepName').fill('Opening Breath Reset');
  await page.locator('#sheetStepDetail').fill('Invite students to land before moving.');
  await page.locator('[data-action="sheet-toggle-pulse"]').click();
  await page.locator('[data-action="suggest-step-swap"]').click();
  await expect(page.locator('[data-action="replace-suggested-step"]').first()).toBeVisible();
  await page.locator('[data-action="replace-suggested-step"]').first().click();

  await page.locator('[data-action="finish-routine"]').click();
  await expect(page.getByText('Suggested Missing Sections')).toBeVisible();
  if (await page.locator('[data-action="add-suggested-blocks"]').count()) {
    await expect(page.locator('[data-action="add-suggested-blocks"]')).toContainText('Add Suggested Sections');
    await page.locator('[data-action="add-suggested-blocks"]').click();
  }
  await expect(page.locator('#sheet')).not.toHaveClass(/open/);

  await saveRoutine(page, 'E2E Last Week Strong Core', '2026-05-16');

  await page.locator('[data-action="load-routines"]').click();
  await expect(await exactRoutineCard(page, 'E2E Last Week Strong Core')).toContainText('Class 5/16/2026');
  await clickSavedRoutineButton(page, 'E2E Last Week Strong Core', 'Duplicate');
  await expect(page.locator('#routineNameInput')).toHaveValue('E2E Last Week Strong Core Copy');

  await page.locator('[data-action="open-quick-add"][data-bi="0"]').click();
  await page.locator('#sheetQuickAddText').fill('Copy Only Note | add this for next week');
  await page.locator('[data-action="confirm-quick-add"]').click();
  await expect(page.getByText('Copy Only Note')).toBeVisible();
  await saveRoutine(page, 'E2E This Week Strong Core', '2026-05-23');

  await page.locator('[data-action="load-routines"]').click();
  await clickSavedRoutineButton(page, 'E2E Last Week Strong Core', 'Open');
  await expect(page.locator('#routineName')).toHaveText('E2E Last Week Strong Core');
  await expect(page.getByText('Copy Only Note')).toHaveCount(0);

  await page.locator('[data-action="load-routines"]').click();
  await expect(await exactRoutineCard(page, 'E2E This Week Strong Core')).toContainText('Class 5/23/2026');
  await clickSavedRoutineButton(page, 'E2E This Week Strong Core', 'Open');
  await expect(page.locator('#routineName')).toHaveText('E2E This Week Strong Core');
  await expect(page.getByText('Copy Only Note')).toBeVisible();

  await page.locator('#studyToggle').click();
  await expect(page.locator('body')).toHaveClass(/study-mode/);
  await expect(page.locator('#studyToggle')).toHaveText('Preview');
  await expect(page.locator('.memory-card').first()).toBeVisible();
  await expect(page.locator('.memory-steps').first()).toBeVisible();
  await expect(page.locator('.timeline-chip').first()).toBeVisible();

  await page.locator('#teachToggle').click();
  await expect(page.locator('body')).toHaveClass(/teach-mode/);
  await expect(page.locator('body')).not.toHaveClass(/study-mode/);
  await page.locator('input.step-checkbox').first().check();
  await expect(page.getByText(/complete · 1\//)).toBeVisible();
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/teach-mode/);
  await expect(page.getByText(/complete · 1\//)).toBeVisible();
});

test('first-run tour is short, local-only, and skippable', async ({ page }) => {
  await freshPage(page, '/', { keepTour: true });
  await expect(page.getByText('Quick Tour')).toBeVisible();
  await expect(page.getByText('Paste messy Apple Notes and turn them into a teachable class plan. Everything saves on this device. No account needed.')).toBeVisible();
  await expect(page.locator('.tour-item')).toHaveCount(5);
  await expect(page.locator('.tour-item strong')).toHaveText(['Edit Plan', 'Saved', 'Preview', 'Teach Mode', 'Classes']);
  await expect(page.getByText('Paste Apple Notes, change exercises, set goals, or ask for suggestions.')).toBeVisible();
  await expect(page.getByText("Open last week's class, duplicate it, or make a backup.")).toBeVisible();
  await expect(page.getByText('Track usual classes, sub classes, and which plans are ready.')).toBeVisible();
  await expect(page.getByText('Study the class shape before teaching.')).toBeVisible();
  await expect(page.getByText('Use bigger text and check off exercises during class.')).toBeVisible();
  await page.getByRole('button', { name: 'Got It' }).click();
  await expect(page.locator('#modalContainer')).toBeEmpty();
  await page.reload();
  await expect(page.getByText('Quick Tour')).toHaveCount(0);
  await expect(page.locator('#routineName')).toHaveText('Mat Pilates - Core + Glutes');
  await page.locator('[data-action="show-tour"]').click();
  await expect(page.getByText('Quick Tour')).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.locator('#modalContainer')).toBeEmpty();
});

test('mobile planning controls stay reachable and new-template flow keeps editing', async ({ page }) => {
  await freshPage(page);
  await expectNoHorizontalOverflow(page);
  await expect(page.locator('.class-map')).toContainText('Class Map');
  await expect(page.locator('.class-glance')).toContainText(/45 min/);
  await expect(page.locator('.filter-panel')).toContainText('All equipment');
  await expect(page.locator('.routine-arc')).toBeHidden();
  await expect(page.locator('.block-card').first()).toBeVisible();
  await page.locator('#editToggle').click();
  await page.locator('#newBtn').click();
  await page.locator('[data-action="new-template"][data-tkey="pilates-full-body"]').click();
  await page.locator('#confirmOk').click();
  await expect(page.locator('#editToggle')).toHaveText(/Done/);
  await expect(page.locator('[data-action="open-quick-build"]')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.locator('[data-action="open-planning-goals"]').click();
  await expect(page.locator('#sheet')).toHaveClass(/open/);
  await expect(page.locator('[data-action="save-planning-goals"]')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.locator('#planningFocus').selectOption('glute');
  await page.locator('#sheet [data-action="planning-eq"][data-eq="band"]').click();
  await page.locator('[data-action="save-planning-goals"]').click();

  await page.locator('[data-action="open-quick-build"]').click();
  await page.locator('[data-action="suggest-quick-build-routine"]').click();
  await expect(page.locator('#sheetQuickBuildText')).toHaveValue(/##/);
  await expect(page.getByText('Added routine suggestions.')).toBeVisible();
  await page.locator('[data-action="close-sheet"]').click();
  await expect(page.getByText('Keep these pasted notes for later?')).toBeVisible();
  await page.locator('#confirmOk').click();

  await page.locator('#newBtn').click();
  await expect(page.locator('#newMenu')).not.toHaveClass(/hidden/);
  await page.locator('[data-action="load-routines"]').click();
  await expect(page.locator('#newMenu')).toHaveClass(/hidden/);
  await expect(page.locator('#libraryPanel')).not.toHaveClass(/hidden/);
  await expectNoHorizontalOverflow(page);
});

test('teacher can schedule usual and sub classes, then plan from a recent saved class', async ({ page }) => {
  await freshPage(page);
  await page.locator('#editToggle').click();
  await saveRoutine(page, 'Recent Saved Pilates Class', isoInDays(-7));

  await page.locator('[data-action="load-schedule"]').click();
  await expect(page.locator('#libraryTitle')).toHaveText('Schedule');
  await expect(page.getByText('No classes scheduled yet.')).toBeVisible();

  await page.locator('[data-action="open-schedule-form"]').click();
  await page.locator('#scheduleTitleInput').fill('Sunday Sub Flow');
  await page.locator('#scheduleDisciplineInput').selectOption('pilates');
  await page.locator('#scheduleDateInput').fill(isoInDays(1));
  await page.locator('#scheduleTimeInput').fill('08:30');
  await page.locator('#scheduleNoteInput').fill('Subbing, bring weights.');
  await page.locator('[data-action="save-schedule-class"]').click();
  await expect(page.locator('.schedule-card').filter({ hasText: 'Sunday Sub Flow' })).toContainText('Needs Plan');
  await expect(page.locator('.schedule-card').filter({ hasText: 'Sunday Sub Flow' })).toContainText('Subbing, bring weights.');

  await page.locator('[data-action="open-schedule-form"]').click();
  await page.locator('#scheduleTitleInput').fill('Friday Usual Pilates');
  await page.locator('#scheduleDisciplineInput').selectOption('pilates');
  await page.locator('#scheduleDateInput').fill(isoInDays(2));
  await page.locator('#scheduleTimeInput').fill('10:30');
  await page.locator('#scheduleRepeatInput').check();
  await page.locator('[data-action="save-schedule-class"]').click();
  const fridayCards = page.locator('.schedule-card').filter({ hasText: 'Friday Usual Pilates' });
  await expect(fridayCards).toHaveCount(2);
  await expect(fridayCards.first()).toContainText('weekly');
  await expectNoHorizontalOverflow(page);

  await page.locator('.schedule-card').filter({ hasText: 'Sunday Sub Flow' }).getByRole('button', { name: 'Use Recent' }).click();
  await expect(page.locator('body')).toHaveClass(/editing-mode/);
  await expect(page.locator('#routineNameInput')).toHaveValue(/Sunday Sub Flow/);
  await expect(page.locator('#blocks')).toContainText('Seated Cross-Legged');

  await page.locator('[data-action="load-schedule"]').click();
  const subCard = page.locator('.schedule-card').filter({ hasText: 'Sunday Sub Flow' });
  await expect(subCard).toContainText('Ready');
  await expect(subCard).toContainText('Linked plan: Sunday Sub Flow');
  await subCard.getByRole('button', { name: 'Taught' }).click();
  await expect(page.locator('.schedule-card').filter({ hasText: 'Sunday Sub Flow' })).toContainText('Taught');

  await page.reload();
  await page.locator('[data-action="load-schedule"]').click();
  await expect(page.locator('.schedule-card').filter({ hasText: 'Sunday Sub Flow' })).toContainText('Taught');
  await expect(page.locator('.schedule-card').filter({ hasText: 'Friday Usual Pilates' })).toHaveCount(2);
});

test('fresh device, backup download, invalid import, and restore all work locally', async ({ page }, testInfo) => {
  await freshPage(page);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('#routineName')).toHaveText('Mat Pilates - Core + Glutes');

  await page.locator('[data-action="load-routines"]').click();
  await expect(page.getByText('No saved classes yet. Save your first class!')).toBeVisible();
  await page.locator('#libraryPanel [data-action="close-library"]').click();

  await page.locator('#editToggle').click();
  await page.locator('#routineNameInput').fill('Backup Export Class');
  await page.locator('[data-action="open-quick-add"][data-bi="0"]').click();
  await page.locator('#sheetQuickAddText').fill('Export Marker Move | local backup check');
  await page.locator('[data-action="confirm-quick-add"]').click();
  await saveRoutine(page, 'Backup Export Class', '2026-05-21');

  await page.locator('[data-action="load-routines"]').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-action="export-backup"]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^lauren-class-planner-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const backupPath = testInfo.outputPath('planner-backup.json');
  await mkdir(dirname(backupPath), { recursive: true });
  await download.saveAs(backupPath);

  const backup = JSON.parse(await readFile(backupPath, 'utf8'));
  expect(backup.version).toBe(1);
  expect(backup.currentState.routineName).toBe('Backup Export Class');
  expect(backup.currentState.classDate).toBe('2026-05-21');
  expect(backup.routines.map(routine => routine.name)).toContain('Backup Export Class');
  expect(Array.isArray(backup.schedule)).toBe(true);

  const invalidPath = await writeFixture(testInfo, 'bad-backup.json', '{not json');
  await page.locator('#backupFileInput').setInputFiles(invalidPath);
  await expect(page.getByText('Import Failed')).toBeVisible();
  await page.locator('#modalContainer button[data-action="close-modal"]').click();

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await dismissTourIfVisible(page);
  await page.locator('[data-action="load-routines"]').click();
  await expect(page.getByText('No saved classes yet. Save your first class!')).toBeVisible();

  await page.locator('#backupFileInput').setInputFiles(backupPath);
  await expect(page.getByText('Import Backup?')).toBeVisible();
  await page.locator('[data-action="confirm-import-backup"]').click();
  await expect(page.getByText('Backup Imported')).toBeVisible();
  await page.locator('#modalContainer button[data-action="close-modal"]').click();
  await expect(await exactRoutineCard(page, 'Backup Export Class')).toBeVisible();
  await clickSavedRoutineButton(page, 'Backup Export Class', 'Open');
  await expect(page.locator('#routineName')).toHaveText('Backup Export Class');
  await expect(page.getByText('Export Marker Move')).toBeVisible();
});

test('mistake recovery protects saved routines and unsaved current edits', async ({ page }) => {
  await freshPage(page);
  await page.locator('#editToggle').click();
  await page.locator('#routineNameInput').fill('Mistake Recovery Base');
  await saveRoutine(page, 'Mistake Recovery Base', '2026-05-16');

  await page.locator('#newBtn').click();
  await page.locator('[data-action="new-template"][data-tkey="blank-pilates"]').click();
  await expect(page.getByText('Start Blank Pilates Class? Unsaved changes will be lost.')).toBeVisible();
  await page.locator('#confirmCancel').click();
  await expect(page.locator('#routineNameInput')).toHaveValue('Mistake Recovery Base');

  await page.locator('[data-action="load-routines"]').click();
  await clickSavedRoutineButton(page, 'Mistake Recovery Base', 'Delete');
  await expect(page.getByText('Delete this saved class?')).toBeVisible();
  await page.locator('#confirmCancel').click();
  await expect(await exactRoutineCard(page, 'Mistake Recovery Base')).toBeVisible();
  await expect(await exactRoutineCard(page, 'Mistake Recovery Base')).toContainText('Class 5/16/2026');

  await clickSavedRoutineButton(page, 'Mistake Recovery Base', 'Duplicate');
  await expect(page.locator('#routineNameInput')).toHaveValue('Mistake Recovery Base Copy');
  await page.locator('[data-action="open-quick-add"][data-bi="0"]').click();
  await page.locator('#sheetQuickAddText').fill('Abandoned Copy Marker | survives reload only on the copy');
  await page.locator('[data-action="confirm-quick-add"]').click();
  await page.reload();
  await expect(page.locator('#routineName')).toHaveText('Mistake Recovery Base Copy');
  await expect(page.getByText('Abandoned Copy Marker')).toBeVisible();

  await page.locator('[data-action="load-routines"]').click();
  await clickSavedRoutineButton(page, 'Mistake Recovery Base', 'Open');
  await expect(page.locator('#routineName')).toHaveText('Mistake Recovery Base');
  await expect(page.getByText('Abandoned Copy Marker')).toHaveCount(0);

  await page.locator('#editToggle').click();
  await page.locator('[data-action="open-step-sheet"][data-bi="0"][data-si="0"]').click();
  await page.locator('#sheetStepName').fill('Same Name Update Marker');
  await page.locator('[data-action="close-sheet"]').click();
  await saveRoutine(page, 'Mistake Recovery Base');
  await page.locator('[data-action="load-routines"]').click();
  await expect(page.locator('.routine-card-title').filter({ hasText: exactText('Mistake Recovery Base') })).toHaveCount(1);
  await clickSavedRoutineButton(page, 'Mistake Recovery Base', 'Open');
  await expect(page.getByText('Same Name Update Marker')).toBeVisible();

  await page.locator('[data-action="load-routines"]').click();
  await clickSavedRoutineButton(page, 'Mistake Recovery Base', 'Delete');
  await page.locator('#confirmOk').click();
  await expect(page.locator('.routine-card-title').filter({ hasText: exactText('Mistake Recovery Base') })).toHaveCount(0);
});

const realClassTemplateNames = [
  'Mat Pilates - Core + Glutes',
  'Mat Pilates - Full Body',
  'Yoga Sculpt - Ball + Weights',
  'Yoga Sculpt - Flow + Strength',
  'Blank Pilates Class',
  'Blank Yoga Class',
];

for (const templateName of realClassTemplateNames) {
  test(`built-in template "${templateName}" saves, duplicates, reloads, and suggests cleanly`, async ({ page }) => {
    await freshPage(page);

    await page.locator('[data-action="load-routines"]').click();
    await clickSavedRoutineButton(page, templateName, 'Open');
    await expect(page.locator('#routineName')).toHaveText(templateName);

    await page.locator('#editToggle').click();
    await page.locator('[data-action="suggest-step"][data-bi="0"]').click();
    await expect(page.locator('[data-action="add-suggested-step"]').first()).toBeVisible();
    await page.locator('[data-action="add-suggested-step"]').first().click();
    await saveRoutine(page, `Real Class - ${templateName}`);
    await page.locator('#editToggle').click();

    await page.locator('[data-action="load-routines"]').click();
    await clickSavedRoutineButton(page, `Real Class - ${templateName}`, 'Duplicate');
    await expect(page.locator('#routineNameInput')).toHaveValue(`Real Class - ${templateName} Copy`);
    await saveRoutine(page, `Real Class - ${templateName} Next Week`);

    await page.locator('[data-action="load-routines"]').click();
    await clickSavedRoutineButton(page, `Real Class - ${templateName}`, 'Open');
    await expect(page.locator('#routineName')).toHaveText(`Real Class - ${templateName}`);
    await page.locator('[data-action="load-routines"]').click();
    await clickSavedRoutineButton(page, `Real Class - ${templateName} Next Week`, 'Open');
    await expect(page.locator('#routineName')).toHaveText(`Real Class - ${templateName} Next Week`);
  });
}
