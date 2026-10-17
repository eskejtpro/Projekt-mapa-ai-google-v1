const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): boolean => Array.isArray(value) && value.every(item => typeof item === 'string');
const textFields = (record: Record<string, any>, fields: string[]) => fields.every(field => typeof record[field] === 'string');
const coordinate = (lat: unknown, lng: unknown) => typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) <= 90 && typeof lng === 'number' && Number.isFinite(lng) && Math.abs(lng) <= 180;
const imageUrl = (url: unknown) => typeof url === 'string' && /^(https?:\/\/|data:image\/(png|jpeg|gif|webp);base64,)/.test(url);
export function validateBackup(data: unknown): asserts data is Record<string, any> {
  if (!object(data) || !['Prezent', 'Prezent Mapy'].includes(data.app)) throw new Error('Nieprawidłowy format kopii');
  const collection = (name: string, validate: (record: Record<string, any>) => boolean, required = false) => {
    if (data[name] === undefined && !required) return;
    if (!Array.isArray(data[name])) throw new Error(`Nieprawidłowa kolekcja ${name}`);
    const ids = new Set();
    for (const record of data[name]) {
      if (!object(record) || typeof record.id !== 'string' || !record.id || ids.has(record.id) || !validate(record)) throw new Error(`Nieprawidłowy rekord ${name}`);
      ids.add(record.id);
    }
  };
  collection('photos', p => textFields(p, ['title', 'date', 'albumId', 'notes']) && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && imageUrl(p.url) && (p.thumbnailUrl === undefined || imageUrl(p.thumbnailUrl)) && object(p.location) && coordinate(p.location.lat, p.location.lng) && textFields(p.location, ['cityName', 'countryName', 'countryCode']) && strings(p.tags) && strings(p.participants) && typeof p.isFavorite === 'boolean', true);
  collection('albums', a => textFields(a, ['name', 'description', 'country']) && imageUrl(a.coverUrl) && Number.isInteger(a.year));
  collection('trips', t => textFields(t, ['title', 'description', 'color']) && imageUrl(t.coverPhotoUrl) && Number.isInteger(t.year) && Array.isArray(t.routePoints) && t.routePoints.every((p: unknown) => object(p) && coordinate(p.lat, p.lng) && typeof p.name === 'string' && Number.isFinite(p.order)));
  if (data.settings !== undefined && !object(data.settings)) throw new Error('Nieprawidłowe ustawienia');
}
