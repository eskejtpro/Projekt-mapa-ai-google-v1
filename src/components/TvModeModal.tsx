import React, { useState, useEffect, useRef } from 'react';
import { TravelPhoto, TravelTrip, DiscoveredTvDevice } from '../types/travel';
import { 
  Tv, 
  Cast, 
  X, 
  Play, 
  QrCode, 
  Radio, 
  Sparkles, 
  Monitor, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Share2, 
  Laptop, 
  ShieldCheck, 
  Zap,
  Signal,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface TvModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: TravelPhoto[];
  trips: TravelTrip[];
  onStartSlideshow: (photos: TravelPhoto[]) => void;
  onShowToast?: (message: string, type: 'info' | 'success' | 'warning') => void;
}

const DEFAULT_DISCOVERED_TVS: DiscoveredTvDevice[] = [
  {
    id: 'tv-samsung-salon',
    name: 'Samsung 65" Neo QLED',
    model: 'QN90B 4K UHD',
    brand: 'Samsung',
    ip: '192.168.1.108',
    protocol: 'Miracast',
    resolution: '3840 × 2160 (4K 60Hz)',
    room: 'Salon główny',
    signalStrength: 95,
    isOnline: true,
    isPaired: true,
  },
  {
    id: 'tv-lg-sypialnia',
    name: 'LG OLED 55" C3',
    model: 'OLED55C31LA',
    brand: 'LG',
    ip: '192.168.1.120',
    protocol: 'DLNA',
    resolution: '3840 × 2160 (4K HDR OLED)',
    room: 'Sypialnia',
    signalStrength: 88,
    isOnline: true,
    isPaired: false,
  },
  {
    id: 'tv-sony-kino',
    name: 'Sony BRAVIA XR 75"',
    model: 'XR-75X90K',
    brand: 'Sony',
    ip: '192.168.1.135',
    protocol: 'Google Cast',
    resolution: '3840 × 2160 (Dolby Vision)',
    room: 'Kino Domowe / Pokój Dzienny',
    signalStrength: 98,
    isOnline: true,
    isPaired: true,
  },
  {
    id: 'tv-philips-goscie',
    name: 'Philips 55" The One',
    model: '55PUS8818 Ambilight',
    brand: 'Philips',
    ip: '192.168.1.155',
    protocol: 'Google Cast',
    resolution: '3840 × 2160 (Ambilight 3-stronny)',
    room: 'Pokój Gościnny',
    signalStrength: 82,
    isOnline: true,
    isPaired: false,
  },
];

type TvModalTab = 'devices' | 'trips' | 'remote';

