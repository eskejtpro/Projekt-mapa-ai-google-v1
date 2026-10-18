const { DatabaseSync } = require('node:sqlite');
const { MediaStore } = require('./media-store.cjs');
const path = require('node:path');
const KEYS = new Set(['prezent_travel_photos_v2', 'prezent_travel_albums_v2', 'prezent_travel_trips_v2', 'prezent_offline_packages_v2', 'prezent_app_settings_v2']);
class LibraryDatabase {
  constructor(file) {
    this.media = file === ':memory:' ? null : new MediaStore(path.join(path.dirname(file), 'photos'));
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS library (key TEXT PRIMARY KEY, value TEXT NOT NULL CHECK(json_valid(value))); PRAGMA user_version=1;');
  }
  validateKey(key) { if (!KEYS.has(key)) throw new Error('Nieznany klucz biblioteki'); }
  get(key) {
    this.validateKey(key);
    const value = this.db.prepare('SELECT value FROM library WHERE key=?').get(key)?.value ?? null;
    return value === null || !this.media ? value : this.media.transform(key, value, 'load');
  }
  set(key, value) {
    this.validateKey(key);
    if (typeof value !== 'string' || Buffer.byteLength(value) > 64 * 1024 * 1024) throw new Error('Nieprawidłowy rozmiar danych');
    const parsed = JSON.parse(value);
    if (key === 'prezent_app_settings_v2' ? !parsed || Array.isArray(parsed) || typeof parsed !== 'object' : !Array.isArray(parsed)) throw new Error('Nieprawidłowy typ danych');
    const stored = this.media ? this.media.transform(key, value, 'save') : value;
    this.db.prepare('INSERT INTO library(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, stored);
  }
  batch(entries) {
    if (!Array.isArray(entries) || entries.length > KEYS.size) throw new Error('Nieprawidłowy wsad');
    this.db.exec('BEGIN IMMEDIATE');
    try { for (const [key, value] of entries) this.set(key, value); this.db.exec('COMMIT'); }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  pathForPhoto(id) {
    if (typeof id !== 'string' || id.length > 200) throw new Error('Nieprawidłowy identyfikator zdjęcia');
    const stored = this.db.prepare('SELECT value FROM library WHERE key=?').get('prezent_travel_photos_v2')?.value;
    if (!stored) throw new Error('Nie znaleziono biblioteki zdjęć');
    const photo = JSON.parse(stored).find(item => item && item.id === id);
    if (!photo || !this.media) throw new Error('Zdjęcie nie jest dostępne lokalnie');
    return { file: this.media.pathFor(photo.url), mimeType: `image/${path.extname(this.media.pathFor(photo.url)).slice(1).replace('jpg', 'jpeg')}`, title: photo.title || 'Zdjęcie' };
  }
  close() { this.db.close(); }
}
module.exports = { LibraryDatabase };
