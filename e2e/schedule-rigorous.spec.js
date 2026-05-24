import { expect, test } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

async function dismissTourIfVisible(page) {
  const tourButton = page.getByRole('button', { name: 'Got It' });
  if (await tourButton.count()) await tourButton.click();
}

async function freshPage(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/?schedule-rigorous=${Date.now()}`);
  await dismissTourIfVisible(page);
}

function isoInDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function saveRoutine(page, name, classDate) {
  await page.locator('[data-action="save-routine"]').click();
  await page.locator('#saveNameInput').fill(name);
  if (classDate) await page.locator('#saveDateInput').fill(classDate);
  await page.locator('[data-action="confirm-save"]').click();
  await expect(page.locator('#modalContainer')).toBeEmpty();
}

async function openSchedule(page) {
  await page.locator('[data-action="load-schedule"]').click();
  await expect(page.locator('#libraryTitle')).toHaveText('Schedule');
}

function scheduleCard(page, title) {
  return page.locator('.schedule-card').filter({ hasText: title });
}

async function addScheduleClass(page, {
  title,
  discipline = 'pilates',
  date = isoInDays(1),
  time = '09:00',
  duration = '45',
  repeats = false,
  note = '',
}) {
  await page.locator('[data-action="open-schedule-form"]').click();
  await page.locator('#scheduleTitleInput').fill(title);
  await page.locator('#scheduleDisciplineInput').selectOption(discipline);
  await page.locator('#scheduleDateInput').fill(date);
  await page.locator('#scheduleTimeInput').fill(time);
  await page.locator('#scheduleDurationInput').selectOption(duration);
  if (repeats) await page.locator('#scheduleRepeatInput').check();
  if (note) await page.locator('#scheduleNoteInput').fill(note);
  await page.locator('[data-action="save-schedule-class"]').click();
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2);
}

test('schedule validation and recent-plan matching prevent cross-type confusion', async ({ page }) => {
  await freshPage(page);
  await page.locator('#editToggle').click();
  await saveRoutine(page, 'Recent Pilates Only', isoInDays(-7));

  await openSchedule(page);
  await page.locator('[data-action="open-schedule-form"]').click();
  await page.locator('[data-action="save-schedule-class"]').click();
  await expect(page.locator('#scheduleFormStatus')).toContainText('Add a class name.');
  await page.locator('#modalContainer button[data-action="close-modal"]').click();

  await addScheduleClass(page, {
    title: 'Yoga Sub No Cross',
    discipline: 'yoga',
    date: isoInDays(1),
    time: '08:15',
    note: 'Only use a Yoga plan here.',
  });

  const yogaCard = scheduleCard(page, 'Yoga Sub No Cross');
  await expect(yogaCard).toHaveCount(1);
  await expect(yogaCard).toContainText('Needs Plan');
  await expect(yogaCard).toContainText('Only use a Yoga plan here.');

  await yogaCard.getByRole('button', { name: 'Use Recent' }).click();
  await expect(page.getByText('No Saved Classes Yet')).toBeVisible();
  await expect(page.getByText('Save a class first, use the current class, or start blank for this scheduled class.')).toBeVisible();
  await page.locator('#modalContainer button[data-action="close-modal"]').click();
  await expect(yogaCard).toContainText('Needs Plan');

  await yogaCard.getByRole('button', { name: 'Start Blank' }).click();
  await expect(page.locator('body')).toHaveClass(/editing-mode/);
  await expect(page.locator('#routineNameInput')).toHaveValue(/Yoga Sub No Cross -/);
  await expect(page.locator('#blocks')).toContainText('Main Yoga Flow');

  const currentState = await page.evaluate(() => JSON.parse(localStorage.getItem('current_state')).state);
  expect(currentState.discipline).toBe('yoga');
  expect(currentState.routineName).toContain('Yoga Sub No Cross');

  await openSchedule(page);
  const readyYogaCard = scheduleCard(page, 'Yoga Sub No Cross');
  await expect(readyYogaCard).toContainText('Ready');
  await expect(readyYogaCard).toContainText('Linked plan: Yoga Sub No Cross');
  await readyYogaCard.getByRole('button', { name: 'Open Plan' }).click();
  await expect(page.locator('#routineName')).toContainText('Yoga Sub No Cross');
  await expect(page.locator('#blocks')).toContainText('Main Yoga Flow');
  await expectNoHorizontalOverflow(page);
});

test('weekly schedule items persist through use-current, reload, delete undo, and backup export', async ({ page }, testInfo) => {
  await freshPage(page);
  await page.locator('#editToggle').click();
  await page.locator('#routineNameInput').fill('Current Class For Schedule');

  await openSchedule(page);
  await addScheduleClass(page, {
    title: 'Weekly Pilates Reliability',
    discipline: 'pilates',
    date: isoInDays(0),
    time: '10:30',
    duration: '60',
    repeats: true,
    note: 'Usual class, keep this easy to find.',
  });

  let weeklyCards = scheduleCard(page, 'Weekly Pilates Reliability');
  await expect(weeklyCards).toHaveCount(2);
  await expect(weeklyCards.first()).toContainText('weekly');
  await expect(weeklyCards.first()).toContainText('Usual class, keep this easy to find.');
  await expectNoHorizontalOverflow(page);

  await weeklyCards.first().getByRole('button', { name: 'Use Current' }).click();
  await expect(page.locator('body')).toHaveClass(/editing-mode/);
  await expect(page.locator('#routineNameInput')).toHaveValue('Current Class For Schedule');

  await openSchedule(page);
  weeklyCards = scheduleCard(page, 'Weekly Pilates Reliability');
  await expect(weeklyCards).toHaveCount(2);
  await expect(weeklyCards.first()).toContainText('Ready');
  await expect(weeklyCards.first()).toContainText('Linked plan: Current Class For Schedule');
  await weeklyCards.first().getByRole('button', { name: 'Taught' }).click();
  weeklyCards = scheduleCard(page, 'Weekly Pilates Reliability');
  await expect(weeklyCards).toHaveCount(2);
  await expect(weeklyCards.first()).toContainText('Taught');
  await expect(weeklyCards.last()).toContainText('Taught');

  await page.reload();
  await dismissTourIfVisible(page);
  await openSchedule(page);
  weeklyCards = scheduleCard(page, 'Weekly Pilates Reliability');
  await expect(weeklyCards).toHaveCount(2);
  await expect(weeklyCards.first()).toContainText('Taught');

  await weeklyCards.first().getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Delete this scheduled class?')).toBeVisible();
  await page.locator('#confirmOk').click();
  await expect(scheduleCard(page, 'Weekly Pilates Reliability')).toHaveCount(0);
  await expect(page.locator('#undoSnackbar')).toContainText('Deleted scheduled class.');
  await page.locator('#undoSnackbar .undo-button').click();
  weeklyCards = scheduleCard(page, 'Weekly Pilates Reliability');
  await expect(weeklyCards).toHaveCount(2);
  await expect(weeklyCards.first()).toContainText('Taught');

  await page.locator('#libraryPanel [data-action="close-library"]').click();
  await expect(page.locator('#libraryPanel')).toHaveClass(/hidden/);
  await page.locator('[data-action="load-routines"]').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-action="export-backup"]').click();
  const download = await downloadPromise;
  const backupPath = testInfo.outputPath('schedule-backup.json');
  await mkdir(dirname(backupPath), { recursive: true });
  await download.saveAs(backupPath);

  const backup = JSON.parse(await readFile(backupPath, 'utf8'));
  expect(backup.schedule).toHaveLength(1);
  expect(backup.schedule[0].title).toBe('Weekly Pilates Reliability');
  expect(backup.schedule[0].repeat).toBe('weekly');
  expect(backup.schedule[0].status).toBe('taught');
  expect(backup.schedule[0].routineId).toBeTruthy();
});
