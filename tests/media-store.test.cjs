const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, readdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { tmpdir } = require('node:os');
const { MediaStore } = require('../electron/media-store.cjs');
const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
test('plik zdjęcia zachowuje treść i nie powiela identycznych obrazów', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'prezent-media-test-'));
  const store = new MediaStore(directory);
  const reference = store.save(image);
  assert.equal(store.save(image), reference);
  assert.equal(readdirSync(directory).length, 1);
  assert.equal(new MediaStore(directory).load(reference), image);
});
test('odrzuca ścieżkę spoza biblioteki i wykrywa uszkodzoną zawartość', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'prezent-media-test-'));
  const store = new MediaStore(directory);
  assert.throws(() => store.load('prezent-media:../../secret'));
  assert.throws(() => store.save('data:image/svg+xml;base64,PHN2Zz4='));
  const reference = store.save(image);
  writeFileSync(path.join(directory, reference.slice('prezent-media:'.length)), 'corrupt');
  assert.throws(() => store.load(reference));
});
