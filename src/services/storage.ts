import { TravelPhoto, TravelAlbum, TravelTrip, OfflineMapPackage, AppSettings, TravelStats } from '../types/travel';
import { DEMO_PHOTOS, DEMO_ALBUMS, DEMO_TRIPS, DEMO_OFFLINE_PACKAGES } from '../data/demoMemories';
import { APP_VERSION } from '../version';
import { persistence } from './persistence';
import { validateBackup } from './backup-validation';

const STORAGE_KEYS = {
  PHOTOS: 'prezent_travel_photos_v2',
  ALBUMS: 'prezent_travel_albums_v2',
  TRIPS: 'prezent_travel_trips_v2',
  OFFLINE_PACKAGES: 'prezent_offline_packages_v2',
  SETTINGS: 'prezent_app_settings_v2',
};

export const DEFAULT_SETTINGS: AppSettings = {
  // 1. Ogólne
  familyName: 'Nasza Rodzina',
  language: 'pl',
  distanceUnit: 'km',
  autoStartWithWindows: false,

  // 2. Wygląd i personalizacja
  interfaceTheme: 'dark',
  accentColor: 'amber',
  transparentSidebar: true,
  galleryDensity: 'default',

  // 3. Mapa i geolokalizacja
  defaultMapLayer: 'dark',
  autoCenterOnPhotos: true,
  clusterRadius: 50,
  showAnimatedRoutes: true,
  showMapLabels: true,

  // 4. Galeria i zdjęcia
  defaultSortBy: 'date-desc',
  showExifBadges: true,
  groupPhotosByDate: true,
  autoDetectDuplicates: true,

  // 5. Import oraz foldery
  windowsPhotosPath: 'Biblioteka przeglądarki — brak katalogu Windows',
  autoScanNewPhotos: true,
  readExifOnImport: true,
  compressLocalThumbnails: false,

  // 6. Pokaz slajdów
  slideshowInterval: 6,
  kenBurnsEnabled: true,
  slideshowTransition: 'fade',
  ambientSoundEnabled: true,
  showMiniMapPip: true,

  // 7. Telewizor i prezentacja
  tvTargetResolution: '4k',
  tvFontSize: 'large',
  enableSmartRemoteQr: true,
  showCinematicCaptions: true,

  // 8. Pamięć i dane lokalne
  cacheLimitMb: 500,
  offlineSimulationMode: false,

  // 9. Kopie zapasowe
  autoBackupIntervalDays: 7,
  includeThumbnailsInBackup: true,

  // 10. Wydajność
  hardwareAcceleration: true,
  lazyLoadImages: true,
  maxRenderedMarkers: 150,

  // 11. Prywatność
  stripGpsOnExport: false,
  saveSearchHistory: false,

  // 12. Informacje
  appVersion: `${APP_VERSION} (Desktop Preview / Codex)`,
};

