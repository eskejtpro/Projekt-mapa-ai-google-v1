const { createHash, randomUUID } = require('node:crypto');
const { createReadStream, existsSync, mkdirSync, copyFileSync, renameSync, unlinkSync, realpathSync, statSync } = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const VIDEO_TYPES = new Map([
  ['.mp4', { mimeType: 'video/mp4', container: 'mp4' }],
  ['.webm', { mimeType: 'video/webm', container: 'webm' }],
]);
const MAX_VIDEO_BYTES = 20 * 1024 * 1024 * 1024;

function readMagic(file) {
  const fd = require('node:fs').openSync(file, 'r');
  try {
    const bytes = Buffer.alloc(16);
    require('node:fs').readSync(fd, bytes, 0, bytes.length, 0);
    return bytes;
  } finally { require('node:fs').closeSync(fd); }
}

function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(file);
    stream.on('data', chunk => hash.update(chunk));
    stream.once('error', reject);
    stream.once('end', () => resolve(hash.digest('hex')));
  });
}

function validateVideoFile(file) {
  const ext = path.extname(file).toLowerCase();
  const type = VIDEO_TYPES.get(ext);
  if (!type) throw new Error('Obsługiwane są wyłącznie pliki MP4 i WebM');
  if (!existsSync(file)) throw new Error('Plik wideo nie istnieje');
  const stat = require('node:fs').statSync(file);
  if (!stat.isFile()) throw new Error('Ścieżka wideo nie wskazuje na plik');
  if (stat.size <= 0) throw new Error('Plik wideo jest pusty');
  if (stat.size > MAX_VIDEO_BYTES) throw new Error('Plik wideo przekracza limit 20 GB');
  const magic = readMagic(file);
  const valid = type.container === 'mp4'
    ? magic.subarray(4, 8).toString('ascii') === 'ftyp'
    : magic.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (!valid) throw new Error('Nagłówek pliku nie odpowiada wybranemu kontenerowi wideo');
  return { ...type, sizeBytes: stat.size };
}

class VideoLibrary {
  constructor(databaseFile, mediaDirectory) {
    this.db = new DatabaseSync(databaseFile);
    this.directory = path.resolve(mediaDirectory);
    mkdirSync(this.directory, { recursive: true });
    this.db.exec(`CREATE TABLE IF NOT EXISTS media_items (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('photo','video')),
      title TEXT NOT NULL, file_name TEXT NOT NULL, relative_path TEXT NOT NULL,
      mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL, content_hash TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL, duration_ms INTEGER, width INTEGER, height INTEGER, codec TEXT,
      codec_status TEXT NOT NULL DEFAULT 'unknown', thumbnail_path TEXT,
      thumbnail_status TEXT NOT NULL DEFAULT 'placeholder', album_id TEXT, trip_id TEXT,
      location_json TEXT
    );`);
  }
  async importVideo(sourceFile, metadata = {}) {
    const info = validateVideoFile(sourceFile);
    const hash = await hashFile(sourceFile);
    const duplicate = this.db.prepare('SELECT * FROM media_items WHERE content_hash = ?').get(hash);
    if (duplicate) return { duplicate: true, item: this.#row(duplicate) };
    const id = `video-${randomUUID()}`;
    const fileName = `${hash}${path.extname(sourceFile).toLowerCase()}`;
    const destination = path.join(this.directory, fileName);
    const temporary = `${destination}.${randomUUID()}.tmp`;
    copyFileSync(sourceFile, temporary);
    renameSync(temporary, destination);
    const item = {
      id, kind: 'video', title: metadata.title || path.basename(sourceFile, path.extname(sourceFile)),
      fileName: path.basename(sourceFile), relativePath: fileName, mimeType: info.mimeType,
      sizeBytes: info.sizeBytes, contentHash: hash, date: metadata.date || new Date().toISOString().slice(0, 10),
      durationMs: metadata.durationMs ?? null, width: metadata.width ?? null, height: metadata.height ?? null,
      codec: metadata.codec ?? null, codecStatus: metadata.codecStatus || 'runtime-required',
      thumbnailPath: null, thumbnailStatus: 'placeholder', albumId: metadata.albumId ?? null,
      tripId: metadata.tripId ?? null, locationJson: metadata.location ? JSON.stringify(metadata.location) : null,
    };
    try {
      this.db.prepare(`INSERT INTO media_items
        (id,kind,title,file_name,relative_path,mime_type,size_bytes,content_hash,date,duration_ms,width,height,codec,codec_status,thumbnail_path,thumbnail_status,album_id,trip_id,location_json)
        VALUES (@id,@kind,@title,@fileName,@relativePath,@mimeType,@sizeBytes,@contentHash,@date,@durationMs,@width,@height,@codec,@codecStatus,@thumbnailPath,@thumbnailStatus,@albumId,@tripId,@locationJson)`).run(item);
    } catch (error) { if (existsSync(destination)) unlinkSync(destination); throw error; }
    return { duplicate: false, item: this.#row(item) };
  }
  list() { return this.db.prepare('SELECT * FROM media_items ORDER BY date DESC, id DESC').all().map(row => this.#row(row)); }
  pathFor(id) {
    const row = this.db.prepare('SELECT relative_path FROM media_items WHERE id = ?').get(id);
    if (!row) throw new Error('Nieznane medium');
    const root = realpathSync(this.directory);
    const target = path.resolve(root, row.relative_path);
    if (!target.startsWith(`${root}${path.sep}`) || !existsSync(target) || !statSync(target).isFile()) throw new Error('Brak bezpiecznego pliku medium');
    const resolved = realpathSync(target);
    if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error('Plik medium wskazuje poza katalog aplikacji');
    return resolved;
  }
  close() { this.db.close(); }
  #row(row) { return { id: row.id, kind: row.kind, title: row.title, fileName: row.file_name ?? row.fileName, localPath: row.relative_path, mimeType: row.mime_type ?? row.mimeType, sizeBytes: row.size_bytes ?? row.sizeBytes, contentHash: row.content_hash ?? row.contentHash, date: row.date, durationMs: row.duration_ms ?? row.durationMs, width: row.width, height: row.height, codec: row.codec, codecStatus: row.codec_status ?? row.codecStatus, thumbnailPath: row.thumbnail_path ?? row.thumbnailPath, thumbnailStatus: row.thumbnail_status ?? row.thumbnailStatus, albumId: row.album_id ?? row.albumId, tripId: row.trip_id ?? row.tripId, location: row.location_json ? JSON.parse(row.location_json) : undefined }; }
}

module.exports = { VideoLibrary, validateVideoFile, hashFile, MAX_VIDEO_BYTES };
