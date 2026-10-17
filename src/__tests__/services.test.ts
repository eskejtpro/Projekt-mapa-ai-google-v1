import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, DEFAULT_SETTINGS } from '../services/storage';
import { guessNearestLocation, formatCoordinates } from '../services/geoService';
import { READY_TRAVEL_PACKS, convertPackToPhotosAndAlbum } from '../data/travelPacks';
import { TravelPhoto, TravelTrip, TravelAlbum } from '../types/travel';

// Mock localStorage dla środowiska Node.js w Vitest
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, String(val)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() { return storageMap.size; },
  key: (i: number) => Array.from(storageMap.keys())[i] || null,
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('oblicza rzetelne statystyki podróży (getTravelStats)', () => {
    const mockPhotos: TravelPhoto[] = [
      {
        id: 'p1',
        url: 'https://example.com/1.jpg',
        title: 'Gdańsk',
        date: '2023-07-15',
        location: { lat: 54.35, lng: 18.64, cityName: 'Gdańsk', countryName: 'Polska', countryCode: 'PL' },
        albumId: 'a1',
        notes: 'Wspaniały spacer nad Motławą',
        participants: ['Jan', 'Anna'],
        tags: ['Wakacje'],
        isFavorite: true,
      },
      {
        id: 'p2',
        url: 'https://example.com/2.jpg',
        title: 'Rzym',
        date: '2024-05-10',
        location: { lat: 41.9, lng: 12.5, cityName: 'Rzym', countryName: 'Włochy', countryCode: 'IT' },
        albumId: 'a2',
        notes: 'Koloseum i Fontanna di Trevi',
        participants: ['Jan'],
        tags: ['Zabytki'],
        isFavorite: false,
      },
    ];

    const mockTrips: TravelTrip[] = [
      {
        id: 't1',
        title: 'Wyprawa do Włoch',
        description: 'Podróż objazdowa',
        coverPhotoUrl: 'https://example.com/cover.jpg',
        color: '#f59e0b',
        year: 2024,
        totalDistanceKm: 1850,
        routePoints: [],
      },
    ];

    const mockAlbums: TravelAlbum[] = [
      { id: 'a1', name: 'Bałtyk', description: 'Album z wakacji nad morzem', coverUrl: '', year: 2023, country: 'Polska' },
      { id: 'a2', name: 'Italia', description: 'Album z wycieczki do Włoch', coverUrl: '', year: 2024, country: 'Włochy' },
    ];

    const stats = StorageService.getTravelStats(mockPhotos, mockTrips, mockAlbums);

    expect(stats.totalPhotos).toBe(2);
    expect(stats.totalAlbums).toBe(2);
    expect(stats.totalTrips).toBe(1);
    expect(stats.totalDistanceKm).toBe(1850);
    expect(stats.countriesVisited).toContain('Polska');
    expect(stats.countriesVisited).toContain('Włochy');
    expect(stats.citiesVisited).toContain('Gdańsk');
    expect(stats.citiesVisited).toContain('Rzym');
    expect(stats.earliestYear).toBe(2023);
    expect(stats.latestYear).toBe(2024);
  });

  it('poprawnie wykrywa duplikaty zdjęć (findDuplicates)', () => {
    const mockPhotos: TravelPhoto[] = [
      {
        id: 'p1',
        url: 'url1',
        title: 'Plaża',
        fileName: 'DSC_0001.JPG',
        date: '2023-07-15',
        location: { lat: 54.35, lng: 18.64, cityName: 'Gdańsk', countryName: 'Polska', countryCode: 'PL' },
        albumId: 'a1',
        notes: 'Dzień na plaży',
        participants: [],
        tags: [],
        isFavorite: false,
      },
      {
        id: 'p2',
        url: 'url2',
        title: 'Plaża Kopia',
        fileName: 'DSC_0001.JPG', // Ta sama nazwa pliku
        date: '2023-07-15',
        location: { lat: 54.35, lng: 18.64, cityName: 'Gdańsk', countryName: 'Polska', countryCode: 'PL' },
        albumId: 'a1',
        notes: 'Dzień na plaży - kopia',
        participants: [],
        tags: [],
        isFavorite: false,
      },
      {
        id: 'p3',
        url: 'url3',
        title: 'Inne zdjęcie',
        fileName: 'DSC_9999.JPG',
        date: '2023-07-16',
        location: { lat: 50.06, lng: 19.94, cityName: 'Kraków', countryName: 'Polska', countryCode: 'PL' },
        albumId: 'a1',
        notes: 'Rynek Główny',
        participants: [],
        tags: [],
        isFavorite: false,
      },
    ];

    const duplicateGroups = StorageService.findDuplicates(mockPhotos);
    expect(duplicateGroups.length).toBe(1);
    expect(duplicateGroups[0].duplicates.length).toBe(2);
  });

  it('eksportuje i importuje kopię zapasową .prezent z zachowaniem spójności struktury', () => {
    const jsonStr = StorageService.exportPrezentBackup(false);
    expect(jsonStr).toBeDefined();

    const parsed = JSON.parse(jsonStr);
    expect(parsed.app).toBe('Prezent Mapy');
    expect(Array.isArray(parsed.photos)).toBe(true);
    expect(Array.isArray(parsed.albums)).toBe(true);

    const importSuccess = StorageService.importPrezentBackup(jsonStr);
    expect(importSuccess).toBe(true);
  });
});

