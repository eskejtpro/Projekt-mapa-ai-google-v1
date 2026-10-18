const { createHash } = require('node:crypto');
const { createReadStream, existsSync, lstatSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } = require('node:fs');
const { pipeline } = require('node:stream/promises');
const { Transform } = require('node:stream');
const path = require('node:path');
const { backup } = require('node:sqlite');
const { open: openFile } = require('node:fs/promises');

const COLLECTION_KEYS = new Set([
  'prezent_travel_photos_v2', 'prezent_travel_albums_v2', 'prezent_travel_trips_v2',
  'prezent_offline_packages_v2', 'prezent_app_settings_v2',
]);
const MANIFEST = 'manifest.json';

function inside(root, candidate) {
  const base = path.resolve(root);
  const full = path.resolve(candidate);
  return full === base || full.startsWith(`${base}${path.sep}`);
}

function relativeSafe(root, file) {
  const rel = path.relative(path.resolve(root), path.resolve(file));
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Niebezpieczna ścieżka pliku');
  return rel.split(path.sep).join('/');
}

function rejectSymlinkTree(root, relative) {
  let current = path.resolve(root);
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (!inside(root, current)) throw new Error('Ścieżka poza katalogiem');
    if (!existsSync(current)) throw new Error('Brak pliku z manifestu');
    if (lstatSync(current).isSymbolicLink()) throw new Error('Symlink nie jest dozwolony w backupie');
  }
}

async function hashAndCopy(source, destination) {
  const hash = createHash('sha256');
  let size = 0;
  const handle = await openFile(destination, 'wx');
  const hashing = new Transform({ transform(chunk, encoding, callback) { hash.update(chunk); size += chunk.length; callback(null, chunk); } });
  try { await pipeline(createReadStream(source), hashing, handle.createWriteStream()); }
  catch (error) { try { await handle.close(); } finally { try { require('node:fs').unlinkSync(destination); } catch {} } throw error; }
  await handle.close();
  return { sha256: hash.digest('hex'), size };
}

async function hashFile(file) {
  const hash = createHash('sha256'); let size = 0;
  const input = createReadStream(file);
  for await (const chunk of input) { hash.update(chunk); size += chunk.length; }
  return { sha256: hash.digest('hex'), size };
}

function walkFiles(root, prefix = '') {
  if (!existsSync(root)) return [];
  const result = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error('Symlink nie jest dozwolony w bibliotece');
    if (entry.isDirectory()) result.push(...walkFiles(full, rel));
    else if (entry.isFile()) result.push({ full, relative: rel });
  }
  return result;
}

function rawDatabase(database) { return database?.db ?? database; }
function rawVideoDatabase(videoLibrary) { return videoLibrary?.db ?? videoLibrary; }

async function createLibraryBackup(database, directoryUserData, newDestinationDirectory) {
  const destination = path.resolve(newDestinationDirectory);
  const userRoot = path.resolve(directoryUserData);
  if (['photos', 'videos'].some(name => inside(path.join(userRoot, name), destination)) || (existsSync(userRoot) && lstatSync(userRoot).isSymbolicLink())) throw new Error('Nieprawidłowy katalog docelowy backupu');
  if (existsSync(destination)) throw new Error('Katalog docelowy backupu już istnieje');
  mkdirSync(destination, { recursive: true });
  const files = [];
  try {
    const dbFile = path.join(destination, 'library.sqlite');
    const sourceDb = rawDatabase(database);
    await backup(sourceDb, dbFile);
    files.push({ source: dbFile, relative: 'library.sqlite' });
    for (const top of ['photos', 'videos']) {
      for (const item of walkFiles(path.join(userRoot, top), top)) files.push({ source: item.full, relative: item.relative });
    }
    const manifest = { format: 1, createdAt: new Date().toISOString(), files: [] };
    for (const file of files) {
      const target = path.join(destination, file.relative);
      mkdirSync(path.dirname(target), { recursive: true });
      const info = file.relative === 'library.sqlite' ? await hashFile(file.source) : await hashAndCopy(file.source, target);
      manifest.files.push({ path: file.relative, sha256: info.sha256, size: info.size });
    }
    writeFileSync(path.join(destination, MANIFEST), JSON.stringify(manifest, null, 2), { flag: 'wx' });
    return { directory: destination, manifest };
  } catch (error) { rmSync(destination, { recursive: true, force: true }); throw error; }
}

