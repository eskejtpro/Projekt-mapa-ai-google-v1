import React, { useState } from 'react';
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
  Sparkles, 
  Trash2, 
  ExternalLink,
  SlidersHorizontal,
  Compass
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
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'albums'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [countryFilter, setCountryFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Unikalne kraje i lata
  const availableCountries = Array.from(new Set(photos.map(p => p.location.countryName))).sort();
  const availableYears = Array.from(new Set(photos.map(p => p.date.substring(0, 4)))).sort().reverse();

  // Filtrowanie
  const filteredPhotos = photos.filter(p => {
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
  });

  return (
    <div className="flex-1 flex flex-col space-y-5">
      {/* Pasek narzędzi galerii */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Przełącznik widoku */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold w-fit">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Siatka zdjęć
          </button>
          <button
            onClick={() => setViewMode('albums')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'albums' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5" /> Albumy podróży
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'timeline' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Oś Czasu (Wyprawy)
          </button>
        </div>

        {/* Wyszukiwarka i filtry */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Szukaj: Rzym, zachód słońca, Zosia..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filtr Kraju */}
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Wszystkie kraje</option>
            {availableCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Filtr Roku */}
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Wszystkie lata</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Ulubione */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              onlyFavorites
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
            Ulubione
          </button>

          {/* Przycisk Pokazu Slajdów z wyselekcjonowanych */}
          <button
            onClick={() => onStartSlideshow(filteredPhotos)}
            disabled={filteredPhotos.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Pokaz slajdów ({filteredPhotos.length})
          </button>
        </div>
      </div>

      {/* Aktywny filtr albumu jeśli wybrano */}
      {selectedAlbumId && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Wyświetlasz album:</span>
            <span className="font-bold text-amber-400">{albums.find(a => a.id === selectedAlbumId)?.name}</span>
          </div>
          <button
            onClick={() => onSelectAlbum(null)}
            className="text-amber-400 hover:underline font-semibold"
          >
            Pokaż wszystkie zdjęcia ✕
          </button>
        </div>
      )}

      {/* WIDOK 1: SIATKA ZDJĘĆ */}
      {viewMode === 'grid' && (
        <>
          {filteredPhotos.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Compass className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Brak zdjęć spełniających kryteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Zmień filtry, wyczyść zapytanie w wyszukiwarce lub zaimportuj nowe rodzinne zdjęcia z komputera.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
                >
                  {/* Miniatura zdjęcia z nakładkami */}
                  <div
                    onClick={() => onSelectPhoto(photo)}
                    className="relative aspect-4/3 w-full overflow-hidden cursor-pointer bg-slate-950"
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Przyciemnienie gradientowe */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Odznaka demonstracyjna */}
                    {photo.isDemo ? (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        Wspomnienie Demo
                      </span>
                    ) : (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-950/85 backdrop-blur text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        Twoje zdjęcie
                      </span>
                    )}

                    {/* Przycisk ulubione */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(photo.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 backdrop-blur text-slate-300 hover:text-rose-400 transition-colors"
                      title="Dodaj do ulubionych"
                    >
                      <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Dolna belka na zdjęciu: Miasto i Kraj */}
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1 font-semibold truncate drop-shadow">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{photo.location.cityName}, {photo.location.countryName}</span>
                      </div>
                      <span className="text-[11px] text-slate-300 shrink-0 drop-shadow">{photo.date}</span>
                    </div>
                  </div>

                  {/* Informacje i opis */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4
                        onClick={() => onSelectPhoto(photo)}
                        className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {photo.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {photo.notes}
                      </p>
                    </div>

                    {/* Uczestnicy i Tagi */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 truncate">
                        <Users className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{photo.participants.slice(0, 3).join(', ')}</span>
                      </div>

                      <button
                        onClick={() => onDeletePhoto(photo.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Usuń zdjęcie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* WIDOK 2: ALBUMY PODRÓŻY */}
      {viewMode === 'albums' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map(album => {
            const count = photos.filter(p => p.albumId === album.id).length;
            return (
              <div
                key={album.id}
                onClick={() => {
                  onSelectAlbum(album.id);
                  setViewMode('grid');
                }}
                className="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-amber-500/50 hover:shadow-2xl transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-950">
                  <img
                    src={album.coverUrl}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 border border-amber-500/30">
                    {album.country} • {album.year}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                    {count} {count === 1 ? 'zdjęcie' : 'zdjęć'}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                      {album.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                    <span>Przeglądaj album</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WIDOK 3: OŚ CZASU (CHRONOLOGIA PODRÓŻY) */}
      {viewMode === 'timeline' && (
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800 before:content-[''] pl-8">
          {trips.map(trip => {
            const tripPhotos = photos.filter(p => {
              if (trip.id === 'trip-italy-2024') return p.location.countryCode === 'IT';
              if (trip.id === 'trip-greece-2023') return p.location.countryCode === 'GR';
              if (trip.id === 'trip-poland-tatry') return p.location.countryCode === 'PL';
              if (trip.id === 'trip-japan-spring') return p.location.countryCode === 'JP';
              if (trip.id === 'trip-norway-fjords') return p.location.countryCode === 'NO';
              return false;
            });

            return (
              <div key={trip.id} className="relative space-y-3">
                {/* Kropka osi czasu */}
                <div
                  className="absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-slate-950 shadow-md"
                  style={{ backgroundColor: trip.color }}
                />

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          {trip.year}
                        </span>
                        <h3 className="text-lg font-bold text-white">{trip.title}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">{trip.description}</p>
                    </div>

                    <button
                      onClick={() => onStartSlideshow(tripPhotos)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-xs font-bold hover:brightness-110 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Pokaz slajdów tej wyprawy ({tripPhotos.length})
                    </button>
                  </div>

                  {/* Punkty trasy */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-500 font-semibold">Etapy trasy:</span>
                    {trip.routePoints.map((pt, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold flex items-center justify-center">
                          {pt.order}
                        </span>
                        {pt.name}
                      </span>
                    ))}
                    {trip.totalDistanceKm && (
                      <span className="text-slate-500 ml-2">Łącznie ~{trip.totalDistanceKm} km</span>
                    )}
                  </div>

                  {/* Karuzela zdjęć z tej wyprawy */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {tripPhotos.slice(0, 4).map(p => (
                      <div
                        key={p.id}
                        onClick={() => onSelectPhoto(p)}
                        className="group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer border border-slate-800 bg-slate-950"
                      >
                        <img src={p.thumbnailUrl || p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />
                        <div className="absolute bottom-2 left-2 right-2 text-[11px] font-semibold text-white truncate">
                          {p.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
