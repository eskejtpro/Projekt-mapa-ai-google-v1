import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from '@playwright/test';

const require = createRequire(import.meta.url);
const electronPath = require('electron');

const profile = mkdtempSync(join(tmpdir(), 'prezent-restart-test-e2e-'));
const fixture = join(profile, 'e2e-fixture.webm');
const launchOptions = {
  executablePath: electronPath,
  args: ['.', `--smoke-test`, `--smoke-profile=${profile}`],
  env: { ...process.env, PREZENT_E2E_VIDEO_FIXTURE: fixture },
};
let app = await electron.launch(launchOptions);
try {
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  // Minimal container fixture exercises the real import/SQLite/UI path.
  // Codec decoding is covered separately by the real Windows media test.
  writeFileSync(fixture, Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(128)]));
  await page.locator('button[title*="Wszystkie Zdjęcia"]').click();
  await page.getByRole('button', { name: 'Dodaj filmy' }).click();
  await page.getByRole('button', { name: /^Filmy/ }).click();
  await assert.doesNotReject(() => page.getByText('e2e-fixture').waitFor({ state: 'visible' }));
  const card = page.locator('article').filter({ hasText: 'e2e-fixture' });
  await card.locator('select').selectOption('album-italy');
  await page.getByText('Zapisano przypisanie filmu do albumu.').waitFor({ state: 'visible' });
  await card.locator('button').first().click();
  await assert.doesNotReject(() => page.getByRole('dialog', { name: 'e2e-fixture' }).waitFor({ state: 'visible' }));
  const video = page.getByRole('dialog').locator('video');
  await assert.doesNotReject(() => video.waitFor({ state: 'visible' }));
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  await app.close();
  app = await electron.launch(launchOptions);
  const restarted = await app.firstWindow();
  await restarted.locator('button[title*="Wszystkie Zdjęcia"]').click();
  await restarted.getByRole('button', { name: /^Filmy/ }).click();
  const persistedCard = restarted.locator('article').filter({ hasText: 'e2e-fixture' });
  assert.equal(await persistedCard.locator('select').inputValue(), 'album-italy');
  console.log('PASS: Electron gallery import, filter, player dialog, album assignment and restart persistence');
} finally {
  await app.close();
}