function readManifest(backupDirectory) {
  const root = path.resolve(backupDirectory);
  if (!existsSync(root) || lstatSync(root).isSymbolicLink() || !lstatSync(root).isDirectory()) throw new Error('Katalog backupu musi być rzeczywistym katalogiem');
  const manifest = JSON.parse(require('node:fs').readFileSync(path.join(root, MANIFEST), 'utf8'));
  if (manifest.format !== 1 || !Array.isArray(manifest.files) || !manifest.files.some(f => f.path === 'library.sqlite') || new Set(manifest.files.map(f => f.path)).size !== manifest.files.length) throw new Error('Manifest musi zawierać library.sqlite');
  for (const file of manifest.files) {
    const allowed = file?.path === 'library.sqlite' || /^photos\/[a-f0-9]{64}\.[A-Za-z0-9]+$/.test(file?.path) || /^videos\/[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/.test(file?.path);
    if (!allowed || file.path.includes('..') || path.isAbsolute(file.path) || file.path.includes('\\') || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.size) || file.size < 0) throw new Error('Nieprawidłowa ścieżka lub wpis manifestu');
    rejectSymlinkTree(root, file.path);
    const full = path.resolve(root, file.path);
    if (!inside(root, full) || !statSync(full).isFile()) throw new Error('Brak pliku z manifestu');
  }
  return { root, manifest };
}

function targetPath(root, relative) {
  const parts = relative.split('/');
  if (parts.length !== 2 || !['photos', 'videos'].includes(parts[0])) throw new Error('Nieobsługiwany plik w backupie');
  const targetRoot = path.resolve(root, parts[0]);
  if (existsSync(targetRoot) && lstatSync(targetRoot).isSymbolicLink()) throw new Error('Katalog medium jest symlinkiem');
  mkdirSync(targetRoot, { recursive: true });
  if (lstatSync(targetRoot).isSymbolicLink()) throw new Error('Katalog medium jest symlinkiem');
  const target = path.resolve(targetRoot, parts[1]);
  if (!inside(targetRoot, target) || parts[1].includes('..') || path.isAbsolute(parts[1])) throw new Error('Niebezpieczna ścieżka medium');
  if (existsSync(target) && lstatSync(target).isSymbolicLink()) throw new Error('Docelowy plik medium jest symlinkiem');
  return target;
}

function jsonEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function mergeCollection(existingText, incomingText, key) {
  const existing = existingText == null ? (key === 'prezent_app_settings_v2' ? {} : []) : JSON.parse(existingText);
  const incoming = JSON.parse(incomingText);
  if (key === 'prezent_app_settings_v2') return { value: existingText == null ? incomingText : existingText, changed: existingText == null };
  if (!Array.isArray(existing) || !Array.isArray(incoming)) throw new Error('Nieprawidłowa kolekcja w backupie');
  const byId = new Map(existing.filter(item => item && item.id != null).map(item => [String(item.id), item]));
  const additions = [];
  for (const item of incoming) {
    if (!item || item.id == null) { additions.push(item); continue; }
    const id = String(item.id); const old = byId.get(id);
    if (old && !jsonEqual(old, item)) throw new Error(`Konflikt rekordu ${key}:${id}`);
    if (!old) additions.push(item);
  }
  return { value: JSON.stringify(existing.concat(additions)), changed: additions.length > 0 };
}

