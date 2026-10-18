const { mkdirSync, readFileSync, writeFileSync, renameSync } = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
class BackupManager {
  constructor(database, directory, version) { this.database = database; this.directory = directory; this.version = version; }
  check(now = Date.now()) {
    const settings = JSON.parse(this.database.get('prezent_app_settings_v2') || '{}');
    const days = settings.autoBackupIntervalDays ?? 7;
    if (!Number.isInteger(days) || days < 1 || days > 3650) return { created: false };
    const photosData = this.database.get('prezent_travel_photos_v2');
    if (photosData === null) return { created: false };
    const stateFile = path.join(this.directory, 'backup-state.json');
    let previous = 0;
    try { previous = JSON.parse(readFileSync(stateFile, 'utf8')).lastBackup || 0; } catch { /* Pierwsza kopia lub uszkodzony stan harmonogramu. */ }
    if (now - previous < days * 86400000) return { created: false };
    let photos = JSON.parse(photosData);
    if (settings.includeThumbnailsInBackup === false) photos = photos.map(({ thumbnailUrl, ...photo }) => photo);
    const snapshot = { app: 'Prezent Mapy', version: this.version, exportDate: new Date(now).toISOString(), photos, albums: JSON.parse(this.database.get('prezent_travel_albums_v2') || '[]'), trips: JSON.parse(this.database.get('prezent_travel_trips_v2') || '[]'), settings };
    const backups = path.join(this.directory, 'backups');
    mkdirSync(backups, { recursive: true });
    const file = path.join(backups, `Prezent-${new Date(now).toISOString().replaceAll(':', '-')}-${randomUUID()}.prezent`);
    const temporary = `${file}.tmp`;
    writeFileSync(temporary, JSON.stringify(snapshot), { flag: 'wx' });
    renameSync(temporary, file);
    const stateTemporary = `${stateFile}.${randomUUID()}.tmp`;
    writeFileSync(stateTemporary, JSON.stringify({ lastBackup: now }), { flag: 'wx' });
    renameSync(stateTemporary, stateFile);
    return { created: true, file };
  }
}
module.exports = { BackupManager };
