import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe2, 
  Image as ImageIcon, 
  Upload, 
  Play, 
  Tv, 
  WifiOff, 
  Smartphone, 
  FolderHeart, 
  Compass, 
  MapPin, 
  Layers, 
  RotateCcw, 
  SlidersHorizontal, 
  HardDrive, 
  Info,
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FolderOpen,
  Folder,
  Clock,
  Navigation
} from 'lucide-react';

import { TravelPhoto, TravelAlbum, TravelTrip, OfflineMapPackage, MapTileProvider, AppSettings, TravelStats } from './types/travel';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';

import { WindowsTitleBar } from './components/WindowsTitleBar';
import { SidebarDock, ActiveNavTab } from './components/SidebarDock';
import { AboutModal } from './components/AboutModal';
import { MapView } from './components/MapView';
import { GalleryView } from './components/GalleryView';
import { SettingsView } from './components/SettingsView';
import { StatsView } from './components/StatsView';
import { DuplicatesView } from './components/DuplicatesView';
import { ImportModal } from './components/ImportModal';
import { SlideshowModal } from './components/SlideshowModal';
import { TvModeModal } from './components/TvModeModal';
import { OfflineMapsModal } from './components/OfflineMapsModal';
import { AndroidSyncModal } from './components/AndroidSyncModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';

