const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { VideoLibrary, validateVideoFile } = require('../electron/video-library.cjs');

function fixture(root, name, header, body = 'synthetic-video') {
  const file = join(root, name);
  const bytes = Buffer.concat([Buffer.from(header), Buffer.from(body)]);
  writeFileSync(file, bytes);
  return file;
}

test('importuje MP4/WebM do katalogu aplikacji bez Base64 i odrzuca duplikat', async () => {
  const root = mkdtempSync(join(tmpdir(), 'prezent-video-'));
  const db = join(root, 'library.sqlite');
  const store = join(root, 'videos');
  try {
    const mp4 = fixture(root, 'film.mp4', Buffer.concat([Buffer.alloc(4), Buffer.from('ftyp'), Buffer.alloc(8)]));
    const library = new VideoLibrary(db, store);
    const first = await library.importVideo(mp4, { codecStatus: 'runtime-required' });
    const second = await library.importVideo(mp4);
    assert.equal(first.duplicate, false);
    assert.equal(second.duplicate, true);
    assert.equal(first.item.mimeType, 'video/mp4');
    assert.equal(first.item.thumbnailStatus, 'placeholder');
    assert.ok(!JSON.stringify(first.item).includes('base64'));
    assert.ok(library.pathFor(first.item.id).startsWith(store));
    assert.throws(() => library.pathFor('../outside'), /Nieznane medium/);
    library.close();
    const reopened = new VideoLibrary(db, store);
    assert.equal(reopened.list().length, 1);
    reopened.close();
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('waliduje WebM, odrzuca uszkodzony kontener i nie ładuje pliku do pamięci', () => {
  const root = mkdtempSync(join(tmpdir(), 'prezent-video-invalid-'));
  try {
    const webm = fixture(root, 'film.webm', [0x1a, 0x45, 0xdf, 0xa3]);
    assert.equal(validateVideoFile(webm).mimeType, 'video/webm');
    const bad = fixture(root, 'film.mp4', 'xxxxbad');
    assert.throws(() => validateVideoFile(bad), /Nagłówek/);
    const unsupported = fixture(root, 'film.mkv', 'matroska');
    assert.throws(() => validateVideoFile(unsupported), /MP4 i WebM/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
