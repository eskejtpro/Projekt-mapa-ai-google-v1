import React, { useState, useRef, useEffect } from 'react';
import exifr from 'exifr';
import { TravelPhoto, TravelAlbum, GeoLocation } from '../types/travel';
import { 
  Upload, 
  FolderPlus, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  X, 
  Folder, 
  HardDrive, 
  Camera, 
  Sparkles, 
  AlertCircle,
  FileSpreadsheet,
  Clipboard,
  Link,
  Package,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  Compass,
  FolderDown
} from 'lucide-react';
import { POPULAR_LOCATIONS, formatCoordinates, readImageFromClipboard, guessNearestLocation } from '../services/geoService';
import { READY_TRAVEL_PACKS, convertPackToPhotosAndAlbum, TravelPhotoPack } from '../data/travelPacks';

export interface InitialImportLocation {
  lat: number;
  lng: number;
  cityName?: string;
  countryName?: string;
  countryCode?: string;
}

export type ImportTabMode = 'files' | 'folder' | 'clipboard' | 'url' | 'packs';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  albums: TravelAlbum[];
  onImportComplete: (photos: TravelPhoto[], newAlbum?: TravelAlbum) => boolean;
  readExif?: boolean;
  initialLocation?: InitialImportLocation | null;
  initialMode?: ImportTabMode;
  initialFiles?: File[];
  initialAlbumId?: string | null;
  onShowToast?: (message: string, type: 'info' | 'success' | 'warning') => void;
}

interface QueuedItem {
  contentHash?: string;
  id: string;
  file?: File;
  dataUrl: string;
  name: string;
  sizeStr: string;
  lat?: number;
  lng?: number;
  hasExifGps: boolean;
  dateStr?: string;
  camera?: { make?: string; model?: string };
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  albums,
  onImportComplete,
  readExif = true,
  initialLocation,
  initialMode = 'files',
  initialFiles,
  initialAlbumId,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ImportTabMode>(initialMode);
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Album
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(
    initialAlbumId && albums.some(a => a.id === initialAlbumId)
      ? initialAlbumId
      : albums[0]?.id || 'album-new'
  );
  const [newAlbumName, setNewAlbumName] = useState<string>('Nowe Wspomnienia');
  const [newAlbumCountry, setNewAlbumCountry] = useState<string>('Polska');

  // Lokalizacja awaryjna (jeśli zdjęcie nie ma GPS w EXIF)
  const [fallbackCity, setFallbackCity] = useState<string>('Gdańsk');
  const [fallbackCountry, setFallbackCountry] = useState<string>('Polska');
  const [fallbackCountryCode, setFallbackCountryCode] = useState<string>('PL');
  const [fallbackLat, setFallbackLat] = useState<number>(54.352);
  const [fallbackLng, setFallbackLng] = useState<number>(18.6466);