describe('geoService', () => {
  it('dopasowuje najbliższą znaną lokalizację na podstawie współrzędnych geograficznych', () => {
    // Koordynaty blisko Gdańska
    const gdanskGuess = guessNearestLocation(54.36, 18.65);
    expect(gdanskGuess.cityName).toBe('Gdańsk / Trójmiasto');
    expect(gdanskGuess.countryCode).toBe('PL');

    // Koordynaty blisko Rzymu
    const romeGuess = guessNearestLocation(41.89, 12.49);
    expect(romeGuess.cityName).toBe('Rzym');
    expect(romeGuess.countryCode).toBe('IT');
  });

  it('prawidłowo formatuje współrzędne w formacie N/S E/W', () => {
    const formatted = formatCoordinates(54.352, 18.6466);
    expect(formatted).toContain('54.3520° N');
    expect(formatted).toContain('18.6466° E');
  });
});

describe('travelPacks', () => {
  it('posiada predefiniowane pakiety podróżnicze i poprawnie konwertuje je na zdjęcia i album', () => {
    expect(READY_TRAVEL_PACKS.length).toBeGreaterThan(0);
    const tatryPack = READY_TRAVEL_PACKS[0];
    const { photos, album } = convertPackToPhotosAndAlbum(tatryPack);

    expect(album.id).toBeDefined();
    expect(album.name).toBe(tatryPack.name);
    expect(photos.length).toBe(tatryPack.photos.length);
    expect(photos[0].albumId).toBe(album.id);
    expect(photos[0].location.lat).toBe(tatryPack.photos[0].lat);
  });

  it('obsługuje i zapisuje własną kolejność zdjęć w katalogu (customPhotoOrder)', () => {
    const album: TravelAlbum = {
      id: 'album-tatry',
      name: 'Tatry Polskie',
      description: 'Górskie szlaki',
      coverUrl: 'https://example.com/tatry.jpg',
      year: 2023,
      country: 'Polska',
      customPhotoOrder: ['photo-3', 'photo-1', 'photo-2'],
    };

    StorageService.saveAlbums([album]);
    const loaded = StorageService.getAlbums();
    expect(loaded[0].customPhotoOrder).toEqual(['photo-3', 'photo-1', 'photo-2']);

    // Test sortowania zdjęć według customPhotoOrder
    const samplePhotos: TravelPhoto[] = [
      { id: 'photo-1', title: 'Zdjęcie 1', url: '', date: '2023-01-01', location: { lat: 0, lng: 0, cityName: '', countryName: '', countryCode: '' }, albumId: 'album-tatry', notes: '', participants: [], tags: [], isFavorite: false },
      { id: 'photo-2', title: 'Zdjęcie 2', url: '', date: '2023-01-02', location: { lat: 0, lng: 0, cityName: '', countryName: '', countryCode: '' }, albumId: 'album-tatry', notes: '', participants: [], tags: [], isFavorite: false },
      { id: 'photo-3', title: 'Zdjęcie 3', url: '', date: '2023-01-03', location: { lat: 0, lng: 0, cityName: '', countryName: '', countryCode: '' }, albumId: 'album-tatry', notes: '', participants: [], tags: [], isFavorite: false },
    ];

    const orderMap = new Map<string, number>();
    album.customPhotoOrder!.forEach((id, idx) => orderMap.set(id, idx));
    const sorted = [...samplePhotos].sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));

    expect(sorted.map(p => p.id)).toEqual(['photo-3', 'photo-1', 'photo-2']);
  });
});
