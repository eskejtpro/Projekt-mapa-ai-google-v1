import React, { useState, useEffect, useMemo } from 'react';
import { removeAlbum } from './services/library-actions';
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
  Navigation,
  ArrowUpDown,
  FolderDown
} from 'lucide-react';

import { TravelPhoto, TravelAlbum, TravelTrip, OfflineMapPackage, MapTileProvider, AppSettings, TravelStats } from './types/travel';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';
import { validateBackup } from './services/backup-validation';

import { WindowsTitleBar } from './components/WindowsTitleBar';
import { SidebarDock, ActiveNavTab } from './components/SidebarDock';
import { AboutModal } from './components/AboutModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { MapView } from './components/MapView';
import { GalleryView } from './components/GalleryView';
import { SettingsView } from './components/SettingsView';
import { StatsView } from './components/StatsView';
import { DuplicatesView } from './components/DuplicatesView';
import { ImportModal, InitialImportLocation, ImportTabMode } from './components/ImportModal';
import { guessNearestLocation } from './services/geoService';
import { SlideshowModal } from './components/SlideshowModal';
import { TvModeModal } from './components/TvModeModal';
import { OfflineMapsModal } from './components/OfflineMapsModal';
import { AndroidSyncModal } from './components/AndroidSyncModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { CatalogOrganizerModal } from './components/CatalogOrganizerModal';
import { VideoPlayer } from './components/VideoPlayer';
import type { MediaItem } from './types/media';

