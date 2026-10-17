import React, { useState, useEffect, useRef } from 'react';
import { TravelPhoto } from '../types/travel';
import { ambientSound } from '../services/audioAmbient';
import { LocalMiniMap } from './LocalMiniMap';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles,
  Compass
} from 'lucide-react';

interface SlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: TravelPhoto[];
  initialIndex?: number;
}

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [intervalSec, setIntervalSec] = useState<number>(6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [kenBurnsActive, setKenBurnsActive] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen || !photos.length || !window.electronAPI) return;
    return window.electronAPI.onRemoteCommand(command => {
      if (command === 'next') setCurrentIndex(index => (index + 1) % photos.length);
      if (command === 'previous') setCurrentIndex(index => (index - 1 + photos.length) % photos.length);
      if (command === 'toggle-play') setIsPlaying(playing => !playing);
      if (command === 'close') { onClose(); void window.electronAPI?.stopRemote(); }
    });
  }, [isOpen, photos.length, onClose]);

  // Zresetuj indeks gdy modal się otwiera
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsPlaying(true);
      if (!isMuted) {
        ambientSound.startOceanAmbient();
      }
    } else {
      ambientSound.stop();
    }
    return () => {
      ambientSound.stop();
    };
  }, [isOpen, initialIndex]);

  // Timer automatycznego zmieniania slajdów
  useEffect(() => {
    if (!isOpen || !isPlaying || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, intervalSec, photos.length]);

  // Obsługa klawiatury (Strzałki, Spacja, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % photos.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[Math.min(currentIndex, photos.length - 1)];

  const toggleSound = () => {
    if (isMuted) {
      ambientSound.startOceanAmbient();
      setIsMuted(false);
    } else {
      ambientSound.stop();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % photos.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* TŁO ZDJĘCIA: Płynne skalowanie Ken Burns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={currentPhoto.id}
          src={currentPhoto.url}
          alt={currentPhoto.title}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            kenBurnsActive ? 'animate-ken-burns' : ''
          }`}
        />
        {/* Winieta kinowa i przyciemnienie dolnej strefy na napisy */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/60" />
      </div>

      {/* GÓRNY PASEK KONTROLNY */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-xl">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            {currentIndex + 1} / {photos.length}
          </div>
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            Kinowy Pokaz Slajdów „Prezent Mapy”
          </span>
        </div>

        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
          {/* Ambient Sound */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl transition-all ${
              isMuted ? 'text-slate-500 hover:text-white' : 'text-amber-400 bg-amber-500/20'
            }`}
            title={isMuted ? 'Włącz nastrojowy ambient dźwiękowy' : 'Wycisz dźwięk'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Czas slajdu */}
          <select
            value={intervalSec}
            onChange={e => setIntervalSec(Number(e.target.value))}
            className="bg-black/60 border border-white/10 text-xs rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
            title="Czas wyświetlania slajdu"
          >
            <option value={4}>4s</option>
            <option value={6}>6s</option>
            <option value={8}>8s</option>
            <option value={12}>12s</option>
          </select>

          {/* Ken Burns Toggle */}
          <button
            onClick={() => setKenBurnsActive(!kenBurnsActive)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              kenBurnsActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
            }`}
            title="Płynne przybliżenie kinowe"
          >
            Ken Burns
          </button>

          {/* Pełny ekran */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white rounded-xl transition-colors"
            title="Pełny ekran (Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Zamknij pokaz */}
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-500/80 rounded-xl text-white transition-all ml-1"
            title="Wyjdź z pokazu slajdów (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STRZAŁKI NAWIGACJI BOCZNEJ */}
      <div className="relative z-10 flex items-center justify-between px-6 pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto p-4 rounded-2xl bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 cursor-pointer"
          title="Poprzednie zdjęcie (Strzałka w lewo)"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto p-4 rounded-2xl bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 cursor-pointer"
          title="Następne zdjęcie (Strzałka w prawo)"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* DOLNA STREFA: KINOWE NAPISY, MINI-MAPA I PILOT */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-end justify-between gap-6">
        {/* Lewa strona: Opis wspomnienia */}
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 shadow-lg">
              <MapPin className="w-3.5 h-3.5" />
              {currentPhoto.location.cityName}, {currentPhoto.location.countryName}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur text-slate-300 border border-white/10 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {currentPhoto.date}
            </span>
            {currentPhoto.participants.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur text-slate-300 border border-white/10 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {currentPhoto.participants.join(', ')}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
            {currentPhoto.title}
          </h2>

          <p className="text-sm md:text-base text-slate-200/95 leading-relaxed drop-shadow bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/10 max-w-xl">
            {currentPhoto.notes}
          </p>
        </div>

        {/* Prawa strona: Mini-Mapa Picture-in-Picture & Pilot */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Mini-Mapa PiP */}
          <div className="w-48 h-32 rounded-2xl overflow-hidden border border-amber-400/50 shadow-2xl bg-slate-900 relative">
            <LocalMiniMap lat={currentPhoto.location.lat} lng={currentPhoto.location.lng} />
            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur text-[10px] px-2 py-0.5 rounded-full font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Compass className="w-3 h-3" /> Lokalizacja
            </div>
          </div>

          {/* Pływający pilot odtwarzania */}
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold hover:scale-105 transition-all shadow-lg"
              title={isPlaying ? 'Zatrzymaj (Spacja)' : 'Wznów (Spacja)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <span className="text-xs text-slate-300 font-mono">
              {isPlaying ? 'Odtwarzanie...' : 'Wstrzymano'}
            </span>
          </div>
        </div>
      </div>

      {/* Pasek postępu na samym dole */}
      <div className="w-full h-1 bg-white/20 overflow-hidden relative z-20">
        <div
          key={`${currentIndex}-${isPlaying}`}
          className={`h-full bg-gradient-to-r from-amber-400 to-emerald-400 ${
            isPlaying ? 'w-full transition-all linear' : 'w-full'
          }`}
          style={{
            transitionDuration: isPlaying ? `${intervalSec}s` : '0s',
          }}
        />
      </div>
    </div>
  );
};
