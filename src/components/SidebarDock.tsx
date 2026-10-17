import React from 'react';
import { 
  Globe2, 
  Search, 
  MapPin, 
  Image as ImageIcon, 
  Folder, 
  Clock, 
  Navigation, 
  Play, 
  Tv, 
  WifiOff, 
  Files, 
  HardDrive, 
  Settings, 
  Smartphone,
  BarChart2,
  Sparkles
} from 'lucide-react';

export type ActiveNavTab = 'map' | 'gallery' | 'albums' | 'timeline' | 'trips' | 'stats' | 'duplicates' | 'windows' | 'settings';

interface SidebarDockProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onOpenImport: () => void;
  onStartSlideshow: () => void;
  onOpenTvMode: () => void;
  onOpenOfflineMaps: () => void;
  onOpenAndroidSync: () => void;
  photosCount: number;
  duplicateCount: number;
  transparentSidebar?: boolean;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenImport,
  onStartSlideshow,
  onOpenTvMode,
  onOpenOfflineMaps,
  onOpenAndroidSync,
  photosCount,
  duplicateCount,
  transparentSidebar = true,
}) => {
  return (
    <aside
      className={`w-14 sm:w-16 border-r border-slate-800/90 flex flex-col items-center justify-between py-3 z-30 select-none shrink-0 ${
        transparentSidebar ? 'bg-[#0a0f1d]/90 backdrop-blur-md' : 'bg-[#0f172a]'
      }`}
    >
      {/* Górna sekcja: Logo i główne widoki */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Przycisk logo */}
        <button
          onClick={() => onSelectTab('map')}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer group relative"
          title="Prezent Mapy – Strona główna mapy"
        >
          <Globe2 className="w-5 h-5 stroke-[2.4]" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Prezent Mapy – Mapa Świata
          </span>
        </button>

        <div className="w-8 h-px bg-slate-800 my-0.5" />

        {/* 1. Mapa Świata */}
        <button
          onClick={() => onSelectTab('map')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'map'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Interaktywna Mapa Świata"
        >
          <MapPin className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Mapa Świata
          </span>
        </button>

        {/* 2. Galeria Wszystkie Zdjęcia */}
        <button
          onClick={() => onSelectTab('gallery')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'gallery'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Wszystkie Zdjęcia & Galeria"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Wszystkie Zdjęcia ({photosCount})
          </span>
        </button>

        {/* 3. Albumy */}
        <button
          onClick={() => onSelectTab('albums')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'albums'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Albumy & Kolekcje"
        >
          <Folder className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Albumy Podróżnicze
          </span>
        </button>

        {/* 4. Oś Czasu */}
        <button
          onClick={() => onSelectTab('timeline')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'timeline'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Oś Czasu Wspomnień"
        >
          <Clock className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Oś Czasu (Chronologia)
          </span>
        </button>

        {/* 5. Trasy Wypraw */}
        <button
          onClick={() => onSelectTab('trips')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'trips'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Trasy Wypraw"
        >
          <Navigation className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Prezentacja Tras Podróży
          </span>
        </button>

        {/* 6. Statystyki podróżnika */}
        <button
          onClick={() => onSelectTab('stats')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'stats'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Statystyki i Osiągnięcia Podróżnicze"
        >
          <BarChart2 className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Statystyki Odwiedzonych Miejsc
          </span>
        </button>

        {/* 7. Wykrywacz duplikatów */}
        <button
          onClick={() => onSelectTab('duplicates')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'duplicates'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Diagnostyka Duplikatów Zdjęć"
        >
          <Files className="w-5 h-5" />
          {duplicateCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Wykrywanie Duplikatów {duplicateCount > 0 ? `(${duplicateCount})` : ''}
          </span>
        </button>

        <div className="w-8 h-px bg-slate-800 my-0.5" />

        {/* Szybkie narzędzia prezentacji */}
        <button
          onClick={onStartSlideshow}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 text-amber-400 hover:text-white hover:from-amber-500 hover:to-emerald-500 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer group relative border border-amber-500/30"
          title="Kinowy Pokaz Slajdów (Spacja)"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Uruchom Pokaz Slajdów
          </span>
        </button>

        <button
          onClick={onOpenTvMode}
          className="w-10 h-10 rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-600/30 flex items-center justify-center transition-all cursor-pointer group relative"
          title="Tryb TV / Salon 4K"
        >
          <Tv className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Tryb TV (Salon 4K)
          </span>
        </button>
      </div>

      {/* Dolna sekcja: Pliki Windows, Offline, Ustawienia */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Mapy Offline */}
        <button
          onClick={onOpenOfflineMaps}
          className="w-10 h-10 rounded-xl text-teal-400 hover:text-white hover:bg-teal-600/30 flex items-center justify-center transition-all cursor-pointer group relative"
          title="Pakiety Map Offline"
        >
          <WifiOff className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Mapy Offline (bez sieci)
          </span>
        </button>

        {/* Windows Explorer */}
        <button
          onClick={() => onSelectTab('windows')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'windows'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Eksplorator Windows & Dane"
        >
          <HardDrive className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Pliki Komputera Windows
          </span>
        </button>

        <div className="w-8 h-px bg-slate-800 my-0.5" />

        {/* Koło Zębate - Ustawienia (wzorowane na Obrazie 1) */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
            activeTab === 'settings'
              ? 'bg-slate-100 text-slate-950 font-bold shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Panel Ustawień (12 Kategorii)"
        >
          <Settings className="w-5 h-5" />
          <span className="absolute left-14 bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
            Ustawienia & Personalizacja
          </span>
        </button>
      </div>
    </aside>
  );
};