  // Zakładka URL
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imageUrlTitle, setImageUrlTitle] = useState<string>('');
  const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
  const [urlPreviewError, setUrlPreviewError] = useState<string | null>(null);

  // Zakładka Schowek
  const [clipboardStatus, setClipboardStatus] = useState<string | null>(null);

  // Uczestnicy i tagi
  const [participantsText, setParticipantsText] = useState<string>('Rodzina');
  const [tagsText, setTagsText] = useState<string>('Wakacje, Podróż');

  const [folderStatusMsg, setFolderStatusMsg] = useState<string | null>(null);

  // Inicjalizacja wybranego albumu jeśli przekazano initialAlbumId (np. Drag & Drop na kartę albumu)
  useEffect(() => {
    if (initialAlbumId && albums.some(a => a.id === initialAlbumId)) {
      setSelectedAlbumId(initialAlbumId);
      const target = albums.find(a => a.id === initialAlbumId);
      if (target?.country) {
        setFallbackCountry(target.country);
      }
    }
  }, [initialAlbumId, albums, isOpen]);

  // Inicjalizacja współrzędnych jeśli przekazano initialLocation (np. kliknięcie PPM na mapie)
  useEffect(() => {
    if (initialLocation) {
      setFallbackLat(Number(initialLocation.lat.toFixed(4)));
      setFallbackLng(Number(initialLocation.lng.toFixed(4)));
      if (initialLocation.cityName) {
        setFallbackCity(initialLocation.cityName);
      } else {
        const guess = guessNearestLocation(initialLocation.lat, initialLocation.lng);
        setFallbackCity(guess.cityName);
      }
      if (initialLocation.countryName) {
        setFallbackCountry(initialLocation.countryName);
      }
      if (initialLocation.countryCode) {
        setFallbackCountryCode(initialLocation.countryCode);
      }
      setNewAlbumName(`Wyprawa – ${initialLocation.cityName || 'Wybrane miejsce'}`);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (initialMode) {
      setActiveTab(initialMode);
    }
  }, [initialMode, isOpen]);

  // Automatyczne wczytanie plików przekazanych do modalu (np. przeciągnięcie na mapę Drag & Drop)
  const processedFilesKeyRef = useRef<Set<File>>(new Set());

  useEffect(() => {
    if (!isOpen) {
      processedFilesKeyRef.current.clear();
      return;
    }

    if (initialFiles && initialFiles.length > 0) {
      const unprocessed = initialFiles.filter(f => {
        const key = f;
        if (processedFilesKeyRef.current.has(key)) return false;
        processedFilesKeyRef.current.add(key);
        return true;
      });

      if (unprocessed.length > 0) {
        processIncomingFiles(unprocessed);
        setActiveTab('files');
      }
    }
  }, [isOpen, initialFiles]);

  // Nasłuchiwanie skrótu wklejania ze schowka (Ctrl+V) gdy modal jest otwarty
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      // Jeśli użytkownik pisze w polu tekstowym, nie przechwytujemy
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            await processIncomingFiles([file]);
            setActiveTab('files');
            onShowToast?.('Przechwycono obraz ze schowka systemowego!', 'success');
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Przetwarzanie plików i wyciąganie metadanych EXIF
  const processIncomingFiles = async (files: File[]) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    const newQueued: QueuedItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      try {
        let exifData: Record<string, unknown> | null = null;
        try {
          exifData = readExif ? await exifr.parse(file, {
            gps: true,
            tiff: true,
            exif: true,
          }) : null;
        } catch {
          // Brak lub uszkodzony EXIF w pliku
        }

        const hasGps = Boolean(exifData && typeof exifData.latitude === 'number' && typeof exifData.longitude === 'number');
        const lat = hasGps ? (exifData?.latitude as number) : undefined;
        const lng = hasGps ? (exifData?.longitude as number) : undefined;

        let photoDate: string | undefined;
        if (exifData?.DateTimeOriginal instanceof Date) {
          photoDate = exifData.DateTimeOriginal.toISOString().split('T')[0];
        }

        const contentHash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))).map(byte => byte.toString(16).padStart(2, '0')).join('');
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error || new Error('Błąd odczytu zdjęcia'));
          reader.onabort = () => reject(new Error('Odczyt anulowany'));
          reader.readAsDataURL(file);
        });

        newQueued.push({
          contentHash,
          id: `queue-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          file,
          dataUrl,
          name: file.name,
          sizeStr: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          lat,
          lng,
          hasExifGps: hasGps,
          dateStr: photoDate,
          camera: {
            make: (exifData?.Make as string) || undefined,
            model: (exifData?.Model as string) || undefined,
          },
        });
      } catch (err) {
        console.error('Błąd odczytu pliku:', file.name, err);
      }
    }

    setQueuedItems(prev => {
      // Zapobieganie powielaniu w kolejce
      const existingSignatures = new Set(prev.map(p => p.contentHash || p.dataUrl));
      const filtered = newQueued.filter(item => { const identity = item.contentHash || item.dataUrl; if (existingSignatures.has(identity)) return false; existingSignatures.add(identity); return true; });
      return [...prev, ...filtered];
    });
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Pobranie obrazu ze schowka przyciskiem
  const handleReadClipboard = async () => {
    setClipboardStatus(null);
    try {
      const res = await readImageFromClipboard();
      if (res) {
        await processIncomingFiles([res.file]);
        setClipboardStatus('Pomyślnie wklejono obraz ze schowka!');
        setActiveTab('files');
        onShowToast?.('Pomyślnie dodano obraz ze schowka systemowego!', 'success');
      } else {
        setClipboardStatus('W schowku nie znaleziono żadnego obrazu. Skopiuj zdjęcie i spróbuj ponownie.');
      }
    } catch (err: any) {
      setClipboardStatus(err.message || 'Brak uprawnień do schowka. Naciśnij klawisze Ctrl+V.');
    }
  };

  // Dodanie zdjęcia z URL
  const handleAddUrlImage = () => {
    if (!imageUrlInput.trim()) return;
    setIsUrlLoading(true);
    setUrlPreviewError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const title = imageUrlTitle.trim() || 'Zdjęcie z internetu';
      setQueuedItems(prev => [
        ...prev,
        {
          id: `url-item-${Date.now()}`,
          dataUrl: imageUrlInput.trim(),
          name: title,
          sizeStr: 'URL online',
          hasExifGps: false,
          dateStr: new Date().toISOString().split('T')[0],
        },
      ]);
      setImageUrlInput('');
      setImageUrlTitle('');
      setIsUrlLoading(false);
      setActiveTab('files');
      onShowToast?.('Dodano fotografię z adresu URL do kolejki importu.', 'success');
    };
    img.onerror = () => {
      setIsUrlLoading(false);
      setUrlPreviewError('Nie udało się wczytać grafiki z podanego adresu URL. Upewnij się, że link prowadzi bezpośrednio do pliku graficznego (np. .jpg, .png).');
    };
    img.src = imageUrlInput.trim();
  };

  // Dodanie całej gotowej paczki tematycznej
  const handleImportPack = (pack: TravelPhotoPack) => {
    const { photos, album } = convertPackToPhotosAndAlbum(pack);
    if (!onImportComplete(photos, album)) return;
    onShowToast?.(`Pomyślnie zaimportowano pakiet "${pack.name}" (${photos.length} zdjęć) na mapę!`, 'success');
    onClose();
  };

  // Szybki wybór popularnej lokalizacji
  const handleSelectPopularLoc = (loc: typeof POPULAR_LOCATIONS[0]) => {
    setFallbackCity(loc.cityName);
    setFallbackCountry(loc.countryName);
    setFallbackCountryCode(loc.countryCode);
    setFallbackLat(loc.lat);
    setFallbackLng(loc.lng);
  };

  // Usunięcie elementu z kolejki
  const handleRemoveQueueItem = (id: string) => {
    setQueuedItems(prev => prev.filter(i => i.id !== id));
  };

  // Finalny zapis zaimportowanych elementów
  const handleFinalSave = () => {
    if (queuedItems.length === 0) return;

    let targetAlbumId = selectedAlbumId;
    let createdAlbum: TravelAlbum | undefined;

    if (selectedAlbumId === 'album-new') {
      targetAlbumId = `album-${Date.now()}`;
      createdAlbum = {
        id: targetAlbumId,
        name: newAlbumName || 'Wspomnienia',
        description: `Importowane wspomnienia z ${newAlbumCountry}`,
        coverUrl: queuedItems[0].dataUrl,
        year: new Date().getFullYear(),
        country: newAlbumCountry || 'Polska',
        isDemo: false,
      };
    }

    const participants = participantsText.split(',').map(s => s.trim()).filter(Boolean);
    const tags = tagsText.split(',').map(s => s.trim()).filter(Boolean);

    const importedPhotos: TravelPhoto[] = queuedItems.map((item, idx) => {
      const hasGps = item.hasExifGps && typeof item.lat === 'number' && typeof item.lng === 'number';
      const lat = hasGps ? (item.lat as number) : fallbackLat;
      const lng = hasGps ? (item.lng as number) : fallbackLng;

      return {
        id: `photo-user-${Date.now()}-${idx}`,
        url: item.dataUrl,
        thumbnailUrl: item.dataUrl,
        title: item.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        date: item.dateStr || new Date().toISOString().split('T')[0],
        location: {
          lat,
          lng,
          cityName: hasGps ? 'Współrzędne EXIF (GPS)' : fallbackCity,
          countryName: hasGps ? 'Lokalizacja ze zdjęcia' : fallbackCountry,
          countryCode: fallbackCountryCode,
          placeName: item.name,
        },
        albumId: targetAlbumId,
        notes: hasGps 
          ? `Lokalizacja odczytana automatycznie z aparatu (${lat.toFixed(4)}, ${lng.toFixed(4)}).`
          : `Wspomnienie przypisane do punktu: ${fallbackCity} (${lat.toFixed(4)}, ${lng.toFixed(4)}).`,
        participants: participants.length > 0 ? participants : ['Rodzina'],
        tags: tags.length > 0 ? tags : ['Wspomnienia'],
        isFavorite: false,
        isDemo: false,
        cameraInfo: item.camera,
        fileName: item.name,
        contentHash: item.contentHash,
        fileSize: item.sizeStr,
        localFilePath: (item.file as any)?.path || undefined,
      };
    });

    if (!onImportComplete(importedPhotos, createdAlbum)) return;
    onShowToast?.(`Pomyślnie dodano ${importedPhotos.length} zdjęć do mapy świata!`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Nagłówek okna */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0c101c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                Centrum Dodawania Zdjęć i Katalogów
                {initialLocation && (
                  <span className="text-[11px] bg-amber-500/15 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Punkt z mapy: {initialLocation.cityName || formatCoordinates(initialLocation.lat, initialLocation.lng)}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Wybierz pliki, cały folder ze zdjęciami, wklej ze schowka lub dodaj gotową kolekcję.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zamknij okno"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pasek zakładek (Wszystkie opcje dodawania zdjęć) */}
        <div className="bg-[#090d18] border-b border-slate-800 px-4 sm:px-6 pt-2 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'files'
                ? 'border-amber-500 text-amber-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Pliki zdjęć</span>
            {queuedItems.length > 0 && (
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {queuedItems.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('folder')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'folder'
                ? 'border-amber-500 text-amber-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Cały katalog / folder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clipboard')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'clipboard'
                ? 'border-amber-500 text-amber-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Wklej ze schowka (Ctrl+V)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'url'
                ? 'border-amber-500 text-amber-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Link URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packs')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'packs'
                ? 'border-amber-500 text-amber-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pakiety podróżnicze</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-md text-[10px] font-bold">
              Gotowe
            </span>
          </button>
        </div>

        {/* Zawartość zakładek */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-[#070b14]">

          {/* BANER INFORMACYJNY JEŚLI KLIKNIĘTO PPM NA MAPIE */}
          {initialLocation && (
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold text-xs">
                    Lokalizacja przypisana z kliknięcia na mapie:
                  </div>
                  <div className="text-amber-300 font-mono text-[11px] mt-0.5">
                    {formatCoordinates(fallbackLat, fallbackLng)} &bull; {fallbackCity}, {fallbackCountry}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const guess = guessNearestLocation(fallbackLat, fallbackLng);
                  setFallbackCity(guess.cityName);
                  setFallbackCountry(guess.countryName);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 cursor-pointer shrink-0"
              >
                Odśwież nazwę
              </button>
            </div>
          )}

          {/* KARTA 1: PLIKI ZDJĘĆ */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-[#0c111e] rounded-2xl p-7 text-center cursor-pointer transition-all space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform shadow-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">
                    Przeciągnij zdjęcia tutaj lub kliknij, aby otworzyć Eksplorator Windows
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Obsługiwane formaty: JPG, JPEG, PNG, WebP (odczytuje współrzędne GPS, datę i model aparatu z EXIF)
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> Wybierz pliki ze zdjęciami
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      folderInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Folder className="w-4 h-4 text-amber-400" /> Wybierz cały folder
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KARTA 2: CAŁY KATALOG / FOLDER */}
          {activeTab === 'folder' && (
            <div className="space-y-4">
              <div className="bg-[#0c111e] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Import Całego Katalogu lub Podfolderu</h4>
                    <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                      Wybierz folder zawierający dziesiątki lub setki zdjęć z wyjazdu. Program automatycznie przeszuka pliki, odczyta współrzędne GPS z każdego zdjęcia oraz przypisze je do mapy. Jeśli któreś ze zdjęć nie posiada GPS, otrzyma lokalizację domyślną.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4" /> Wybierz folder z komputera
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const path = 'C:\\Users\\Rodzina\\Obrazy\\Prezent-Wspomnienia';
                      if (navigator.clipboard) navigator.clipboard.writeText(path).catch(() => {});
                      setFolderStatusMsg('Skopiowano ścieżkę do schowka: ' + path);
                      setTimeout(() => setFolderStatusMsg(null), 3500);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <HardDrive className="w-4 h-4 text-indigo-400" /> Kopiuj ścieżkę folderu Windows
                  </button>
                </div>

                {folderStatusMsg && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl">
                    ✓ {folderStatusMsg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KARTA 3: WKLEJ ZE SCHOWKA */}
          {activeTab === 'clipboard' && (
            <div className="space-y-4">
              <div className="bg-[#0c111e] border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                  <Clipboard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Wklejanie Zdjęcia ze Schowka Systemowego</h4>
                  <p className="text-slate-400 text-[11px] mt-1 max-w-lg mx-auto">
                    Skopiowałeś zdjęcie z internetu, zrzut ekranu lub plik w Eksploratorze Windows? Kliknij poniższy przycisk lub po prostu naciśnij <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">Ctrl + V</kbd> w oknie aplikacji.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReadClipboard}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    <Clipboard className="w-4 h-4" /> Odczytaj obraz ze schowka
                  </button>
                </div>

                {clipboardStatus && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl max-w-md mx-auto">
                    {clipboardStatus}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KARTA 4: LINK URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="bg-[#0c111e] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Link className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Dodaj Zdjęcie z Adresu URL (Sieć / NAS / Chmura)</h4>
                    <p className="text-slate-400 text-[11px]">Wklej bezpośredni link do pliku graficznego.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Adres URL zdjęcia:</label>
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-... lub link ze serwera NAS"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Tytuł wspomnienia (opcjonalnie):</label>
                    <input
                      type="text"
                      value={imageUrlTitle}
                      onChange={e => setImageUrlTitle(e.target.value)}
                      placeholder="np. Widok na zatokę o zmierzchu"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  {urlPreviewError && (
                    <div className="text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-2.5 rounded-xl">
                      {urlPreviewError}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      disabled={!imageUrlInput.trim() || isUrlLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" /> {isUrlLoading ? 'Sprawdzanie linku...' : 'Dodaj do kolejki importu'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KARTA 5: GOTOWE PAKIETY PODRÓŻNICZE */}
          {activeTab === 'packs' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white">Gotowe Zestawy Fotografii Podróżniczych</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Dodaj za jednym kliknięciem autentyczne fotografie ze współrzędnymi GPS z najpiękniejszych zakątków świata.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {READY_TRAVEL_PACKS.map(pack => (
                  <div
                    key={pack.id}
                    className="bg-[#0c111e] border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl flex flex-col group transition-all"
                  >
                    <div className="h-28 relative overflow-hidden bg-slate-950">
                      <img
                        src={pack.coverUrl}
                        alt={pack.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute top-2 right-2 bg-slate-900/90 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                        {pack.photos.length} zdjęć
                      </div>
                      <div className="absolute bottom-2 left-2 text-[10px] text-slate-300 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" /> {pack.region}, {pack.country}
                      </div>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="font-bold text-white text-xs">{pack.name}</div>
                        <p className="text-slate-400 text-[11px] line-clamp-2 mt-1">{pack.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleImportPack(pack)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold border border-amber-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Dodaj tę kolekcję na mapę
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LISTA OCZEKUJĄCYCH ZDJĘĆ DO ZAPISU */}
          {queuedItems.length > 0 && (
            <div className="bg-[#0c111e] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Kolejka zdjęć do dodania ({queuedItems.length})
                </div>
                <button
                  type="button"
                  onClick={() => setQueuedItems([])}
                  className="text-slate-400 hover:text-rose-400 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Wyczyść listę
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {queuedItems.map(item => (
                  <div
                    key={item.id}
                    className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group aspect-square flex flex-col justify-end"
                  >
                    <img src={item.dataUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveQueueItem(item.id)}
                      className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <div className="p-1.5 relative z-10">
                      <div className="text-[10px] font-semibold text-white truncate">{item.name}</div>
                      <div className="text-[9px] text-slate-300 flex items-center gap-1 mt-0.5">
                        {item.hasExifGps ? (
                          <span className="text-emerald-400 font-bold">GPS EXIF</span>
                        ) : (
                          <span className="text-amber-400">Domyślna</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KONFIGURACJA ALBUMU I METADANYCH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0c111e] border border-slate-800 rounded-2xl p-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Przypisz do albumu:</label>
              <select
                value={selectedAlbumId}
                onChange={e => setSelectedAlbumId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="album-new">+ Utwórz nowy album dla tych zdjęć</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.year})</option>
                ))}
              </select>
            </div>

            {selectedAlbumId === 'album-new' && (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Nazwa nowego albumu:</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={e => setNewAlbumName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  placeholder="np. Wakacje Rodzinne 2025"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Uczestnicy (oddziel przecinkami):</label>
              <input
                type="text"
                value={participantsText}
                onChange={e => setParticipantsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                placeholder="Mama, Tata, Zosia, Kacper"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Tagi / Etykiety:</label>
              <input
                type="text"
                value={tagsText}
                onChange={e => setTagsText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                placeholder="Wakacje, Góry, Plaża, Zachód słońca"
              />
            </div>
          </div>

          {/* AWARYJNA LOKALIZACJA DLA ZDJĘĆ BEZ EXIF GPS */}
          <div className="bg-[#0c111e] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <MapPin className="w-4 h-4" />
                Lokalizacja domyślna (jeśli aparat/plik nie posiada GPS w EXIF)
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {formatCoordinates(fallbackLat, fallbackLng)}
              </span>
            </div>

            {/* Szybkie pigułki popularnych miast */}
            <div className="space-y-1.5">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">
                Szybki wybór popularnego miejsca:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {POPULAR_LOCATIONS.slice(0, 14).map(loc => (
                  <button
                    key={loc.cityName}
                    type="button"
                    onClick={() => handleSelectPopularLoc(loc)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                      fallbackCity === loc.cityName
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {loc.cityName} ({loc.countryCode})
                  </button>
                ))}
              </div>
            </div>

            {/* Ręczna edycja pól */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Miasto / Region:</span>
                <input
                  type="text"
                  value={fallbackCity}
                  onChange={e => setFallbackCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Kraj:</span>
                <input
                  type="text"
                  value={fallbackCountry}
                  onChange={e => setFallbackCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Szerokość (Lat):</span>
                <input
                  type="number"
                  step="0.0001"
                  value={fallbackLat}
                  onChange={e => setFallbackLat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Długość (Lng):</span>
                <input
                  type="number"
                  step="0.0001"
                  value={fallbackLng}
                  onChange={e => setFallbackLng(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ukryte inputy HTML */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          // @ts-expect-error webkitdirectory is standard for folder picking
          webkitdirectory=""
          directory=""
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Pasek postępu importu */}
        {isProcessing && (
          <div className="px-6 py-2 bg-slate-950 border-t border-slate-800 shrink-0">
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Odczytywanie metadanych EXIF i współrzędnych GPS...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Stopka okna */}
        <div className="p-4 border-t border-slate-800 bg-[#0c101c] flex items-center justify-between shrink-0">
          <div className="text-slate-400 text-xs hidden sm:block">
            {queuedItems.length > 0 ? (
              <span>Gotowe do zapisu: <strong className="text-white">{queuedItems.length}</strong> fotografii</span>
            ) : (
              <span>Wybierz zdjęcia, folder lub kolekcję, aby kontynuować</span>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs font-semibold"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleFinalSave}
              disabled={queuedItems.length === 0 || isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all cursor-pointer text-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Zapisz {queuedItems.length > 0 ? `(${queuedItems.length})` : ''} na mapie świata
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
