import { useEffect, useState } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import type { MediaItem } from '../types/media';
import type { GeoLocation } from '../types/travel';

export function VideoLocationEditor({ video, onSave }: { video: MediaItem; onSave: (video: MediaItem, location: GeoLocation | null) => void | Promise<void> }) {
  const [lat, setLat] = useState(String(video.location?.lat ?? ''));
  const [lng, setLng] = useState(String(video.location?.lng ?? ''));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setLat(String(video.location?.lat ?? '')); setLng(String(video.location?.lng ?? ''));
  }, [video.location?.lat, video.location?.lng]);
  const save = async (remove = false) => {
    const latitude = Number(lat); const longitude = Number(lng);
    if (!remove && (!lat.trim() || !lng.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) {
      setError('Podaj szerokość od −90 do 90 i długość od −180 do 180.'); return;
    }
    setError(''); setBusy(true);
    try { await onSave(video, remove ? null : { lat: latitude, lng: longitude, cityName: '', countryName: '', countryCode: '' }); }
    catch { setError('Nie udało się zapisać. Spróbuj ponownie.'); }
    finally { setBusy(false); }
  };
  return <details className="border-t border-slate-700 pt-3 text-sm">
    <summary className="cursor-pointer text-slate-200 focus-visible:outline-2 focus-visible:outline-amber-400 rounded py-2">
      <MapPin className="inline h-4 w-4 mr-2 text-amber-400" />{video.location ? 'Lokalizacja na mapie' : 'Dodaj lokalizację'}
    </summary>
    <div className="mt-2 space-y-3">
      <p className="text-xs leading-relaxed text-slate-300">{video.locationSource === 'metadata' ? 'GPS odczytany z pliku. Możesz go poprawić.' : 'Współrzędne są zapisywane lokalnie. Oryginalny film pozostaje bez zmian.'}</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-slate-300">Szerokość<input aria-label={`${video.title} szerokość`} inputMode="decimal" type="number" min="-90" max="90" step="any" value={lat} onChange={e => setLat(e.target.value)} disabled={busy} className="mt-1 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-amber-400" /></label>
        <label className="text-xs text-slate-300">Długość<input aria-label={`${video.title} długość`} inputMode="decimal" type="number" min="-180" max="180" step="any" value={lng} onChange={e => setLng(e.target.value)} disabled={busy} className="mt-1 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-amber-400" /></label>
      </div>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void save()} className="min-h-11 rounded-lg bg-amber-500 px-3 font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">{busy ? 'Zapisywanie…' : 'Zapisz GPS'}</button>
        {video.location && <button type="button" disabled={busy} onClick={() => void save(true)} className="min-h-11 rounded-lg border border-slate-600 px-3 text-slate-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-amber-400"><Trash2 className="inline w-4 h-4 mr-1" />Usuń GPS</button>}
      </div>
    </div>
  </details>;
}
