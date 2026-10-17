const { createHash, randomUUID } = require('node:crypto');
const { mkdirSync, existsSync, writeFileSync, renameSync, readFileSync } = require('node:fs');
const path = require('node:path');
class MediaStore {
  constructor(directory) { this.directory = directory; mkdirSync(directory, { recursive: true }); }
  save(url) {
    if (typeof url !== 'string' || !url.startsWith('data:')) return url;
    const match = /^data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/]*={0,2})$/.exec(url);
    if (!match || match[2].length > 90 * 1024 * 1024) throw new Error('Nieobsługiwany obraz lub przekroczony limit 64 MB');
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.toString('base64') !== match[2]) throw new Error('Nieprawidłowy obraz base64');
    const digest = createHash('sha256').update(bytes).digest('hex');
    const name = `${digest}.${match[1]}`;
    const target = path.join(this.directory, name);
    if (!existsSync(target)) {
      const temporary = path.join(this.directory, `${randomUUID()}.tmp`);
      writeFileSync(temporary, bytes, { flag: 'wx' });
      renameSync(temporary, target);
    }
    return `prezent-media:${name}`;
  }
  load(url) {
    if (typeof url !== 'string' || !url.startsWith('prezent-media:')) return url;
    const match = /^prezent-media:([a-f0-9]{64})\.(png|jpeg|gif|webp)$/.exec(url);
    if (!match) throw new Error('Nieprawidłowy identyfikator zdjęcia');
    const bytes = readFileSync(path.join(this.directory, `${match[1]}.${match[2]}`));
    if (createHash('sha256').update(bytes).digest('hex') !== match[1]) throw new Error('Uszkodzony plik zdjęcia');
    return `data:image/${match[2]};base64,${bytes.toString('base64')}`;
  }
  transform(key, value, operation) {
    const fields = key === 'prezent_travel_photos_v2' ? ['url', 'thumbnailUrl'] : key === 'prezent_travel_albums_v2' ? ['coverUrl'] : key === 'prezent_travel_trips_v2' ? ['coverPhotoUrl'] : [];
    if (!fields.length) return value;
    const records = JSON.parse(value);
    if (!Array.isArray(records)) throw new Error('Nieprawidłowa kolekcja zdjęć');
    return JSON.stringify(records.map(record => {
      const result = { ...record };
      for (const field of fields) if (result[field]) result[field] = this[operation](result[field]);
      return result;
    }));
  }
}
module.exports = { MediaStore };
