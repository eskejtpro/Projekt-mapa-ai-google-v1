import React, { useState, useRef } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  albums: TravelAlbum[];
  onImportComplete: (photos: TravelPhoto[], newAlbum?: TravelAlbum) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  albums,
  onImportComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(albums[0]?.id || 'album-new');
  const [newAlbumName, setNewAlbumName] = useState<string>('Wakacje Rodzinne 2025');
  const [newAlbumCountry, setNewAlbumCountry] = useState<string>('Polska');
  
  // Ręczna lokalizacja awaryjna (jeśli zdjęcie nie ma GPS w EXIF)
  const [fallbackCity, setFallbackCity] = useState<string>('Gdańsk');
  const [fallbackCountry, setFallbackCountry] = useState<string>('Polska');
  const [fallbackLat, setFallbackLat] = useState<number>(54.352);
  const [fallbackLng, setFallbackLng] = useState<number>(18.6466);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processAndImport = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: selectedFiles.length });

    const importedPhotos: TravelPhoto[] = [];
    let targetAlbumId = selectedAlbumId;
    let createdAlbum: TravelAlbum | undefined;

    if (selectedAlbumId === 'album-new') {
      targetAlbumId = `album-${Date.now()}`;
      createdAlbum = {
        id: targetAlbumId,
        name: newAlbumName || 'Nowa Podróż',
        description: `Importowane wspomnienia z ${newAlbumCountry}`,
        coverUrl: '',
        year: new Date().getFullYear(),
        country: newAlbumCountry || 'Polska',
        isDemo: false,
      };
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setProgress({ current: i + 1, total: selectedFiles.length });

      try {
        // 1. Odczyt metadanych EXIF za pomocą biblioteki exifr
        let exifData: Record<string, unknown> | null = null;
        try {
          exifData = await exifr.parse(file, {
            gps: true,
            tiff: true,
            exif: true,
          });
        } catch (err) {
          console.warn('Brak EXIF w pliku:', file.name, err);
        }

        // 2. Wyciągnięcie współrzędnych GPS lub fallback
        const hasGps = Boolean(exifData && typeof exifData.latitude === 'number' && typeof exifData.longitude === 'number');
        const lat = (exifData && typeof exifData.latitude === 'number') ? (exifData.latitude as number) : fallbackLat;
        const lng = (exifData && typeof exifData.longitude === 'number') ? (exifData.longitude as number) : fallbackLng;

        // 3. Data wykonania
        let photoDate = new Date().toISOString().split('T')[0];
        if (exifData?.DateTimeOriginal instanceof Date) {
          photoDate = exifData.DateTimeOriginal.toISOString().split('T')[0];
        }

        // 4. Konwersja do DataURL
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        // Ustaw okładkę nowego albumu, jeśli jeszcze brak
        if (createdAlbum && !createdAlbum.coverUrl) {
          createdAlbum.coverUrl = dataUrl;
        }

        const newPhoto: TravelPhoto = {
          id: `photo-user-${Date.now()}-${i}`,
          url: dataUrl,
          thumbnailUrl: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          date: photoDate,
          location: {
            lat,
            lng,
            cityName: hasGps ? 'Lokalizacja ze zdjęcia (GPS)' : fallbackCity,
            countryName: hasGps ? 'Współrzędne EXIF' : fallbackCountry,
            countryCode: fallbackCountry === 'Polska' ? 'PL' : 'XX',
            placeName: file.name,
          },
          albumId: targetAlbumId,
          notes: hasGps 
            ? `Wspomnienie zaimportowane automatycznie z geolokalizacją EXIF (${lat.toFixed(4)}, ${lng.toFixed(4)}).`
            : `Zdjęcie rodzinne przypisane do lokalizacji: ${fallbackCity}.`,
          participants: ['Rodzina'],
          tags: ['Prywatne', 'Wakacje'],
          isFavorite: false,
          isDemo: false,
          cameraInfo: {
            make: (exifData?.Make as string) || undefined,
            model: (exifData?.Model as string) || undefined,
          },
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          localFilePath: `C:\\Prezent\\Wspomnienia\\${createdAlbum?.name || 'Album'}\\${file.name}`,
        };

        importedPhotos.push(newPhoto);
      } catch (err) {
        console.error('Błąd importu pliku:', file.name, err);
      }
    }

    setIsProcessing(false);
    onImportComplete(importedPhotos, createdAlbum);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Nagłówek modala */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Import Zdjęć z Komputera Windows</h3>
              <p className="text-xs text-slate-400">
                Wybierz zdjęcia lub cały folder. Program automatycznie odczyta współrzędne GPS z metadanych EXIF.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ciało modala */}
        <div className="p-6 space-y-6 text-xs">
          {/* Obszar Dropzone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/60 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                {selectedFiles.length > 0 ? `Wybrano ${selectedFiles.length} plików gotowych do importu` : 'Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać'}
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                Obsługuje formaty: JPG, JPEG, PNG, WebP (odczytuje GPS, datę, aparat)
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Wybierz pliki
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  folderInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
              >
                <Folder className="w-3.5 h-3.5" /> Wybierz cały folder
              </button>
            </div>

            {/* Ukryte inputy */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Folder input */}
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
          </div>

          {/* Konfiguracja albumu docelowego */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Przypisz do albumu:</label>
              <select
                value={selectedAlbumId}
                onChange={e => setSelectedAlbumId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="album-new">+ Utwórz nowy album z tej podróży</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.year})</option>
                ))}
              </select>
            </div>

            {selectedAlbumId === 'album-new' && (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Nazwa nowego albumu:</label>
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={e => setNewAlbumName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  placeholder="np. Wakacje w Chorwacji 2025"
                />
              </div>
            )}
          </div>

          {/* Awaryjne przypisanie lokalizacji dla zdjęć bez EXIF GPS */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <MapPin className="w-4 h-4" />
              Lokalizacja domyślna (jeśli aparat nie zapisał współrzędnych GPS)
            </div>
            <p className="text-slate-400 text-[11px]">
              Dla zdjęć ze starych aparatów cyfrowych lub komunikatorów podaj orientacyjne miasto, a program umieści je na mapie świata:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Miasto:</span>
                <input
                  type="text"
                  value={fallbackCity}
                  onChange={e => setFallbackCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Kraj:</span>
                <input
                  type="text"
                  value={fallbackCountry}
                  onChange={e => setFallbackCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Szerokość (Lat):</span>
                <input
                  type="number"
                  step="0.001"
                  value={fallbackLat}
                  onChange={e => setFallbackLat(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block mb-1">Długość (Lng):</span>
                <input
                  type="number"
                  step="0.001"
                  value={fallbackLng}
                  onChange={e => setFallbackLng(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Dostęp do plików programu Windows */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Katalog programu w Windows 10/11</div>
                <div className="font-mono text-[11px] text-slate-400">C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert('W wersji Windows 10/11: Otwieranie folderu w Eksploratorze Windows (explorer.exe C:\\Users\\Rodzina\\Obrazy\\Prezent-Wspomnienia)')}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-semibold hover:bg-indigo-900/60 transition-colors whitespace-nowrap"
            >
              Otwórz w Eksploratorze
            </button>
          </div>
        </div>

        {/* Pasek postępu jeśli trwa import */}
        {isProcessing && (
          <div className="px-6 py-2 bg-slate-950 border-t border-slate-800">
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Odczytywanie metadanych EXIF i zapisywanie...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Stopka modala */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={processAndImport}
            disabled={selectedFiles.length === 0 || isProcessing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isProcessing ? 'Przetwarzanie...' : `Zapisz ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''} do pamięci programu`}
          </button>
        </div>
      </div>
    </div>
  );
};