export default function App() {
  // Baza danych wspomnień
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [albums, setAlbums] = useState<TravelAlbum[]>([]);
  const [trips, setTrips] = useState<TravelTrip[]>([]);
  const [offlinePackages, setOfflinePackages] = useState<OfflineMapPackage[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Okno Windows 10/11
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Aktywny widok
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('map');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Modale narzędziowe
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState<boolean>(false);
  const [slideshowPhotos, setSlideshowPhotos] = useState<TravelPhoto[]>([]);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState<number>(0);
  const [isTvModeOpen, setIsTvModeOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isAndroidSyncOpen, setIsAndroidSyncOpen] = useState<boolean>(false);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<TravelPhoto | null>(null);

  // Załadowanie danych
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    const p = StorageService.getPhotos();
    const a = StorageService.getAlbums();
    const t = StorageService.getTrips();
    const pkg = StorageService.getOfflinePackages();
    const s = StorageService.getSettings();

    setPhotos(p);
    setAlbums(a);
    setTrips(t);
    setOfflinePackages(pkg);
    setSettings(s);
  };

  // Statystyki
  const stats: TravelStats = useMemo(() => {
    return StorageService.getTravelStats(photos, trips, albums);
  }, [photos, trips, albums]);

  // Duplikaty
  const duplicateGroups = useMemo(() => {
    return StorageService.findDuplicates(photos);
  }, [photos]);

  // Obsługa dodania zdjęć z importu
  const handleImportComplete = (newPhotos: TravelPhoto[], newAlbum?: TravelAlbum) => {
    const updatedPhotos = [...newPhotos, ...photos];
    setPhotos(updatedPhotos);
    StorageService.savePhotos(updatedPhotos);

    if (newAlbum) {
      const updatedAlbums = [newAlbum, ...albums];
      setAlbums(updatedAlbums);
      StorageService.saveAlbums(updatedAlbums);
    }
  };

  // Ulubione
  const handleToggleFavorite = (id: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
    setPhotos(updated);
    StorageService.savePhotos(updated);
  };

  // Usunięcie zdjęcia
  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    StorageService.savePhotos(updated);
  };

  // Aktualizacja zdjęcia po edycji
  const handleUpdatePhoto = (updatedPhoto: TravelPhoto) => {
    const updated = photos.map(p => p.id === updatedPhoto.id ? updatedPhoto : p);
    setPhotos(updated);
    StorageService.savePhotos(updated);
    setSelectedPhotoForDetail(updatedPhoto);
  };

  // Zapis ustawień
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // Czyszczenie pamięci podręcznej kafelków
  const handleClearCache = () => {
    const freed = StorageService.clearMapCache();
    loadAllData();
    alert(`Wyczyszczono pamięć podręczną map offline. Zwolniono ~${freed} MB.`);
  };

  // Reset ustawień
  const handleResetSettings = () => {
    if (confirm('Czy chcesz przywrócić domyślne ustawienia programu Prezent?')) {
      handleUpdateSettings(DEFAULT_SETTINGS);
    }
  };

  // Start pokazu slajdów
  const handleStartSlideshow = (customList?: TravelPhoto[], startIndex: number = 0) => {
    const list = customList && customList.length > 0 ? customList : photos;
    setSlideshowPhotos(list);
    setSlideshowStartIndex(startIndex);
    setIsSlideshowOpen(true);
  };

  // Reset do demo
  const handleResetDemo = () => {
    if (confirm('Czy na pewno chcesz przywrócić fabryczny zestaw demonstracyjnych podróży rodzinnych?')) {
      StorageService.resetToDemo();
      loadAllData();
    }
  };

  // Wyczyszczenie demo
  const handleClearDemo = () => {
    if (confirm('Czy chcesz usunąć wszystkie przykładowe wspomnienia demonstracyjne i zostawić tylko swoje własne zdjęcia?')) {
      StorageService.clearDemoData();
      loadAllData();
    }
  };

  const handleOpenWindowsFolder = () => {
    alert(`Otwieranie folderu w systemie Windows:\nexplorer.exe "${settings.windowsPhotosPath}"`);
  };

  const handleCloseApp = () => {
    if (confirm('Czy chcesz zamknąć aplikację Prezent?')) {
      setIsWindowMinimized(true);
    }
  };

  const demoPhotosCount = photos.filter(p => p.isDemo).length;
  const userPhotosCount = photos.filter(p => !p.isDemo).length;

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-hidden ${
      settings.interfaceTheme === 'light' ? 'bg-slate-100' : 'bg-[#070b14]'
    }`}>
      {/* TŁO PULPITU WINDOWS 11 GDY OKNO NIE JEST ZMAKSYMALIZOWANE */}
      {!isWindowMaximized && (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#0a1224] to-[#122345] flex items-center justify-center p-3 sm:p-5 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/4" />
          <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/4" />
        </div>
      )}

      {/* PASEK ZMINIMALIZOWANEGO OKNA W PASKU ZADAŃ */}
      {isWindowMinimized ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-30">
          <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-md animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center shadow-lg text-slate-950 font-black mx-auto">
              <Globe2 className="w-10 h-10 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Okno programu Prezent jest zminimalizowane</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aplikacja działa w tle w systemie Windows 10/11. Kliknij poniżej, aby powrócić do przeglądania wspomnień.
              </p>
            </div>
            <button
              onClick={() => setIsWindowMinimized(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              Przywróć okno programu
            </button>
          </div>
        </div>
      ) : (
        /* KONTENER OKNA APLIKACJI WINDOWS */
        <div
          className={`flex flex-col z-20 transition-all duration-200 ${
            isWindowMaximized
              ? 'w-full h-screen'
              : 'w-full max-w-7xl h-[95vh] mx-auto my-auto rounded-2xl border border-slate-700/80 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-[#090d18]'
          }`}
        >
          {/* 1. Belka Tytułowa Okna Windows 10/11 (Titlebar + Menu) */}
          <WindowsTitleBar
            isMaximized={isWindowMaximized}
            onToggleMaximize={() => setIsWindowMaximized(!isWindowMaximized)}
            onMinimize={() => setIsWindowMinimized(true)}
            onCloseApp={handleCloseApp}
            onOpenImport={() => setIsImportOpen(true)}
            onStartSlideshow={() => handleStartSlideshow()}
            onOpenTvMode={() => setIsTvModeOpen(true)}
            onOpenOfflineMaps={() => setIsOfflineModalOpen(true)}
            onOpenAndroidSync={() => setIsAndroidSyncOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            onOpenWindowsFolder={handleOpenWindowsFolder}
            onSelectTab={(tab) => setActiveTab(tab)}
          />

          {/* 2. Główny Układ Okna: Boczny Dock Ikon (Obraz 3) + Obszar Roboczy */}
          <div className="flex-1 flex overflow-hidden">
            {/* Wąski Dock Ikon po lewej stronie */}
            <SidebarDock
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              onOpenImport={() => setIsImportOpen(true)}
              onStartSlideshow={() => handleStartSlideshow()}
              onOpenTvMode={() => setIsTvModeOpen(true)}
              onOpenOfflineMaps={() => setIsOfflineModalOpen(true)}
              onOpenAndroidSync={() => setIsAndroidSyncOpen(true)}
              photosCount={photos.length}
              duplicateCount={duplicateGroups.length}
              transparentSidebar={settings.transparentSidebar}
            />

            {/* Obszar Roboczy Wybranego Widoku */}
            <main className="flex-1 flex flex-col p-4 md:p-5 overflow-y-auto bg-[#070b14]">
              {/* WIDOK 1: MAPA ŚWIATA (Wzorowana na Obrazie 3) */}
              {activeTab === 'map' && (
                <div className="flex-1 flex flex-col space-y-3 min-h-[500px]">
                  <MapView
                    photos={photos}
                    trips={trips}
                    selectedTripId={selectedTripId}
                    onSelectPhoto={(photo) => setSelectedPhotoForDetail(photo)}
                    onStartSlideshow={(customList) => handleStartSlideshow(customList)}
                    tileProvider={settings.defaultMapLayer}
                    onChangeTileProvider={(p) => handleUpdateSettings({ ...settings, defaultMapLayer: p })}
                    showAnimatedRoutes={settings.showAnimatedRoutes}
                  />

                  {/* Szybki filtr tras pod mapą */}
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" /> Wyprawa na mapie:
                      </span>
                      <button
                        onClick={() => setSelectedTripId(null)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                          selectedTripId === null
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        Wszystkie
                      </button>
                      {trips.map(trip => (
                        <button
                          key={trip.id}
                          onClick={() => setSelectedTripId(trip.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                            selectedTripId === trip.id
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          {trip.title} ({trip.year})
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Baza: {photos.length} zdjęć</span>
                      <button
                        onClick={() => setActiveTab('gallery')}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        Przeglądaj galerię →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WIDOK 2: WSZYSTKIE ZDJĘCIA & GALERIA (Wzorowana na Obrazie 2 - Windows Photos) */}
              {activeTab === 'gallery' && (
                <GalleryView
                  photos={photos}
                  albums={albums}
                  trips={trips}
                  onSelectPhoto={(photo) => setSelectedPhotoForDetail(photo)}
                  onToggleFavorite={handleToggleFavorite}
                  onDeletePhoto={handleDeletePhoto}
                  onStartSlideshow={(list) => handleStartSlideshow(list)}
                  onSelectAlbum={(id) => setSelectedAlbumId(id)}
                  selectedAlbumId={selectedAlbumId}
                  density={settings.galleryDensity}
                  showExifBadges={settings.showExifBadges}
                />
              )}

              {/* WIDOK 3: ALBUMY I INTELIGENTNE KOLEKCJE */}
              {activeTab === 'albums' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Folder className="w-5 h-5 text-amber-400" />
                        Albumy i Kolekcje Podróżnicze
                      </h2>
                      <p className="text-xs text-slate-400">
                        Podróże podzielone na albumy rodzinne oraz kolekcje inteligentne.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsImportOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Utwórz nowy album z importu
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {albums.map(album => {
                      const count = photos.filter(p => p.albumId === album.id).length;
                      return (
                        <div
                          key={album.id}
                          onClick={() => {
                            setSelectedAlbumId(album.id);
                            setActiveTab('gallery');
                          }}
                          className="group bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-amber-500/60 hover:shadow-2xl transition-all cursor-pointer flex flex-col"
                        >
                          <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-950">
                            <img
                              src={album.coverUrl}
                              alt={album.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/30">
                              {album.country} • {album.year}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                              {count} {count === 1 ? 'zdjęcie' : 'zdjęć'}
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                                {album.name}
                              </h3>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {album.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                              <span>Otwórz album</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WIDOK 4: OŚ CZASU (CHRONOLOGIA) */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Oś Czasu Wspomnień
                    </h2>
                    <p className="text-xs text-slate-400">
                      Wyprawy ułożone chronologicznie z etapami podróży i kluczowymi fotografiami.
                    </p>
                  </div>

                  <div className="space-y-6 pl-4 border-l-2 border-slate-800">
                    {trips.map(trip => {
                      const tripPhotos = photos.filter(p => {
                        if (trip.id === 'trip-italy-2024') return p.location.countryCode === 'IT';
                        if (trip.id === 'trip-greece-2023') return p.location.countryCode === 'GR';
                        if (trip.id === 'trip-poland-tatry') return p.location.countryCode === 'PL';
                        if (trip.id === 'trip-japan-spring') return p.location.countryCode === 'JP';
                        if (trip.id === 'trip-norway-fjords') return p.location.countryCode === 'NO';
                        return false;
                      });

                      return (
                        <div key={trip.id} className="relative bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                {trip.year}
                              </span>
                              <h3 className="text-lg font-bold text-white mt-1">{trip.title}</h3>
                              <p className="text-xs text-slate-400 max-w-xl mt-0.5">{trip.description}</p>
                            </div>

                            <button
                              onClick={() => handleStartSlideshow(tripPhotos)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Pokaz slajdów ({tripPhotos.length})
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            {tripPhotos.slice(0, 4).map(p => (
                              <div
                                key={p.id}
                                onClick={() => setSelectedPhotoForDetail(p)}
                                className="aspect-4/3 rounded-xl overflow-hidden cursor-pointer border border-slate-800 bg-slate-950 group relative"
                              >
                                <img src={p.thumbnailUrl || p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />
                                <div className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white truncate">
                                  {p.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WIDOK 5: PREZENTACJA TRAS PODRÓŻY */}
              {activeTab === 'trips' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-amber-400" />
                        Prezentacja Wypraw i Tras Podróżniczych
                      </h2>
                      <p className="text-xs text-slate-400">
                        Szczegółowe etapy podróży z dystansem w {settings.distanceUnit === 'km' ? 'kilometrach' : 'milach'}.
                      </p>
                    </div>

                    <button
                      onClick={() => handleStartSlideshow()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Prezentuj wszystkie trasy
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {trips.map(trip => (
                      <div
                        key={trip.id}
                        className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-amber-500/50 transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-950">
                          <img src={trip.coverPhotoUrl} alt={trip.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 px-2.5 py-0.5 rounded text-xs font-bold text-amber-400 border border-amber-500/30">
                            {trip.year}
                          </div>
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                            <span className="font-semibold text-emerald-400">~{trip.totalDistanceKm} km</span>
                            <span className="font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded">
                              {trip.routePoints.length} etapów
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-white text-base">{trip.title}</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{trip.description}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTripId(trip.id);
                                setActiveTab('map');
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                            >
                              <Compass className="w-3.5 h-3.5 text-amber-400" />
                              Pokaż na mapie
                            </button>
                            <button
                              onClick={() => {
                                const trPhotos = photos.filter(p => {
                                  if (trip.id === 'trip-italy-2024') return p.location.countryCode === 'IT';
                                  if (trip.id === 'trip-greece-2023') return p.location.countryCode === 'GR';
                                  if (trip.id === 'trip-poland-tatry') return p.location.countryCode === 'PL';
                                  if (trip.id === 'trip-japan-spring') return p.location.countryCode === 'JP';
                                  if (trip.id === 'trip-norway-fjords') return p.location.countryCode === 'NO';
                                  return false;
                                });
                                handleStartSlideshow(trPhotos);
                              }}
                              className="py-1.5 px-3 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                            >
                              Prezentuj
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WIDOK 6: STATYSTYKI PODRÓŻNIKA */}
              {activeTab === 'stats' && (
                <StatsView
                  stats={stats}
                  photos={photos}
                  trips={trips}
                  onSelectCountry={(c) => {
                    setActiveTab('gallery');
                  }}
                  onSelectCity={(city) => {
                    setActiveTab('map');
                  }}
                />
              )}

              {/* WIDOK 7: DIAGNOSTYKA DUPLIKATÓW */}
              {activeTab === 'duplicates' && (
                <DuplicatesView
                  photos={photos}
                  onDeletePhoto={handleDeletePhoto}
                  onSelectPhoto={(photo) => setSelectedPhotoForDetail(photo)}
                />
              )}

              {/* WIDOK 8: EKSPLORATOR WINDOWS */}
              {activeTab === 'windows' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-indigo-400" />
                      Eksplorator Windows & Zarządzanie Danymi
                    </h2>
                    <p className="text-xs text-slate-400">
                      Zarządzaj lokalnymi plikami w systemie Windows 10/11, twórz kopie zapasowe i sprawdzaj status offline.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <FolderHeart className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Katalog Obrazów w Windows</h3>
                          <p className="text-[11px] text-slate-400">Ścieżka do zdjęć na dysku komputera</p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Lokalizacja na dysku:</span>
                        <div className="text-slate-200 select-all break-all">
                          {settings.windowsPhotosPath}
                        </div>
                      </div>

                      <button
                        onClick={handleOpenWindowsFolder}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Otwórz folder w Eksploratorze Windows
                      </button>
                    </div>

                    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Prywatne Przechowywanie (Offline)</h3>
                          <p className="text-[11px] text-slate-400">100% lokalnie, brak wymogu połączenia z chmurą</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Wspomnienia demonstracyjne:</span>
                          <span className="font-bold text-amber-400">{demoPhotosCount} zdjęć</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Twoje własne zdjęcia:</span>
                          <span className="font-bold text-emerald-400">{userPhotosCount} zdjęć</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleClearDemo}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 text-xs font-semibold border border-slate-700"
                        >
                          Wyczyść demo
                        </button>
                        <button
                          onClick={handleResetDemo}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Przywróć demo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WIDOK 9: 12-KATEGORIALNY PANEL USTAWIEŃ (Wzorowany na Obrazie 1) */}
              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onClearCache={handleClearCache}
                  onResetSettings={handleResetSettings}
                  photosCount={photos.length}
                />
              )}
            </main>
          </div>

          {/* 3. Klasyczny Pasek Stanu Windows (Status Bar) na dole okna */}
          <footer className="bg-[#121828] border-t border-slate-800 px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Gotowy
              </span>
              <span className="text-slate-600">|</span>
              <span className="truncate max-w-xs text-slate-300 font-mono text-[10px]">
                {settings.windowsPhotosPath}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                Baza: <strong className="text-white">{photos.length}</strong> fotografii w {albums.length} albumach
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 hidden md:inline">
                Prywatność: <span className="text-emerald-400 font-semibold">100% Offline</span>
              </span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <button
                onClick={() => setIsAboutOpen(true)}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                O programie
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* MODALE APLIKACJI */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        photosCount={photos.length}
        albumsCount={albums.length}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        albums={albums}
        onImportComplete={handleImportComplete}
      />

      <SlideshowModal
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        photos={slideshowPhotos}
        initialIndex={slideshowStartIndex}
      />

      <TvModeModal
        isOpen={isTvModeOpen}
        onClose={() => setIsTvModeOpen(false)}
        photos={photos}
        trips={trips}
        onStartSlideshow={(list) => handleStartSlideshow(list)}
      />

      <OfflineMapsModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        packages={offlinePackages}
        onUpdatePackages={(pkgs) => {
          setOfflinePackages(pkgs);
          StorageService.saveOfflinePackages(pkgs);
        }}
        isOfflineMode={settings.offlineSimulationMode}
        onToggleOfflineMode={(enabled) => {
          handleUpdateSettings({ ...settings, offlineSimulationMode: enabled });
        }}
      />

      <AndroidSyncModal
        isOpen={isAndroidSyncOpen}
        onClose={() => setIsAndroidSyncOpen(false)}
        onDataRestored={loadAllData}
      />

      <PhotoDetailModal
        photo={selectedPhotoForDetail}
        onClose={() => setSelectedPhotoForDetail(null)}
        onUpdatePhoto={handleUpdatePhoto}
        onDeletePhoto={handleDeletePhoto}
        onStartSlideshowFromThis={(p) => {
          const idx = photos.findIndex(ph => ph.id === p.id);
          handleStartSlideshow(photos, Math.max(0, idx));
        }}
      />
    </div>
  );
}
