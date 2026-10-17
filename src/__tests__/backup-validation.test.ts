import { expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../services/storage';
import { DEMO_PHOTOS, DEMO_ALBUMS, DEMO_TRIPS } from '../data/demoMemories';
import { validateBackup, validateSettings } from '../services/backup-validation';
const backup = (): Record<string, any> => structuredClone({ app: 'Prezent Mapy', photos: DEMO_PHOTOS, albums: DEMO_ALBUMS, trips: DEMO_TRIPS, settings: DEFAULT_SETTINGS });
it('odrzuca osierocone albumy i podróże', () => {
  const value = backup();
  value.photos[0].albumId = 'missing-album';
  expect(() => validateBackup(value)).toThrow();
  const another = backup();
  another.albums[0].tripId = 'missing-trip';
  expect(() => validateBackup(another)).toThrow();
});
it('odrzuca daty nieistniejące w kalendarzu i nieprawidłowe pola opcjonalne', () => {
  const value = backup();
  value.photos[0].date = '2025-02-30';
  expect(() => validateBackup(value)).toThrow();
  value.photos[0].date = '2024-02-29';
  value.photos[0].cameraInfo = { make: 123 };
  expect(() => validateBackup(value)).toThrow();
});
it('weryfikuje enumy, granice i nieznane klucze ustawień', () => {
  expect(() => validateSettings({ slideshowTransition: 'untrusted' })).toThrow();
  expect(() => validateSettings({ slideshowInterval: 0 })).toThrow();
  expect(() => validateSettings({ maxRenderedMarkers: 1.5 })).toThrow();
  expect(() => validateSettings(JSON.parse('{"__proto__":{}}'))).toThrow();
  expect(() => validateSettings({ slideshowInterval: 12, interfaceTheme: 'system' })).not.toThrow();
});
it('obsługuje format legacy i poprawny rok przestępny', () => {
  const value = backup();
  value.app = 'Prezent';
  value.photos[0].date = '2024-02-29';
  expect(() => validateBackup(value)).not.toThrow();
});
