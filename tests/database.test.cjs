const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { LibraryDatabase } = require('../electron/database.cjs');
const photos = 'prezent_travel_photos_v2';
test('SQLite zachowuje dane po zamknięciu i ponownym otwarciu', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'prezent-sqlite-test-')), 'library.sqlite');
  let db = new LibraryDatabase(file);
  db.set(photos, '[{"id":"synthetic-photo"}]');
  db.close();
  db = new LibraryDatabase(file);
  assert.deepEqual(JSON.parse(db.get(photos)), [{ id: 'synthetic-photo' }]);
  db.close();
});
test('SQLite odrzuca klucze, JSON i wycofuje cały nieprawidłowy wsad', () => {
  const db = new LibraryDatabase(':memory:');
  db.set(photos, '[]');
  assert.throws(() => db.get('../../secret'));
  assert.throws(() => db.set(photos, '{broken'));
  assert.throws(() => db.batch([[photos, '[1]'], ['unknown', '[]']]));
  assert.equal(db.get(photos), '[]');
  db.close();
});
test('kopie zdjęć pozostają samowystarczalne po ponownym otwarciu biblioteki', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'prezent-photo-db-test-')), 'library.sqlite');
  const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
  let db = new LibraryDatabase(file);
  db.set(photos, JSON.stringify([{ id: 'test', url: image, thumbnailUrl: image }]));
  assert.ok(!db.db.prepare('SELECT value FROM library WHERE key=?').get(photos).value.includes('base64'));
  db.close();
  db = new LibraryDatabase(file);
  assert.equal(JSON.parse(db.get(photos))[0].url, image);
  db.close();
});
