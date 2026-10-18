import './test-environment.mjs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { _electron as electron } from '@playwright/test';

const require = createRequire(import.meta.url);
const electronPath = require('electron');
const profile = mkdtempSync(join(tmpdir(), 'prezent-restart-test-performance-'));
const startedAt = performance.now();
const app = await electron.launch({
  executablePath: electronPath,
  args: ['.', '--smoke-test', '--offline-smoke-test', '--e2e-interactive', `--smoke-profile=${profile}`],
});

const round = value => Math.round(value * 100) / 100;
const measure = async (action) => {
  const start = performance.now();
  await action();
  return round(performance.now() - start);
};

try {
  const page = await app.firstWindow();
  page.setDefaultTimeout(15000);
  await page.waitForLoadState('domcontentloaded');
  const metrics = { startupMs: round(performance.now() - startedAt), timings: {} };
  metrics.timings.mapMs = await measure(async () => {
    await page.locator('.leaflet-container').waitFor({ state: 'visible' });
  });
  const tileStartedAt = performance.now();
  metrics.tilesLoaded = await page.waitForFunction(
      () => document.querySelectorAll('.leaflet-tile-loaded').length > 0,
      undefined,
      { timeout: 5000 },
  ).then(() => true).catch(() => false);
  metrics.timings.tileWaitMs = round(performance.now() - tileStartedAt);
  metrics.timings.galleryMs = await measure(async () => {
    await page.locator('button[title="Wszystkie Zdjęcia & Galeria"]').click();
    await page.getByRole('button', { name: /^Pokaz slajdów/ }).waitFor({ state: 'visible' });
  });
  metrics.timings.sqliteReadMs = await measure(async () => {
    await page.evaluate(() => {
      for (const key of ['prezent_travel_photos_v2', 'prezent_travel_albums_v2', 'prezent_travel_trips_v2', 'prezent_app_settings_v2']) {
        window.electronAPI.storage.get(key);
      }
    });
  });
  metrics.ram = await app.evaluate(() => ({
    rssMb: Math.round(process.memoryUsage().rss / 1048576),
    heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1048576),
  }));
  metrics.platform = process.platform;
  metrics.node = process.version;
  metrics.commit = process.env.GITHUB_SHA || 'local';
  const { mkdirSync, writeFileSync } = await import('node:fs');
  mkdirSync('reports', { recursive: true });
  writeFileSync('reports/performance-e2e.json', JSON.stringify(metrics, null, 2));
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await app.close();
}