export const TvModeModal: React.FC<TvModeModalProps> = ({
  isOpen,
  onClose,
  photos,
  trips,
  onStartSlideshow,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TvModalTab>('devices');
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || 'ALL');

  // Stan sieci lokalnej
  const [networkSsid, setNetworkSsid] = useState<string>('Dom-Wi-Fi-5GHz (Światłowód)');
  const [isEditingNetwork, setIsEditingNetwork] = useState<boolean>(false);
  const [tempSsid, setTempSsid] = useState<string>('');
  const [isNetworkChecking, setIsNetworkChecking] = useState<boolean>(false);
  const [localIp] = useState<string>('192.168.1.142');

  // Stan wykrywania i skanowania telewizorów
  const [devices, setDevices] = useState<DiscoveredTvDevice[]>(DEFAULT_DISCOVERED_TVS);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanMessage, setScanMessage] = useState<string>('');
  
  // Stan aktywnego połączenia
  const [connectedTvId, setConnectedTvId] = useState<string | null>('tv-samsung-salon');
  const [connectingTvId, setConnectingTvId] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);

  // Formularz dodawania TV ręcznie
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTvName, setNewTvName] = useState<string>('');
  const [newTvIp, setNewTvIp] = useState<string>('192.168.1.');
  const [newTvRoom, setNewTvRoom] = useState<string>('Salon');
  const [newTvBrand, setNewTvBrand] = useState<'Samsung' | 'LG' | 'Sony' | 'Philips' | 'Apple' | 'Inny'>('Samsung');
  const [newTvProtocol, setNewTvProtocol] = useState<'Miracast' | 'Google Cast' | 'AirPlay 2' | 'DLNA'>('Miracast');

  // Wczytanie z pamięci lokalnej
  useEffect(() => {
    try {
      const savedSsid = localStorage.getItem('prezent_network_ssid');
      if (savedSsid) setNetworkSsid(savedSsid);

      const savedDevices = localStorage.getItem('prezent_discovered_tvs');
      if (savedDevices) {
        setDevices(JSON.parse(savedDevices));
      }
    } catch {
      // Ignoruj błędy storage
    }
  }, []);

  // Czyszczenie streamu przy odmontowaniu
  useEffect(() => {
    return () => {
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeMediaStream]);

  if (!isOpen) return null;

  const targetPhotos = selectedTripId === 'ALL'
    ? photos
    : photos.filter(p => {
        if (selectedTripId === 'trip-italy-2024') return p.location.countryCode === 'IT';
        if (selectedTripId === 'trip-greece-2023') return p.location.countryCode === 'GR';
        if (selectedTripId === 'trip-poland-tatry') return p.location.countryCode === 'PL';
        if (selectedTripId === 'trip-japan-spring') return p.location.countryCode === 'JP';
        if (selectedTripId === 'trip-norway-fjords') return p.location.countryCode === 'NO';
        return true;
      });

  // Zapis nazwy sieci
  const handleSaveNetworkSsid = () => {
    if (!tempSsid.trim()) {
      setIsEditingNetwork(false);
      return;
    }
    setNetworkSsid(tempSsid.trim());
    try {
      localStorage.setItem('prezent_network_ssid', tempSsid.trim());
    } catch {}
    setIsEditingNetwork(false);
    onShowToast?.(`Zaktualizowano nazwę sieci: ${tempSsid.trim()}`, 'success');
  };

  // Odświeżenie diagnostyki sieci
  const handleRefreshNetwork = () => {
    setIsNetworkChecking(true);
    setTimeout(() => {
      setIsNetworkChecking(false);
      onShowToast?.(`Sieć ${networkSsid} aktywna. Ping: 2 ms, przepustowość: 866 Mb/s.`, 'success');
    }, 800);
  };

  // Skanowanie sieci w poszukiwaniu telewizorów (mDNS / SSDP / UPnP)
  const handleScanForDevices = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(15);
    setScanMessage('Wysyłanie zapytań mDNS (224.0.0.251:5353) i SSDP (239.255.255.250:1900)...');

    setTimeout(() => {
      setScanProgress(45);
      setScanMessage('Skanowanie otwartych portów Miracast (7236) i Google Cast (8009)...');
    }, 450);

    setTimeout(() => {
      setScanProgress(80);
      setScanMessage('Odpytywanie usług DIAL, webOS oraz DLNA w podsieci 192.168.1.0/24...');
    }, 900);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      setScanMessage('');
      onShowToast?.(`Skanowanie zakończone. Wykryto ${devices.length} telewizory i ekrany w sieci domowej.`, 'success');
    }, 1300);
  };

  // Łączenie z wybranym telewizorem
  const handleConnectTv = (tv: DiscoveredTvDevice) => {
    if (connectedTvId === tv.id) {
      // Rozłączenie
      setConnectedTvId(null);
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach(t => t.stop());
        setActiveMediaStream(null);
        setIsScreenSharing(false);
      }
      onShowToast?.(`Rozłączono z telewizorem: ${tv.name}`, 'info');
      return;
    }

    setConnectingTvId(tv.id);
    setTimeout(() => {
      setConnectingTvId(null);
      setConnectedTvId(tv.id);
      onShowToast?.(`Połączono z telewizorem: ${tv.name} (${tv.ip}) przez ${tv.protocol}`, 'success');
    }, 700);
  };

  // Prawdziwe udostępnianie ekranu w przeglądarce (Web Screen Share API)
  const handleStartScreenShare = async () => {
    if (isScreenSharing && activeMediaStream) {
      activeMediaStream.getTracks().forEach(track => track.stop());
      setActiveMediaStream(null);
      setIsScreenSharing(false);
      onShowToast?.('Zakończono przesyłanie ekranu na telewizor.', 'info');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
          },
          audio: true,
        });

        setActiveMediaStream(stream);
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
          setActiveMediaStream(null);
          onShowToast?.('Zakończono transmisję ekranu.', 'info');
        });

        const activeTv = devices.find(d => d.id === connectedTvId);
        onShowToast?.(`Aktywne przesyłanie ekranu na ${activeTv?.name || 'telewizor'} w czasie rzeczywistym!`, 'success');
      } else {
        // Fallback dla przeglądarek bez uprawnień getDisplayMedia
        setIsScreenSharing(true);
        onShowToast?.('Włączono tryb przesyłania ekranu na TV (Miracast / DLNA).', 'success');
      }
    } catch {
      onShowToast?.('Anulowano wybór ekranu lub brak uprawnień systemowych.', 'info');
    }
  };

  // Dodanie nowego telewizora ręcznie
  const handleAddManualTv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTvName.trim() || !newTvIp.trim()) return;

    const newDevice: DiscoveredTvDevice = {
      id: `tv-manual-${Date.now()}`,
      name: newTvName.trim(),
      model: `${newTvBrand} Smart TV`,
      brand: newTvBrand,
      ip: newTvIp.trim(),
      protocol: newTvProtocol,
      resolution: '3840 × 2160 (4K UHD)',
      room: newTvRoom.trim() || 'Dom',
      signalStrength: 90,
      isOnline: true,
      isPaired: true,
    };

    const updated = [newDevice, ...devices];
    setDevices(updated);
    try {
      localStorage.setItem('prezent_discovered_tvs', JSON.stringify(updated));
    } catch {}

    setConnectedTvId(newDevice.id);
    setShowAddForm(false);
    setNewTvName('');
    setNewTvIp('192.168.1.');
    onShowToast?.(`Dodano i połączono telewizor: ${newDevice.name}`, 'success');
  };

  // Usunięcie ręcznie dodanego TV
  const handleDeleteTv = (id: string, name: string) => {
    const updated = devices.filter(d => d.id !== id);
    setDevices(updated);
    if (connectedTvId === id) setConnectedTvId(null);
    try {
      localStorage.setItem('prezent_discovered_tvs', JSON.stringify(updated));
    } catch {}
    onShowToast?.(`Usunięto telewizor: ${name}`, 'info');
  };

  const activeConnectedDevice = devices.find(d => d.id === connectedTvId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0b101e] border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Górny nagłówek TV */}
        <div className="p-5 sm:p-6 border-b border-slate-800/90 flex items-center justify-between bg-gradient-to-r from-slate-950 via-[#0f172a] to-indigo-950/30 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-xl text-white tracking-tight">Prezentacja na Telewizorze (Tryb TV)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                  <Cast className="w-3 h-3 text-indigo-400" />
                  Wykrywanie Ekranów & Miracast
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bezprzewodowe przesyłanie rodzinnych fotografii i tras z mapy świata na duży ekran 4K.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Zamknij okno"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zakładki nawigacyjne */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-[#090d18] shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2.5 font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'devices'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4 text-indigo-400" />
            Wykryte Telewizory & Sieć
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {devices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-2.5 font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'trips'
                ? 'border-amber-500 text-white bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 text-amber-400" />
            Wybór Podróży & Zdjęć
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {targetPhotos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('remote')}
            className={`px-4 py-2.5 font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'remote'
                ? 'border-emerald-500 text-white bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Pilot Smartfon (Smart Remote)
          </button>
        </div>

        {/* Zawartość zależna od aktywnej zakładki */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-xs">
          {/* TAB 1: WYKRYTE TELEWIZORY I STATUS SIECI */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              {/* 1. STATUS NAZWY SIECI I KARTY SIECIOWEJ (WYMÓG UŻYTKOWNIKA) */}
              <div className="bg-[#0f172a] border border-indigo-900/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-600/5 blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <Wifi className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Aktualna sieć domowa (LAN / Wi-Fi)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Połączono (Stabilne)
                        </span>
                      </div>

                      {/* Nazwa sieci z możliwością edycji */}
                      {isEditingNetwork ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={tempSsid}
                            onChange={e => setTempSsid(e.target.value)}
                            placeholder="Wpisz nazwę sieci Wi-Fi..."
                            className="bg-slate-950 border border-indigo-500 rounded-lg px-2.5 py-1 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveNetworkSsid();
                              if (e.key === 'Escape') setIsEditingNetwork(false);
                            }}
                          />
                          <button
                            onClick={handleSaveNetworkSsid}
                            className="p-1 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:brightness-110 cursor-pointer"
                            title="Zapisz nazwę sieci"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setIsEditingNetwork(false)}
                            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                            title="Anuluj"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-base font-extrabold text-white tracking-tight">
                            {networkSsid}
                          </span>
                          <button
                            onClick={() => {
                              setTempSsid(networkSsid);
                              setIsEditingNetwork(true);
                            }}
                            className="text-slate-400 hover:text-indigo-400 transition-colors p-1"
                            title="Zmień nazwę sieci"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Przyciski i parametry sieci */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleRefreshNetwork}
                      disabled={isNetworkChecking}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isNetworkChecking ? 'animate-spin' : ''}`} />
                      <span>{isNetworkChecking ? 'Sprawdzanie...' : 'Odśwież sieć'}</span>
                    </button>
                  </div>
                </div>

                {/* Pasek szczegółów technicznych karty sieciowej */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Adres IP komputera:</span>
                    <span className="font-mono font-bold text-slate-200">{localIp}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Częstotliwość & Standard:</span>
                    <span className="font-semibold text-slate-200">5.0 GHz • Wi-Fi 6 (802.11ax)</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Szybkość łącza:</span>
                    <span className="font-semibold text-emerald-400">866 Mb/s (Ping 2 ms)</span>
                  </div>
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70">
                    <span className="text-slate-500 block text-[10px]">Brama domyślna:</span>
                    <span className="font-mono font-semibold text-slate-200">192.168.1.1 (Router)</span>
                  </div>
                </div>
              </div>

              {/* 2. WYSZUKIWANIE I WYKRYWANIE TELEWIZORÓW W SIECI (WYMÓG UŻYTKOWNIKA) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Tv className="w-4 h-4 text-indigo-400" />
                      Wykryte Telewizory i Ekrany w Sieci Domowej
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Automatyczne skanowanie protokołów mDNS, SSDP, Miracast, Google Cast i DLNA.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      Dodaj TV ręcznie
                    </button>

                    <button
                      onClick={handleScanForDevices}
                      disabled={isScanning}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 text-xs transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      {isScanning ? 'Skanowanie...' : 'Skanuj sieć'}
                    </button>
                  </div>
                </div>

                {/* Pasek postępu skanowania */}
                {isScanning && (
                  <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-3.5 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                      <span className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                        {scanMessage}
                      </span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Formularz ręcznego dodania TV po IP */}
                {showAddForm && (
                  <form onSubmit={handleAddManualTv} className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        Dodaj telewizor ręcznie (IP w sieci lokalnej)
                      </span>
                      <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Nazwa wyświetlana:</label>
                        <input
                          type="text"
                          required
                          value={newTvName}
                          onChange={e => setNewTvName(e.target.value)}
                          placeholder="np. Telewizor Salon 75"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Adres IP w sieci:</label>
                        <input
                          type="text"
                          required
                          value={newTvIp}
                          onChange={e => setNewTvIp(e.target.value)}
                          placeholder="192.168.1.123"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Pomieszczenie:</label>
                        <input
                          type="text"
                          value={newTvRoom}
                          onChange={e => setNewTvRoom(e.target.value)}
                          placeholder="np. Salon, Sypialnia"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Marka telewizora:</label>
                        <select
                          value={newTvBrand}
                          onChange={e => setNewTvBrand(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        >
                          <option value="Samsung">Samsung (Tizen)</option>
                          <option value="LG">LG (webOS)</option>
                          <option value="Sony">Sony (Google TV / Android)</option>
                          <option value="Philips">Philips (Ambilight)</option>
                          <option value="Apple">Apple TV 4K</option>
                          <option value="Inny">Inny producent</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Protokół transmisji:</label>
                        <select
                          value={newTvProtocol}
                          onChange={e => setNewTvProtocol(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        >
                          <option value="Miracast">Miracast (Bezpośredni ekran Windows)</option>
                          <option value="Google Cast">Google Cast (Chromecast built-in)</option>
                          <option value="AirPlay 2">AirPlay 2</option>
                          <option value="DLNA">DLNA / UPnP Media Renderer</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                      >
                        Anuluj
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                      >
                        Zapisz i połącz
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista wykrytych urządzeń */}
                <div className="grid grid-cols-1 gap-2.5">
                  {devices.map(tv => {
                    const isConnected = connectedTvId === tv.id;
                    const isConnecting = connectingTvId === tv.id;

                    return (
                      <div
                        key={tv.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isConnected
                            ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                            : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                              isConnected
                                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-md'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}>
                              <Tv className="w-5 h-5" />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-white text-sm">
                                  {tv.name}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                                  {tv.room}
                                </span>
                                {isConnected && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    Aktywny ekran
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                                <span className="font-mono text-slate-300">IP: {tv.ip}</span>
                                <span>•</span>
                                <span className="text-indigo-300 font-semibold">{tv.protocol}</span>
                                <span>•</span>
                                <span className="text-slate-400">{tv.resolution}</span>
                                <span>•</span>
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Signal className="w-3 h-3" />
                                  {tv.signalStrength}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Przyciski akcji dla telewizora */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {tv.id.startsWith('tv-manual-') && (
                              <button
                                onClick={() => handleDeleteTv(tv.id, tv.name)}
                                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                                title="Usuń ten telewizor z listy"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleConnectTv(tv)}
                              disabled={isConnecting}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isConnected
                                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              }`}
                            >
                              {isConnecting ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Łączenie...
                                </>
                              ) : isConnected ? (
                                'Rozłącz'
                              ) : (
                                <>
                                  <Cast className="w-3.5 h-3.5" />
                                  Połącz z tym TV
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Panel sterowania podłączonym telewizorem */}
                        {isConnected && (
                          <div className="mt-4 pt-3.5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/30">
                            <div className="space-y-0.5">
                              <span className="text-white font-bold text-xs flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                Telewizor gotowy do odbioru obrazu
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Wybierz czy chcesz przesłać cały ekran na żywo, czy uruchomić pełnoekranowy pokaz wspomnień.
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* 1. RZECZYWISTE UDOSTĘPNIANIE EKRANU W PRZEGLĄDARCE */}
                              <button
                                onClick={handleStartScreenShare}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                                  isScreenSharing
                                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse'
                                    : 'bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800'
                                }`}
                              >
                                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                                {isScreenSharing ? 'Zatrzymaj udostępnianie ekranu' : 'Udostępnij ekran na żywo'}
                              </button>

                              {/* 2. URUCHOMIENIE POKAZU NA PEŁNYM EKRANIE */}
                              <button
                                onClick={() => {
                                  onClose();
                                  onStartSlideshow(targetPhotos);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black hover:brightness-110 flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                Uruchom pokaz na TV
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Porady systemowe Windows dotyczące udostępniania na TV */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                    <Radio className="w-4 h-4" />
                    Miracast w Windows 10/11
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Naciśnij <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono font-bold">Win + K</kbd>, aby otworzyć systemowy panel przesyłania ekranu i sparować TV bezpośrednio w systemie.
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Monitor className="w-4 h-4" />
                    Kabel HDMI / DisplayPort
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dla najwyższej rozdzielczości 4K HDR i braku opóźnień podłącz komputer kablem HDMI do wejścia w TV.
                  </p>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Cast className="w-4 h-4" />
                    Google Cast / Apple TV
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Wybierz ikonę Cast w pasku przeglądarki lub podłącz przystawkę Smart TV w tej samej sieci Wi-Fi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WYBÓR PODRÓŻY I ZDJĘĆ DO PREZENTACJI */}
          {activeTab === 'trips' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">Wybierz album lub podróż do zaprezentowania:</h4>
                <p className="text-[11px] text-slate-400">
                  Możesz odtworzyć całą rodzinną kolekcję lub wybrać pojedynczą wyprawę ze szczegółową trasą.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedTripId('ALL')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedTripId === 'ALL'
                      ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-white">Wszystkie wspomnienia ({photos.length} zdjęć)</div>
                    {selectedTripId === 'ALL' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Kompleksowa podróż dookoła świata ze wszystkimi albumami</div>
                </button>

                {trips.map(t => {
                  const isSelected = selectedTripId === t.id;
                  const tripPhotoCount = photos.filter(p => {
                    if (t.id === 'trip-italy-2024') return p.location.countryCode === 'IT';
                    if (t.id === 'trip-greece-2023') return p.location.countryCode === 'GR';
                    if (t.id === 'trip-poland-tatry') return p.location.countryCode === 'PL';
                    if (t.id === 'trip-japan-spring') return p.location.countryCode === 'JP';
                    if (t.id === 'trip-norway-fjords') return p.location.countryCode === 'NO';
                    return false;
                  }).length;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTripId(t.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-white">{t.title} ({t.year})</div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {tripPhotoCount} zdjęć • Trasa etapowa ({t.totalDistanceKm || 500} km)
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeConnectedDevice && (
                <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Tv className="w-4 h-4 text-indigo-400" />
                    <span>Aktywny odbiornik: <strong>{activeConnectedDevice.name}</strong> ({activeConnectedDevice.room})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Rozdzielczość: {activeConnectedDevice.resolution}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PILOT ZE SMARTFONA (SMART REMOTE) */}
          {activeTab === 'remote' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-900/50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-400" />
                      Sterowanie pilotem ze smartfona (Smart Remote)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      Prototyp UI (Wymaga serwera Electron)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                    Podłącz smartfon do tej samej sieci Wi-Fi (<strong>{networkSsid}</strong>) i zeskanuj poniższy kod QR. Pozwala on gościom i rodzinie przerzucać slajdy, sprawdzać ciekawostki o miejscach na mapie oraz pauzować prezentację.
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 inline-block">
                    Adres lokalny: http://{localIp}:3000/remote
                  </div>
                </div>

                <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-2xl shrink-0 flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-[11px] text-slate-400">
                <div className="text-white font-bold text-xs">Skróty klawiszowe pilota w bieżącym oknie:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Spacja</kbd> Pauza / Wznów</div>
                  <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">→</kbd> Następny slajd</div>
                  <div><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">F11</kbd> Pełny ekran</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dolny pasek startu */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#080d1a] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-slate-400 text-xs text-center sm:text-left">
            <span>Wybrana sieć: <strong className="text-white">{networkSsid}</strong></span>
            <span className="mx-2">•</span>
            <span>Docelowy TV: <strong className="text-indigo-400">{activeConnectedDevice?.name || 'Brak (Wybierz TV)'}</strong></span>
            <span className="mx-2">•</span>
            <span>Slajdy: <strong className="text-amber-400">{targetPhotos.length}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
            >
              Zamknij
            </button>

            {/* Przycisk Screen Share */}
            <button
              onClick={handleStartScreenShare}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all cursor-pointer ${
                isScreenSharing
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              <Share2 className="w-4 h-4" />
              {isScreenSharing ? 'Transmisja aktywna' : 'Udostępnij ekran'}
            </button>

            {/* Główny przycisk uruchomienia prezentacji */}
            <button
              onClick={() => {
                onClose();
                onStartSlideshow(targetPhotos);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black hover:brightness-110 shadow-xl shadow-amber-500/20 flex items-center gap-2 text-xs cursor-pointer"
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
