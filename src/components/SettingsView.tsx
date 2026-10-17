import React, { useState } from 'react';
import { AppSettings } from '../types/travel';
import { 
  Settings, 
  Palette, 
  Map, 
  Image as ImageIcon, 
  FolderSync, 
  Play, 
  Tv, 
  HardDrive, 
  Save, 
  Zap, 
  ShieldCheck, 
  Info,
  Search,
  Check,
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  LayoutGrid,
  CheckCircle2,
  Trash2,
  FolderOpen
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearCache: () => void;
  onResetSettings: () => void;
  photosCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onClearCache,
  onResetSettings,
  photosCount,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('appearance');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveBanner, setSaveBanner] = useState<boolean>(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const categories = [
    { id: 'general', name: 'Ogólne', icon: Settings, desc: 'Profil rodziny, język i jednostki' },
    { id: 'appearance', name: 'Wygląd i personalizacja', icon: Palette, desc: 'Motyw interfejsu, kolory i siatka' },
    { id: 'map', name: 'Mapa i geolokalizacja', icon: Map, desc: 'Warstwy, klastrowanie i trasy' },
    { id: 'gallery', name: 'Galeria i zdjęcia', icon: ImageIcon, desc: 'Sortowanie, odznaki EXIF i układ' },
    { id: 'import', name: 'Import oraz foldery', icon: FolderSync, desc: 'Ścieżki Windows i skanowanie' },
    { id: 'slideshow', name: 'Pokaz slajdów', icon: Play, desc: 'Ken Burns, przejścia i ambient audio' },
    { id: 'tv', name: 'Telewizor i prezentacja', icon: Tv, desc: 'Tryb salonu 4K i pilot Smart Remote' },
    { id: 'storage', name: 'Pamięć i dane lokalne', icon: HardDrive, desc: 'Pamięć podręczna i diagnostyka' },
    { id: 'backup', name: 'Kopie zapasowe', icon: Save, desc: 'Archiwum .prezent i automatyzacja' },
    { id: 'performance', name: 'Wydajność', icon: Zap, desc: 'Akceleracja sprzętowa i optymalizacja' },
    { id: 'privacy', name: 'Prywatność', icon: ShieldCheck, desc: 'Zasady bezpieczeństwa offline' },
    { id: 'about', name: 'Informacje o aplikacji', icon: Info, desc: 'Wersja, licencja i pomoc' },
  ];

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#0c101c] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl">
      {/* LEWY PANEL KATEGORII USTAWIEŃ (Untitled UI Style) */}
      <div className="w-full md:w-72 bg-[#090d18] border-b md:border-b-0 md:border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              Ustawienia programu
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Personalizuj działanie i wygląd aplikacji Prezent
            </p>
          </div>

          {/* Wyszukiwarka ustawień */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Szukaj opcji..."
              className="w-full bg-[#121829] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Lista kategorii */}
          <nav className="space-y-1 max-h-[58vh] overflow-y-auto pr-1">
            {filteredCategories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dolny przycisk resetu */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onResetSettings}
            className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Przywróć domyślne
          </button>
          {saveBanner && (
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" /> Zapisano
            </span>
          )}
        </div>
      </div>

      {/* PRAWY PANEL KONFIGURACJI WYBRANEJ KATEGORII */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[82vh] space-y-6 text-xs text-slate-300">
        {/* KATEGORIA 1: OGÓLNE */}
        {activeCategory === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Ustawienia ogólne</h3>
              <p className="text-xs text-slate-400 mt-1">Podstawowa tożsamość albumu rodzinnego i jednostki miar.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-white font-semibold">Nazwa profilu rodzinnego / albumu:</label>
                <input
                  type="text"
                  value={settings.familyName}
                  onChange={e => update('familyName', e.target.value)}
                  className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-white font-semibold">Język interfejsu:</label>
                  <select
                    value={settings.language}
                    onChange={e => update('language', e.target.value as 'pl' | 'en')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="pl">Polski (Domyślny)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white font-semibold">Jednostka odległości na trasach:</label>
                  <select
                    value={settings.distanceUnit}
                    onChange={e => update('distanceUnit', e.target.value as 'km' | 'mi')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="km">Kilometry (km)</option>
                    <option value="mi">Mile (mi)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <div>
                  <div className="text-white font-semibold">Automatyczny start z systemem Windows:</div>
                  <div className="text-slate-400 text-[11px]">Uruchamiaj aplikację po zalogowaniu do systemu Windows 10/11</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoStartWithWindows}
                  onChange={e => update('autoStartWithWindows', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 2: WYGLĄD I PERSONALIZACJA (Wzorowane na Zrzucie Ekranu 1) */}
        {activeCategory === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Wygląd i personalizacja</h3>
              <p className="text-xs text-slate-400 mt-1">Dostosuj motyw interfejsu, kolory akcentów i styl układu.</p>
            </div>

            {/* Wizualny wybór motywu (Karty jak na załączonym obrazie 1) */}
            <div className="space-y-3">
              <label className="text-white font-semibold block">Motyw interfejsu (Interface theme):</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* System preference */}
                <div
                  onClick={() => update('interfaceTheme', 'system')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    settings.interfaceTheme === 'system'
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-[#121829] hover:border-slate-700'
                  }`}
                >
                  <div className="aspect-16/10 rounded-xl bg-gradient-to-r from-slate-950 to-slate-200 border border-slate-700/60 p-2 flex flex-col justify-between mb-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="h-2 w-12 bg-slate-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Systemowy</span>
                    {settings.interfaceTheme === 'system' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </div>

                {/* Dark mode */}
                <div
                  onClick={() => update('interfaceTheme', 'dark')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    settings.interfaceTheme === 'dark'
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-[#121829] hover:border-slate-700'
                  }`}
                >
                  <div className="aspect-16/10 rounded-xl bg-slate-950 border border-slate-800 p-2 flex flex-col justify-between mb-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="h-2 w-16 bg-slate-800 rounded" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Ciemny (Dark)</span>
                    {settings.interfaceTheme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </div>

                {/* Light mode */}
                <div
                  onClick={() => update('interfaceTheme', 'light')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    settings.interfaceTheme === 'light'
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-[#121829] hover:border-slate-700'
                  }`}
                >
                  <div className="aspect-16/10 rounded-xl bg-slate-200 border border-slate-400 p-2 flex flex-col justify-between mb-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="h-2 w-16 bg-slate-400 rounded" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Jasny (Light)</span>
                    {settings.interfaceTheme === 'light' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Przełącznik przezroczystości bocznego docka */}
            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Przezroczysty pasek boczny (Transparent sidebar):</div>
                <div className="text-slate-400 text-[11px]">Subtelny efekt szkła akrylowego Windows Mica w docku nawigacyjnym</div>
              </div>
              <input
                type="checkbox"
                checked={settings.transparentSidebar}
                onChange={e => update('transparentSidebar', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Gęstość siatki zdjęć */}
            <div className="space-y-3">
              <label className="text-white font-semibold block">Gęstość widoku galerii (Gallery density):</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => update('galleryDensity', 'default')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    settings.galleryDensity === 'default'
                      ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                      : 'border-slate-800 bg-[#121829] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">Standardowa siatka (Default)</div>
                  <div className="text-[11px] text-slate-400">Optymalna dla zdjęć z opisami wspomnień</div>
                </button>
                <button
                  type="button"
                  onClick={() => update('galleryDensity', 'compact')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    settings.galleryDensity === 'compact'
                      ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                      : 'border-slate-800 bg-[#121829] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">Kompaktowa siatka (Compact)</div>
                  <div className="text-[11px] text-slate-400">Więcej miniatur na jednym ekranie</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 3: MAPA I GEOLOKALIZACJA */}
        {activeCategory === 'map' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Mapa i geolokalizacja</h3>
              <p className="text-xs text-slate-400 mt-1">Domyślne podkłady kartograficzne, klastrowanie i trasy.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-white font-semibold">Domyślna warstwa mapy:</label>
                <select
                  value={settings.defaultMapLayer}
                  onChange={e => update('defaultMapLayer', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="dark">CartoDB Dark Matter (Nocny luksusowy)</option>
                  <option value="satellite">Esri World Imagery (Fotorealistyczna satelita)</option>
                  <option value="light">CartoDB Positron (Minimalistyczny jasny)</option>
                  <option value="osm">OpenStreetMap Standard</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Animowane linie tras podróży:</div>
                  <div className="text-slate-400 text-[11px]">Rysowanie tras przerywaną linią z ponumerowanymi etapami</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showAnimatedRoutes}
                  onChange={e => update('showAnimatedRoutes', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Automatyczne centrowanie na zdjęciach:</div>
                  <div className="text-slate-400 text-[11px]">Dopasowuje zoom mapy po wybraniu podróży lub kraju</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoCenterOnPhotos}
                  onChange={e => update('autoCenterOnPhotos', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 4: GALERIA I ZDJĘCIA */}
        {activeCategory === 'gallery' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Galeria i zdjęcia</h3>
              <p className="text-xs text-slate-400 mt-1">Ustawienia sortowania, odznak EXIF i grupowania chronologicznego.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-white font-semibold">Domyślny porządek sortowania:</label>
                <select
                  value={settings.defaultSortBy}
                  onChange={e => update('defaultSortBy', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="date-desc">Data wykonania: Od najnowszych</option>
                  <option value="date-asc">Data wykonania: Od najstarszych</option>
                  <option value="location">Lokalizacja (Kraj / Miasto)</option>
                  <option value="title">Tytuł alfabetycznie</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Odznaki EXIF GPS na miniaturach:</div>
                  <div className="text-slate-400 text-[11px]">Wyświetlaj ikony aparatu i statusu lokalizacji w rogu zdjęcia</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showExifBadges}
                  onChange={e => update('showExifBadges', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Wykrywanie duplikatów:</div>
                  <div className="text-slate-400 text-[11px]">Skanuj bazę w poszukiwaniu identycznych ujęć z wakacji</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDetectDuplicates}
                  onChange={e => update('autoDetectDuplicates', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 5: IMPORT ORAZ FOLDERY */}
        {activeCategory === 'import' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Import oraz foldery robocze</h3>
              <p className="text-xs text-slate-400 mt-1">Lokalizacja biblioteki w systemie Windows i reguły importu.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-white font-semibold">Katalog roboczy w systemie Windows:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.windowsPhotosPath}
                    onChange={e => update('windowsPhotosPath', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                  <button
                    onClick={() => alert(`Folder roboczy: ${settings.windowsPhotosPath}`)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
                  >
                    Przeglądaj
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Automatyczny odczyt EXIF przy imporcie:</div>
                  <div className="text-slate-400 text-[11px]">Wyciągaj GPS, datę oraz dane aparatu natychmiast po wyborze pliku</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.readExifOnImport}
                  onChange={e => update('readExifOnImport', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 6: POKAZ SLAJDÓW */}
        {activeCategory === 'slideshow' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Pokaz slajdów</h3>
              <p className="text-xs text-slate-400 mt-1">Konfiguracja kinowego odtwarzacza wspomnień na pełnym ekranie.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white font-semibold">Czas trwania slajdu:</label>
                  <select
                    value={settings.slideshowInterval}
                    onChange={e => update('slideshowInterval', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={3}>3 sekundy (Szybki)</option>
                    <option value={5}>5 sekund</option>
                    <option value={6}>6 sekund (Zalecany)</option>
                    <option value={8}>8 sekund</option>
                    <option value={12}>12 sekund (Spokojny)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white font-semibold">Styl przejścia slajdów:</label>
                  <select
                    value={settings.slideshowTransition}
                    onChange={e => update('slideshowTransition', e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="fade">Kinowe przenikanie (Crossfade)</option>
                    <option value="slide">Płynne przesunięcie (Slide)</option>
                    <option value="zoom">Powiększenie (Zoom)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Efekt kinowy Ken Burns:</div>
                  <div className="text-slate-400 text-[11px]">Subtelne, powolne zbliżanie kadru podczas prezentacji</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.kenBurnsEnabled}
                  onChange={e => update('kenBurnsEnabled', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Picture-in-Picture Mini-Mapa:</div>
                  <div className="text-slate-400 text-[11px]">Wyświetlaj w rogu mapę z lokalizacją aktualnego zdjęcia</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showMiniMapPip}
                  onChange={e => update('showMiniMapPip', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Nastrojowy ambient dźwiękowy w tle:</div>
                  <div className="text-slate-400 text-[11px]">Łagodne odgłosy oceanu generowane przez Web Audio API</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ambientSoundEnabled}
                  onChange={e => update('ambientSoundEnabled', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 7: TELEWIZOR I PREZENTACJA */}
        {activeCategory === 'tv' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Telewizor i prezentacja w salonie</h3>
              <p className="text-xs text-slate-400 mt-1">Ustawienia wyświetlania na dużych ekranach TV 4K i sterowania.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-white font-semibold">Rozdzielczość docelowa ekranu TV:</label>
                <select
                  value={settings.tvTargetResolution}
                  onChange={e => update('tvTargetResolution', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="4k">Ekran 4K Ultra HD (3840 x 2160)</option>
                  <option value="1080p">Ekran Full HD (1920 x 1080)</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Kod QR Smart Remote na ekranie:</div>
                  <div className="text-slate-400 text-[11px]">Pozwala gościom przewijać zdjęcia z poziomu smartfona</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableSmartRemoteQr}
                  onChange={e => update('enableSmartRemoteQr', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 8: PAMIĘĆ I DANE LOKALNE */}
        {activeCategory === 'storage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Pamięć i dane lokalne</h3>
              <p className="text-xs text-slate-400 mt-1">Rozmiar bazy, czyszczenie pamięci podręcznej i stan plików.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Liczba zapisanych wspomnień:</span>
                <span className="font-mono font-bold text-white">{photosCount} zdjęć</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-white font-semibold">Pamięć podręczna kafelków mapy:</div>
                  <div className="text-slate-400 text-[11px]">Kafelki offline zapisane w pamięci komputera</div>
                </div>
                <button
                  onClick={onClearCache}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-200 hover:text-red-400 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Wyczyść cache mapy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 9: KOPIE ZAPASOWE */}
        {activeCategory === 'backup' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Kopie zapasowe (.prezent)</h3>
              <p className="text-xs text-slate-400 mt-1">Automatyczne archiwum biblioteki i eksport na pendrive.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-white font-semibold">Częstotliwość przypomnień o kopii:</label>
                <select
                  value={settings.autoBackupIntervalDays}
                  onChange={e => update('autoBackupIntervalDays', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value={7}>Co 7 dni</option>
                  <option value={14}>Co 14 dni</option>
                  <option value={30}>Co miesiąc</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Dołączaj miniatury do pliku .prezent:</div>
                  <div className="text-slate-400 text-[11px]">Pozwala na pełny podgląd fotografii bez dostępu do oryginalnego dysku</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeThumbnailsInBackup}
                  onChange={e => update('includeThumbnailsInBackup', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 10: WYDAJNOŚĆ */}
        {activeCategory === 'performance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Wydajność</h3>
              <p className="text-xs text-slate-400 mt-1">Płynność renderowania mapy i obsługa dużych kolekcji zdjęć.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Akceleracja sprzętowa GPU:</div>
                  <div className="text-slate-400 text-[11px]">Wykorzystaj kartę graficzną do płynnych animacji mapy Leaflet</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hardwareAcceleration}
                  onChange={e => update('hardwareAcceleration', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <div className="text-white font-semibold">Leniwe ładowanie miniatur (Lazy loading):</div>
                  <div className="text-slate-400 text-[11px]">Ładuj zdjęcia dopiero gdy stają się widoczne w oknie</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.lazyLoadImages}
                  onChange={e => update('lazyLoadImages', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 11: PRYWATNOŚĆ */}
        {activeCategory === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Prywatność i bezpieczeństwo</h3>
              <p className="text-xs text-slate-400 mt-1">Zasady lokalnego przechowywania bez wysyłania do chmury.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                ✓ <strong>Gwarancja prywatności:</strong> Aplikacja Prezent działa w 100% lokalnie na Twoim komputerze z systemem Windows 10/11. Żadne zdjęcia, notatki ani koordynaty nie są przesyłane do zewnętrznych serwerów.
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="text-white font-semibold">Wymazuj współrzędne GPS przy eksporcie:</div>
                  <div className="text-slate-400 text-[11px]">Usuwa dokładne koordynaty geograficzne w plikach udostępnianych znajomym</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.stripGpsOnExport}
                  onChange={e => update('stripGpsOnExport', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* KATEGORIA 12: INFORMACJE O APLIKACJI */}
        {activeCategory === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">O programie Prezent</h3>
              <p className="text-xs text-slate-400 mt-1">Informacje o wersji, bibliotekach i prawach autorskich.</p>
            </div>

            <div className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black">
                  <Settings className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Prezent – Desktop Edition</h4>
                  <p className="text-[11px] text-slate-400">Wersja {settings.appVersion}</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-[11px] text-slate-400">
                <p>• Zaprojektowano do prezentowania wspomnień rodzinnych i podróży na mapie świata.</p>
                <p>• Silnik map: Leaflet & OpenStreetMap / CartoDB / Esri Satellite.</p>
                <p>• Odczyt metadanych: exifr (GPS, aparat, data).</p>
                <p>• Dźwięk ambient: Web Audio API (szum oceanu, 100% offline).</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
