import React, { useState } from 'react';
import { TravelAlbum, TravelPhoto } from '../types/travel';
import {
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Play,
  Save,
  Folder,
  Sparkles,
  Calendar,
  MapPin,
  GripVertical,
  RotateCcw,
  Check,
  Compass
} from 'lucide-react';

interface CatalogOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: TravelAlbum | null;
  allPhotos: TravelPhoto[];
  onSaveOrder: (albumId: string, orderedPhotoIds: string[]) => void;
  onStartSlideshow: (orderedPhotos: TravelPhoto[]) => void;
}

export const CatalogOrganizerModal: React.FC<CatalogOrganizerModalProps> = ({
  isOpen,
  onClose,
  album,
  allPhotos,
  onSaveOrder,
  onStartSlideshow,
}) => {
  if (!isOpen || !album) return null;

  // Pobierz wszystkie zdjęcia z tego albumu
  const albumPhotos = allPhotos.filter(p => p.albumId === album.id);

  // Uporządkuj zdjęcia według zapisanego customPhotoOrder (lub domyślnie chronologicznie)
  const initialOrderedPhotos = React.useMemo(() => {
    if (album.customPhotoOrder && album.customPhotoOrder.length > 0) {
      const orderMap = new Map<string, number>();
      album.customPhotoOrder.forEach((id, idx) => orderMap.set(id, idx));

      return [...albumPhotos].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 99999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 99999;
        if (orderA !== orderB) return orderA - orderB;
        return a.date.localeCompare(b.date);
      });
    }
    return [...albumPhotos].sort((a, b) => a.date.localeCompare(b.date));
  }, [album, albumPhotos]);

  const [orderedList, setOrderedList] = useState<TravelPhoto[]>(initialOrderedPhotos);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  // Zsynchronizuj stan w przypadku zmiany albumu
  React.useEffect(() => {
    setOrderedList(initialOrderedPhotos);
    setHasSaved(false);
  }, [initialOrderedPhotos]);

  // Przesunięcie elementu w tablicy
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedList.length) return;
    const updated = [...orderedList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrderedList(updated);
    setHasSaved(false);
  };

  // 1. Przesuń o 1 pozycję wcześniej
  const handleMoveEarlier = (idx: number) => moveItem(idx, idx - 1);

  // 2. Przesuń o 1 pozycję później
  const handleMoveLater = (idx: number) => moveItem(idx, idx + 1);

  // 3. Przenieś na sam początek
  const handleMoveToStart = (idx: number) => moveItem(idx, 0);

  // 4. Przenieś na sam koniec
  const handleMoveToEnd = (idx: number) => moveItem(idx, orderedList.length - 1);

  // Szybkie szablony sortowania
  const handleSortOldestFirst = () => {
    const sorted = [...orderedList].sort((a, b) => a.date.localeCompare(b.date));
    setOrderedList(sorted);
    setHasSaved(false);
  };

  const handleSortNewestFirst = () => {
    const sorted = [...orderedList].sort((a, b) => b.date.localeCompare(a.date));
    setOrderedList(sorted);
    setHasSaved(false);
  };

  const handleSortAlphabetical = () => {
    const sorted = [...orderedList].sort((a, b) => a.title.localeCompare(b.title));
    setOrderedList(sorted);
    setHasSaved(false);
  };

  const handleSortGeographic = () => {
    // Trasa ze wschodu na zachód lub według długości geograficznej
    const sorted = [...orderedList].sort((a, b) => a.location.lng - b.location.lng);
    setOrderedList(sorted);
    setHasSaved(false);
  };

  const handleReverseOrder = () => {
    setOrderedList([...orderedList].reverse());
    setHasSaved(false);
  };

  // Zapisz porządek
  const handleSave = () => {
    const ids = orderedList.map(p => p.id);
    onSaveOrder(album.id, ids);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  // Uruchom pokaz w mojej kolejności
  const handlePlayInOrder = () => {
    const ids = orderedList.map(p => p.id);
    onSaveOrder(album.id, ids);
    onStartSlideshow(orderedList);
    onClose();
  };

  // Drag & drop HTML5
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveItem(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">

        {/* NAGŁÓWEK OKNA */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Układanie Kolejności Slajdów: {album.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono border border-slate-700">
                  {orderedList.length} zdjęć
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Przeciągaj lub używaj strzałek, aby ustalić własną kolejność wyświetlania zdjęć w pokazie slajdów.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Zamknij (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PASEK SZYBKICH SZABLONÓW SORTOWANIA I AKCJI */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Szybkie szablony:
            </span>
            <button
              onClick={handleSortOldestFirst}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3 h-3 text-amber-400" /> Najstarsze pierwsze
            </button>
            <button
              onClick={handleSortNewestFirst}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3 h-3 text-emerald-400" /> Najnowsze pierwsze
            </button>
            <button
              onClick={handleSortGeographic}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3 h-3 text-sky-400" /> Trasa Zachód → Wschód
            </button>
            <button
              onClick={handleReverseOrder}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Odwróć aktualną kolejność"
            >
              <RotateCcw className="w-3 h-3 text-purple-400" /> Odwróć
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                hasSaved
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {hasSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {hasSaved ? 'Zapisano!' : 'Zapisz kolejność'}
            </button>

            <button
              onClick={handlePlayInOrder}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Odtwórz pokaz slajdów w tej kolejności
            </button>
          </div>
        </div>

        {/* LISTA ZDJĘĆ DO PRZECIĄGANIA I UKŁADANIA */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {orderedList.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ten album nie zawiera jeszcze żadnych fotografii.</p>
            </div>
          ) : (
            orderedList.map((photo, index) => {
              const isFirst = index === 0;
              const isLast = index === orderedList.length - 1;

              return (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group bg-slate-900/90 hover:bg-slate-800/90 border rounded-2xl p-3 flex items-center justify-between gap-4 transition-all duration-200 select-none ${
                    draggedIndex === index
                      ? 'border-amber-500 ring-2 ring-amber-500/40 opacity-70 scale-[0.99]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* LEWA STRONA: UCHWYT, NUMERACJA I MINIATURA */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Grip handle do przeciągania */}
                    <div className="cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-amber-400 transition-colors p-1">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Numer slajdu */}
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-amber-400 shrink-0 shadow-inner">
                      #{index + 1}
                    </div>

                    {/* Miniatura zdjęcia */}
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Szczegóły zdjęcia */}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate group-hover:text-amber-300 transition-colors">
                        {photo.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {photo.location.cityName}, {photo.location.countryName}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          {photo.date}
                        </span>
                        {photo.notes && (
                          <span className="hidden sm:inline text-slate-500 truncate max-w-xs">
                            — {photo.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PRAWA STRONA: PRZYCISKI KONTROLI KOLEJNOŚCI */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleMoveToStart(index)}
                      disabled={isFirst}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      title="Przenieś na sam początek (Slajd #1)"
                    >
                      <ChevronsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveEarlier(index)}
                      disabled={isFirst}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      title="Przesuń o 1 pozycję wcześniej"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveLater(index)}
                      disabled={isLast}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      title="Przesuń o 1 pozycję później"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveToEnd(index)}
                      disabled={isLast}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      title="Przenieś na sam koniec"
                    >
                      <ChevronsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* STOPKA Z PRZYCISKAMI */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Wskazówka: Możesz również chwycić za ikonę po lewej stronie i przeciągnąć zdjęcie myszą.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-colors cursor-pointer"
            >
              Zapisz i zastosuj kolejność
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
