import React from 'react';
import { TravelPhoto } from '../types/travel';
import { StorageService } from '../services/storage';
import { Files, Trash2, Check, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface DuplicatesViewProps {
  photos: TravelPhoto[];
  onDeletePhoto: (id: string) => void;
  onSelectPhoto: (photo: TravelPhoto) => void;
}

export const DuplicatesView: React.FC<DuplicatesViewProps> = ({
  photos,
  onDeletePhoto,
  onSelectPhoto,
}) => {
  const duplicateGroups = StorageService.findDuplicates(photos);

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
            <Files className="w-3.5 h-3.5" />
            Diagnostyka Biblioteki Zdjęć
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Wykrywanie Duplikatów i Serii Ujęć
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Program porównuje zawartość osadzonych zdjęć. Jednakowa nazwa, data lub lokalizacja nie wystarcza do potwierdzenia duplikatu. Zewnętrzne adresy zdjęć nie są traktowane jako dowód identyczności.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-center shrink-0">
          <div className="text-[11px] text-slate-400">Znalezione grupy duplikatów:</div>
          <div className="text-2xl font-black text-rose-400">{duplicateGroups.length}</div>
        </div>
      </div>

      {duplicateGroups.length === 0 ? (
        <div className="bg-[#121829] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Brak duplikatów w bibliotece</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Nie znaleziono identycznych osadzonych obrazów. Zdjęcia dostępne wyłącznie pod zewnętrznym adresem wymagają oddzielnej oceny.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map((group, idx) => (
            <div
              key={group.groupKey}
              className="bg-[#121829] border border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400">Grupa #{idx + 1} ({group.duplicates.length} zdjęcia o identycznych parametrach)</span>
                <span className="text-slate-500 text-[11px]">{group.duplicates[0]?.date} • {group.duplicates[0]?.location.cityName}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {group.duplicates.map(photo => (
                  <div
                    key={photo.id}
                    className="relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col"
                  >
                    <div
                      onClick={() => onSelectPhoto(photo)}
                      className="aspect-4/3 w-full overflow-hidden cursor-pointer"
                    >
                      <img src={photo.thumbnailUrl || photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>

                    <div className="p-2 flex items-center justify-between text-[11px]">
                      <span className="truncate text-slate-300 font-semibold">{photo.title}</span>
                      <button
                        onClick={() => onDeletePhoto(photo.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Usuń tę kopię"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
