import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { TravelPhoto, TravelTrip, TravelAlbum } from '../types/travel';
import { 
  Tv, 
  Cast, 
  X, 
  Play, 
  QrCode, 
  Radio, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Monitor, 
  Sliders, 
  Maximize
} from 'lucide-react';

interface TvModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: TravelPhoto[];
  trips: TravelTrip[];
  albums: TravelAlbum[];
  onStartSlideshow: (photos: TravelPhoto[]) => void;
}

export const TvModeModal: React.FC<TvModeModalProps> = ({
  isOpen,
  onClose,
  photos,
  trips,
  albums,
  onStartSlideshow,
}) => {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || 'ALL');
  const [devices, setDevices] = useState<{ id: string; address: string; description: string; protocol: string }[]>([]);
  const [discoveryStatus, setDiscoveryStatus] = useState('');
  const [remoteUrls, setRemoteUrls] = useState<string[]>([]);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [remoteQr, setRemoteQr] = useState('');
  const [remoteError, setRemoteError] = useState('');
  const [remoteBusy, setRemoteBusy] = useState(false);
  useEffect(() => {
    let active = true;
    if (!remoteUrl) { setRemoteQr(''); return; }
    void QRCode.toDataURL(remoteUrl, { width: 192, margin: 2 }).then(image => { if (active) setRemoteQr(image); }).catch(() => { if (active) setRemoteError('Nie udało się wygenerować kodu QR. Użyj adresu.'); });
    return () => { active = false; };
  }, [remoteUrl]);
  const toggleRemote = async () => {
    if (!window.electronAPI) { setRemoteError('Pilot jest dostępny w aplikacji Windows.'); return; }
    setRemoteBusy(true);
    setRemoteError('');
    try {
      if (remoteUrl) { await window.electronAPI.stopRemote(); setRemoteUrl(''); setRemoteUrls([]); }
      else { const session = await window.electronAPI.startRemote(); setRemoteUrls(session.urls); setRemoteUrl(session.urls[0]); }
    } catch { setRemoteError('Nie udało się uruchomić pilota. Sprawdź sieć i zaporę Windows.'); }
    finally { setRemoteBusy(false); }
  };
  useEffect(() => {
    if (!isOpen || !window.electronAPI) return;
    let cancelled = false;
    const scan = async () => {
      try {
        const found = await window.electronAPI!.discoverTVs();
        if (!cancelled) { setDevices(found); setDiscoveryStatus(found.length ? 'Wykryto lokalne odtwarzacze DLNA.' : 'Brak odpowiedzi DLNA. Sprawdź wspólną sieć i ustawienia TV.'); }
      } catch { if (!cancelled) setDiscoveryStatus('Nie udało się przeskanować sieci lokalnej.'); }
    };
    setDiscoveryStatus('Wyszukiwanie odtwarzaczy w sieci lokalnej…');
    void scan();
    const timer = setInterval(() => void scan(), 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [isOpen]);

  if (!isOpen) return null;

  const targetPhotos = selectedTripId === 'ALL'
    ? photos
    : photos.filter(p => albums.some(album => album.id === p.albumId && album.tripId === selectedTripId));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Górny pasek TV */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xl text-white">Prezentacja na Telewizorze (Tryb TV)</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  Salon 4K
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Prezentuj rodzinne wakacje na dużym ekranie TV bez kompresji i z kinowym dźwiękiem.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ciało */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2" aria-live="polite">
            <div className="font-bold text-white">Urządzenia w sieci lokalnej — DLNA/SSDP</div>
            <p>{window.electronAPI ? discoveryStatus : 'Wyszukiwanie urządzeń jest dostępne w aplikacji Windows.'}</p>
            {devices.map(device => <div key={device.id} className="text-indigo-300">{device.description} · {device.address} · {device.protocol}</div>)}
            <p className="text-slate-400">Lista odświeża się co 15 sekund podczas otwarcia panelu. Wykrycie urządzenia nie oznacza jeszcze połączenia ani przesyłania pokazu.</p>
          </div>
          {/* Metody połączenia z TV w Windows 10/11 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Radio className="w-4 h-4" />
                Bezprzewodowo (Miracast)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Naciśnij <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Win + K</kbd> w Windows i wybierz swój telewizor (Samsung, LG, Sony, Philips).
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Monitor className="w-4 h-4" />
                Kabel HDMI / DisplayPort
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Podłącz laptop lub PC bezpośrednio do wejścia HDMI w telewizorze i włącz tryb pełnego ekranu.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Cast className="w-4 h-4" />
                Google Cast / TV Box
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Przesyłaj kartę lub całe okno programu bezpośrednio na przystawkę Android TV / Apple TV.
              </p>
            </div>
          </div>

          {/* Wybór podróży do prezentacji */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <label className="text-white font-bold block">Wybierz podróż do zaprezentowania gościom i rodzinie:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTripId('ALL')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedTripId === 'ALL'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-semibold text-xs">Wszystkie wspomnienia ({photos.length} zdjęć)</div>
                <div className="text-[10px] text-slate-400">Kompleksowa podróż dookoła świata</div>
              </button>

              {trips.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTripId(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTripId === t.id
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-xs">{t.title} ({t.year})</div>
                  <div className="text-[10px] text-slate-400">Trasa etapowa • {t.totalDistanceKm ?? 'Brak danych'} km</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pilot zdalnego sterowania na smartfonie */}
          <div className="bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  Sterowanie pilotem z telefonu (Smart Remote)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {remoteUrl ? 'Sesja aktywna' : 'Uruchamiany na żądanie'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Włącz pilota i zeskanuj kod telefonem w tej samej zaufanej sieci Wi-Fi. Pilot zmienia slajdy, pauzuje i zamyka pokaz na komputerze. Sesja wygasa po 2 godzinach; adres z kodem daje dostęp do sterowania. Połączenie lokalne HTTP nie jest szyfrowane.
              </p>
              <button disabled={remoteBusy} onClick={() => void toggleRemote()} className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold disabled:opacity-50">{remoteBusy ? 'Proszę czekać…' : remoteUrl ? 'Wyłącz pilota' : 'Włącz pilota z telefonu'}</button>
              {remoteUrls.length > 1 && <select aria-label="Adres sieci pilota" value={remoteUrl} onChange={event => setRemoteUrl(event.target.value)} className="block bg-slate-900 border border-slate-700 rounded p-2 max-w-full">{remoteUrls.map(url => <option key={url} value={url}>{new URL(url).host}</option>)}</select>}
              {remoteUrl && <input aria-label="Adres parowania pilota" readOnly value={remoteUrl} onFocus={event => event.target.select()} className="block w-full bg-slate-950 rounded p-2 text-[10px]" />}
              {remoteError && <p role="alert" className="text-amber-300">{remoteError}</p>}
            </div>
            <div className="w-32 h-32 rounded-xl bg-white p-1 shadow-lg shrink-0 flex items-center justify-center">
              {remoteQr ? <img src={remoteQr} alt="Kod QR parowania pilota" className="w-full h-full" /> : <QrCode className="w-14 h-14 text-slate-900" />}
            </div>
          </div>
        </div>

        {/* Dolny pasek startu */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-slate-400 text-xs">
            Przygotowano do odtworzenia: <span className="font-bold text-white">{targetPhotos.length} zdjęć</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Zamknij
            </button>
            <button
              onClick={() => {
                onClose();
                onStartSlideshow(targetPhotos);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 text-slate-950 font-black hover:brightness-110 shadow-xl shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Rozpocznij prezentację na TV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
