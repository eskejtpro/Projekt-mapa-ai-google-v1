const { DatabaseSync } = require('node:sqlite');
const KEYS = new Set(['prezent_travel_photos_v2', 'prezent_travel_albums_v2', 'prezent_travel_trips_v2', 'prezent_offline_packages_v2', 'prezent_app_settings_v2']);
class LibraryDatabase {
  constructor(file) {
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS library (key TEXT PRIMARY KEY, value TEXT NOT NULL CHECK(json_valid(value))); PRAGMA user_version=1;');
  }
  validateKey(key) { if (!KEYS.has(key)) throw new Error('Nieznany klucz biblioteki'); }
  get(key) {
    this.validateKey(key);
    return this.db.prepare('SELECT value FROM library WHERE key=?').get(key)?.value ?? null;
  }
  set(key, value) {
    this.validateKey(key);
    if (typeof value !== 'string' || Buffer.byteLength(value) > 64 * 1024 * 1024) throw new Error('Nieprawidłowy rozmiar danych');
    const parsed = JSON.parse(value);
    if (key === 'prezent_app_settings_v2' ? !parsed || Array.isArray(parsed) || typeof parsed !== 'object' : !Array.isArray(parsed)) throw new Error('Nieprawidłowy typ danych');
    this.db.prepare('INSERT INTO library(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, value);
  }
  batch(entries) {
    if (!Array.isArray(entries) || entries.length > KEYS.size) throw new Error('Nieprawidłowy wsad');
    this.db.exec('BEGIN IMMEDIATE');
    try { for (const [key, value] of entries) this.set(key, value); this.db.exec('COMMIT'); }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  close() { this.db.close(); }
}
module.exports = { LibraryDatabase };