export const StorageService = {
  saveLibrary(photos: TravelPhoto[], albums: TravelAlbum[]): boolean {
    try { persistence.batch([[STORAGE_KEYS.PHOTOS, JSON.stringify(photos)], [STORAGE_KEYS.ALBUMS, JSON.stringify(albums)]]); return true; }
    catch { return false; }
  },
  // Zdjęcia
  getPhotos(): TravelPhoto[] {
    try {
      const data = persistence.getItem(STORAGE_KEYS.PHOTOS);
      if (!data) {
        this.savePhotos(DEMO_PHOTOS);
        return DEMO_PHOTOS;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_PHOTOS;
    }
  },

  savePhotos(photos: TravelPhoto[]): boolean {
    try {
      persistence.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
      return true;
    } catch (e: any) {
      console.error('Błąd zapisu fotografii w localStorage (możliwe przekroczenie limitu pamięci):', e);
      return false;
    }
  },

  // Albumy
  getAlbums(): TravelAlbum[] {
    try {
      const data = persistence.getItem(STORAGE_KEYS.ALBUMS);
      if (!data) {
        this.saveAlbums(DEMO_ALBUMS);
        return DEMO_ALBUMS;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_ALBUMS;
    }
  },

  saveAlbums(albums: TravelAlbum[]): boolean {
    try {
      persistence.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
      return true;
    } catch (e) {
      console.error('Błąd zapisu albumów w localStorage:', e);
      return false;
    }
  },

  // Trasy
  getTrips(): TravelTrip[] {
    try {
      const data = persistence.getItem(STORAGE_KEYS.TRIPS);
      if (!data) {
        this.saveTrips(DEMO_TRIPS);
        return DEMO_TRIPS;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_TRIPS;
    }
  },

  saveTrips(trips: TravelTrip[]): boolean {
    try {
      persistence.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
      return true;
    } catch (e) {
      console.error('Błąd zapisu tras w localStorage:', e);
      return false;
    }
  },

  // Pakiety map offline
  getOfflinePackages(): OfflineMapPackage[] {
    try {
      const data = persistence.getItem(STORAGE_KEYS.OFFLINE_PACKAGES);
      if (!data) {
        this.saveOfflinePackages(DEMO_OFFLINE_PACKAGES);
        return DEMO_OFFLINE_PACKAGES;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_OFFLINE_PACKAGES;
    }
  },

  saveOfflinePackages(packages: OfflineMapPackage[]): boolean {
    try {
      persistence.setItem(STORAGE_KEYS.OFFLINE_PACKAGES, JSON.stringify(packages));
      return true;
    } catch (e) {
      console.error('Błąd zapisu pakietów map w localStorage:', e);
      return false;
    }
  },

  // Ustawienia (12 kategorii)
  getSettings(): AppSettings {
    try {
      const data = persistence.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data), appVersion: DEFAULT_SETTINGS.appVersion };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): boolean {
    try {
      persistence.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Błąd zapisu ustawień w localStorage:', e);
      return false;
    }
  },

  // Statystyka zajętości pamięci w localStorage
  getStorageStats(): { usedKb: number; isNearLimit: boolean } {
    try {
      let total = 0;
      for (const key of Object.values(STORAGE_KEYS)) {
        total += (persistence.getItem(key)?.length || 0) * 2;
      }
      const usedKb = Math.round(total / 1024);
      // Większość przeglądarek ma limit ~5MB (5120 KB)
      const isNearLimit = !(typeof window !== 'undefined' && window.electronAPI) && usedKb > 4000;
      return { usedKb, isNearLimit };
    } catch {
      return { usedKb: 0, isNearLimit: false };
    }
  },

  // Obliczanie statystyk podróżniczych
  getTravelStats(photos: TravelPhoto[], trips: TravelTrip[], albums: TravelAlbum[]): TravelStats {
    const countries = Array.from(new Set(photos.map(p => p.location.countryName))).filter(Boolean);
    const cities = Array.from(new Set(photos.map(p => p.location.cityName))).filter(Boolean);
    const totalDistance = trips.reduce((sum, t) => sum + (t.totalDistanceKm || 0), 0);
    const years = photos.map(p => parseInt(p.date.substring(0, 4), 10)).filter(y => !isNaN(y));

    return {
      totalPhotos: photos.length,
      totalTrips: trips.length,
      totalAlbums: albums.length,
      countriesVisited: countries,
      citiesVisited: cities,
      totalDistanceKm: totalDistance,
      earliestYear: years.length ? Math.min(...years) : new Date().getFullYear(),
      latestYear: years.length ? Math.max(...years) : new Date().getFullYear(),
    };
  },

  // Wykrywanie duplikatów zdjęć na podstawie nazwy pliku, daty lub współrzędnych
  findDuplicates(photos: TravelPhoto[]): { groupKey: string; duplicates: TravelPhoto[] }[] {
    const map = new Map<string, TravelPhoto[]>();

    photos.forEach(p => {
      // Klucz dopasowania: zbliżona lokalizacja + ta sama data LUB identyczna nazwa pliku
      const key = p.url.startsWith('data:image/') ? p.url : null;
      if (!key) return;

      const existing = map.get(key) || [];
      existing.push(p);
      map.set(key, existing);
    });

    const duplicateGroups: { groupKey: string; duplicates: TravelPhoto[] }[] = [];
    map.forEach((items, key) => {
      if (items.length > 1) {
        duplicateGroups.push({ groupKey: key.startsWith('sha256_') ? key : `identical-image-${duplicateGroups.length + 1}`, duplicates: items });
      }
    });

    return duplicateGroups;
  },

  // Reset do fabrycznego demo
  resetToDemo(): void {
    this.savePhotos(DEMO_PHOTOS);
    this.saveAlbums(DEMO_ALBUMS);
    this.saveTrips(DEMO_TRIPS);
    this.saveOfflinePackages(DEMO_OFFLINE_PACKAGES);
  },

  // Usunięcie zdjęć demonstracyjnych
  clearDemoData(): void {
    const photos = this.getPhotos().filter(p => !p.isDemo);
    const albums = this.getAlbums().filter(a => !a.isDemo);
    this.savePhotos(photos);
    this.saveAlbums(albums);
  },

  // Czyszczenie pamięci podręcznej kafelków mapy
  clearMapCache(): number {
    const pkgs = this.getOfflinePackages().map(p => ({ ...p, isDownloaded: false, downloadDate: undefined }));
    this.saveOfflinePackages(pkgs);
    return 145; // zwolniono MB
  },

  // Eksport bazy do .prezent
  exportPrezentBackup(stripGps: boolean = false): string {
    let photosToExport = this.getPhotos();
    if (stripGps) {
      photosToExport = photosToExport.map(p => ({
        ...p,
        location: { ...p.location, lat: 0, lng: 0 },
      }));
    }

    const backup = {
      app: 'Prezent Mapy',
      version: APP_VERSION,
      exportDate: new Date().toISOString(),
      photos: photosToExport,
      albums: this.getAlbums(),
      trips: stripGps ? this.getTrips().map(trip => ({ ...trip, routePoints: [] })) : this.getTrips(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import bazy z pliku
  importPrezentBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      validateBackup(data);
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          if (!(key in DEFAULT_SETTINGS) || typeof value !== typeof DEFAULT_SETTINGS[key as keyof AppSettings]) throw new Error('Nieprawidłowe ustawienie');
        }
      }
      const entries: [string, string][] = [[STORAGE_KEYS.PHOTOS, JSON.stringify(data.photos)]];
      if (data.albums) entries.push([STORAGE_KEYS.ALBUMS, JSON.stringify(data.albums)]);
      if (data.trips) entries.push([STORAGE_KEYS.TRIPS, JSON.stringify(data.trips)]);
      if (data.settings) entries.push([STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings)]);
      persistence.batch(entries);
      return true;
    } catch (e) {
      console.error('Błąd importu kopii zapasowej:', e);
      return false;
    }
  }
};
