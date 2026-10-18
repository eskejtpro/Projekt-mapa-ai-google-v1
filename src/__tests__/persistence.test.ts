import { afterEach, expect, it, vi } from 'vitest';
import { migrateDesktopPersistence, persistence } from '../services/persistence';
const photos = 'prezent_travel_photos_v2';
afterEach(() => vi.unstubAllGlobals());
function setup(existing = new Map<string, string>()) {
  const source = new Map<string, string>([[photos, '[{"id":"source"}]']]);
  const batch = vi.fn((entries: [string, string][]) => entries.forEach(([key, value]) => existing.set(key, value)));
  vi.stubGlobal('localStorage', { getItem: (key: string) => source.get(key) ?? null, setItem: (key: string, value: string) => source.set(key, value) });
  vi.stubGlobal('window', { electronAPI: { storage: { get: (key: string) => existing.get(key) ?? null, set: (key: string, value: string) => existing.set(key, value), batch } } });
  return { source, existing, batch };
}
it('migruje dane transakcyjnie i zachowuje kopię źródłową', () => {
  const { source, existing, batch } = setup();
  migrateDesktopPersistence();
  expect(batch).toHaveBeenCalledTimes(1);
  expect(existing.get(photos)).toBe(source.get(photos));
  expect(source.get('prezent_before_sqlite_migration')).toContain('source');
});
it('istniejąca baza ma pierwszeństwo nad localStorage', () => {
  const { batch } = setup(new Map([[photos, '[]']]));
  migrateDesktopPersistence();
  expect(batch).not.toHaveBeenCalled();
  expect(persistence.getItem(photos)).toBe('[]');
});
it('błędny JSON przerywa migrację przed zapisem', () => {
  const { source, batch } = setup();
  source.set(photos, '{broken');
  expect(() => migrateDesktopPersistence()).toThrow();
  expect(batch).not.toHaveBeenCalled();
});