export default function App() {
  // Baza danych wspomnień
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [albums, setAlbums] = useState<TravelAlbum[]>([]);
  const [trips, setTrips] = useState<TravelTrip[]>([]);
  const [offlinePackages, setOfflinePackages] = useState<OfflineMapPackage[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [reorderAlbum, setReorderAlbum] = useState<TravelAlbum | null>(null);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);

  // Okno Windows 10/11
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        showToast('Włączono tryb pełnego ekranu (F11)', 'info');
      }).catch(() => {
        setIsFullscreen(prev => !prev);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
          showToast('Wyłączono tryb pełnego ekranu', 'info');
        }).catch(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Globalna obsługa skrótu F11 i synchronizacja ze stanem przeglądarki
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleGlobalF11 = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', handleGlobalF11);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', handleGlobalF11);
    };
  }, []);

  // Aktywny widok
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('map');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Modale narzędziowe
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [importInitialLocation, setImportInitialLocation] = useState<InitialImportLocation | null>(null);
  const [importInitialMode, setImportInitialMode] = useState<ImportTabMode>('files');
  const [importInitialFiles, setImportInitialFiles] = useState<File[]>([]);
  const [importInitialAlbumId, setImportInitialAlbumId] = useState<string | null>(null);
  const [dragOverAlbumId, setDragOverAlbumId] = useState<string | null>(null);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState<boolean>(false);
  const [slideshowPhotos, setSlideshowPhotos] = useState<TravelPhoto[]>([]);
  const [slideshowStartIndex, setSlideshowStartIndex] = useState<number>(0);
  const [isTvModeOpen, setIsTvModeOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isAndroidSyncOpen, setIsAndroidSyncOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [selectedPhotoForDetail, setSelectedPhotoForDetail] = useState<TravelPhoto | null>(null);

  // System powiadomień i potwierdzeń w stylu Windows (zamiast alert / confirm)
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    isDanger?: boolean;
  } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(t => (t?.message === message ? null : t));
    }, 4000);
  };

  // Załadowanie danych
  useEffect(() => {
    loadAllData();
    void loadVideos();
    const unsubscribeBackup = window.electronAPI?.onBackupError(() => showToast('Nie udało się utworzyć automatycznej kopii. Sprawdź wolne miejsce i uprawnienia folderu danych.', 'warning'));
    if (window.electronAPI) {
      void window.electronAPI.systemInfo().then(info => {
        setSettings(previous => ({ ...previous, windowsPhotosPath: info.photosPath, autoStartWithWindows: info.autoStart }));
        if (!info.offlineMapAvailable) setOfflinePackages(previous => previous.map(pkg => ({ ...pkg, isDownloaded: false })));
      }).catch(() => showToast('Nie udało się odczytać ustawień Windows.', 'warning'));
    }
    return () => unsubscribeBackup?.();
  }, []);

  const loadAllData = () => {
    try {
    const p = StorageService.getPhotos();
    const a = StorageService.getAlbums();
    const t = StorageService.getTrips();
    const pkg = StorageService.getOfflinePackages();
    const s = StorageService.getSettings();
    validateBackup({ app: 'Prezent Mapy', photos: p, albums: a, trips: t, settings: s });

    setPhotos(p);
    setAlbums(a);
    setTrips(t);
    setOfflinePackages(pkg);
    setSettings(s);
    setLibraryError(null);
    } catch { setLibraryError('Nie udało się odczytać biblioteki. Zachowaj kopię plików danych przed przywracaniem.'); }
  };

  const loadVideos = async () => {
    if (!window.electronAPI) return;
    try { setVideos(await window.electronAPI.video.list() as unknown as MediaItem[]); } catch { showToast('Nie udało się odczytać biblioteki filmów.', 'warning'); }
  };

  const handleImportVideos = async () => {
    if (!window.electronAPI) { showToast('Import filmów wymaga aplikacji Windows.', 'warning'); return; }
    try {
      const imported = await window.electronAPI.video.import();
      await loadVideos();
      showToast(imported.length ? `Dodano ${imported.length} filmów do biblioteki.` : 'Nie wybrano filmów.', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Import filmu nie powiódł się.', 'warning'); }
  };

  const handleAssignVideo = async (video: MediaItem, albumId: string | null) => {
    try { await window.electronAPI?.video.setAlbum(video.id, albumId); await loadVideos(); showToast('Zapisano przypisanie filmu do albumu.', 'success'); }
    catch { showToast('Nie udało się przypisać filmu do albumu.', 'warning'); }
  };

  // Statystyki
  const stats: TravelStats = useMemo(() => {
    return StorageService.getTravelStats(photos, trips, albums);
  }, [photos, trips, albums]);

  // Duplikaty
  const duplicateGroups = useMemo(() => {
    return StorageService.findDuplicates(photos);
  }, [photos]);

  // Obsługa dodania zdjęć z importu z zabezpieczeniem przed duplikatami i obsługą limitu pamięci
  const handleImportComplete = (newPhotos: TravelPhoto[], newAlbum?: TravelAlbum) => {
    const identities = new Set(photos.filter(photo => photo.url.startsWith('data:image/')).map(photo => photo.url));
    const uniqueNew = newPhotos.filter(photo => {
      if (!settings.autoDetectDuplicates || !photo.url.startsWith('data:image/')) return true;
      if (identities.has(photo.url)) return false;
      identities.add(photo.url); return true;
    });
    const updatedPhotos = [...uniqueNew, ...photos];
    const updatedAlbums = newAlbum && !albums.some(album => album.id === newAlbum.id) ? [newAlbum, ...albums] : albums;
    if (!StorageService.saveLibrary(updatedPhotos, updatedAlbums)) { showToast('Nie zapisano importu. Sprawdź miejsce na dysku lub limit pamięci przeglądarki.', 'warning'); return false; }
    setPhotos(updatedPhotos);
    setAlbums(updatedAlbums);
    setImportInitialFiles([]);
    setImportInitialLocation(null);
    return true;
  };

  // Otwarcie centrum importu zdjęć z predefiniowaną lokalizacją (np. kliknięcie PPM na mapie lub z menu)
  const handleOpenImportWithLocation = (location?: InitialImportLocation, mode: ImportTabMode = 'files', files?: File[]) => {
    setImportInitialLocation(location || null);
    setImportInitialMode(mode);
    setImportInitialFiles(files || []);
    setIsImportOpen(true);
  };

  // Upuszczenie plików bezpośrednio na określony punkt mapy świata (Drag & Drop)
  const handleDropPhotosOnMap = (files: File[], lat: number, lng: number) => {
    const guess = guessNearestLocation(lat, lng);
    setImportInitialFiles(files);
    setImportInitialLocation({
      lat,
      lng,
      cityName: guess.cityName,
      countryName: guess.countryName,
      countryCode: guess.countryCode,
    });
    setImportInitialMode('files');
    setIsImportOpen(true);
    showToast(`Przeciągnięto ${files.length} zdjęć na mapę: ${guess.cityName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`, 'info');
  };

  // Upuszczenie plików bezpośrednio na określony katalog / album z Eksploratora Windows (Drag & Drop)
  const handleDropPhotosOnAlbum = (files: File[], targetAlbumId: string) => {
    const targetAlbum = albums.find(a => a.id === targetAlbumId);
    setImportInitialFiles(files);
    setImportInitialAlbumId(targetAlbumId);
    setImportInitialLocation(null);
    setImportInitialMode('files');
    setIsImportOpen(true);
    showToast(
      `Przeciągnięto ${files.length} ${files.length === 1 ? 'zdjęcie' : 'zdjęć'} do katalogu: ${targetAlbum?.name || 'Album'}`,
      'info'
    );
  };

  // Ulubione
  const handleToggleFavorite = (id: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
    if (!StorageService.savePhotos(updated)) { showToast('Nie zapisano zmiany ulubionych.', 'warning'); return false; }
    setPhotos(updated);
    return true;
  };

  // Usunięcie zdjęcia
  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id);
    if (!StorageService.savePhotos(updated)) { showToast('Nie zapisano usunięcia zdjęcia.', 'warning'); return false; }
    setPhotos(updated);
    return true;
  };

  // Aktualizacja zdjęcia po edycji
  const handleDeletePhotos = (ids: string[]) => {
    const requested = new Set(ids);
    const count = photos.filter(photo => requested.has(photo.id)).length;
    if (!count) return;
    setConfirmDialog({ title: 'Usuwanie zdjęć z biblioteki', message: `Usunąć ${count} zdjęć z biblioteki? Pliki źródłowe na dysku nie zostaną usunięte.`, confirmLabel: 'Usuń zdjęcia', isDanger: true, onConfirm: () => {
      const updated = photos.filter(photo => !requested.has(photo.id));
      if (!StorageService.savePhotos(updated)) { showToast('Nie zapisano usunięcia zdjęć.', 'warning'); return; }
      setPhotos(updated);
      setSelectedPhotoForDetail(null);
      showToast(`Usunięto ${count} zdjęć z biblioteki.`, 'success');
    }});
  };
  const handleDeleteAlbum = (id: string, deletePhotos: boolean) => {
    const album = albums.find(item => item.id === id);
    if (!album) return;
    setConfirmDialog({ title: 'Usuwanie albumu', message: `Usunąć album „${album.name}”${deletePhotos ? ' wraz ze zdjęciami z biblioteki' : ', zachowując zdjęcia bez przypisania'}? Pliki źródłowe pozostaną na dysku.`, confirmLabel: 'Usuń album', isDanger: true, onConfirm: () => {
      const { photos: updatedPhotos, albums: updatedAlbums } = removeAlbum(photos, albums, id, deletePhotos);
      if (!StorageService.saveLibrary(updatedPhotos, updatedAlbums)) { showToast('Nie zapisano usunięcia albumu.', 'warning'); return; }
      setPhotos(updatedPhotos); setAlbums(updatedAlbums); setSelectedAlbumId(null); setSelectedPhotoForDetail(null);
      showToast('Usunięto album.', 'success');
    }});
  };
  const handleUpdatePhoto = (updatedPhoto: TravelPhoto) => {
    const updated = photos.map(p => p.id === updatedPhoto.id ? updatedPhoto : p);
    if (!StorageService.savePhotos(updated)) { showToast('Nie zapisano edycji zdjęcia.', 'warning'); return false; }
    setPhotos(updated);
    setSelectedPhotoForDetail(updatedPhoto);
    return true;
  };

  // Zapis ustawień
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    try {
      if (window.electronAPI && newSettings.autoStartWithWindows !== settings.autoStartWithWindows) await window.electronAPI.setAutoStart(newSettings.autoStartWithWindows);
      if (!StorageService.saveSettings(newSettings)) throw new Error('Błąd zapisu');
      setSettings(newSettings);
    } catch { showToast('Nie udało się zapisać ustawień. Autostart wymaga zainstalowanej wersji Windows.', 'warning'); }
  };

  // Czyszczenie pamięci podręcznej kafelków
  const handleClearCache = async () => {
    if (!StorageService.clearMapCache()) { showToast('Nie udało się zapisać stanu map offline.', 'warning'); return; }
    let removedBytes = 0;
    if (window.electronAPI) {
      try { removedBytes = (await window.electronAPI.removeOfflineMap()).removedBytes; }
      catch { showToast('Nie udało się usunąć lokalnego pakietu map.', 'warning'); return; }
    }
    loadAllData();
    const size = removedBytes > 0 ? ` Zwolniono ${(removedBytes / 1048576).toFixed(1)} MB.` : '';
    showToast(`Wyczyszczono pamięć podręczną map offline.${size}`, 'success');
  };

  // Reset ustawień
  const handleResetSettings = () => {
    setConfirmDialog({
      title: 'Przywracanie ustawień',
      message: 'Czy na pewno chcesz przywrócić domyślne ustawienia programu Prezent Mapy?',
      confirmLabel: 'Przywróć domyślne',
      onConfirm: () => {
        handleUpdateSettings(DEFAULT_SETTINGS);
        showToast('Przywrócono domyślne ustawienia programu.', 'info');
      },
    });
  };

  // Start pokazu slajdów
  const handleStartSlideshow = (customList?: TravelPhoto[], startIndex: number = 0) => {
    const list = customList && customList.length > 0 ? customList : photos;
    setSlideshowPhotos(list);
    setSlideshowStartIndex(startIndex);
    setIsSlideshowOpen(true);
  };

  // Zapis własnej kolejności slajdów w katalogu / albumie
  const handleSaveAlbumOrder = (albumId: string, orderedPhotoIds: string[]) => {
    setAlbums(prevAlbums => {
      const updated = prevAlbums.map(a => {
        if (a.id === albumId) {
          return { ...a, customPhotoOrder: orderedPhotoIds };
        }
        return a;
      });
      StorageService.saveAlbums(updated);
      return updated;
    });
    showToast('Zapisano własną kolejność zdjęć w katalogu!', 'success');
  };

  // Uruchomienie pokazu slajdów z wybranego albumu według jego własnej kolejności
  const handleStartAlbumSlideshow = (album: TravelAlbum) => {
    const albumPhotos = photos.filter(p => p.albumId === album.id);
    if (album.customPhotoOrder && album.customPhotoOrder.length > 0) {
      const orderMap = new Map<string, number>();
      album.customPhotoOrder.forEach((id, idx) => orderMap.set(id, idx));
      const sorted = [...albumPhotos].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 99999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 99999;
        if (orderA !== orderB) return orderA - orderB;
        return a.date.localeCompare(b.date);
      });
      handleStartSlideshow(sorted);
    } else {
      handleStartSlideshow(albumPhotos);
    }
  };

  // Reset do demo
  const handleResetDemo = () => {
    setConfirmDialog({
      title: 'Fabryczny zestaw wspomnień',
      message: 'Czy na pewno chcesz przywrócić fabryczny zestaw demonstracyjnych podróży rodzinnych?',
      confirmLabel: 'Przywróć demo',
      onConfirm: () => {
        if (!StorageService.resetToDemo()) { showToast('Nie udało się przywrócić zestawu demo.', 'warning'); return; }
        loadAllData();
        showToast('Przywrócono demonstracyjny zestaw wypraw.', 'success');
      },
    });
  };

  // Wyczyszczenie demo
  const handleClearDemo = () => {
    setConfirmDialog({
      title: 'Usunięcie danych demonstracyjnych',
      message: 'Czy chcesz usunąć wszystkie przykładowe wspomnienia demonstracyjne i zostawić tylko swoje własne zdjęcia?',
      confirmLabel: 'Usuń dane demonstracyjne',
      isDanger: true,
      onConfirm: () => {
        if (!StorageService.clearDemoData()) { showToast('Nie udało się usunąć danych demonstracyjnych.', 'warning'); return; }
        loadAllData();
        showToast('Usunięto dane demonstracyjne.', 'info');
      },
    });
  };

  const handleOpenWindowsFolder = async () => {
    if (!window.electronAPI) { showToast('Folder Windows jest dostępny w aplikacji desktopowej.', 'info'); return; }
    try { await window.electronAPI.openPhotos(); }
    catch { showToast('Nie udało się otworzyć folderu zdjęć.', 'warning'); }
  };

  const handleCloseApp = () => {
    setConfirmDialog({
      title: 'Zamykanie aplikacji',
      message: 'Czy chcesz zminimalizować i zamknąć okno programu Prezent Mapy?',
      confirmLabel: 'Zamknij okno',
      onConfirm: () => {
        setIsWindowMinimized(true);
      },
    });
  };

  const demoPhotosCount = photos.filter(p => p.isDemo).length;
  const userPhotosCount = photos.filter(p => !p.isDemo).length;

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-hidden ${
      settings.interfaceTheme === 'light' ? 'bg-slate-100' : 'bg-[#070b14]'
    }`}>
      {libraryError && <div role="alert" className="fixed inset-x-0 top-9 bottom-6 z-[100] bg-slate-950/95 flex items-center justify-center p-8"><div className="max-w-lg border border-amber-500/40 rounded-2xl bg-slate-900 p-6 space-y-4"><h2 className="text-xl font-bold text-amber-300">Odczyt biblioteki wstrzymany</h2><p>{libraryError}</p><button onClick={loadAllData} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">Spróbuj ponownie</button><p className="text-xs text-slate-400">Zamknij aplikację i zachowaj folder danych Prezent Mapy w profilu Windows. Nie usuwaj library.sqlite ani katalogu photos.</p></div></div>}
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
              <h3 className="font-bold text-lg text-white">Okno programu Prezent Mapy jest zminimalizowane</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aplikacja działa w tle w systemie Windows 10/11. Kliknij poniżej, aby powrócić do przeglądania wspomnień.
              </p>
            </div>
            <button
              onClick={() => setIsWindowMinimized(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              Przywróć okno programu Prezent Mapy
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
            onToggleMaximize={() => { if (window.electronAPI) void window.electronAPI.maximize(); else setIsWindowMaximized(!isWindowMaximized); }}
            onMinimize={() => { if (window.electronAPI) void window.electronAPI.minimize(); else setIsWindowMinimized(true); }}
            onCloseApp={() => { if (window.electronAPI) void window.electronAPI.close(); else handleCloseApp(); }}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenImport={() => setIsImportOpen(true)}
            onStartSlideshow={() => handleStartSlideshow()}
            onOpenTvMode={() => setIsTvModeOpen(true)}
            onOpenOfflineMaps={() => setIsOfflineModalOpen(true)}
            onOpenAndroidSync={() => setIsAndroidSyncOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
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
            <main className={`flex-1 flex flex-col ${activeTab === 'map' ? 'p-3 md:p-4 overflow-hidden h-full' : 'p-4 md:p-5 overflow-y-auto'} bg-[#070b14]`}>
              {/* WIDOK 1: MAPA ŚWIATA (Wzorowana na Obrazie 3) */}
              {activeTab === 'map' && (
                <div className="flex-1 flex flex-col space-y-2.5 h-full min-h-0">
                  <MapView
                    photos={photos}
                    albums={albums}
                    trips={trips}
                    selectedTripId={selectedTripId}
                    onSelectPhoto={(photo) => setSelectedPhotoForDetail(photo)}
                    onStartSlideshow={(customList) => handleStartSlideshow(customList)}
                    tileProvider={settings.defaultMapLayer}
                    onChangeTileProvider={(p) => handleUpdateSettings({ ...settings, defaultMapLayer: p })}
                    showAnimatedRoutes={settings.showAnimatedRoutes}
                    offlineMode={settings.offlineSimulationMode}
                    autoCenterOnPhotos={settings.autoCenterOnPhotos}
                    showMapLabels={settings.showMapLabels}
                    clusterRadius={settings.clusterRadius}
                    onOpenImport={handleOpenImportWithLocation}
                    onShowToast={showToast}
                    onDropPhotosOnMap={handleDropPhotosOnMap}
                  />

                  {/* Szybki filtr tras pod mapą */}
                  <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
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
                  videos={videos}
                  albums={albums}
                  trips={trips}
                  onSelectPhoto={(photo) => setSelectedPhotoForDetail(photo)}
                  onToggleFavorite={handleToggleFavorite}
                  onDeletePhoto={handleDeletePhoto}
                  onDeletePhotos={handleDeletePhotos}
                  onDeleteAlbum={handleDeleteAlbum}
                  onStartSlideshow={(list) => handleStartSlideshow(list)}
                  onSelectAlbum={(id) => setSelectedAlbumId(id)}
                  selectedAlbumId={selectedAlbumId}
                  onOpenOrganizer={(album) => setReorderAlbum(album)}
                  onDropPhotosOnAlbum={handleDropPhotosOnAlbum}
                  onImportVideos={handleImportVideos}
                  onOpenVideo={setSelectedVideo}
                  onAssignVideo={handleAssignVideo}
                  density={settings.galleryDensity}
                  showExifBadges={settings.showExifBadges}
                  defaultSortBy={settings.defaultSortBy}
                  lazyLoadImages={settings.lazyLoadImages}
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
                        Podróże podzielone na katalogi rodzinne z możliwością własnego układania kolejności slajdów.
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
                      const isDragOver = dragOverAlbumId === album.id;

                      return (
                        <div
                          key={album.id}
                          onClick={() => {
                            setSelectedAlbumId(album.id);
                            setActiveTab('gallery');
                          }}
                          onDragOver={(e) => {
                            if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragOverAlbumId(album.id);
                            }
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              setDragOverAlbumId(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverAlbumId(null);
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              const validFiles = Array.from(e.dataTransfer.files).filter(f =>
                                f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|tiff?|gif)$/i.test(f.name)
                              );
                              if (validFiles.length > 0) {
                                handleDropPhotosOnAlbum(validFiles, album.id);
                              }
                            }
                          }}
                          className={`group bg-[#0f172a] rounded-2xl border overflow-hidden shadow-xl transition-all cursor-pointer flex flex-col relative ${
                            isDragOver
                              ? 'border-amber-400 ring-4 ring-amber-400/40 scale-[1.02] shadow-2xl shadow-amber-500/20'
                              : 'border-slate-800 hover:border-amber-500/60 hover:shadow-2xl'
                          }`}
                        >
                          {/* Aktywna nakładka upuszczenia zdjęć na kartę albumu */}
                          {isDragOver && (
                            <div className="absolute inset-0 z-40 bg-amber-500/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-slate-950 font-sans border-2 border-dashed border-white animate-in fade-in zoom-in-95 duration-150">
                              <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center mb-2 animate-bounce">
                                <FolderDown className="w-6 h-6" />
                              </div>
                              <h4 className="font-extrabold text-base tracking-tight">Upuść zdjęcia tutaj!</h4>
                              <p className="text-xs font-semibold mt-0.5 opacity-90 text-center">
                                Dodaj bezpośrednio do albumu: {album.name}
                              </p>
                            </div>
                          )}

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
                            {album.customPhotoOrder && album.customPhotoOrder.length > 0 && (
                              <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-bold shadow flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Ułożony
                              </div>
                            )}
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

                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                              <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                                Otwórz album <ExternalLink className="w-3.5 h-3.5" />
                              </span>

                              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => setReorderAlbum(album)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                                  title="Ułóż kolejność zdjęć w tym katalogu"
                                >
                                  <ArrowUpDown className="w-3 h-3 text-amber-400" />
                                  Kolejność
                                </button>
                                <button
                                  onClick={() => handleStartAlbumSlideshow(album)}
                                  disabled={count === 0}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition-all flex items-center gap-1 font-bold cursor-pointer disabled:opacity-30"
                                  title="Uruchom pokaz slajdów tego albumu"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  Slajdy
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs" onClick={event => event.stopPropagation()}>
                              <button className="text-red-300 p-1" onClick={() => handleDeleteAlbum(album.id, false)}>Usuń album, zachowaj zdjęcia</button>
                              <button className="text-red-400 p-1" onClick={() => handleDeleteAlbum(album.id, true)}>Usuń ze zdjęciami</button>
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
        readExif={settings.readExifOnImport}
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false);
          setImportInitialLocation(null);
          setImportInitialFiles([]);
          setImportInitialAlbumId(null);
        }}
        albums={albums}
        onImportComplete={handleImportComplete}
        initialLocation={importInitialLocation}
        initialMode={importInitialMode}
        initialFiles={importInitialFiles}
        initialAlbumId={importInitialAlbumId}
        onShowToast={showToast}
      />

      {selectedVideo && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" role="dialog" aria-label={selectedVideo.title}>
          <div className="w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3"><h2 className="text-white font-bold">{selectedVideo.title}</h2><button onClick={() => setSelectedVideo(null)} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200">Zamknij</button></div>
            <VideoPlayer src={`prezent-video://local/${selectedVideo.id}`} title={selectedVideo.title} />
          </div>
        </div>
      )}

      <SlideshowModal
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        photos={slideshowPhotos}
        initialIndex={slideshowStartIndex}
        albumName={selectedAlbumId ? albums.find(a => a.id === selectedAlbumId)?.name : undefined}
      />

      <CatalogOrganizerModal
        isOpen={!!reorderAlbum}
        onClose={() => setReorderAlbum(null)}
        album={reorderAlbum}
        allPhotos={photos}
        onSaveOrder={handleSaveAlbumOrder}
        onStartSlideshow={(ordered) => {
          setReorderAlbum(null);
          handleStartSlideshow(ordered);
        }}
      />

      <TvModeModal
        isOpen={isTvModeOpen}
        onClose={() => setIsTvModeOpen(false)}
        photos={photos}
        trips={trips}
        albums={albums}
        onStartSlideshow={(list) => handleStartSlideshow(list)}
        onShowToast={showToast}
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

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Okno dialogowe potwierdzenia akcji (zastępujące window.confirm) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="bg-[#0f172a] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-xs text-white">{confirmDialog.title}</span>
              <button
                onClick={() => setConfirmDialog(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5 text-xs text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </div>
            <div className="bg-[#0f172a] p-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                {confirmDialog.cancelLabel || 'Anuluj'}
              </button>
              <button
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  action();
                }}
                className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer ${
                  confirmDialog.isDanger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {confirmDialog.confirmLabel || 'Zatwierdź'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Powiadomienie Toast w stylu Windows 11 Action Center */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-[#111827]/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-400 animate-pulse'
                : toast.type === 'warning'
                ? 'bg-amber-400'
                : 'bg-blue-400'
            }`}
          />
          <div className="flex-1 text-xs text-slate-200 font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
