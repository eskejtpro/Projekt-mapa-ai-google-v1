import React, { useState } from 'react';
import { OfflineMapPackage } from '../types/travel';
import { 
  WifiOff, 
  Download, 
  CheckCircle2, 
  Trash2, 
  HardDrive, 
  Layers, 
  X, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface OfflineMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: OfflineMapPackage[];
  onUpdatePackages: (packages: OfflineMapPackage[]) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: (enabled: boolean) => void;
}

export const OfflineMapsModal: React.FC<OfflineMapsModalProps> = ({
  isOpen,
  onClose,
  packages,
  onUpdatePackages,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  if (!isOpen) return null;

  const handleDownload = (pkgId: string) => {
    setDownloadingId(pkgId);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingId(null);
          // Zaktualizuj pakiet na pobrany
          const updated = packages.map(p => {
            if (p.id === pkgId) {
              return {
                ...p,
                isDownloaded: true,
                downloadDate: new Date().toISOString().split('T')[0],
              };
            }
            return p;
          });
          onUpdatePackages(updated);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleDelete = (pkgId: string) => {
    const updated = packages.map(p => {
      if (p.id === pkgId) {
        return {
          ...p,
          isDownloaded: false,
          downloadDate: undefined,
        };
      }
      return p;
    });
    onUpdatePackages(updated);
  };

  const totalDownloadedMb = packages
    .filter(p => p.isDownloaded)
    .reduce((sum, p) => sum + p.estimatedSizeMb, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Nagłówek */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <WifiOff className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Menedżer Map Offline</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold border border-teal-500/30">
                  Podróż bez Internetu
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pobierz wybrane regiony świata do pamięci komputera, aby przeglądać mapę i wspomnienia w samolocie lub w podróży.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zawartość */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Przełącznik trybu Offline (Samolotowego) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-400" />
                Tryb symulacji Offline (Brak połączenia z siecią)
              </div>
              <p className="text-[11px] text-slate-400">
                Wymuś korzystanie wyłącznie z lokalnie zapisanych kafelków i bazy danych bez odwołań do serwerów.
              </p>
            </div>
            <button
              onClick={() => onToggleOfflineMode(!isOfflineMode)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                isOfflineMode
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isOfflineMode ? 'Tryb Offline: WŁĄCZONY' : 'Tryb Offline: WYŁĄCZONY'}
            </button>
          </div>

          {/* Statystyki pamięci podręcznej */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-teal-400" />
              <span>Zajęte miejsce na dysku przez mapy offline:</span>
            </div>
            <span className="font-mono font-bold text-teal-400">{totalDownloadedMb} MB</span>
          </div>

          {/* Lista pakietów regionalnych */}
          <div className="space-y-3">
            <h4 className="font-bold text-white">Dostępne pakiety kafelków mapy:</h4>
            <div className="space-y-2">
              {packages.map(pkg => {
                const isDownloadingThis = downloadingId === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{pkg.name}</span>
                        {pkg.isDownloaded && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Pobrane ({pkg.downloadDate})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pkg.region}</p>
                      <span className="text-[10px] text-slate-500">Szacowany rozmiar: ~{pkg.estimatedSizeMb} MB</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDownloadingThis ? (
                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl text-teal-400 font-mono text-[11px]">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{downloadProgress}%</span>
                        </div>
                      ) : pkg.isDownloaded ? (
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-slate-800 transition-colors"
                          title="Usuń pobrany pakiet z dysku"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(pkg.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Pobierz pakiet
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stopka */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
