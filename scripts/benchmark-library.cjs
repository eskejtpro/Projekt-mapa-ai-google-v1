const { LibraryDatabase } = require('../electron/database.cjs');
const { mkdtempSync, mkdirSync, writeFileSync, statSync, readdirSync } = require('node:fs');
const { tmpdir, platform, release } = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const samples = [];
for (const count of [1000, 10000]) {
  const directory = mkdtempSync(path.join(tmpdir(), 'prezent-library-benchmark-'));
  const db = new LibraryDatabase(path.join(directory, 'library.sqlite'));
  const photos = Array.from({ length: count }, (_, index) => ({ id: `synthetic-${index}`, url: image, thumbnailUrl: image, title: `Zdjęcie ${index}`, notes: 'Syntetyczny pomiar metadanych i identycznego małego obrazu, nie rzeczywiste fotografie.', date: '2026-01-01', albumId: 'synthetic-album', location: { lat: 50, lng: 20, cityName: 'Test', countryName: 'Test', countryCode: 'XX' }, participants: [], tags: [], isFavorite: false }));
  const started = performance.now();
  db.set('prezent_travel_photos_v2', JSON.stringify(photos));
  const writeMs = performance.now() - started;
  const readStarted = performance.now();
  const loaded = JSON.parse(db.get('prezent_travel_photos_v2'));
  const readMs = performance.now() - readStarted;
  if (loaded.length !== count || loaded[count - 1].url !== image) throw new Error('Błędny odczyt pomiaru');
  const sampledRssMb = process.memoryUsage().rss / 1048576;
  db.close();
  samples.push({ count, writeMs: Math.round(writeMs), readMs: Math.round(readMs), sampledRssMb: Math.round(sampledRssMb), sqliteBytes: statSync(path.join(directory, 'library.sqlite')).size, mediaFiles: readdirSync(path.join(directory, 'photos')).length });
}
const sourceHashes = Object.fromEntries(['electron/database.cjs', 'electron/media-store.cjs'].map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
const report = { date: new Date().toISOString(), commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), workingTreeDirty: !!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(), sourceHashes, platform: `${platform()} ${release()}`, scope: 'Synthetic metadata and identical 1x1 PNG; not UI FPS, real photo import or peak RSS', samples };
mkdirSync('reports', { recursive: true });
writeFileSync('reports/library-benchmark.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
