function desktopStore() { return typeof window === 'undefined' ? undefined : window.electronAPI?.storage; }
export function migrateDesktopPersistence(): void {
  const store = desktopStore();
  if (!store) return;
  const keys = ['prezent_travel_photos_v2', 'prezent_travel_albums_v2', 'prezent_travel_trips_v2', 'prezent_offline_packages_v2', 'prezent_app_settings_v2'];
  // Istniejąca baza ma pierwszeństwo; nie mieszamy dwóch bibliotek.
  if (keys.some(key => store.get(key) !== null)) return;
  const entries: [string, string][] = [];
  const savedSnapshot = localStorage.getItem('prezent_atomic_library_v1');
  const snapshot = savedSnapshot ? JSON.parse(savedSnapshot) : {};
  for (const key of keys) {
    const value = snapshot[key] ?? localStorage.getItem(key);
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
  getItem(key: string): string | null {
    const store = desktopStore();
    if (store) return store.get(key);
    const snapshot = localStorage.getItem('prezent_atomic_library_v1');
    return snapshot ? JSON.parse(snapshot)[key] ?? localStorage.getItem(key) : localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    const store = desktopStore();
    if (store) store.set(key, value);
    else {
      const snapshot = localStorage.getItem('prezent_atomic_library_v1');
      if (snapshot) localStorage.setItem('prezent_atomic_library_v1', JSON.stringify({ ...JSON.parse(snapshot), [key]: value }));
      else localStorage.setItem(key, value);
    }
  },
  batch(entries: [string, string][]): void {
    const store = desktopStore();
    if (store) { store.batch(entries); return; }
    const snapshot = localStorage.getItem('prezent_atomic_library_v1');
    // Jedno setItem jest atomowe także przy przekroczeniu limitu przeglądarki.
    localStorage.setItem('prezent_atomic_library_v1', JSON.stringify({ ...(snapshot ? JSON.parse(snapshot) : {}), ...Object.fromEntries(entries) }));
  },
};
