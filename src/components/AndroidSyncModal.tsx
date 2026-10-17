import React, { useState } from 'react';
import { StorageService } from '../types/../services/storage';
import { 
  Smartphone, 
  Download, 
  Upload, 
  CheckCircle2, 
  QrCode, 
  Wifi, 
  X, 
  ShieldCheck, 
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AndroidSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const AndroidSyncModal: React.FC<AndroidSyncModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const json = StorageService.exportPrezentBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prezent_Kopia_Wspomnien_${new Date().toISOString().split('T')[0]}.prezent`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importPrezentBackup(content);
      if (success) {
        setImportStatus('Sukces! Dane wspomnień i mapy zostały pomyślnie przywrócone.');
        setTimeout(() => {
          onDataRestored();
          onClose();
        }, 1500);
      } else {
        setImportStatus('Błąd: Nieprawidłowy plik kopii zapasowej .prezent.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Nagłówek */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">Synchronizacja z Android & Kopia Zapasowa</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Gotowe na Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Prywatna wymiana danych między Windows 10/11 a telefonem z Androidem bez użycia zewnętrznych chmur.
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
          {/* Architektura zgodna z Android Room */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Database className="w-4 h-4" />
              Zgodność Schematu z Android Room Database (Offline-First)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Format pliku <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded">.prezent</code> zawiera znormalizowane tabele: <code className="text-slate-300 font-mono">photos</code>, <code className="text-slate-300 font-mono">albums</code>, <code className="text-slate-300 font-mono">trips</code>, <code className="text-slate-300 font-mono">locations</code>. Baza w telefonie z Androidem mapuje te dane 1:1 do encji Room z kluczami obcymi i transakcyjnym zapisem.
            </p>
          </div>

          {/* Dwie karty: Eksport i Import pliku .prezent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                  <Download className="w-4 h-4 text-amber-400" />
                  Eksport kopii zapasowej
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Zapisz wszystkie albumy, współrzędne, notatki rodzinne i zdjęcia do pojedynczego, bezpiecznego pliku <code className="text-amber-300">.prezent</code>.
                </p>
              </div>

              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Pobierz plik .prezent
              </button>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Import / Przywrócenie z telefonu
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Wgraj plik <code className="text-emerald-300">.prezent</code> wyeksportowany z telefonu z Androidem lub innego komputera z programem.
                </p>
              </div>

              <label className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                Wczytaj plik .prezent
                <input
                  type="file"
                  accept=".prezent,.json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>
            </div>
          </div>

          {/* Status importu */}
          {importStatus && (
            <div className={`p-3 rounded-xl border text-xs font-semibold ${
              importStatus.includes('Sukces')
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/40 border-red-500/40 text-red-300'
            }`}>
              {importStatus}
            </div>
          )}

          {/* Bezpośrednia synchronizacja Wi-Fi (LAN) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                Lokalny protokół P2P przez domowe Wi-Fi
              </div>
              <p className="text-[11px] text-slate-400">
                Aplikacja mobilna na Androida po wykryciu komputera w tej samej sieci domowej może pobrać nowe zdjęcia jednym kliknięciem bez przesyłania do chmury.
              </p>
            </div>

            <div className="w-14 h-14 rounded-xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-900" />
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
