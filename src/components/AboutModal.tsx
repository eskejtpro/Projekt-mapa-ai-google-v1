import React from 'react';
import { APP_VERSION } from '../version';
import { Globe2, X, CheckCircle2, HardDrive, ShieldCheck, Cpu } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  photosCount: number;
  albumsCount: number;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  photosCount,
  albumsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Pasek tytułowy okna dialogowego Windows */}
        <div className="bg-[#0f172a] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs text-white">Prezent Mapy – Właściwości Programu</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Zawartość */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 flex items-center justify-center shadow-lg text-slate-950 font-black shrink-0">
              <Globe2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Prezent Mapy</h3>
              <p className="text-[11px] text-slate-400">Wersja {APP_VERSION} (Desktop Preview)</p>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Program gotowy do użytku lokalnego</p>
            </div>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Przeznaczenie:</span>
              <span className="text-slate-200 font-semibold">Wspomnienia rodzinne & podróże na mapie</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Środowisko:</span>
              <span className="text-slate-200">Windows 10 / 11 (64-bit Desktop)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Lokalna baza danych:</span>
              <span className="text-slate-200 font-mono">{photosCount} wspomnień w {albumsCount} albumach</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Prywatność:</span>
              <span className="text-emerald-400 font-semibold">100% Offline (brak wysyłania do chmury)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Katalog roboczy:</span>
              <span className="text-slate-300 font-mono text-[10px]">C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Aplikacja została zaprojektowana tak, aby cała rodzina mogła wspólnie zasiąść przed ekranem komputera lub telewizora i w kinowy sposób wspominać najpiękniejsze wakacje i wyprawy.
          </div>
        </div>

        {/* Dolny przycisk OK */}
        <div className="bg-[#0f172a] p-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
