const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): boolean => Array.isArray(value) && value.every(item => typeof item === 'string');
const textFields = (record: Record<string, any>, fields: string[]) => fields.every(field => typeof record[field] === 'string');
const coordinate = (lat: unknown, lng: unknown) => typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) <= 90 && typeof lng === 'number' && Number.isFinite(lng) && Math.abs(lng) <= 180;
const imageUrl = (url: unknown) => typeof url === 'string' && /^(https?:\/\/|data:image\/(png|jpeg|gif|webp);base64,)/.test(url);
const optional = (record: Record<string, any>, field: string, validate: (value: any) => boolean) => record[field] === undefined || validate(record[field]);
const boolean = (value: unknown) => typeof value === 'boolean';
const text = (value: unknown) => typeof value === 'string';
const nonnegative = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const year = (value: unknown) => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 9999;
const date = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const cover = (value: unknown) => value === '' || imageUrl(value);
const ENUMS: Record<string, readonly string[]> = {
  language: ['pl', 'en'], distanceUnit: ['km', 'mi'], interfaceTheme: ['dark', 'light', 'system'],
  accentColor: ['amber', 'emerald', 'indigo', 'rose', 'sky'], galleryDensity: ['default', 'compact', 'large'],
  defaultMapLayer: ['dark', 'satellite', 'voyager', 'light', 'osm', 'streets'], defaultSortBy: ['date-desc', 'date-asc', 'location', 'title'],
  slideshowTransition: ['fade', 'slide', 'zoom'], tvTargetResolution: ['4k', '1080p'], tvFontSize: ['normal', 'large', 'huge'],
};
const BOOLEANS = new Set(['autoStartWithWindows', 'transparentSidebar', 'autoCenterOnPhotos', 'showAnimatedRoutes', 'showMapLabels', 'showExifBadges', 'groupPhotosByDate', 'autoDetectDuplicates', 'autoScanNewPhotos', 'readExifOnImport', 'compressLocalThumbnails', 'kenBurnsEnabled', 'ambientSoundEnabled', 'showMiniMapPip', 'enableSmartRemoteQr', 'showCinematicCaptions', 'offlineSimulationMode', 'includeThumbnailsInBackup', 'hardwareAcceleration', 'lazyLoadImages', 'stripGpsOnExport', 'saveSearchHistory']);
const RANGES: Record<string, [number, number]> = { clusterRadius: [1, 500], slideshowInterval: [1, 3600], cacheLimitMb: [1, 1048576], autoBackupIntervalDays: [0, 3650], maxRenderedMarkers: [1, 100000] };
export function validateSettings(settings: unknown): void {
  if (!object(settings)) throw new Error('Nieprawidłowe ustawienia');
  for (const [key, value] of Object.entries(settings)) {
    if (Object.hasOwn(ENUMS, key)) { if (!ENUMS[key].includes(value)) throw new Error(`Nieprawidłowe ustawienie ${key}`); }
    else if (BOOLEANS.has(key)) { if (!boolean(value)) throw new Error(`Nieprawidłowe ustawienie ${key}`); }
    else if (Object.hasOwn(RANGES, key)) { const [min, max] = RANGES[key]; if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Nieprawidłowe ustawienie ${key}`); }
    else if (['familyName', 'windowsPhotosPath', 'appVersion'].includes(key)) { if (!text(value) || value.length > (key === 'windowsPhotosPath' ? 32767 : 200)) throw new Error(`Nieprawidłowe ustawienie ${key}`); }
    else throw new Error(`Nieznane ustawienie ${key}`);
  }
}
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
  collection('photos', p => textFields(p, ['title', 'date', 'albumId', 'notes']) && date(p.date) && imageUrl(p.url) && optional(p, 'thumbnailUrl', imageUrl) && object(p.location) && coordinate(p.location.lat, p.location.lng) && textFields(p.location, ['cityName', 'countryName', 'countryCode']) && optional(p.location, 'placeName', text) && strings(p.tags) && strings(p.participants) && boolean(p.isFavorite) && optional(p, 'isDemo', boolean) && optional(p, 'time', value => text(value) && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) && ['fileSize', 'fileName', 'localFilePath', 'duplicateGroup'].every(field => optional(p, field, text)) && optional(p, 'fileSizeBytes', nonnegative) && optional(p, 'contentHash', value => text(value) && /^[a-f0-9]{64}$/.test(value)) && optional(p, 'cameraInfo', value => object(value) && ['make', 'model', 'focalLength', 'iso'].every(field => optional(value, field, text))), true);
  collection('albums', a => textFields(a, ['name', 'description', 'country']) && cover(a.coverUrl) && year(a.year) && optional(a, 'tripId', text) && optional(a, 'isDemo', boolean) && optional(a, 'isSmartAlbum', boolean) && optional(a, 'smartFilter', value => ['favorites', 'nature', 'family', 'food', 'recent'].includes(value)));
  collection('trips', t => textFields(t, ['title', 'description', 'color']) && cover(t.coverPhotoUrl) && year(t.year) && optional(t, 'totalDistanceKm', nonnegative) && optional(t, 'transportType', value => ['car', 'plane', 'train', 'camper', 'foot'].includes(value)) && Array.isArray(t.routePoints) && t.routePoints.every((p: unknown) => object(p) && coordinate(p.lat, p.lng) && text(p.name) && Number.isInteger(p.order) && p.order >= 0));
  if (data.settings !== undefined) validateSettings(data.settings);
  if (data.albums) {
    const albums = new Set(data.albums.map((album: any) => album.id));
    if (data.photos.some((photo: any) => photo.albumId && !albums.has(photo.albumId))) throw new Error('Zdjęcie odwołuje się do brakującego albumu');
  }
  if (data.albums && data.trips) {
    const trips = new Set(data.trips.map((trip: any) => trip.id));
    if (data.albums.some((album: any) => album.tripId && !trips.has(album.tripId))) throw new Error('Album odwołuje się do brakującej podróży');
  }
}
