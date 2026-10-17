import React, { useState, useEffect } from 'react';
import { TravelPhoto, TravelAlbum, TravelTrip } from '../types/travel';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  Folder, 
  Clock, 
  Grid, 
  Play, 
  Trash2, 
  SlidersHorizontal,
  Compass,
  Camera,
  Layers,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface GalleryViewProps {
  photos: TravelPhoto[];
  albums: TravelAlbum[];
  trips: TravelTrip[];
  onSelectPhoto: (photo: TravelPhoto) => void;
  onToggleFavorite: (id: string) => void;
  onDeletePhoto: (id: string) => void;
  onStartSlideshow: (photos: TravelPhoto[]) => void;
  onSelectAlbum: (albumId: string | null) => void;
  selectedAlbumId: string | null;
  density?: 'default' | 'compact' | 'large';
  showExifBadges?: boolean;
  defaultSortBy?: 'date-desc' | 'date-asc' | 'title' | 'location';
  lazyLoadImages?: boolean;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  albums,
  trips,
  onSelectPhoto,
  onToggleFavorite,
  onDeletePhoto,
  onStartSlideshow,
  onSelectAlbum,
  selectedAlbumId,
  density = 'default',
  showExifBadges = true,
  defaultSortBy = 'date-desc',
  lazyLoadImages = true,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'albums'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title' | 'location'>(defaultSortBy);
  useEffect(() => { setSortBy(defaultSortBy); }, [defaultSortBy]);

  const availableCountries = Array.from(new Set(photos.map(p => p.location.countryName))).sort();
  const availableYears = Array.from(new Set(photos.map(p => p.date.substring(0, 4)))).sort().reverse();

  // Filtrowanie i sortowanie
  const filteredPhotos = photos
    .filter(p => {
      if (selectedAlbumId && p.albumId !== selectedAlbumId) return false;
      if (onlyFavorites && !p.isFavorite) return false;
      if (countryFilter !== 'ALL' && p.location.countryName !== countryFilter) return false;
      if (yearFilter !== 'ALL' && !p.date.startsWith(yearFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCity = p.location.cityName.toLowerCase().includes(q);
        const matchCountry = p.location.countryName.toLowerCase().includes(q);
        const matchNotes = p.notes.toLowerCase().includes(q);
        const matchPeople = p.participants.some(person => person.toLowerCase().includes(q));
        const matchTags = p.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchCity && !matchCountry && !matchNotes && !matchPeople && !matchTags) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'location') return a.location.cityName.localeCompare(b.location.cityName, 'pl');
      return a.title.localeCompare(b.title);
    });

  // Grupowanie według miesięcy/lat dla stylu Windows Photos (Obraz 2)
  const groupedSections: { dateTitle: string; items: TravelPhoto[] }[] = [];
  const groupsMap = new Map<string, TravelPhoto[]>();

  filteredPhotos.forEach(p => {
    const yearMonth = p.date.substring(0, 7); // YYYY-MM
    const existing = groupsMap.get(yearMonth) || [];
    existing.push(p);
    groupsMap.set(yearMonth, existing);
  });

  groupsMap.forEach((items, yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const monthName = dateObj.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    groupedSections.push({
      dateTitle: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      items,
    });
  });

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Pasek Górny - Styl Windows Photos (Obraz 2) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Lewy nagłówek Windows Photos */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Wszystkie zdjęcia (All Photos)</h2>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
              {filteredPhotos.length} fotografii
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Lokalna kolekcja fotografii rodzinnych uporządkowana chronologicznie i geograficznie
          </p>
        </div>

        {/* Prawy panel filtrów */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Wyszukiwarka */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Szukaj: Rzym, plaża, Zosia..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filtr Kraju */}
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="ALL">Wszystkie kraje</option>
            {availableCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sortowanie */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="date-desc">Najnowsze</option>
            <option value="date-asc">Najstarsze</option>
            <option value="title">Tytuł A-Z</option>
            <option value="location">Miejscowość A-Z</option>
          </select>

          {/* Ulubione */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`p-2 rounded-xl border transition-all ${
              onlyFavorites
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Tylko ulubione zdjęcia"
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
          </button>

          {/* Start Pokazu Slajdów */}
          <button
            onClick={() => onStartSlideshow(filteredPhotos)}
            disabled={filteredPhotos.length === 0}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Pokaz slajdów ({filteredPhotos.length})
          </button>
        </div>
      </div>

      {/* Aktywny filtr albumu */}
      {selectedAlbumId && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Wybrany album:</span>
            <span className="font-bold text-amber-400">{albums.find(a => a.id === selectedAlbumId)?.name}</span>
          </div>
          <button
            onClick={() => onSelectAlbum(null)}
            className="text-amber-400 hover:underline font-semibold cursor-pointer"
          >
            Pokaż całą bibliotekę ✕
          </button>
        </div>
      )}

      {/* SEKCJE ZDJĘĆ Z PODZIAŁEM NA DATY (Jak na Obrazie 2 - Windows Photos) */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Brak zdjęć spełniających wybrane kryteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Zmień filtry lub zaimportuj nowe rodzinne zdjęcia z komputera.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSections.map(section => (
            <div key={section.dateTitle} className="space-y-3">
              {/* Nagłówek sekcji daty */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {section.dateTitle}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {section.items.length} {section.items.length === 1 ? 'zdjęcie' : 'zdjęć'}
                </span>
              </div>

              {/* Siatka zdjęć o zróżnicowanych proporcjach */}
              <div className={`grid gap-3 ${
                density === 'compact'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              }`}>
                {section.items.map((photo, pIdx) => {
                  // Różne warianty wysokości kafelków jak w Windows Photos (Obraz 2)
                  const isFeatured = pIdx % 7 === 0;

                  return (
                    <div
                      key={photo.id}
                      className={`group relative bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg hover:border-amber-500/60 hover:shadow-2xl transition-all duration-300 flex flex-col ${
                        isFeatured && density !== 'compact' ? 'sm:col-span-2 aspect-16/9' : 'aspect-4/3'
                      }`}
                    >
                      {/* Obraz miniatury */}
                      <div
                        onClick={() => onSelectPhoto(photo)}
                        className="w-full h-full cursor-pointer relative overflow-hidden bg-slate-950"
                      >
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.title}
                          loading={lazyLoadImages ? 'lazy' : 'eager'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Winieta dolna */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                        {/* Odznaki w lewym górnym rogu (Obraz 2) */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          {showExifBadges && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 shadow">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              {photo.location.cityName}
                            </span>
                          )}
                          {photo.isDemo && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                              Demo
                            </span>
                          )}
                        </div>

                        {/* Przycisk ulubione po prawej stronie */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(photo.id);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/80 backdrop-blur text-slate-300 hover:text-rose-400 transition-colors"
                          title="Ulubione"
                        >
                          <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Dolna belka z podpisem */}
                        <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between text-xs">
                          <span className="font-semibold truncate drop-shadow">{photo.title}</span>
                          <span className="text-[10px] text-slate-300 shrink-0 font-mono ml-2">{photo.date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
