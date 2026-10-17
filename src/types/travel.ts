export interface GeoLocation {
  lat: number;
  lng: number;
  cityName: string;
  countryName: string;
  countryCode: string; // np. 'IT', 'GR', 'PL', 'JP', 'NO'
  placeName?: string;
}

export interface TravelPhoto {
  id: string;
  url: string; // URL lub DataURL (base64)
  thumbnailUrl?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location: GeoLocation;
  albumId: string;
  notes: string;
  participants: string[]; // np. ['Mama', 'Tata', 'Zosia', 'Kacper']
  tags: string[]; // np. ['Plaża', 'Zachód słońca', 'Góry', 'Kulinaria']
  isFavorite: boolean;
  isDemo?: boolean;
  cameraInfo?: {
    make?: string;
    model?: string;
    focalLength?: string;
    iso?: string;
  };
  fileSize?: string;
  fileSizeBytes?: number;
  fileName?: string;
  contentHash?: string; // SHA-256 oryginalnej zawartości pliku
  localFilePath?: string; // np. "C:\Prezent\Zdjecia\Santorini_2024.jpg"
  duplicateGroup?: string;
}

export interface TravelTrip {
  id: string;
  title: string;
  description: string;
  year: number;
  coverPhotoUrl: string;
  color: string;
  routePoints: {
    lat: number;
    lng: number;
    name: string;
    order: number;
  }[];
  totalDistanceKm?: number;
  transportType?: 'car' | 'plane' | 'train' | 'camper' | 'foot';
}

export interface TravelAlbum {
  id: string;
  name: string;
  tripId?: string;
  description: string;
  coverUrl: string;
  year: number;
  country: string;
  isDemo?: boolean;
  isSmartAlbum?: boolean;
  smartFilter?: 'favorites' | 'nature' | 'family' | 'food' | 'recent';
}

export type MapTileProvider = 'dark' | 'satellite' | 'voyager' | 'light' | 'osm' | 'streets';

export interface OfflineMapPackage {
  id: string;
  name: string;
  region: string;
  estimatedSizeMb: number;
  bounds: [[number, number], [number, number]];
  isDownloaded: boolean;
  downloadProgress?: number;
  downloadDate?: string;
}

// 12-kategorialne ustawienia aplikacji Prezent
export interface AppSettings {
  // 1. Ogólne
  familyName: string;
  language: 'pl' | 'en';
  distanceUnit: 'km' | 'mi';
  autoStartWithWindows: boolean;

  // 2. Wygląd i personalizacja
  interfaceTheme: 'dark' | 'light' | 'system';
  accentColor: 'amber' | 'emerald' | 'indigo' | 'rose' | 'sky';
  transparentSidebar: boolean;
  galleryDensity: 'default' | 'compact' | 'large';

  // 3. Mapa i geolokalizacja
  defaultMapLayer: MapTileProvider;
  autoCenterOnPhotos: boolean;
  clusterRadius: number; // np. 50
  showAnimatedRoutes: boolean;
  showMapLabels: boolean;

  // 4. Galeria i zdjęcia
  defaultSortBy: 'date-desc' | 'date-asc' | 'location' | 'title';
  showExifBadges: boolean;
  groupPhotosByDate: boolean;
  autoDetectDuplicates: boolean;

  // 5. Import oraz foldery
  windowsPhotosPath: string;
  autoScanNewPhotos: boolean;
  readExifOnImport: boolean;
  compressLocalThumbnails: boolean;

  // 6. Pokaz slajdów
  slideshowInterval: number; // sekundy
  kenBurnsEnabled: boolean;
  slideshowTransition: 'fade' | 'slide' | 'zoom';
  ambientSoundEnabled: boolean;
  showMiniMapPip: boolean;

  // 7. Telewizor i prezentacja
  tvTargetResolution: '4k' | '1080p';
  tvFontSize: 'normal' | 'large' | 'huge';
  enableSmartRemoteQr: boolean;
  showCinematicCaptions: boolean;

  // 8. Pamięć i dane lokalne
  cacheLimitMb: number;
  offlineSimulationMode: boolean;

  // 9. Kopie zapasowe
  autoBackupIntervalDays: number;
  includeThumbnailsInBackup: boolean;

  // 10. Wydajność
  hardwareAcceleration: boolean;
  lazyLoadImages: boolean;
  maxRenderedMarkers: number;

  // 11. Prywatność
  stripGpsOnExport: boolean;
  saveSearchHistory: boolean;

  // 12. Informacje
  appVersion: string;
}

export interface TravelStats {
  totalPhotos: number;
  totalTrips: number;
  totalAlbums: number;
  countriesVisited: string[];
  citiesVisited: string[];
  totalDistanceKm: number;
  earliestYear: number;
  latestYear: number;
}
