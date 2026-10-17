import React, { useState } from 'react';
import { TravelPhoto } from '../types/travel';
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Camera, 
  FileText, 
  HardDrive, 
  Play, 
  Trash2, 
  Check, 
  Tag, 
  Compass,
  Edit3
} from 'lucide-react';

interface PhotoDetailModalProps {
  photo: TravelPhoto | null;
  onClose: () => void;
  onUpdatePhoto: (updated: TravelPhoto) => void;
  onDeletePhoto: (id: string) => void;
  onStartSlideshowFromThis: (photo: TravelPhoto) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  onClose,
  onUpdatePhoto,
  onDeletePhoto,
  onStartSlideshowFromThis,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(photo?.title || '');
  const [notes, setNotes] = useState<string>(photo?.notes || '');
  const [participantsStr, setParticipantsStr] = useState<string>(photo?.participants.join(', ') || '');
  const [tagsStr, setTagsStr] = useState<string>(photo?.tags.join(', ') || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!photo) return null;

  const handleSave = () => {
    const updated: TravelPhoto = {
      ...photo,
      title,
      notes,
      participants: participantsStr.split(',').map(s => s.trim()).filter(Boolean),
      tags: tagsStr.split(',').map(s => s.trim()).filter(Boolean),
    };
    onUpdatePhoto(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Lewa strona: Duże zdjęcie */}
        <div className="relative md:w-3/5 bg-black flex items-center justify-center p-4 overflow-hidden">
          <img
            src={photo.url}
            alt={photo.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
          />

          {photo.isDemo ? (
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur text-amber-400 text-xs font-bold border border-amber-500/30">
              Wspomnienie Demo
            </span>
          ) : (
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur text-emerald-400 text-xs font-bold border border-emerald-500/30">
              Twoje Zdjęcie
            </span>
          )}

          <button
            onClick={() => {
              onClose();
              onStartSlideshowFromThis(photo);
            }}
            className="absolute bottom-6 left-6 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Pokaz slajdów od tego zdjęcia
          </button>
        </div>

        {/* Prawa strona: Informacje, notatki i edycja */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 text-xs text-slate-300 space-y-5">
          <div className="space-y-4">
            {/* Nagłówek okna */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                <span>{photo.location.cityName}, {photo.location.countryName}</span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tytuł */}
            {isEditing ? (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Tytuł wspomnienia:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            ) : (
              <h3 className="font-extrabold text-lg text-white leading-snug">{photo.title}</h3>
            )}

            {/* Data i lokalizacja */}
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {photo.date} {photo.time || ''}
              </span>
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                GPS: {photo.location.lat.toFixed(3)}, {photo.location.lng.toFixed(3)}
              </span>
            </div>

            {/* Notatki rodzinne */}
            <div className="space-y-1.5 bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Wspomnienie rodzinne
                </span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edytuj
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              ) : (
                <p className="text-slate-300 text-xs leading-relaxed italic">
                  "{photo.notes}"
                </p>
              )}
            </div>

            {/* Uczestnicy i Tagi */}
            <div className="space-y-2">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Uczestnicy (oddziel przecinkami):</label>
                    <input
                      type="text"
                      value={participantsStr}
                      onChange={e => setParticipantsStr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Tagi:</label>
                    <input
                      type="text"
                      value={tagsStr}
                      onChange={e => setTagsStr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-400 text-xs">Z kim:</span>
                    <span className="text-slate-200 font-semibold">{photo.participants.join(', ')}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
                    {photo.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Informacje o pliku i aparacie */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5 text-[11px] text-slate-400">
              {photo.cameraInfo?.make && (
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Aparat: {photo.cameraInfo.make} {photo.cameraInfo.model}</span>
                </div>
              )}
              {photo.localFilePath && (
                <div className="flex items-start gap-2 font-mono text-[10px] truncate text-slate-500">
                  <HardDrive className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="truncate" title={photo.localFilePath}>{photo.localFilePath}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dolne przyciski */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex-1 font-semibold"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex-1 font-bold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Zapisz zmiany
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    onDeletePhoto(photo.id);
                    onClose();
                  }}
                  className="text-slate-500 hover:text-red-400 flex items-center gap-1.5 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" /> Usuń z bazy
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                >
                  Zamknij
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
