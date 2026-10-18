import '../scripts/test-environment.mjs';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from '@playwright/test';

const require = createRequire(import.meta.url);
const electronPath = require('electron');

const profile = mkdtempSync(join(tmpdir(), 'prezent-restart-test-e2e-'));
const fixture = join(profile, `e2e-fixture${process.env.PREZENT_REAL_VIDEO ? extname(process.env.PREZENT_REAL_VIDEO) : '.webm'}`);
const launchOptions = {
  executablePath: electronPath,
  args: ['.', '--smoke-test', '--offline-smoke-test', '--e2e-interactive', `--smoke-profile=${profile}`],
  env: { ...process.env, PREZENT_E2E_VIDEO_FIXTURE: fixture, PREZENT_E2E_VIDEO_LOCATION: JSON.stringify({ lat: 52.2297, lng: 21.0122, cityName: 'Warszawa', countryName: 'Polska', countryCode: 'PL' }) },
};
let app = await electron.launch(launchOptions);
try {
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1024, 768));
  const page = await app.firstWindow();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => console.error('Renderer error:', error.message));
  await page.waitForLoadState('domcontentloaded');
  // Minimal container fixture exercises the real import/SQLite/UI path.
  // Codec decoding is covered separately by the real Windows media test.
  if (process.env.PREZENT_REAL_VIDEO) copyFileSync(process.env.PREZENT_REAL_VIDEO, fixture);
  else writeFileSync(fixture, Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(128)]));
  await page.locator('button[title*="Wszystkie Zdjęcia"]').click();
  await page.getByRole('button', { name: 'Dodaj filmy' }).click();
  await page.getByRole('button', { name: /^Filmy/ }).click();
  console.log('E2E: imported video and opened filter');
  await assert.doesNotReject(() => page.getByText('e2e-fixture').waitFor({ state: 'visible' }));
  const card = page.locator('article').filter({ hasText: 'e2e-fixture' });
  await card.locator('summary').click();
  await card.getByLabel('e2e-fixture szerokość').fill('');
  await card.getByRole('button', { name: 'Zapisz GPS' }).click();
  await card.getByRole('alert').waitFor({ state: 'visible' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  mkdirSync('reports', { recursive: true });
  await page.screenshot({ path: 'reports/video-gps-editor.png' });
  assert.equal((await page.evaluate(() => window.electronAPI.video.list()))[0].location.lat, 52.2297);
  await card.getByLabel('e2e-fixture szerokość').fill('52.2297');
  await card.getByLabel('e2e-fixture długość').fill('21.0122');
  await card.getByRole('button', { name: 'Zapisz GPS' }).click();
  await page.getByText('Zapisano lokalizację filmu.', { exact: true }).waitFor({ state: 'visible' });
  const savedLocation = (await page.evaluate(() => window.electronAPI.video.list()))[0];
  assert.equal(savedLocation.locationSource, 'user');
  assert.equal(savedLocation.location.countryName, '');
  console.log('E2E: GPS empty-field validation');
  await card.locator('select').selectOption('album-italy');
  await page.getByText('Zapisano przypisanie filmu do albumu.').waitFor({ state: 'visible' });
  await page.locator('button[title="Interaktywna Mapa Świata"]').click();
  await page.getByRole('button', { name: 'Filmy', exact: true }).click();
  await page.getByRole('button', { name: /Słoneczna Wyprawa do Włoch/ }).click();
  const videoMarker = page.locator('.custom-video-pin').first();
  await videoMarker.waitFor({ state: 'visible', timeout: 15000 });
  console.log('E2E: visible offline video marker');
  const markerBox = await videoMarker.boundingBox();
  assert.ok(markerBox && markerBox.width > 0 && markerBox.height > 0);
  // The deliberately tiny offline fixture covers world zoom 3 only. Selecting
  // a trip fits zoom 9; return to its documented coverage before testing tiles.
  await page.locator('button[title="Widok na cały świat"]').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('.leaflet-tile-loaded')).some(image => image.src.startsWith('prezent-tiles:') && image.naturalWidth > 0), { timeout: 15000 });
  mkdirSync('reports', { recursive: true });
  await page.screenshot({ path: 'reports/video-map-offline.png' });
  await videoMarker.click();
  await page.getByRole('button', { name: 'Otwórz film', exact: true }).click();
  await page.getByRole('dialog', { name: 'e2e-fixture' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  await page.locator('button[title="Wszystkie Zdjęcia & Galeria"]').click();
  await page.getByRole('button', { name: /^Filmy/ }).click();
  await card.locator('button').first().click();
  await assert.doesNotReject(() => page.getByRole('dialog', { name: 'e2e-fixture' }).waitFor({ state: 'visible' }));
  const video = page.getByRole('dialog').locator('video');
  await assert.doesNotReject(() => video.waitFor({ state: 'visible' }));
  if (process.env.PREZENT_REAL_VIDEO) {
    await video.evaluate(async element => { element.muted = true; await element.play(); });
    await page.waitForFunction(() => { const v = document.querySelector('[role=dialog] video'); return v.currentTime > 0.3 && v.getVideoPlaybackQuality().totalVideoFrames > 0; });
    await video.evaluate(async element => {
      element.pause(); element.volume = 0.4;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Film nie zakończył seek')), 10000);
        element.addEventListener('seeked', () => { clearTimeout(timer); resolve(); }, { once: true });
        element.currentTime = 1.2;
      });
      if (!element.paused || element.seeking || element.readyState < 2 || Math.abs(element.currentTime - 1.2) >= 0.2 || element.volume !== 0.4) throw new Error('Nieprawidłowy stan po pauzie/seek');
    });
    console.log('PASS: real video decoded frames, playback time, pause and seek (speaker audio UNVERIFIED).');
    await card.locator('img[alt="e2e-fixture"]').waitFor({ state: 'visible' });
  } else await page.getByRole('dialog').getByRole('alert').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  // PR #7: the existing slideshow must expose a mixed photo/video sequence.
  await page.evaluate(() => {
    const key = 'prezent_travel_photos_v2';
    const current = JSON.parse(window.electronAPI.storage.get(key) || '[]');
    if (!current.some(photo => photo.id === 'slideshow-fixture-photo')) {
      const base = current[0] || { location: { lat: 52.2297, lng: 21.0122, cityName: 'Warszawa', countryName: 'Polska', countryCode: 'PL' }, albumId: '', participants: [], tags: [] };
      const photo = { ...base, id: 'slideshow-fixture-photo', title: 'Slideshow fixture photo', date: '2026-01-01', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', thumbnailUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', notes: '', isFavorite: false, isDemo: false };
      window.electronAPI.storage.set(key, JSON.stringify([...current, photo]));
    }
  });
  await page.reload();
  await page.locator('button[title="Wszystkie Zdjęcia & Galeria"]').click();
  const slideshowButton = page.getByRole('button', { name: /^Pokaz slajdów/ });
  await slideshowButton.click();
  const slideshow = page.locator('div.fixed.inset-0.z-50');
  await slideshow.waitFor({ state: 'visible' });
  assert.ok(await slideshow.locator('img').count() > 0, 'Pokaz nie wyświetlił zdjęcia');
  await page.keyboard.press('End');
  await slideshow.getByTestId('slideshow-video').waitFor({ state: 'visible' });
  assert.match(await slideshow.locator('text=/\\d+ \/ \\d+/').first().innerText(), /\d+ \/ \d+/);
  await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('div.fixed.inset-0.z-50 video')?.paused === true, { timeout: 5000 });
    assert.equal(await slideshow.locator('video').first().evaluate(video => video.paused), true);
  await page.keyboard.press('Space');
  if (process.env.PREZENT_REAL_VIDEO) {
    await slideshow.locator('video').first().evaluate(async video => {
      video.muted = true;
      await video.play();
    });
    await page.waitForFunction(() => document.querySelector('div.fixed.inset-0.z-50 video')?.currentTime > 0.2);
    await slideshow.locator('video').first().evaluate(video => { video.currentTime = Math.max(0, video.duration - 0.1); });
    // onEnded advances the React slideshow immediately, so the old <video>
    // is unmounted before its `ended` property can be observed. Verify the
    // user-visible contract instead: playback completion advances to media
    // that is not the completed video.
    await slideshow.locator('[data-testid="slideshow-video"]').waitFor({ state: 'detached', timeout: 15000 });
    await slideshow.locator('img').first().waitFor({ state: 'visible' });
  }
  await page.keyboard.press('Escape');
  await slideshow.waitFor({ state: 'hidden' });
  console.log(process.env.PREZENT_REAL_VIDEO
    ? 'PASS: mixed slideshow controls and real video completion advance'
    : 'PASS: mixed slideshow controls (real video completion is covered by test:video-playback-real)');
  if (process.env.PREZENT_CODEC_ONLY) {
    await app.close();
    process.exit(0);
  }
  await app.close();
  await new Promise(resolve => setTimeout(resolve, 1000));
  app = await electron.launch(launchOptions);
  const restarted = await app.firstWindow();
  restarted.setDefaultTimeout(15000);
  await restarted.locator('button[title*="Wszystkie Zdjęcia"]').click();
  await restarted.getByRole('button', { name: /^Filmy/ }).click();
  const persistedCard = restarted.locator('article').filter({ hasText: 'e2e-fixture' });
  assert.equal(await persistedCard.locator('select').inputValue(), 'album-italy');
  const backupParent = mkdtempSync(join(tmpdir(), 'prezent-e2e-backup-'));
  await app.evaluate(({ dialog }, directory) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [directory] }); }, backupParent);
  await restarted.locator('button[title="Panel Ustawień (12 Kategorii)"]').click();
  await restarted.getByRole('button', { name: /Kopie zapasowe/ }).click();
  await restarted.getByRole('button', { name: 'Zapisz pełną kopię', exact: true }).click();
  await restarted.getByRole('status').filter({ hasText: 'Pełna kopia została sprawdzona' }).waitFor({ state: 'visible', timeout: 30000 });
  await restarted.screenshot({ path: 'reports/library-backup-ui.png' });
  const createdBackup = { directory: join(backupParent, readdirSync(backupParent).find(name => name.startsWith('Prezent-Mapy-'))) };
  await app.evaluate(({ dialog }, directory) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [directory] });
    dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false });
  }, createdBackup.directory);
  await restarted.getByRole('button', { name: 'Przywróć pełną kopię', exact: true }).click();
  await restarted.locator('button[title="Wycentruj na Twoich zdjęciach"]').waitFor({ state: 'visible', timeout: 30000 });
  assert.ok(readdirSync(join(profile, 'backups')).some(name => name.startsWith('before-restore-')));
  console.log('PASS: native Electron backup/restore IPC, SHA-256 validation and safety copy');
  const largeLibraryStart = Date.now();
  const total = await restarted.evaluate(() => {
    const key = 'prezent_travel_photos_v2';
    const original = JSON.parse(window.electronAPI.storage.get(key));
    const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
    const synthetic = Array.from({ length: 1500 }, (_, i) => ({ ...original[0], id: `stress-photo-${i}`, url: image, thumbnailUrl: image, title: `Syntetyczne zdjęcie ${i}`, location: { ...original[0].location, lat: 40 + i / 100, lng: 5 + i / 100 } }));
    window.electronAPI.storage.set(key, JSON.stringify([...original, ...synthetic]));
    return original.length + synthetic.length + 1;
  });
  await restarted.reload();
  await restarted.getByText(`${total} mediów`, { exact: true }).waitFor({ state: 'visible' });
  assert.ok(await restarted.locator('.custom-leaflet-cluster').count() > 0);
  await restarted.locator('button[title="Przybliż (+)"]').click();
  const largeLibraryMs = Date.now() - largeLibraryStart;
  assert.ok(largeLibraryMs < 30000, `Map stress exceeded 30s: ${largeLibraryMs}`);
  writeFileSync('reports/video-map-stress.json', JSON.stringify({ passed: true, mediaCount: total, loadAndInteractMs: largeLibraryMs, synthetic: true, network: 'HTTP(S) blocked by Electron offline mode' }, null, 2));
  console.log(`PASS: offline map ${total} media, clustering and zoom in ${largeLibraryMs}ms`);
  console.log('PASS: Electron gallery/map video marker, popup player, filter, album assignment and restart persistence');
} finally {
  await app.close();
}
