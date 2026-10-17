import { TravelPhoto, TravelAlbum, TravelTrip, OfflineMapPackage } from '../types/travel';
import { DEMO_PHOTOS, DEMO_ALBUMS, DEMO_TRIPS, DEMO_OFFLINE_PACKAGES } from '../data/demoMemories';

const STORAGE_KEYS = {
  PHOTOS: 'prezent_travel_photos_v1',
  ALBUMS: 'prezent_travel_albums_v1',
  TRIPS: 'prezent_travel_trips_v1',
  OFFLINE_PACKAGES: 'prezent_offline_packages_v1',
  SETTINGS: 'prezent_app_settings_v1',
};

export interface AppSettings {
  defaultMapLayer: 'osm' | 'dark' | 'light' | 'satellite';
  slideshowInterval: number; // sekundy
  ambientSoundEnabled: boolean;
  kenBurnsEnabled: boolean;
  offlineSimulationMode: boolean;
  windowsPhotosPath: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultMapLayer: 'dark',
  slideshowInterval: 6,
  ambientSoundEnabled: true,
  kenBurnsEnabled: true,
  offlineSimulationMode: false,
  windowsPhotosPath: 'C:\\Users\\Rodzina\\Obrazy\\Prezent-Wspomnienia',
};

export const StorageService = {
  // Pobieranie zdjęć
  getPhotos(): TravelPhoto[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PHOTOS);
      if (!data) {
        this.savePhotos(DEMO_PHOTOS);
        return DEMO_PHOTOS;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_PHOTOS;
    }
  },

  savePhotos(photos: TravelPhoto[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    } catch (e) {
      console.warn('Błąd zapisu zdjęć do localStorage (sprawdź limit pamięci):', e);
    }
  },

  // Albumy
  getAlbums(): TravelAlbum[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALBUMS);
      if (!data) {
        this.saveAlbums(DEMO_ALBUMS);
        return DEMO_ALBUMS;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_ALBUMS;
    }
  },

  saveAlbums(albums: TravelAlbum[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
    } catch (e) {
      console.warn('Błąd zapisu albumów:', e);
    }
  },

  // Trasy podróży
  getTrips(): TravelTrip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
      if (!data) {
        this.saveTrips(DEMO_TRIPS);
        return DEMO_TRIPS;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_TRIPS;
    }
  },

  saveTrips(trips: TravelTrip[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.warn('Błąd zapisu tras:', e);
    }
  },

  // Pakiety map offline
  getOfflinePackages(): OfflineMapPackage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_PACKAGES);
      if (!data) {
        this.saveOfflinePackages(DEMO_OFFLINE_PACKAGES);
        return DEMO_OFFLINE_PACKAGES;
      }
      return JSON.parse(data);
    } catch {
      return DEMO_OFFLINE_PACKAGES;
    }
  },

  saveOfflinePackages(packages: OfflineMapPackage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_PACKAGES, JSON.stringify(packages));
    } catch (e) {
      console.warn('Błąd zapisu pakietów map:', e);
    }
  },

  // Ustawienia
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Błąd zapisu ustawień:', e);
    }
  },

  // Reset do danych demonstracyjnych
  resetToDemo(): void {
    this.savePhotos(DEMO_PHOTOS);
    this.saveAlbums(DEMO_ALBUMS);
    this.saveTrips(DEMO_TRIPS);
    this.saveOfflinePackages(DEMO_OFFLINE_PACKAGES);
  },

  // Wyczyszczenie danych demonstracyjnych i pozostawienie tylko własnych
  clearDemoData(): void {
    const photos = this.getPhotos().filter(p => !p.isDemo);
    const albums = this.getAlbums().filter(a => !a.isDemo);
    this.savePhotos(photos);
    this.saveAlbums(albums);
  },

  // Eksport całej bazy do pliku .prezent (kopia zapasowa)
  exportPrezentBackup(): string {
    const backup = {
      app: 'Prezent',
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      photos: this.getPhotos(),
      albums: this.getAlbums(),
      trips: this.getTrips(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import z pliku .prezent
  importPrezentBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.app !== 'Prezent' || !Array.isArray(data.photos)) {
        throw new Error('Nieprawidłowy format pliku kopii zapasowej .prezent');
      }
      if (data.photos) this.savePhotos(data.photos);
      if (data.albums) this.saveAlbums(data.albums);
      if (data.trips) this.saveTrips(data.trips);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Błąd importu kopii zapasowej:', e);
      return false;
    }
  }
};
