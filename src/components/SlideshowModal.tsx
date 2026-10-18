import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TravelPhoto } from '../types/travel';
import { MediaItem } from '../types/media';
import { ambientSound, AmbientSoundTrack } from '../services/audioAmbient';
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
  Compass,
  Settings,
  Shuffle,
  Repeat,
  Layers,
  Sliders,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Music,
  Wind,
  Flame,
  Waves,
  Sun
} from 'lucide-react';

export type SlideshowTransition = 'ken-burns' | 'crossfade' | 'slide' | 'zoom-fade';
export type SlideshowInfoMode = 'full' | 'minimal' | 'clean';
export type SlideshowOrderMode = 'original' | 'chronological' | 'reverse' | 'shuffle';

interface SlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Array<TravelPhoto | MediaItem>;
  initialIndex?: number;
  albumName?: string;
}

type SlideshowMedia = TravelPhoto | MediaItem;
const isVideoMedia = (media: SlideshowMedia): media is MediaItem => 'kind' in media && media.kind === 'video';

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  isOpen,
  onClose,
  photos: inputPhotos,
  initialIndex = 0,
  albumName,
}) => {
  // Ustawienia odtwarzania
  const [intervalSec, setIntervalSec] = useState<number>(6);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [orderMode, setOrderMode] = useState<SlideshowOrderMode>('original');
  const [transition, setTransition] = useState<SlideshowTransition>('ken-burns');

  // Ustawienia dźwięku
  const [ambientTrack, setAmbientTrack] = useState<AmbientSoundTrack>('ocean');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Widok i nakładki
  const [infoMode, setInfoMode] = useState<SlideshowInfoMode>('full');
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [showFilmstrip, setShowFilmstrip] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Auto-ukrywanie kontrolek podczas bezruchu myszy
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const idleTimerRef = useRef<number | null>(null);

  // Lista zdjęć w wybranej kolejności
  const activePhotos = useMemo<SlideshowMedia[]>(() => {
    if (inputPhotos.length <= 1) return inputPhotos;
    const list = [...inputPhotos];
    if (orderMode === 'chronological') {
      return list.sort((a, b) => a.date.localeCompare(b.date));
    } else if (orderMode === 'reverse') {
      return list.sort((a, b) => b.date.localeCompare(a.date));
    } else if (orderMode === 'shuffle') {
      // Deterministyczny lub losowy shuffle
      return list.sort(() => Math.random() - 0.5);
    }
    // 'original' = kolejność przekazana (np. ułożona w katalogu)
    return list;
  }, [inputPhotos, orderMode]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);

  // Inicjalizacja pokazu i dźwięku
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, activePhotos.length - 1)));
      setIsPlaying(true);
      if (!isMuted && ambientTrack !== 'none') {
        ambientSound.setVolume(volume / 100);
        ambientSound.playTrack(ambientTrack);
      }
    } else {
      ambientSound.stop();
      setIsSettingsOpen(false);
    }
    return () => {
      ambientSound.stop();
    };
  }, [isOpen]);

  // Synchronizacja głośności i ścieżki dźwiękowej
  useEffect(() => {
    if (!isOpen) return;
    if (isMuted || ambientTrack === 'none') {
      ambientSound.stop();
    } else {
      ambientSound.setVolume(volume / 100);
      ambientSound.playTrack(ambientTrack);
    }
  }, [ambientTrack, isMuted, volume, isOpen]);

  // Timer automatycznej zmiany slajdów
  useEffect(() => {
    if (!isOpen || !isPlaying || activePhotos.length <= 1 || isVideoMedia(activePhotos[currentIndex])) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= activePhotos.length - 1) {
          if (isLooping) {
            return 0;
          } else {
            setIsPlaying(false);
            return prev;
          }
        }
        return prev + 1;
      });
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, intervalSec, activePhotos.length, isLooping]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoMedia(activePhotos[currentIndex])) return;
    video.volume = volume / 100;
    video.muted = isMuted;
    if (isPlaying) void video.play().catch(() => setIsPlaying(false));
    else video.pause();
    return () => video.pause();
  }, [activePhotos, currentIndex, isMuted, isPlaying, volume]);

  // Auto-scrollowanie paska miniatur do aktywnego zdjęcia
  useEffect(() => {
    if (showFilmstrip && filmstripRef.current) {
      const activeThumb = filmstripRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, showFilmstrip]);

  // Obsługa ruchu myszy - auto-ukrywanie kontrolek po 3.5s
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying && !isSettingsOpen) {
      idleTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  };

  // Obsługa skrótów klawiaturowych
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      setControlsVisible(true);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % activePhotos.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + activePhotos.length) % activePhotos.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(prev => Math.min(100, prev + 10));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 10));
      } else if (e.key.toLowerCase() === 'm') {
        setIsMuted(prev => !prev);
      } else if (e.key.toLowerCase() === 'f' || e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 's') {
        setIsSettingsOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 't') {
        setShowFilmstrip(prev => !prev);
      } else if (e.key === 'Home') {
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        setCurrentIndex(activePhotos.length - 1);
      } else if (e.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activePhotos.length, isSettingsOpen, onClose]);

  if (!isOpen || activePhotos.length === 0) return null;

  const currentPhoto = activePhotos[currentIndex] || activePhotos[0];
  const mediaTitle = (media: SlideshowMedia) => media.title;
  const mediaDate = (media: SlideshowMedia) => media.date;
  const mediaLocation = (media: SlideshowMedia) => media.location;
  const mediaNotes = (media: SlideshowMedia) => isVideoMedia(media) ? '' : media.notes;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % activePhotos.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + activePhotos.length) % activePhotos.length);

  // Klasy animacji w zależności od wybranego przejścia
  const getTransitionClass = () => {
    switch (transition) {
      case 'ken-burns':
        return 'animate-ken-burns transition-opacity duration-1000';
      case 'crossfade':
        return 'transition-opacity duration-700 ease-in-out';
      case 'slide':
        return 'transition-all duration-700 ease-out transform';
      case 'zoom-fade':
        return 'transition-all duration-1000 transform scale-100 animate-in fade-in zoom-in-95';
      default:
        return 'transition-opacity duration-700';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none font-sans ${
        !controlsVisible ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* TŁO ZDJĘCIA: Płynne skalowanie i efekty wizualne */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {isVideoMedia(currentPhoto) ? (
          <video
            data-testid="slideshow-video"
            ref={videoRef}
            key={`${currentPhoto.id}-${currentIndex}`}
            src={`prezent-video://local/${currentPhoto.id}`}
            className="pointer-events-auto w-full h-full object-contain bg-black"
            autoPlay={isPlaying}
            controls
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={nextSlide}
            onError={() => setIsPlaying(false)}
          />
        ) : (
          <img
            key={`${currentPhoto.id}-${currentIndex}`}
            src={currentPhoto.url}
            alt={currentPhoto.title}
            className={`w-full h-full object-contain ${getTransitionClass()}`}
          />
        )}
        {/* Winieta kinowa i gradient ochronny na napisy */}
        {infoMode !== 'clean' && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-black/60 pointer-events-none" />
        )}
      </div>

      {/* GÓRNY PASEK KONTROLNY (HUD) */}
      <div
        className={`relative z-20 p-4 sm:p-6 flex items-center justify-between transition-opacity duration-500 ${
          controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Lewa etykieta informacyjna */}
        <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
            {currentIndex + 1} / {activePhotos.length}
          </div>
          <div>
            <span className="text-xs font-bold tracking-wide text-white block">
              {albumName ? `Katalog: ${albumName}` : 'Kinowy Pokaz Slajdów'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {orderMode === 'original' && 'Kolejność: Ułożona w katalogu'}
              {orderMode === 'chronological' && 'Kolejność: Chronologiczna'}
              {orderMode === 'reverse' && 'Kolejność: Najnowsze'}
              {orderMode === 'shuffle' && 'Kolejność: Losowa'}
              {' • '}{intervalSec}s
            </span>
          </div>
        </div>

        {/* Prawy zestaw przycisków kontrolnych */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          {/* Szybki przełącznik dźwięku */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl transition-all ${
              isMuted ? 'text-slate-500 hover:text-white' : 'text-amber-400 bg-amber-500/20 border border-amber-500/30'
            }`}
            title={isMuted ? 'Włącz nastrojowy ambient (M)' : 'Wycisz dźwięk (M)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Przełącznik trybu informacji (Pełny / Minimalistyczny / Czyste kino) */}
          <button
            onClick={() => {
              if (infoMode === 'full') setInfoMode('minimal');
              else if (infoMode === 'minimal') setInfoMode('clean');
              else setInfoMode('full');
            }}
            className="p-2 text-slate-300 hover:text-white rounded-xl transition-colors"
            title={`Widok napisów: ${infoMode === 'full' ? 'Pełny opis' : infoMode === 'minimal' ? 'Tylko miasto' : 'Czyste kino'}`}
          >
            {infoMode === 'clean' ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Przełącznik paska miniatur */}
          <button
            onClick={() => setShowFilmstrip(!showFilmstrip)}
            className={`p-2 rounded-xl transition-all ${
              showFilmstrip ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:text-white'
            }`}
            title="Pokaż / Ukryj pasek miniatur (T)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Koło zębate - Otwórz panel ustawień */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl transition-all ${
              isSettingsOpen ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
            title="Ustawienia zaawansowane pokazu (S)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Pełny ekran */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white rounded-xl transition-colors"
            title="Pełny ekran (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Zamknij pokaz slajdów */}
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-500 rounded-xl text-white transition-all ml-1 cursor-pointer"
            title="Wyjdź z pokazu slajdów (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STRZAŁKI NAWIGACJI BOCZNEJ */}
      <div
        className={`relative z-20 flex items-center justify-between px-4 sm:px-6 pointer-events-none transition-opacity duration-500 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={prevSlide}
          className="pointer-events-auto p-3.5 sm:p-4 rounded-2xl bg-black/50 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 cursor-pointer shadow-2xl"
          title="Poprzednie zdjęcie (Strzałka w lewo)"
        >
          <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto p-3.5 sm:p-4 rounded-2xl bg-black/50 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 cursor-pointer shadow-2xl"
          title="Następne zdjęcie (Strzałka w prawo)"
        >
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* DOLNA STREFA: KINOWE NAPISY, MINI-MAPA I PILOT */}
      <div
        className={`relative z-20 p-4 sm:p-8 flex flex-col md:flex-row items-end justify-between gap-6 transition-opacity duration-500 ${
          controlsVisible && infoMode !== 'clean' ? 'opacity-100' : infoMode === 'clean' ? 'opacity-0 pointer-events-none' : 'opacity-0'
        }`}
      >
        {/* Lewa strona: Opis wspomnienia */}
        <div className="max-w-2xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5 shadow-lg">
              <MapPin className="w-3.5 h-3.5" />
              {mediaLocation(currentPhoto)?.cityName || 'Brak lokalizacji'}, {mediaLocation(currentPhoto)?.countryName || ''}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur text-slate-300 border border-white/10 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              {mediaDate(currentPhoto)}
            </span>
            {infoMode === 'full' && !isVideoMedia(currentPhoto) && currentPhoto.participants.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur text-slate-300 border border-white/10 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {currentPhoto.participants.join(', ')}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-xl">
            {mediaTitle(currentPhoto)}
          </h2>

          {infoMode === 'full' && mediaNotes(currentPhoto) && (
            <p className="text-sm text-slate-200/95 leading-relaxed drop-shadow bg-black/50 backdrop-blur-sm p-3 rounded-2xl border border-white/10 max-w-xl">
              {mediaNotes(currentPhoto)}
            </p>
          )}
        </div>

        {/* Prawa strona: Mini-Mapa Picture-in-Picture & Pływający pilot */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Mini-Mapa PiP */}
          {showMiniMap && mediaLocation(currentPhoto) && (
            <div className="w-48 h-32 rounded-2xl overflow-hidden border border-amber-400/50 shadow-2xl bg-slate-900 relative">
              <iframe
                title="Mini Map"
                className="w-full h-full pointer-events-none filter brightness-90 contrast-125"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mediaLocation(currentPhoto)!.lng - 0.2}%2C${mediaLocation(currentPhoto)!.lat - 0.2}%2C${mediaLocation(currentPhoto)!.lng + 0.2}%2C${mediaLocation(currentPhoto)!.lat + 0.2}&layer=mapnik&marker=${mediaLocation(currentPhoto)!.lat}%2C${mediaLocation(currentPhoto)!.lng}`}
              />
              <div className="absolute top-2 left-2 bg-black/85 backdrop-blur text-[10px] px-2 py-0.5 rounded-full font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Compass className="w-3 h-3" /> Lokalizacja
              </div>
            </div>
          )}

          {/* Pływający pilot odtwarzania */}
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold hover:scale-105 transition-all shadow-lg cursor-pointer"
              title={isPlaying ? 'Zatrzymaj (Spacja)' : 'Wznów (Spacja)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <span className="text-xs text-slate-300 font-mono">
              {isPlaying ? 'Odtwarzanie' : 'Wstrzymano'}
            </span>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors ${isLooping ? 'text-amber-400' : 'text-slate-500'}`}
              title={isLooping ? 'Pętla włączona (powtarzaj)' : 'Pętla wyłączona'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* PASEK MINIATUR (FILMSTRIP / TIMELINE) */}
      {showFilmstrip && (
        <div
          ref={filmstripRef}
          className={`relative z-20 bg-black/85 backdrop-blur-lg border-t border-white/10 p-3 flex items-center gap-2.5 overflow-x-auto scrollbar-thin transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {activePhotos.map((photo, pIdx) => {
            const isCurrent = pIdx === currentIndex;
            return (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(pIdx)}
                className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50'
                    : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                }`}
                title={`#${pIdx + 1} - ${photo.title}`}
              >
                {isVideoMedia(photo) ? (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] text-amber-300">FILM</div>
                ) : (
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 rounded text-[9px] font-mono text-white">
                  #{pIdx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* CIENKI PASEK POSTĘPU NA SAMYM DOLE */}
      <div className="w-full h-1 bg-white/15 overflow-hidden relative z-30">
        <div
          key={`${currentIndex}-${isPlaying}-${intervalSec}`}
          className={`h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 ${
            isPlaying ? 'w-full' : 'w-full'
          }`}
          style={{
            transitionProperty: isPlaying ? 'width' : 'none',
            transitionDuration: isPlaying ? `${intervalSec}s` : '0s',
            transitionTimingFunction: 'linear',
          }}
        />
      </div>

      {/* BOCZNY WYSUNIĘTY PANEL USTAWIEŃ POKAZU SLAJDÓW (DRAWER) */}
      {isSettingsOpen && (
        <div className="absolute inset-y-0 right-0 w-full sm:w-96 z-40 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl font-sans overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ustawienia Pokazu</h3>
                  <p className="text-[11px] text-slate-400">Dostosuj tempo, muzykę i przejścia</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. CZAS TRWANIA SLAJDU */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Czas wyświetlania slajdu:</span>
                <span className="font-mono text-amber-400 font-bold">{intervalSec} sekund</span>
              </div>
              <input
                type="range"
                min={2}
                max={30}
                value={intervalSec}
                onChange={e => setIntervalSec(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>2s (szybko)</span>
                <span>6s (optymalnie)</span>
                <span>15s (spokojnie)</span>
                <span>30s</span>
              </div>
            </div>

            {/* 2. EFEKTY PRZEJŚCIA SLAJDÓW */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Efekt przejścia slajdów:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'ken-burns', label: 'Ken Burns (Płynny zoom)' },
                  { id: 'crossfade', label: 'Płynne przenikanie' },
                  { id: 'slide', label: 'Kinowy przesuw' },
                  { id: 'zoom-fade', label: 'Zoom & Fade' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTransition(item.id as SlideshowTransition)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                      transition === item.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. KOLEJNOŚĆ ODTWARZANIA */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Kolejność odtwarzania:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'original', label: '⭐ Własna z katalogu' },
                  { id: 'chronological', label: 'Najstarsze pierwsze' },
                  { id: 'reverse', label: 'Najnowsze pierwsze' },
                  { id: 'shuffle', label: 'Losowa (Shuffle)' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setOrderMode(item.id as SlideshowOrderMode)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                      orderMode === item.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. NASTROJOWE TŁO DŹWIĘKOWE (WEB AUDIO API - 100% OFFLINE) */}
            <div className="space-y-2.5 border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-400" /> Nastrojowy dźwięk offline:
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">100% Proceduralny</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'ocean', label: 'Szum oceanu', icon: Waves },
                  { id: 'forest', label: 'Szum lasu & wiatr', icon: Wind },
                  { id: 'campfire', label: 'Ognisko & kominek', icon: Flame },
                  { id: 'crickets', label: 'Letnie cykady', icon: Sun },
                  { id: 'synthPad', label: 'Spokojny ambient pad', icon: Sparkles },
                  { id: 'none', label: 'Brak dźwięku', icon: VolumeX },
                ].map(track => {
                  const Icon = track.icon;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        setAmbientTrack(track.id as AmbientSoundTrack);
                        if (track.id !== 'none') setIsMuted(false);
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        ambientTrack === track.id && !isMuted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{track.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Suwak głośności */}
              {ambientTrack !== 'none' && !isMuted && (
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Głośność dźwięku:</span>
                    <span className="font-mono text-amber-400">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* 5. POZOSTAŁE OPCJE */}
            <div className="space-y-3 border-t border-slate-800/80 pt-4 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Pokaż mini-mapę Picture-in-Picture</span>
                <input
                  type="checkbox"
                  checked={showMiniMap}
                  onChange={e => setShowMiniMap(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Pokaż dolny pasek miniatur</span>
                <input
                  type="checkbox"
                  checked={showFilmstrip}
                  onChange={e => setShowFilmstrip(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Odtwarzaj w pętli bez końca</span>
                <input
                  type="checkbox"
                  checked={isLooping}
                  onChange={e => setIsLooping(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Zamknij panel i oglądaj
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
