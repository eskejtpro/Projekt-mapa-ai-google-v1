import React, { useState } from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Globe2, 
  FolderOpen, 
  Upload, 
  Save, 
  Tv, 
  Play, 
  WifiOff, 
  Smartphone, 
  HelpCircle, 
  Info, 
  ExternalLink,
  RotateCcw,
  Maximize2,
  Copy
} from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onMinimize: () => void;
  onCloseApp: () => void;
  onOpenImport: () => void;
  onStartSlideshow: () => void;
  onOpenTvMode: () => void;
  onOpenOfflineMaps: () => void;
  onOpenAndroidSync: () => void;
  onOpenAbout: () => void;
  onOpenWindowsFolder: () => void;
  onSelectTab: (tab: 'map' | 'gallery' | 'trips' | 'windows') => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isMaximized,
  onToggleMaximize,
  onMinimize,
  onCloseApp,
  onOpenImport,
  onStartSlideshow,
  onOpenTvMode,
  onOpenOfflineMaps,
  onOpenAndroidSync,
  onOpenAbout,
  onOpenWindowsFolder,
  onSelectTab,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setActiveMenu(prev => prev === name ? null : name);
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div className="bg-[#182030] text-slate-200 select-none border-b border-slate-700/80 relative z-50">
      {/* Główny pasek tytułowy okna Windows 10/11 */}
      <div className="flex items-center justify-between h-9 px-2 text-xs">
        {/* Lewa strona: Ikona programu, Nazwa i Menu Windows */}
        <div className="flex items-center gap-2">
          {/* Ikona Windows App */}
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-sm ml-1">
            <Globe2 className="w-3.5 h-3.5" />
          </div>

          <span className="font-semibold text-slate-200 text-[11px] tracking-wide mr-2 flex items-center gap-1.5">
            Prezent Mapy – Rodzinne Wspomnienia i Podróże na Mapie Świata
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">[Windows 11 Desktop Edition]</span>
          </span>

          {/* Menu rozwijane w stylu tradycyjnych aplikacji Windows */}
          <div className="hidden md:flex items-center text-[11px] text-slate-300">
            {/* Menu: Plik */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('file')}
                className={`px-2.5 py-1 rounded hover:bg-slate-700/60 transition-colors ${
                  activeMenu === 'file' ? 'bg-slate-700 text-white' : ''
                }`}
              >
                Plik
              </button>
              {activeMenu === 'file' && (
                <div
                  onMouseLeave={closeMenu}
                  className="absolute left-0 top-full mt-0.5 w-60 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    onClick={() => { closeMenu(); onOpenImport(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Importuj zdjęcia z dysku</span>
                    <span className="text-[10px] text-slate-400">Ctrl+O</span>
                  </button>
                  <button
                    onClick={() => { closeMenu(); onOpenWindowsFolder(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Otwórz folder w Eksploratorze</span>
                    <span className="text-[10px] text-slate-400">Win+E</span>
                  </button>
                  <div className="h-px bg-slate-700 my-1" />
                  <button
                    onClick={() => { closeMenu(); onOpenAndroidSync(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Eksportuj kopię (.prezent)</span>
                    <span className="text-[10px] text-slate-400">Ctrl+S</span>
                  </button>
                  <div className="h-px bg-slate-700 my-1" />
                  <button
                    onClick={() => { closeMenu(); onCloseApp(); }}
                    className="w-full px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center justify-between transition-colors text-left"
                  >
                    <span>Zamknij program</span>
                    <span className="text-[10px] text-slate-400">Alt+F4</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu: Widok */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('view')}
                className={`px-2.5 py-1 rounded hover:bg-slate-700/60 transition-colors ${
                  activeMenu === 'view' ? 'bg-slate-700 text-white' : ''
                }`}
              >
                Widok
              </button>
              {activeMenu === 'view' && (
                <div
                  onMouseLeave={closeMenu}
                  className="absolute left-0 top-full mt-0.5 w-52 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 z-50"
                >
                  <button
                    onClick={() => { closeMenu(); onSelectTab('map'); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span>Interaktywna Mapa Świata</span>
                    <span className="text-[10px] text-slate-400">Ctrl+1</span>
                  </button>
                  <button
                    onClick={() => { closeMenu(); onSelectTab('gallery'); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span>Galeria & Albumy Rodzinne</span>
                    <span className="text-[10px] text-slate-400">Ctrl+2</span>
                  </button>
                  <button
                    onClick={() => { closeMenu(); onSelectTab('trips'); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span>Prezentacja Tras Podróży</span>
                    <span className="text-[10px] text-slate-400">Ctrl+3</span>
                  </button>
                  <div className="h-px bg-slate-700 my-1" />
                  <button
                    onClick={() => { closeMenu(); onToggleMaximize(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span>{isMaximized ? 'Przywróć okno' : 'Maksymalizuj okno'}</span>
                    <span className="text-[10px] text-slate-400">F11</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu: Narzędzia */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('tools')}
                className={`px-2.5 py-1 rounded hover:bg-slate-700/60 transition-colors ${
                  activeMenu === 'tools' ? 'bg-slate-700 text-white' : ''
                }`}
              >
                Narzędzia
              </button>
              {activeMenu === 'tools' && (
                <div
                  onMouseLeave={closeMenu}
                  className="absolute left-0 top-full mt-0.5 w-60 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 z-50"
                >
                  <button
                    onClick={() => { closeMenu(); onStartSlideshow(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left font-bold text-amber-300"
                  >
                    <span className="flex items-center gap-2"><Play className="w-3.5 h-3.5 fill-current" /> Kinowy pokaz slajdów</span>
                    <span className="text-[10px] text-slate-400 font-normal">Spacja</span>
                  </button>
                  <button
                    onClick={() => { closeMenu(); onOpenTvMode(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="flex items-center gap-2"><Tv className="w-3.5 h-3.5" /> Prezentacja na TV (Salon 4K)</span>
                    <span className="text-[10px] text-slate-400">Win+K</span>
                  </button>
                  <div className="h-px bg-slate-700 my-1" />
                  <button
                    onClick={() => { closeMenu(); onOpenOfflineMaps(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="flex items-center gap-2"><WifiOff className="w-3.5 h-3.5" /> Menedżer map offline</span>
                  </button>
                  <button
                    onClick={() => { closeMenu(); onOpenAndroidSync(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-between transition-colors text-left"
                  >
                    <span className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> Synchronizacja z telefonem Android</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu: Pomoc */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('help')}
                className={`px-2.5 py-1 rounded hover:bg-slate-700/60 transition-colors ${
                  activeMenu === 'help' ? 'bg-slate-700 text-white' : ''
                }`}
              >
                Pomoc
              </button>
              {activeMenu === 'help' && (
                <div
                  onMouseLeave={closeMenu}
                  className="absolute left-0 top-full mt-0.5 w-52 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 z-50"
                >
                  <button
                    onClick={() => { closeMenu(); onOpenAbout(); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center gap-2 transition-colors text-left"
                  >
                    <Info className="w-3.5 h-3.5" /> O programie Prezent Mapy
                  </button>
                  <button
                    onClick={() => { closeMenu(); alert('Skróty klawiszowe programu Prezent Mapy:\n\n• Spacja: Uruchom/Pauza pokazu slajdów\n• Strzałki ← / →: Następne/poprzednie zdjęcie\n• F11: Pełny ekran\n• Esc: Wyjście z pokazu\n• Ctrl+O: Import zdjęć z dysku\n• Win+K: Przesyłanie na TV'); }}
                    className="w-full px-3 py-1.5 hover:bg-amber-500 hover:text-slate-950 flex items-center gap-2 transition-colors text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Skróty klawiszowe
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prawa strona: Klasyczne przyciski kontroli okna Windows (Minimalizuj, Maksymalizuj, Zamknij) */}
        <div className="flex items-center h-full">
          {/* Przycisk Minimalizuj */}
          <button
            onClick={onMinimize}
            className="w-11 h-9 flex items-center justify-center hover:bg-slate-700/70 transition-colors text-slate-300 hover:text-white cursor-pointer"
            title="Minimalizuj okno"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Przycisk Maksymalizuj / Przywróć */}
          <button
            onClick={onToggleMaximize}
            className="w-11 h-9 flex items-center justify-center hover:bg-slate-700/70 transition-colors text-slate-300 hover:text-white cursor-pointer"
            title={isMaximized ? "Przywróć okno w dół" : "Maksymalizuj okno"}
          >
            {isMaximized ? (
              <Copy className="w-3.5 h-3.5 rotate-180" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Przycisk Zamknij z charakterystycznym czerwonym tłem Windows */}
          <button
            onClick={onCloseApp}
            className="w-11 h-9 flex items-center justify-center hover:bg-[#e81123] transition-colors text-slate-300 hover:text-white cursor-pointer"
            title="Zamknij okno"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
