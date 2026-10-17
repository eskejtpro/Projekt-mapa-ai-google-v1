import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'PPM na mapie', desc: 'Menu dodawania zdjęć lub katalogu w wybranym punkcie' },
  { key: 'Ctrl + V', desc: 'Wklej zdjęcie ze schowka systemowego' },
  { key: 'Upuść na mapę', desc: 'Przeciągnij zdjęcia z dysku i upuść w wybranym miejscu' },
  { key: 'Spacja', desc: 'Uruchomienie / Pauza pokazu slajdów' },
  { key: '← / →', desc: 'Poprzednie / Następne zdjęcie w pokazie i galerii' },
  { key: 'F11', desc: 'Pełny ekran (prezentacja bez ramek)' },
  { key: 'Esc', desc: 'Wyjście z pokazu slajdów lub zamknięcie okna modalnego' },
  { key: 'Ctrl + O', desc: 'Otwórz menedżer importu zdjęć z dysku' },
  { key: 'Win + K', desc: 'Szybkie przesyłanie ekranu na telewizor (Miracast / TV)' },
  { key: '+ / -', desc: 'Płynne przybliżanie i oddalanie mapy świata' },
  { key: 'M', desc: 'Szybki powrót do widoku mapy świata' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Pasek tytułowy */}
        <div className="bg-[#0f172a] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs text-white">Prezent Mapy – Skróty Klawiszowe</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista skrótów */}
        <div className="p-5 space-y-2 text-xs text-slate-300 max-h-[65vh] overflow-y-auto">
          <p className="text-[11px] text-slate-400 mb-3">
            Wygodne skróty klawiszowe ułatwiające sterowanie prezentacją zdjęć i mapą w systemie Windows:
          </p>
          <div className="space-y-2">
            {SHORTCUTS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800"
              >
                <span className="text-slate-300 font-medium">{item.desc}</span>
                <kbd className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold text-[11px] shadow-xs">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Dolny przycisk */}
        <div className="bg-[#0f172a] p-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
