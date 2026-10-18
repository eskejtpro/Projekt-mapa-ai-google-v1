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
    library.db.prepare(`INSERT INTO media_items
      (id,kind,title,file_name,relative_path,mime_type,size_bytes,content_hash,date,codec_status,thumbnail_status)
      VALUES ('escape','video','escape','escape.mp4','../outside.mp4','video/mp4',7,'escape-hash','2026-10-18','unknown','placeholder')`).run();
    assert.throws(() => library.pathFor('escape'), /Brak bezpiecznego pliku medium/);
    library.close();
    const reopened = new VideoLibrary(db, store);
    assert.equal(reopened.list().length, 2);
    reopened.setAlbum(first.item.id, 'album-1');
    assert.equal(reopened.list().find(item => item.id === first.item.id).albumId, 'album-1');
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

test('migruje źródło lokalizacji i trwale zapisuje/usuwa ręczny GPS', async () => {
  const root = mkdtempSync(join(tmpdir(), 'prezent-video-gps-'));
  try {
    const library = new VideoLibrary(join(root, 'library.sqlite'), join(root, 'videos'));
    const item = await library.importVideo(fixture(root, 'gps.webm', [0x1a, 0x45, 0xdf, 0xa3]));
    library.setLocation(item.item.id, { lat: 52.2297, lng: 21.0122, cityName: 'Warszawa', countryName: 'Polska', countryCode: 'PL' });
    assert.equal(library.list()[0].location.lat, 52.2297);
    assert.equal(library.list()[0].locationSource, 'user');
    assert.throws(() => library.setLocation(item.item.id, { lat: 91, lng: 0 }), /współrzędne/);
    library.close();
    const reopened = new VideoLibrary(join(root, 'library.sqlite'), join(root, 'videos'));
    assert.equal(reopened.list()[0].location.lng, 21.0122);
    reopened.setLocation(item.item.id, null);
    assert.equal(reopened.list()[0].location, undefined);
    assert.equal(reopened.list()[0].locationSource, 'unknown');
    reopened.close();
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('nie zachowuje starych nazw miejsca po ręcznej zmianie współrzędnych', async () => {
  const root = mkdtempSync(join(tmpdir(), 'prezent-video-place-'));
  try {
    const library = new VideoLibrary(join(root, 'library.sqlite'), join(root, 'videos'));
    const item = await library.importVideo(fixture(root, 'place.webm', [0x1a, 0x45, 0xdf, 0xa3]), { location: { lat: 52.2297, lng: 21.0122, cityName: 'Warszawa', countryName: 'Polska', countryCode: 'PL' }, locationSource: 'metadata' });
    library.setLocation(item.item.id, { lat: 35.6762, lng: 139.6503, cityName: '', countryName: '', countryCode: '' });
    assert.deepEqual(library.list()[0].location, { lat: 35.6762, lng: 139.6503, cityName: '', countryName: '', countryCode: '' });
    library.close();
  } finally { rmSync(root, { recursive: true, force: true }); }
});
