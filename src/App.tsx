import React, { useState, useEffect } from 'react';
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
  FolderOpen
} from 'lucide-react';

import { TravelPhoto, TravelAlbum, TravelTrip, OfflineMapPackage, MapTileProvider } from './types/travel';
import { StorageService } from './services/storage';

import { WindowsTitleBar } from './components/WindowsTitleBar';
import { AboutModal } from './components/AboutModal';
import { MapView } from './components/MapView';
import { GalleryView } from './components/GalleryView';
import { ImportModal } from './components/ImportModal';
import { SlideshowModal } from './components/SlideshowModal';
import { TvModeModal } from './components/TvModeModal';
import { OfflineMapsModal } from './components/OfflineMapsModal';
import { AndroidSyncModal } from './components/AndroidSyncModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';

export default function App() {
  // Główne stany bazy danych wspomnień
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [albums, setAlbums] = useState<TravelAlbum[]>([]);
  const [trips, setTrips] = useState<TravelTrip[]>([]);
  const [offlinePackages, setOfflinePackages] = useState<OfflineMapPackage[]>([]);

  // Okno Windows 10/11
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Stany widoków
  const [activeTab, setActiveTab] = useState<'map' | 'gallery' | 'trips' | 'windows'>('map');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('dark');
  const [isOfflineSimulation, setIsOfflineSimulation] = useState<boolean>(false);

  // Modale
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState<boolean>(false);
  const [slideshowPhotos, setSlideshowPhotos] = useState<TravelPhoto[]>([]);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState<number>(0);
  const [isTvModeOpen, setIsTvModeOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isAndroidSyncOpen, setIsAndroidSyncOpen] = useState<boolean>(false);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<TravelPhoto | null>(null);

  // Ładowanie początkowe z lokalnego magazynu
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
    setTileProvider(s.defaultMapLayer);
    setIsOfflineSimulation(s.offlineSimulationMode);
  };

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
    alert('Otwieranie folderu w systemie Windows:\nexplorer.exe "C:\\Users\\Rodzina\\Obrazy\\Prezent-Wspomnienia"');
  };

  const handleCloseApp = () => {
    if (confirm('Czy chcesz zamknąć aplikację Prezent?')) {
      setIsWindowMinimized(true);
    }
  };

  const demoPhotosCount = photos.filter(p => p.isDemo).length;
  const userPhotosCount = photos.filter(p => !p.isDemo).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      {/* TŁO PULPITU WINDOWS 11 JEŚLI OKNO JEST ZMNIEJSZONE LUB ZMINIMALIZOWANE */}
      {!isWindowMaximized && (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#0d1527] to-[#172554] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
          {/* Subtelna abstrakcyjna tapeta Windows 11 */}
          <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/4" />
          <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/4" />
        </div>
      )}

      {/* PASEK ZMINIMALIZOWANEGO OKNA W PASKU ZADAŃ WINDOWS */}
      {isWindowMinimized ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-30">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-md animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center shadow-lg text-slate-950 font-black mx-auto">
              <Globe2 className="w-10 h-10 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Okno programu Prezent jest zminimalizowane</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aplikacja działa w tle w systemie Windows 10/11. Kliknij poniżej, aby przywrócić okno na pulpit.
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
              : 'w-full max-w-7xl h-[94vh] mx-auto my-auto rounded-xl border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden bg-slate-950'
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

          {/* 2. Pasek Narzędzi i Nawigacji Programu Prezent */}
          <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
            {/* Zakładki programu */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto w-full md:w-auto">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Compass className="w-4 h-4" />
                Interaktywna Mapa Świata
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'gallery'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Galeria & Albumy ({photos.length})
              </button>
              <button
                onClick={() => setActiveTab('trips')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'trips'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Trasy Podróży ({trips.length})
              </button>
              <button
                onClick={() => setActiveTab('windows')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'windows'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <HardDrive className="w-4 h-4" />
                Eksplorator Windows & Narzędzia
              </button>
            </div>

            {/* Szybkie przyciski akcji */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                title="Wybierz zdjęcia lub cały folder z dysku"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Importuj zdjęcia</span>
              </button>

              <button
                onClick={() => handleStartSlideshow()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                title="Rozpocznij kinowy pokaz slajdów (Spacja)"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Pokaz slajdów</span>
              </button>

              <button
                onClick={() => setIsTvModeOpen(true)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 transition-all cursor-pointer"
                title="Tryb TV / Salon 4K"
              >
                <Tv className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOfflineModalOpen(true)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 border border-slate-700 transition-all cursor-pointer"
                title="Mapy Offline"
              >
                <WifiOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Główny Obszar Treści w Oknie */}
          <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-slate-950">
            {/* ZAKŁADKA 1: MAPA ŚWIATA */}
            {activeTab === 'map' && (
              <div className="flex-1 flex flex-col space-y-3 min-h-[480px]">
                <MapView
                  photos={photos}
                  trips={trips}
                  selectedTripId={selectedTripId}
                  onSelectPhoto={(photo) => setSelectedPhotoForDetail(photo)}
                  onStartSlideshow={(customList) => handleStartSlideshow(customList)}
                  tileProvider={tileProvider}
                  onChangeTileProvider={(p) => {
                    setTileProvider(p);
                    const s = StorageService.getSettings();
                    StorageService.saveSettings({ ...s, defaultMapLayer: p });
                  }}
                />

                {/* Szybki filtr podróży */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> Trasa podróży:
                    </span>
                    <button
                      onClick={() => setSelectedTripId(null)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        selectedTripId === null
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Wszystkie na mapie
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

                  <span className="text-[11px] text-slate-400 font-mono">
                    Wspomnienia na mapie: {photos.length} zdjęć
                  </span>
                </div>
              </div>
            )}

            {/* ZAKŁADKA 2: GALERIA I ALBUMY */}
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
              />
            )}

            {/* ZAKŁADKA 3: TRASY I PREZENTACJA WYPRAW */}
            {activeTab === 'trips' && (
              <div className="space-y-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-400" />
                      Prezentacja Wypraw i Tras Podróżniczych
                    </h2>
                    <p className="text-xs text-slate-400">
                      Wybierz podróż, aby wyświetlić jej trasę etapową, dystans i rozpocząć pokaz.
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartSlideshow()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-md cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Pokaz slajdów wszystkich podróży
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                      <div
                        key={trip.id}
                        className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-amber-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col"
                      >
                        <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-950">
                          <img
                            src={trip.coverPhotoUrl}
                            alt={trip.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur px-2.5 py-0.5 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/30">
                            {trip.year}
                          </div>
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                            <span className="font-semibold text-emerald-400">
                              {trip.totalDistanceKm ? `~${trip.totalDistanceKm} km` : 'Trasa'}
                            </span>
                            <span className="bg-slate-900/80 px-2 py-0.5 rounded-md font-mono text-[11px]">
                              {tripPhotos.length} zdjęć
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h3 className="text-base font-bold text-white">{trip.title}</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                              {trip.description}
                            </p>

                            <div className="mt-2.5 space-y-1 pt-2 border-t border-slate-800">
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Etapy trasy:</span>
                              <div className="flex flex-wrap gap-1">
                                {trip.routePoints.map((pt, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300"
                                  >
                                    {pt.order}. {pt.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTripId(trip.id);
                                setActiveTab('map');
                              }}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Compass className="w-3.5 h-3.5 text-amber-400" />
                              Mapa
                            </button>

                            <button
                              onClick={() => handleStartSlideshow(tripPhotos)}
                              className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-xs font-bold hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Prezentuj
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ZAKŁADKA 4: EKSPLORATOR WINDOWS & NARZĘDZIA */}
            {activeTab === 'windows' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-indigo-400" />
                    Centrum Programu Windows 10/11 & Pliki Robocze
                  </h2>
                  <p className="text-xs text-slate-400">
                    Oryginalne pliki w Eksploratorze Windows, prywatność danych, eksport do .prezent oraz synchronizacja.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
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
                        C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\
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

                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
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
          </div>

          {/* 4. Klasyczny Pasek Stanu Windows (Status Bar) na dole okna */}
          <div className="bg-[#182030] border-t border-slate-700/80 px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Gotowy
              </span>
              <span className="text-slate-600">|</span>
              <span className="truncate max-w-xs text-slate-300 font-mono text-[10px]">
                C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                Baza: <strong className="text-white">{photos.length}</strong> zdjęć ({trips.length} tras)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 hidden md:inline">
                Tryb: <span className="text-slate-300">Windows 10/11 Desktop</span>
              </span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <button
                onClick={() => setIsAboutOpen(true)}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                O programie
              </button>
            </div>
          </div>
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
        isOfflineMode={isOfflineSimulation}
        onToggleOfflineMode={(enabled) => {
          setIsOfflineSimulation(enabled);
          const s = StorageService.getSettings();
          StorageService.saveSettings({ ...s, offlineSimulationMode: enabled });
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
