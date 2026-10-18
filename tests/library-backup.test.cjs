const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync, truncateSync, symlinkSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { LibraryDatabase } = require('../electron/database.cjs');
const { VideoLibrary } = require('../electron/video-library.cjs');
const { createLibraryBackup, restoreLibraryBackup, hashAndCopy } = require('../electron/library-backup.cjs');
function cleanup(directory) { try { rmSync(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { /* Windows may release SQLite handles after the test process exits. */ } }

const image = Buffer.from('real-photo-bytes');
const video = Buffer.concat([Buffer.alloc(4), Buffer.from('ftyp'), Buffer.alloc(8), Buffer.alloc(1024 * 1024, 7)]);
function digest(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }
function setup() {
  const root = mkdtempSync(path.join(tmpdir(), 'prezent-library-backup-'));
  mkdirSync(path.join(root, 'photos')); mkdirSync(path.join(root, 'videos'));
  writeFileSync(path.join(root, 'photos', '132fd762d20aa5f4e9143737d66826abd8a2d151ab9e0fe9abc1d451f5e154e1.jpg'), image); writeFileSync(path.join(root, 'videos', 'film.mp4'), video);
  const db = new LibraryDatabase(path.join(root, 'library.sqlite'));
  db.set('prezent_travel_photos_v2', JSON.stringify([{ id: 'photo-1', url: 'local://photo.jpg' }]));
  db.set('prezent_travel_albums_v2', JSON.stringify([{ id: 'album-1', name: 'Rocznica' }]));
  db.set('prezent_app_settings_v2', JSON.stringify({ ignored: true }));
  const videoLibrary = new VideoLibrary(path.join(root, 'library.sqlite'), path.join(root, 'videos'));
  videoLibrary.db.prepare(`INSERT INTO media_items (id,kind,title,file_name,relative_path,mime_type,size_bytes,content_hash,date,album_id,location_json,location_source,codec_status,thumbnail_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run('video-1','video','Film','film.mp4','film.mp4','video/mp4',video.length,digest(path.join(root,'videos','film.mp4')),'2026-10-18','album-1',JSON.stringify({lat:52.2,lng:21}), 'user','unknown','placeholder');
  return { root, db, videoLibrary };
}

test('tworzy przenośny backup SQLite i mediów ze strumieniowym SHA256', async () => {
  const source = setup(); const backup = path.join(source.root, 'new-backup');
  try {
    const result = await createLibraryBackup(source.db, source.root, backup);
    assert.equal(result.manifest.files.find(f => f.path === 'videos/film.mp4').size, video.length);
    assert.equal(result.manifest.files.find(f => f.path.startsWith('photos/')).sha256, digest(path.join(source.root, 'photos', '132fd762d20aa5f4e9143737d66826abd8a2d151ab9e0fe9abc1d451f5e154e1.jpg')));
    assert.ok(readFileSync(path.join(backup, 'library.sqlite')).length > 0);
  } finally { source.videoLibrary.close(); source.db.close(); cleanup(source.root); }
});

test('restore dodaje dane do nowego profilu, zachowuje album/GPS i pliki po restarcie', async () => {
  const source = setup(); const backup = path.join(source.root, 'new-backup');
  const targetRoot = mkdtempSync(path.join(tmpdir(), 'prezent-library-target-')); mkdirSync(path.join(targetRoot, 'photos')); mkdirSync(path.join(targetRoot, 'videos'));
  try {
    await createLibraryBackup(source.db, source.root, backup); source.videoLibrary.close(); source.db.close();
    const db = new LibraryDatabase(path.join(targetRoot, 'library.sqlite')); const videos = new VideoLibrary(path.join(targetRoot, 'library.sqlite'), path.join(targetRoot, 'videos'));
    await restoreLibraryBackup(db, videos, backup); videos.close(); db.close();
    const reopened = new LibraryDatabase(path.join(targetRoot, 'library.sqlite')); const reopenedVideos = new VideoLibrary(path.join(targetRoot, 'library.sqlite'), path.join(targetRoot, 'videos'));
    assert.equal(JSON.parse(reopened.get('prezent_travel_albums_v2'))[0].id, 'album-1');
    assert.equal(reopenedVideos.list()[0].location.lat, 52.2); assert.equal(digest(path.join(targetRoot, 'videos', 'film.mp4')), digest(path.join(source.root, 'videos', 'film.mp4')));
    reopenedVideos.close(); reopened.close();
  } finally { try { source.videoLibrary.close(); source.db.close(); } catch {} cleanup(source.root); cleanup(targetRoot); }
});

test('uszkodzenie, brak, traversal i konflikt nie zmieniają profilu', async () => {
  const source = setup(); const backup = path.join(source.root, 'new-backup'); const target = mkdtempSync(path.join(tmpdir(), 'prezent-library-invalid-')); mkdirSync(path.join(target, 'photos')); mkdirSync(path.join(target, 'videos'));
  try {
    await createLibraryBackup(source.db, source.root, backup); const db = new LibraryDatabase(path.join(target, 'library.sqlite')); const videos = new VideoLibrary(path.join(target, 'library.sqlite'), path.join(target, 'videos'));
    const before = db.db.prepare('SELECT * FROM library').all(); writeFileSync(path.join(backup, 'photos', '132fd762d20aa5f4e9143737d66826abd8a2d151ab9e0fe9abc1d451f5e154e1.jpg'), Buffer.from('changed'));
    await assert.rejects(() => restoreLibraryBackup(db, videos, backup)); assert.deepEqual(db.db.prepare('SELECT * FROM library').all(), before);
    copyFileSync(path.join(source.root, 'library.sqlite'), path.join(backup, 'library.sqlite')); const manifest = JSON.parse(readFileSync(path.join(backup, 'manifest.json'))); manifest.files[0].path = '../escape'; writeFileSync(path.join(backup, 'manifest.json'), JSON.stringify(manifest));
    await assert.rejects(() => restoreLibraryBackup(db, videos, backup), /ścieżka|Ścieżka|manifest/i); assert.deepEqual(db.db.prepare('SELECT * FROM library').all(), before);
    videos.close(); db.close();
  } finally { try { source.videoLibrary.close(); source.db.close(); } catch {} cleanup(source.root); cleanup(target); }
});

test('odrzuca brakującą referencję zdjęcia, katalog docelowy w userData i obsługuje sparse 64MiB', async () => {
  const source = setup(); const backup = path.join(source.root, 'new-backup');
  try {
    const sparse = path.join(source.root, 'videos', 'large.bin'); writeFileSync(sparse, ''); truncateSync(sparse, 64 * 1024 * 1024);
    source.db.db.prepare('UPDATE library SET value=? WHERE key=?').run(JSON.stringify([{ id: 'photo-1', url: 'prezent-media:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg' }]), 'prezent_travel_photos_v2');
    await createLibraryBackup(source.db, source.root, backup);
    const manifest = JSON.parse(readFileSync(path.join(backup, 'manifest.json')));
    assert.equal(manifest.files.find(file => file.path === 'videos/large.bin').size, 64 * 1024 * 1024);
    const missing = mkdtempSync(path.join(tmpdir(), 'prezent-missing-ref-')); mkdirSync(path.join(missing, 'photos')); mkdirSync(path.join(missing, 'videos'));
    const targetDb = new LibraryDatabase(path.join(missing, 'library.sqlite')); const targetVideos = new VideoLibrary(path.join(missing, 'library.sqlite'), path.join(missing, 'videos'));
    const before = targetDb.db.prepare('SELECT * FROM library').all();
    writeFileSync(path.join(backup, 'manifest.json'), JSON.stringify({ ...manifest, files: manifest.files.filter(file => !file.path.startsWith('photos/')) }));
    await assert.rejects(() => restoreLibraryBackup(targetDb, targetVideos, backup), /Brak zdjęcia/);
    assert.deepEqual(targetDb.db.prepare('SELECT * FROM library').all(), before); targetVideos.close(); targetDb.close(); cleanup(missing);
    await assert.rejects(() => createLibraryBackup(source.db, source.root, path.join(source.root, 'videos', 'nested')), /katalog docelowy/);
  } finally { try { source.videoLibrary.close(); source.db.close(); } catch {} cleanup(source.root); }
});

test('EEXIST nie usuwa istniejącego pliku docelowego', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'prezent-hash-copy-'));
  const source = path.join(root, 'source.bin'); const destination = path.join(root, 'destination.bin');
  writeFileSync(source, 'new-content'); writeFileSync(destination, 'existing-content');
  await assert.rejects(() => hashAndCopy(source, destination), /EEXIST|already exists|istnieje/i);
  assert.equal(readFileSync(destination, 'utf8'), 'existing-content'); cleanup(root);
});

test('hash i bytes skopiowanego pliku są zgodne dla 3KiB i 64MiB', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'prezent-hash-copy-bytes-'));
  try {
    for (const [name, bytes] of [['small.bin', Buffer.alloc(3 * 1024, 0x5a)], ['large.bin', Buffer.alloc(64 * 1024 * 1024, 0xa5)]]) {
      const source = path.join(root, `source-${name}`); const destination = path.join(root, `destination-${name}`);
      writeFileSync(source, bytes); const result = await hashAndCopy(source, destination);
      assert.equal(result.sha256, digest(destination)); assert.equal(result.size, readFileSync(destination).length); assert.deepEqual(readFileSync(destination), readFileSync(source));
    }
  } finally { cleanup(root); }
});
