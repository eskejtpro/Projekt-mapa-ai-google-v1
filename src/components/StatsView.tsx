import React from 'react';
import { TravelStats, TravelPhoto, TravelTrip } from '../types/travel';
import { 
  Globe2, 
  MapPin, 
  Compass, 
  Navigation, 
  Calendar, 
  Award, 
  TrendingUp, 
  Camera, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface StatsViewProps {
  stats: TravelStats;
  photos: TravelPhoto[];
  trips: TravelTrip[];
  onSelectCountry: (countryName: string) => void;
  onSelectCity: (cityName: string) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  photos,
  trips,
  onSelectCountry,
  onSelectCity,
}) => {
  // Miasta z największą liczbą zdjęć
  const cityCounts: Record<string, number> = {};
  photos.forEach(p => {
    cityCounts[p.location.cityName] = (cityCounts[p.location.cityName] || 0) + 1;
  });
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Baner główny statystyk */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Award className="w-3.5 h-3.5" />
              Paszport Podróżnika Rodzinnego
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Kronika Waszych Wspólnych Podróży po Świecie
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Podsumowanie wszystkich zapisanych ekspedycji, odwiedzonych stolic, przebytych kilometrów oraz zachowanych fotografii z lat {stats.earliestYear} – {stats.latestYear}.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Odwiedzone kraje:</div>
              <div className="text-2xl font-black text-white">{stats.countriesVisited.length} państw</div>
            </div>
          </div>
        </div>
      </div>

      {/* Siatka 4 kluczowych wskaźników */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121829] border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Odwiedzone miasta</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.citiesVisited.length}</div>
          <p className="text-[11px] text-slate-500">Punkty na mapie świata</p>
        </div>

        <div className="bg-[#121829] border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Przebyte kilometry</span>
            <Navigation className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">~{stats.totalDistanceKm.toLocaleString()} km</div>
          <p className="text-[11px] text-slate-500">Zarejestrowane trasy podróży</p>
        </div>

        <div className="bg-[#121829] border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Zapisane wspomnienia</span>
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalPhotos}</div>
          <p className="text-[11px] text-slate-500">Lokalne fotografie z koordynatami</p>
        </div>

        <div className="bg-[#121829] border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Zakres lat</span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.earliestYear} - {stats.latestYear}</div>
          <p className="text-[11px] text-slate-500">Lata rodzinnych wypraw</p>
        </div>
      </div>

      {/* Dwie kolumny: Odwiedzone Państwa & Najczęściej odwiedzane miasta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Państwa */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-amber-400" />
            Odwiedzone kraje ({stats.countriesVisited.length}):
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.countriesVisited.map(c => (
              <button
                key={c}
                onClick={() => onSelectCountry(c)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold hover:border-amber-500 hover:text-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🌍</span>
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Najpopularniejsze miasta */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Najchętniej fotografowane miejsca:
          </h3>
          <div className="space-y-2">
            {topCities.map(([city, count]) => (
              <div
                key={city}
                onClick={() => onSelectCity(city)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors text-xs"
              >
                <span className="font-semibold text-white">{city}</span>
                <span className="text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {count} {count === 1 ? 'zdjęcie' : 'zdjęć'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
