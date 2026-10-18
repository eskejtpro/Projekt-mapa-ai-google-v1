import '../scripts/test-environment.mjs';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from '@playwright/test';
const require = createRequire(import.meta.url);
const { LibraryDatabase } = require('../electron/database.cjs');
// Real JPEG APP1/Exif GPS IFD, little-endian, generated only for this test.
function withGps(jpeg) {
  const tiff = Buffer.alloc(128);
  tiff.write('II'); tiff.writeUInt16LE(42, 2); tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(1, 8); tiff.writeUInt16LE(0x8825, 10); tiff.writeUInt16LE(4, 12); tiff.writeUInt32LE(1, 14); tiff.writeUInt32LE(26, 18);
  tiff.writeUInt16LE(4, 26);
  for (const [i, tag, type, count, value] of [[0, 1, 2, 2, 78], [1, 2, 5, 3, 80], [2, 3, 2, 2, 69], [3, 4, 5, 3, 104]]) {
    const offset = 28 + i * 12;
    tiff.writeUInt16LE(tag, offset); tiff.writeUInt16LE(type, offset + 2); tiff.writeUInt32LE(count, offset + 4); tiff.writeUInt32LE(value, offset + 8);
  }
  [52, 13, 46, 21, 0, 44].forEach((value, i) => { tiff.writeUInt32LE(value, 80 + i * 8); tiff.writeUInt32LE(1, 84 + i * 8); });
  const payload = Buffer.concat([Buffer.from('Exif\0\0'), tiff]);
  const header = Buffer.from([0xff, 0xe1, 0, 0]); header.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([jpeg.subarray(0, 2), header, payload, jpeg.subarray(2)]);
}
const profile = mkdtempSync(join(tmpdir(), 'prezent-restart-test-system-'));
const db = new LibraryDatabase(join(profile, 'library.sqlite'));
for (const key of ['photos', 'albums', 'trips', 'offline_packages']) db.set(`prezent_${key === 'offline_packages' ? '' : 'travel_'}${key}_v2`, '[]');
db.set('prezent_app_settings_v2', JSON.stringify({ offlineSimulationMode: true, ambientSoundEnabled: false, showMiniMapPip: false, slideshowInterval: 12 }));
db.close();
const options = { executablePath: require('electron'), args: ['.', '--smoke-test', '--offline-smoke-test', '--e2e-interactive', `--smoke-profile=${profile}`] };
const report = { profile, stages: [], runtimeErrors: [], screens: [], fullscreenConsole: [] };
mkdirSync('reports/system-audit', { recursive: true });
let app = await electron.launch(options);
let page;
try {
  page = await app.firstWindow(); page.setDefaultTimeout(10000);
  page.on('pageerror', error => report.runtimeErrors.push(error.message));
  page.on('console', message => { if (/fullscreen/i.test(message.text())) report.fullscreenConsole.push(message.text()); });
  await page.locator('.leaflet-container').waitFor();
  report.stages.push('clean-empty-library');
  const openImport = async () => {
    await page.getByRole('button', { name: 'Plik', exact: true }).click();
    await page.getByRole('button', { name: /Importuj zdjęcia z dysku/ }).click();
    await page.getByText('Centrum Dodawania Zdjęć i Katalogów', { exact: true }).waitFor();
  };
  await openImport();
  await page.locator('input[type=file]').first().setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await page.getByRole('alert').filter({ hasText: /broken.png|obrazu|zdjęcia/ }).waitFor({ timeout: 5000 });
  assert.equal(await page.getByRole('button', { name: /Zapisz.*na mapie świata/ }).isDisabled(), true);
  await page.screenshot({ path: 'reports/system-audit/import-error.png' });
  report.stages.push('corrupt-image-rejected');
  const jpeg = Buffer.from(await app.evaluate(({ nativeImage }) => nativeImage.createFromBitmap(Buffer.from([255, 128, 0, 255, 0, 0, 255, 255, 255, 0, 0, 255, 0, 255, 0, 255]), { width: 2, height: 2 }).toJPEG(90).toString('base64')), 'base64');
  await page.locator('input[type=file]').first().setInputFiles([
    { name: 'audit-photo.jpg', mimeType: 'image/jpeg', buffer: withGps(jpeg) },
    { name: 'plain.jpg', mimeType: 'image/jpeg', buffer: jpeg },
  ]);
  await page.getByPlaceholder('np. Wakacje Rodzinne 2025').fill('Album audytu');
  const save = page.getByRole('button', { name: /Zapisz \(2\) na mapie świata/ });
  await page.getByLabel('Szerokość GPS importu').fill('1000');
  await save.click();
  await page.getByRole('alert').filter({ hasText: 'Nieprawidłowe współrzędne GPS' }).waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2')).length), 0);
  await page.getByLabel('Szerokość GPS importu').fill('54.352');
  await save.click();
  await page.getByText('Centrum Dodawania Zdjęć i Katalogów', { exact: true }).waitFor({ state: 'hidden' });
  let stored = await page.evaluate(() => JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2')));
  assert.equal(stored.length, 2); assert.equal(stored[0].title, 'audit photo');
  assert.ok(Math.abs(stored[0].location.lat - (52 + 13 / 60 + 46 / 3600)) < 0.00001);
  assert.equal(stored[0].location.countryCode, '');
  assert.equal(stored[1].location.cityName, 'Gdańsk');
  const albumId = stored[0].albumId;
  assert.ok(albumId); assert.equal((await page.evaluate(() => JSON.parse(window.electronAPI.storage.get('prezent_travel_albums_v2'))))[0].name, 'Album audytu');
  report.stages.push('real-jpeg-import-and-create-album');
  await openImport();
  assert.equal(await page.getByRole('button', { name: /Zapisz.*na mapie świata/ }).isDisabled(), true, 'Previous import queue leaked into new dialog');
  const folder = join(profile, 'folder-fixture'); mkdirSync(folder);
  writeFileSync(join(folder, 'gps.jpg'), withGps(jpeg)); writeFileSync(join(folder, 'plain.jpg'), jpeg);
  await page.getByRole('button', { name: 'Cały katalog / folder', exact: true }).click();
  await page.locator('input[webkitdirectory]').setInputFiles(folder);
  await page.getByRole('button', { name: /Zapisz \(2\) na mapie świata/ }).waitFor();
  await page.getByRole('button', { name: 'Anuluj', exact: true }).click();
  report.stages.push('folder-import-and-cancel-preserves-library');
  await page.locator('button[title="Wszystkie Zdjęcia & Galeria"]').click();
  await page.getByAltText('audit photo', { exact: true }).first().locator('..').click();
  const detail = page.locator('div.fixed.inset-0.z-50');
  await detail.getByRole('button', { name: /Edytuj/ }).click();
  assert.equal(await detail.locator('input').first().inputValue(), 'audit photo', 'Editor overwrote existing title with stale state');
  await page.screenshot({ path: 'reports/system-audit/photo-editor.png' });
  await detail.locator('input').first().fill('Zdjęcie po edycji');
  await detail.getByRole('button', { name: 'Zapisz zmiany' }).click();
  await detail.getByRole('button', { name: 'Zamknij', exact: true }).click();
  const search = page.getByPlaceholder('Szukaj: Rzym, plaża, Zosia...');
  await search.fill('nieistniejace-medium');
  assert.equal(await page.getByAltText('Zdjęcie po edycji', { exact: true }).count(), 0);
  await search.fill('Zdjęcie po edycji');
  assert.equal(await page.getByAltText('Zdjęcie po edycji', { exact: true }).count(), 1);
  await search.fill('');
  report.stages.push('photo-editor-preserves-fields');
  await page.locator('button[title="Albumy & Kolekcje"]').click();
  await page.getByRole('button', { name: 'Kolejność', exact: true }).click();
  await app.evaluate(({ ipcMain }) => {
    const original = ipcMain.listeners('library:operation');
    ipcMain.removeAllListeners('library:operation');
    ipcMain.on('library:operation', (event, operation, key, ...args) => {
      if (operation === 'set' && key === 'prezent_travel_albums_v2') event.returnValue = { ok: false, error: 'Test: disk denied' };
      else for (const listener of original) listener(event, operation, key, ...args);
    });
    globalThis.restoreAuditStorage = () => { ipcMain.removeAllListeners('library:operation'); for (const listener of original) ipcMain.on('library:operation', listener); };
  });
  await page.getByRole('button', { name: 'Zapisz kolejność', exact: true }).click();
  await page.getByText('Nie zapisano kolejności zdjęć.', { exact: false }).waitFor();
  assert.equal(await page.getByText('Zapisano!', { exact: true }).count(), 0);
  await app.evaluate(() => { globalThis.restoreAuditStorage(); delete globalThis.restoreAuditStorage; });
  await page.getByRole('button', { name: 'Zapisz kolejność', exact: true }).click();
  await page.getByText('Zapisano!', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Zamknij organizer albumu', exact: true }).click();
  report.stages.push('album-order-disk-failure-and-retry');
  const tabs = ['Interaktywna Mapa Świata', 'Wszystkie Zdjęcia & Galeria', 'Albumy & Kolekcje', 'Oś Czasu Wspomnień', 'Trasy Wypraw', 'Statystyki i Osiągnięcia Podróżnicze', 'Diagnostyka Duplikatów Zdjęć', 'Eksplorator Windows & Dane', 'Panel Ustawień (12 Kategorii)'];
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1024, 768));
  for (let i = 0; i < tabs.length; i++) {
    await page.locator(`button[title="${tabs[i]}"]`).click();
    await page.locator('main').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, tabs[i]);
    await page.screenshot({ path: `reports/system-audit/screen-${i}.png` });
    report.screens.push(tabs[i]);
  }
  for (const name of ['Ogólne', 'Wygląd i personalizacja', 'Mapa i geolokalizacja', 'Galeria i zdjęcia', 'Import oraz foldery', 'Pokaz slajdów', 'Telewizor i prezentacja', 'Pamięć i dane lokalne', 'Kopie zapasowe', 'Wydajność', 'Prywatność', 'Informacje o aplikacji']) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.screenshot({ path: `reports/system-audit/settings-${report.screens.length}.png` });
    report.screens.push(`Ustawienia: ${name}`);
  }
  await page.locator('button[title="Tryb TV / Salon 4K"]').click();
  await page.getByRole('heading', { name: 'Przesyłanie na telewizor' }).waitFor();
  await page.screenshot({ path: 'reports/system-audit/tv.png' });
  await page.getByRole('button', { name: 'Zamknij', exact: true }).last().click();
  await page.locator('button[title="Pakiety Map Offline"]').click();
  await page.getByText('Menedżer Map Offline', { exact: true }).waitFor();
  await page.screenshot({ path: 'reports/system-audit/offline.png' });
  await page.getByRole('button', { name: 'Zamknij', exact: true }).click();
  await page.locator('button[title="Wszystkie Zdjęcia & Galeria"]').click();
  await page.getByRole('button', { name: /^Pokaz slajdów/ }).click();
  const show = page.locator('div.fixed.inset-0.z-50');
  await show.waitFor();
  await page.keyboard.press('f');
  await page.waitForFunction(() => !!document.fullscreenElement);
  await page.keyboard.press('f');
  await page.waitForFunction(() => !document.fullscreenElement);
  await page.keyboard.press('s');
  assert.equal(await show.locator('input[type=range][min="2"]').inputValue(), '12', 'Saved slideshow interval ignored');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  report.stages.push('saved-slideshow-preferences');
  await app.close();
  app = await electron.launch(options); page = await app.firstWindow();
  page.setDefaultTimeout(10000);
  await page.locator('.leaflet-container').waitFor();
  stored = await page.evaluate(() => JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2')));
  assert.equal(stored.length, 2); assert.equal(stored[0].title, 'Zdjęcie po edycji'); assert.equal(stored[0].albumId, albumId);
  report.stages.push('restart-preserves-photo-and-album');
  await page.evaluate(() => {
    const key = 'prezent_travel_albums_v2';
    const albums = JSON.parse(window.electronAPI.storage.get(key));
    albums.push({ id: 'audit-empty-album', name: 'Pusty album audytu', description: '', country: '', year: 2026, coverUrl: '' });
    window.electronAPI.storage.set(key, JSON.stringify(albums));
  });
  await page.reload();
  await page.locator('button[title="Albumy & Kolekcje"]').click();
  const emptyCard = page.locator('main .group').filter({ has: page.getByText('Pusty album audytu', { exact: true }) });
  assert.equal(await emptyCard.getByRole('button', { name: 'Slajdy', exact: true }).isDisabled(), true);
  assert.equal(await page.locator('div.fixed.inset-0.z-50').count(), 0);
  report.stages.push('empty-album-does-not-play-other-media');
  assert.deepEqual(report.runtimeErrors, []);
  report.passed = true;
  console.log('PASS: system audit JPEG import, empty profile, album, edit, screens, preferences and restart');
} catch (error) {
  report.passed = false; report.error = error.message;
  if (page && !page.isClosed()) report.fullscreenState = await page.evaluate(() => ({ enabled: document.fullscreenEnabled, active: !!document.fullscreenElement, focused: document.hasFocus() })).catch(() => null);
  if (page && !page.isClosed()) await page.screenshot({ path: 'reports/system-audit/failure.png' }).catch(() => {});
  throw error;
} finally {
  writeFileSync('reports/system-audit.json', JSON.stringify(report, null, 2));
  await app.close();
}
