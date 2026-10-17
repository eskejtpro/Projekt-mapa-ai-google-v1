function desktopStore() { return typeof window === 'undefined' ? undefined : window.electronAPI?.storage; }
export function migrateDesktopPersistence(): void {
  const store = desktopStore();
  if (!store) return;
  const keys = ['prezent_travel_photos_v2', 'prezent_travel_albums_v2', 'prezent_travel_trips_v2', 'prezent_offline_packages_v2', 'prezent_app_settings_v2'];
  // Istniejąca baza ma pierwszeństwo; nie mieszamy dwóch bibliotek.
  if (keys.some(key => store.get(key) !== null)) return;
  const entries: [string, string][] = [];
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value === null) continue;
    const parsed = JSON.parse(value);
    if (key.endsWith('settings_v2') ? !parsed || typeof parsed !== 'object' || Array.isArray(parsed) : !Array.isArray(parsed)) throw new Error('Nieprawidłowa biblioteka do migracji');
    entries.push([key, value]);
  }
  if (entries.length) {
    localStorage.setItem('prezent_before_sqlite_migration', JSON.stringify(entries));
    store.batch(entries);
  }
}
export const persistence = {
  getItem(key: string): string | null { const store = desktopStore(); return store ? store.get(key) : localStorage.getItem(key); },
  setItem(key: string, value: string): void {
    const store = desktopStore();
    if (store) store.set(key, value); else localStorage.setItem(key, value);
  },
};
