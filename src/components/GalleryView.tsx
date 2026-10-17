import React, { useState, useEffect } from 'react';
import { TravelPhoto, TravelAlbum, TravelTrip } from '../types/travel';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  Folder, 
  Play, 
  Trash2, 
  Compass,
  ArrowUpDown,
  Sparkles,
  GripVertical,
  FolderDown,
  Upload
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
  onOpenOrganizer?: (album: TravelAlbum) => void;
  onDropPhotosOnAlbum?: (files: File[], albumId: string) => void;
  density?: 'default' | 'compact' | 'large';
  showExifBadges?: boolean;
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
  onOpenOrganizer,
  onDropPhotosOnAlbum,
  density = 'default',
  showExifBadges = true,
}) => {
  const currentAlbum = albums.find(a => a.id === selectedAlbumId);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'custom' | 'date-desc' | 'date-asc' | 'title'>(
    currentAlbum?.customPhotoOrder && currentAlbum.customPhotoOrder.length > 0 ? 'custom' : 'date-desc'
  );

  // Stany przeciągania plików z Eksploratora Windows (Drag & Drop)
  const [isDragOverBanner, setIsDragOverBanner] = useState<boolean>(false);
  const [isDragOverGallery, setIsDragOverGallery] = useState<boolean>(false);

  // Zaktualizuj domyślne sortowanie, gdy użytkownik wejdzie do albumu z ułożoną kolejnością
  useEffect(() => {
    if (currentAlbum?.customPhotoOrder && currentAlbum.customPhotoOrder.length > 0) {
      setSortBy('custom');
    } else if (sortBy === 'custom') {
      setSortBy('date-desc');
    }
  }, [selectedAlbumId]);

  const availableCountries = Array.from(new Set(photos.map(p => p.location.countryName))).sort();

  // Obsługa przeciągania plików bezpośrednio na baner albumu
  const handleBannerDragOver = (e: React.DragEvent) => {
    if (!selectedAlbumId) return;
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOverBanner(true);
    }
  };

  const handleBannerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverBanner(false);
    }
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverBanner(false);
    setIsDragOverGallery(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && selectedAlbumId && onDropPhotosOnAlbum) {
      const validFiles = Array.from(e.dataTransfer.files).filter(f =>
        f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|tiff?|gif)$/i.test(f.name)
      );
      if (validFiles.length > 0) {
        onDropPhotosOnAlbum(validFiles, selectedAlbumId);
      }
    }
  };

  // Obsługa przeciągania plików nad całą przestrzenią galerii, gdy aktywny jest album
  const handleGalleryDragOver = (e: React.DragEvent) => {
    if (!selectedAlbumId) return;
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      setIsDragOverGallery(true);
    }
  };

  const handleGalleryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverGallery(false);
    }
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverGallery(false);
    setIsDragOverBanner(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && selectedAlbumId && onDropPhotosOnAlbum) {
      const validFiles = Array.from(e.dataTransfer.files).filter(f =>
        f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|heic|tiff?|gif)$/i.test(f.name)
      );
      if (validFiles.length > 0) {
        onDropPhotosOnAlbum(validFiles, selectedAlbumId);
      }
    }
  };

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
      if (sortBy === 'custom' && currentAlbum?.customPhotoOrder) {
        const orderMap = new Map<string, number>();
        currentAlbum.customPhotoOrder.forEach((id, idx) => orderMap.set(id, idx));
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 99999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 99999;
        if (orderA !== orderB) return orderA - orderB;
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      return a.title.localeCompare(b.title);
    });

  // Grupowanie według miesięcy/lat dla standardowego widoku chronologicznego
  const groupedSections: { dateTitle: string; items: TravelPhoto[] }[] = [];
  const groupsMap = new Map<string, TravelPhoto[]>();

  if (sortBy !== 'custom') {
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
  }

  return (
    <div 
      onDragOver={handleGalleryDragOver}
      onDragLeave={handleGalleryDragLeave}
      onDrop={handleGalleryDrop}
      className="flex-1 flex flex-col space-y-4 relative"
    >
      {/* Pełnoekranowa nakładka upuszczenia zdjęć z Eksploratora Windows gdy otwarty jest album */}
      {selectedAlbumId && currentAlbum && isDragOverGallery && !isDragOverBanner && (
        <div className="absolute inset-0 z-40 bg-amber-950/80 backdrop-blur-xs rounded-3xl border-2 border-dashed border-amber-400 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150 pointer-events-none">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/25 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3 animate-bounce">
            <FolderDown className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Upuść zdjęcia tutaj!</h3>
          <p className="text-sm text-amber-200 mt-1 max-w-md">
            Zdjęcia z Eksploratora Windows zostaną natychmiast przypisane do katalogu <strong className="text-white underline">{currentAlbum.name}</strong>.
          </p>
        </div>
      )}

      {/* Pasek Górny - Styl Windows Photos */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Lewy nagłówek Windows Photos */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentAlbum ? currentAlbum.name : 'Wszystkie zdjęcia (All Photos)'}
            </h2>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
              {filteredPhotos.length} fotografii
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {currentAlbum 
              ? (currentAlbum.description || 'Kolekcja zdjęć w wybranym katalogu rodzinnym')
              : 'Lokalna kolekcja fotografii rodzinnych uporządkowana chronologicznie i geograficznie'}
          </p>
        </div>

        {/* Prawy panel filtrów */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Wyszukiwarka */}
          <div className="relative flex-1 sm:w-56">
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
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none font-medium"
          >
            {currentAlbum && (
              <option value="custom">⭐ Moja ułożona kolejność</option>
            )}
            <option value="date-desc">Najnowsze</option>
            <option value="date-asc">Najstarsze</option>
            <option value="title">Tytuł A-Z</option>
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
            title="Uruchom kinowy pokaz slajdów w wybranej kolejności"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Pokaz slajdów ({filteredPhotos.length})
          </button>
        </div>
      </div>

      {/* Aktywny filtr katalogu / albumu z przyciskiem układania kolejności i strefą upuszczania Drag & Drop */}
      {selectedAlbumId && currentAlbum && (
        <div
          onDragOver={handleBannerDragOver}
          onDragLeave={handleBannerDragLeave}
          onDrop={handleBannerDrop}
          className={`rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg transition-all duration-200 relative overflow-hidden ${
            isDragOverBanner
              ? 'bg-amber-500/25 border-2 border-dashed border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]'
              : 'bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50'
          }`}
        >
          {/* Aktywna nakładka upuszczenia bezpośrednio na baner */}
          {isDragOverBanner && (
            <div className="absolute inset-0 z-30 bg-amber-500/90 backdrop-blur-xs flex items-center justify-center p-3 text-slate-950 font-sans border-2 border-dashed border-white animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/30 flex items-center justify-center animate-bounce">
                  <FolderDown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Upuść zdjęcia tutaj!</h4>
                  <p className="text-[11px] font-semibold opacity-95">
                    Zostaną natychmiast przypisane do katalogu: {currentAlbum.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-slate-400 font-semibold">Aktywny katalog:</span>
                <span className="font-bold text-white text-sm">{currentAlbum.name}</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono text-[10px] border border-amber-500/30">
                  {filteredPhotos.length} zdjęć
                </span>
                {currentAlbum.customPhotoOrder && currentAlbum.customPhotoOrder.length > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Własna kolejność
                  </span>
                )}
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-amber-300/90 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                  <FolderDown className="w-3 h-3 text-amber-400" /> Przeciągnij zdjęcia z Windows tutaj
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentAlbum.description || 'Kolekcja rodzinna ze zdjęciami z podróży'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {onOpenOrganizer && (
              <button
                onClick={() => onOpenOrganizer(currentAlbum)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow cursor-pointer"
                title="Zmień kolejność slajdów w tym katalogu"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Układaj kolejność slajdów
              </button>
            )}

            <button
              onClick={() => onSelectAlbum(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              Wszystkie zdjęcia ✕
            </button>
          </div>
        </div>
      )}

      {/* SEKCJE ZDJĘĆ */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Brak zdjęć w tym katalogu</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Przeciągnij i upuść zdjęcia z Eksploratora Windows bezpośrednio tutaj, aby dodać je do tego katalogu.
          </p>
        </div>
      ) : sortBy === 'custom' ? (
        /* WIDOK PŁASKI Z NUMERACJĄ DLA WŁASNEJ KOLEJNOŚCI */
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Zdjęcia ułożone według Twojej własnej kolejności do pokazu slajdów
            </span>
            {currentAlbum && onOpenOrganizer && (
              <button
                onClick={() => onOpenOrganizer(currentAlbum)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowUpDown className="w-3 h-3" /> Zmień układ
              </button>
            )}
          </div>

          <div className={`grid gap-3 ${
            density === 'compact'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredPhotos.map((photo, pIdx) => {
              const isFeatured = pIdx % 7 === 0;

              return (
                <div
                  key={photo.id}
                  className={`group relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-amber-500/60 hover:shadow-2xl transition-all duration-300 flex flex-col ${
                    isFeatured && density !== 'compact' ? 'sm:col-span-2 aspect-16/9' : 'aspect-4/3'
                  }`}
                >
                  <div
                    onClick={() => onSelectPhoto(photo)}
                    className="w-full h-full cursor-pointer relative overflow-hidden bg-slate-950"
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Winieta dolna */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Numer kolejności slajdu w lewym górnym rogu */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-mono font-extrabold shadow-lg">
                        #{pIdx + 1}
                      </span>
                      {showExifBadges && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 shadow">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          {photo.location.cityName}
                        </span>
                      )}
                    </div>

                    {/* Szybkie akcje w prawym górnym rogu */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleFavorite(photo.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur text-white hover:text-rose-400 border border-white/20 transition-colors"
                        title="Dodaj do ulubionych"
                      >
                        <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeletePhoto(photo.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur text-white hover:text-rose-400 border border-white/20 transition-colors"
                        title="Usuń zdjęcie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Dolne napisy miniatury */}
                    <div className="absolute bottom-2.5 inset-x-3 text-left">
                      <h4 className="font-bold text-sm text-white truncate drop-shadow">
                        {photo.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        {photo.location.cityName}, {photo.location.countryName} • {photo.date}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* WIDOK Z PODZIAŁEM NA MIESIĄCE DLA TRYBU CHRONOLOGICZNEGO */
        <div className="space-y-6">
          {groupedSections.map(section => (
            <div key={section.dateTitle} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {section.dateTitle}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {section.items.length} {section.items.length === 1 ? 'zdjęcie' : 'zdjęć'}
                </span>
              </div>

              <div className={`grid gap-3 ${
                density === 'compact'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              }`}>
                {section.items.map((photo, pIdx) => {
                  const isFeatured = pIdx % 7 === 0;

                  return (
                    <div
                      key={photo.id}
                      className={`group relative bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg hover:border-amber-500/60 hover:shadow-2xl transition-all duration-300 flex flex-col ${
                        isFeatured && density !== 'compact' ? 'sm:col-span-2 aspect-16/9' : 'aspect-4/3'
                      }`}
                    >
                      <div
                        onClick={() => onSelectPhoto(photo)}
                        className="w-full h-full cursor-pointer relative overflow-hidden bg-slate-950"
                      >
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          {showExifBadges && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold border border-white/20 flex items-center gap-1 shadow">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              {photo.location.cityName}
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onToggleFavorite(photo.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur text-white hover:text-rose-400 border border-white/20 transition-colors"
                            title="Dodaj do ulubionych"
                          >
                            <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onDeletePhoto(photo.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur text-white hover:text-rose-400 border border-white/20 transition-colors"
                            title="Usuń zdjęcie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="absolute bottom-2.5 inset-x-3 text-left">
                          <h4 className="font-bold text-sm text-white truncate drop-shadow">
                            {photo.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 truncate mt-0.5">
                            {photo.location.cityName}, {photo.location.countryName} • {photo.date}
                          </p>
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
