import { beforeEach, describe, expect, it } from 'vitest';
import { StorageService } from '../services/storage';
import { APP_VERSION } from '../version';
const data = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), clear: () => data.clear() }, configurable: true });
describe('biblioteka → kopia → przywrócenie', () => {
  beforeEach(() => data.clear());
  it('stara wersja zapisana w ustawieniach nie nadpisuje wersji aplikacji', () => {
    StorageService.saveSettings({ ...StorageService.getSettings(), appVersion: '1.0.0' });
    expect(StorageService.getSettings().appVersion).toContain(APP_VERSION);
  });
  it('odtwarza zmieniony opis, albumy i trasy po wyczyszczeniu pamięci', () => {
    const photos = StorageService.getPhotos().slice(0, 1).map(photo => ({ ...photo, notes: 'Notatka testowa', isFavorite: true }));
    expect(StorageService.savePhotos(photos)).toBe(true);
    const albums = StorageService.getAlbums();
    const trips = StorageService.getTrips();
    const backup = StorageService.exportPrezentBackup();
    expect(JSON.parse(backup).version).toBe(APP_VERSION);
    data.clear();
    expect(StorageService.importPrezentBackup(backup)).toBe(true);
    expect(StorageService.getPhotos()).toEqual(photos);
    expect(StorageService.getAlbums()).toEqual(albums);
    expect(StorageService.getTrips()).toEqual(trips);
  });
  it('anonimizacja eksportu nie zmienia lokalnych współrzędnych', () => {
    const photos = StorageService.getPhotos();
    const backup = JSON.parse(StorageService.exportPrezentBackup(true));
    expect(backup.photos.every((p: { location: { lat: number; lng: number } }) => p.location.lat === 0 && p.location.lng === 0)).toBe(true);
    expect(StorageService.getPhotos()).toEqual(photos);
  });
  it('błędne współrzędne i zduplikowane ID nie zmieniają biblioteki', () => {
    const original = StorageService.getPhotos();
    const backup = JSON.parse(StorageService.exportPrezentBackup());
    backup.photos[0].location.lat = 100;
    expect(StorageService.importPrezentBackup(JSON.stringify(backup))).toBe(false);
    expect(StorageService.getPhotos()).toEqual(original);
    backup.photos[0].location.lat = 0;
    backup.photos.push(backup.photos[0]);
    expect(StorageService.importPrezentBackup(JSON.stringify(backup))).toBe(false);
    expect(StorageService.getPhotos()).toEqual(original);
  });
  it('brak miejsca nie zgłasza sukcesu i zachowuje poprzednią bibliotekę', () => {
    const original = StorageService.getPhotos();
    const backup = JSON.parse(StorageService.exportPrezentBackup());
    backup.photos = [];
    const setItem = localStorage.setItem;
    localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    try {
      expect(StorageService.importPrezentBackup(JSON.stringify(backup))).toBe(false);
      expect(StorageService.getPhotos()).toEqual(original);
    } finally { localStorage.setItem = setItem; }
  });
});