async function restoreLibraryBackup(database, videoLibrary, backupDirectory) {
  const { root, manifest } = readManifest(backupDirectory);
  for (const file of manifest.files) {
    const actual = await hashFile(path.join(root, file.path));
    if (actual.sha256 !== file.sha256 || actual.size !== file.size) throw new Error(`Nieprawidłowa suma pliku ${file.path}`);
  }
  const backupDb = path.join(root, 'library.sqlite');
  const sourceDb = new (require('node:sqlite').DatabaseSync)(backupDb, { readOnly: true });
  let sourceLibrary; let sourceMedia;
  try {
    sourceLibrary = sourceDb.prepare('SELECT key,value FROM library').all();
    sourceMedia = sourceDb.prepare('SELECT * FROM media_items').all();
  } catch (error) { sourceDb.close(); throw error; }
  const targetDb = rawDatabase(database);
  const mediaRoot = path.resolve(videoLibrary?.directory ?? path.join(path.dirname(database.db?.filename ?? ''), 'videos'));
  const photosRoot = path.resolve(database?.media?.directory ?? path.join(path.dirname(database.db?.filename ?? ''), 'photos'));
  try {
    if ([photosRoot, mediaRoot].some(rootPath => existsSync(rootPath) && lstatSync(rootPath).isSymbolicLink())) throw new Error('Katalog docelowy biblioteki jest symlinkiem');
  } catch (error) { sourceDb.close(); throw error; }
  const copied = [];
  try {
    const manifestByPath = new Map(manifest.files.map(item => [item.path, item]));
    const photoRefs = new Set();
    for (const row of sourceLibrary) for (const match of String(row.value).matchAll(/prezent-media:([a-f0-9]{64}\.[A-Za-z0-9]+)/g)) photoRefs.add(`photos/${match[1]}`);
    for (const ref of photoRefs) if (!manifestByPath.has(ref)) throw new Error(`Brak zdjęcia z manifestu ${ref}`);
    for (const row of sourceMedia) {
      if (typeof row.relative_path !== 'string' || row.relative_path.includes('\\') || row.relative_path.includes('..') || path.isAbsolute(row.relative_path) || row.relative_path.includes('/')) throw new Error(`Niebezpieczna ścieżka medium ${row.id}`);
      const expected = manifestByPath.get(`videos/${row.relative_path}`);
      if (row.kind === 'video' && (!expected || Number(row.size_bytes) !== expected.size || String(row.content_hash) !== expected.sha256)) throw new Error(`Brak lub niezgodny plik medium ${row.id}`);
    }
    for (const item of manifest.files.filter(f => f.path !== 'library.sqlite')) {
      const targetRoot = item.path.startsWith('photos/') ? photosRoot : mediaRoot;
      const target = targetPath(path.dirname(targetRoot), item.path);
      if (existsSync(target)) { const current = await hashFile(target); if (current.sha256 !== item.sha256 || current.size !== item.size) throw new Error(`Konflikt pliku ${item.path}`); continue; }
      await hashAndCopy(path.join(root, item.path), target); copied.push(target);
    }
    const existingMedia = targetDb.prepare('SELECT * FROM media_items').all();
    const byId = new Map(existingMedia.map(row => [String(row.id), row]));
    const byHash = new Map(existingMedia.map(row => [String(row.content_hash), row]));
    for (const row of sourceMedia) {
      const old = byId.get(String(row.id));
      if (old && !jsonEqual(old, row)) throw new Error(`Konflikt medium ${row.id}`);
      const hashOwner = byHash.get(String(row.content_hash));
      if (!old && hashOwner && String(hashOwner.id) !== String(row.id)) throw new Error(`Konflikt hash medium ${row.id}`);
    }
    const schemaColumns = new Set(targetDb.prepare('PRAGMA table_info(media_items)').all().map(column => column.name));
    const insertedRows = [];
    targetDb.exec('BEGIN IMMEDIATE');
    try {
      for (const row of sourceLibrary) {
        if (!COLLECTION_KEYS.has(row.key)) throw new Error('Nieznany klucz biblioteki');
        const current = targetDb.prepare('SELECT value FROM library WHERE key=?').get(row.key)?.value;
        const merged = mergeCollection(current, row.value, row.key);
        if (merged.changed) targetDb.prepare('INSERT INTO library(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(row.key, merged.value);
      }
      for (const row of sourceMedia) if (!byId.has(String(row.id))) {
        const columns = Object.keys(row).filter(column => schemaColumns.has(column));
        if (!columns.length || columns.length !== Object.keys(row).length) throw new Error('Nieznana kolumna media_items');
        const quoted = columns.map(c => `"${c.replaceAll('"', '""')}"`).join(',');
        targetDb.prepare(`INSERT INTO media_items (${quoted}) VALUES (${columns.map(() => '?').join(',')})`).run(...columns.map(c => row[c]));
        insertedRows.push(row.id);
      }
      targetDb.exec('COMMIT');
    } catch (error) { try { targetDb.exec('ROLLBACK'); } finally { for (const file of copied) { try { rmSync(file, { force: true }); } catch {} } } throw error; }
    return { restoredLibraryRecords: sourceLibrary.length, restoredMediaItems: sourceMedia.length, copiedFiles: copied.length };
  } catch (error) {
    for (const file of copied) { try { rmSync(file, { force: true }); } catch {} }
    throw error;
  } finally { sourceDb.close(); }
}

module.exports = { createLibraryBackup, restoreLibraryBackup, hashAndCopy };
