import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { TravelPhoto, TravelTrip, TravelAlbum, MapTileProvider } from '../types/travel';
import { 
  Layers, 
  MapPin, 
  Plus, 
  Minus, 
  Locate, 
  Search, 
  Globe, 
  Play, 
  Sun, 
  Moon, 
  Compass, 
  Map as MapIcon, 
  Check,
  FolderPlus,
  Upload,
  Clipboard,
  Link,
  Package,
  Copy,
  ChevronDown,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { InitialImportLocation, ImportTabMode } from './ImportModal';
import { formatCoordinates, guessNearestLocation, reverseGeocodeOnline, GeoGuess, readImageFromClipboard } from '../services/geoService';

interface MapViewProps {
  photos: TravelPhoto[];
  trips: TravelTrip[];
  albums: TravelAlbum[];
  selectedTripId: string | null;
  onSelectPhoto: (photo: TravelPhoto) => void;
  onStartSlideshow: (filteredPhotos?: TravelPhoto[]) => void;
  tileProvider: MapTileProvider;
  onChangeTileProvider: (provider: MapTileProvider) => void;
  showAnimatedRoutes?: boolean;
  offlineMode?: boolean;
  autoCenterOnPhotos?: boolean;
  onOpenImport?: (location?: InitialImportLocation, mode?: ImportTabMode) => void;
  onShowToast?: (message: string, type: 'info' | 'success' | 'warning') => void;
  onDropPhotosOnMap?: (files: File[], lat: number, lng: number) => void;
}

interface TileServerConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
}

// 100% stabilne, szybkie i niezawodne serwery kafelków w wysokiej rozdzielczości
const TILE_SERVERS: Record<MapTileProvider, TileServerConfig> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  osm: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  streets: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ',
    maxZoom: 19,
  },
};

const MAP_STYLES: { id: MapTileProvider; label: string; sub: string; icon: any }[] = [
  { id: 'dark', label: 'Nocny', sub: 'Dark Matter', icon: Moon },
  { id: 'satellite', label: 'Satelita', sub: 'Esri World Imagery', icon: Globe },
  { id: 'voyager', label: 'Kolor / Teren', sub: 'OpenStreetMap', icon: Compass },
  { id: 'streets', label: 'Ulice', sub: 'Esri Streets', icon: MapIcon },
  { id: 'light', label: 'Dzień', sub: 'Positron Light', icon: Sun },
];

export const MapView: React.FC<MapViewProps> = ({
  photos,
  trips,
  albums,
  selectedTripId,
  onSelectPhoto,
  onStartSlideshow,
  tileProvider,
  onChangeTileProvider,
  showAnimatedRoutes = true,
  offlineMode = false,
  autoCenterOnPhotos = true,
  onOpenImport,
  onShowToast,
  onDropPhotosOnMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);
  const [activeCountryFilter, setActiveCountryFilter] = useState<string>('ALL');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Stan menu kontekstowego prawego przycisku myszy (Right-Click Context Menu)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    lat: number;
    lng: number;
    guess: GeoGuess;
  } | null>(null);

  // Stan przeciągania plików nad mapą (Drag & Drop)
  const [isDragOverMap, setIsDragOverMap] = useState<boolean>(false);
  const [dragHoverCoords, setDragHoverCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Inicjalizacja instancji Leaflet z obsługą prawego przycisku myszy
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [36.0, 15.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    const activeProvider = tileProvider in TILE_SERVERS ? tileProvider : 'dark';
    const config = offlineMode ? { url: 'prezent-tiles://local/{z}/{x}/{y}', attribution: 'Lokalny pakiet MBTiles — licencja dostawcy pakietu', maxZoom: 22, subdomains: '' } : TILE_SERVERS[activeProvider];
    const tileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const markersLayer = L.layerGroup().addTo(map);
    const routesLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    routesLayerRef.current = routesLayer;
    mapInstanceRef.current = map;

    // OBSŁUGA PRAWEGO PRZYCISKU MYSZY NA MAPIE (Context Menu)
    map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      const { lat, lng } = e.latlng;
      const initialGuess = guessNearestLocation(lat, lng);

      // Obliczamy pozycję menu tak, aby nie wychodziło poza krawędzie kontenera
      const container = mapContainerRef.current;
      let posX = e.containerPoint.x;
      let posY = e.containerPoint.y;

      if (container) {
        const maxX = container.clientWidth - 290;
        const maxY = container.clientHeight - 360;
        if (posX > maxX) posX = Math.max(10, posX - 280);
        if (posY > maxY) posY = Math.max(10, posY - 320);
      }

      setContextMenu({
        x: posX,
        y: posY,
        lat,
        lng,
        guess: initialGuess,
      });

      // Asynchronicznie próbujemy pobrać pełną nazwę z geokodowania online
      // Nazwy przybliżone lokalnie; współrzędne użytkownika nie opuszczają aplikacji.
    });

    // Zamknięcie menu kontekstowego przy standardowym kliknięciu lub przesunięciu mapy
    map.on('click', () => setContextMenu(null));
    map.on('movestart', () => setContextMenu(null));

    // Wielostopniowe invalidateSize
    const t0 = setTimeout(() => map.invalidateSize({ animate: false }), 20);
    const t1 = setTimeout(() => map.invalidateSize({ animate: false }), 150);
    const t2 = setTimeout(() => map.invalidateSize({ animate: false }), 400);
    const t3 = setTimeout(() => map.invalidateSize({ animate: false }), 800);

    const handleWindowResize = () => {
      map.invalidateSize({ animate: false });
    };
    window.addEventListener('resize', handleWindowResize);

    // Klawisz Escape zamyka menu kontekstowe
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setShowAddMenu(false);
        setShowLayerMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ animate: false });
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Zmiana warstwy kafelków
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const activeProvider = tileProvider in TILE_SERVERS ? tileProvider : 'dark';
    const config = offlineMode ? { url: 'prezent-tiles://local/{z}/{x}/{y}', attribution: 'Lokalny pakiet MBTiles — licencja dostawcy pakietu', maxZoom: 22, subdomains: '' } : TILE_SERVERS[activeProvider];

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc',
    }).addTo(mapInstanceRef.current);

    newLayer.bringToBack();
    tileLayerRef.current = newLayer;

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize({ animate: false });
    }, 50);
  }, [tileProvider, offlineMode]);

  // Filtrowanie zdjęć
  const visiblePhotos = useMemo(() => photos.filter(photo => {
    if (selectedTripId) {
      if (!albums.some(album => album.id === photo.albumId && album.tripId === selectedTripId)) return false;
    }
    if (activeCountryFilter !== 'ALL' && photo.location.countryCode !== activeCountryFilter) {
      return false;
    }
    return true;
  }), [photos, selectedTripId, activeCountryFilter, albums]);

  // Renderowanie pinezek ze zdjęciami oraz tras podróży
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    const locationGroups: Record<string, TravelPhoto[]> = {};
    visiblePhotos.forEach(p => {
      const key = `${p.location.lat.toFixed(2)}_${p.location.lng.toFixed(2)}`;
      if (!locationGroups[key]) locationGroups[key] = [];
      locationGroups[key].push(p);
    });

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    Object.values(locationGroups).forEach(group => {
      const rep = group[0];
      const count = group.length;
      bounds.extend([rep.location.lat, rep.location.lng]);

      const badgeBg = count > 10 ? '#7c3aed' : count > 2 ? '#2563eb' : '#059669';

      const safeImageUrl = /^(https?:\/\/|data:image\/(png|jpeg|gif|webp);base64,)/.test(rep.thumbnailUrl || rep.url) ? rep.thumbnailUrl || rep.url : '';
      const escapeAttribute = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;');
      const iconHtml = `
        <div style="position: relative; width: 56px; height: 64px; cursor: pointer; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.7)); transition: transform 0.2s ease;">
          <div style="width: 50px; height: 50px; border-radius: 9999px; overflow: hidden; border: 3px solid #ffffff; background: #0b1120; box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);">
            <img src="${escapeAttribute(safeImageUrl)}" alt="${escapeAttribute(rep.title)}" style="width: 50px !important; height: 50px !important; max-width: none !important; object-fit: cover; display: block;" />
          </div>
          ${count > 1 ? `
            <div style="position: absolute; top: -3px; right: -3px; background: ${badgeBg}; color: #ffffff; font-size: 11px; font-weight: 900; border-radius: 9999px; min-width: 22px; height: 22px; padding: 0 5px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.8); font-family: monospace;">
              ${count}
            </div>
          ` : ''}
          <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.8); margin-top: 3px;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-cluster-pin',
        html: iconHtml,
        iconSize: [56, 64],
        iconAnchor: [28, 60],
        popupAnchor: [0, -56],
      });

      const marker = L.marker([rep.location.lat, rep.location.lng], { icon: customIcon });

      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-3 text-slate-100 max-w-xs';

      // Podgląd zdjęcia
      const imgContainer = document.createElement('div');
      imgContainer.className = 'rounded-xl overflow-hidden mb-2 relative shadow-lg bg-slate-950';

      const img = document.createElement('img');
      img.src = rep.url;
      img.alt = rep.title || 'Wspomnienie';
      img.className = 'w-full h-36 object-cover';
      imgContainer.appendChild(img);

      const badge = document.createElement('div');
      badge.className = 'absolute top-2 right-2 bg-slate-950/85 backdrop-blur text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30';
      badge.textContent = `${rep.location.cityName || 'Lokalizacja'}, ${rep.location.countryName || 'Świat'}`;
      imgContainer.appendChild(badge);
      popupHtml.appendChild(imgContainer);

      // Tytuł wspomnienia
      const titleEl = document.createElement('h4');
      titleEl.className = 'font-bold text-sm text-white leading-tight mb-1';
      titleEl.textContent = rep.title;
      popupHtml.appendChild(titleEl);

      // Opis / Notatka
      if (rep.notes) {
        const notesEl = document.createElement('p');
        notesEl.className = 'text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed';
        notesEl.textContent = rep.notes;
        popupHtml.appendChild(notesEl);
      }

      // Metadane: data i uczestnicy
      const metaRow = document.createElement('div');
      metaRow.className = 'flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400';

      const dateSpan = document.createElement('span');
      dateSpan.textContent = `📅 ${rep.date || 'Nieznana data'}`;
      metaRow.appendChild(dateSpan);

      const partSpan = document.createElement('span');
      partSpan.textContent = `👥 ${(rep.participants || []).slice(0, 2).join(', ') || 'Rodzina'}`;
      metaRow.appendChild(partSpan);

      popupHtml.appendChild(metaRow);

      // Przycisk otwarcia szczegółów
      const btn = document.createElement('button');
      btn.className = 'w-full mt-3 py-1.5 px-3 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-md cursor-pointer';

      const btnSpan = document.createElement('span');
      btnSpan.textContent = 'Otwórz wspomnienie';
      btn.appendChild(btnSpan);
      btn.onclick = () => onSelectPhoto(rep);

      popupHtml.appendChild(btn);
      marker.bindPopup(popupHtml, { minWidth: 260, maxWidth: 300 });
      markersLayerRef.current?.addLayer(marker);
    });

    if (showAnimatedRoutes) {
      trips.forEach(trip => {
        if (selectedTripId && trip.id !== selectedTripId) return;
        if (trip.routePoints && trip.routePoints.length > 1) {
          const latLngs = trip.routePoints.map(pt => [pt.lat, pt.lng] as [number, number]);

          const polyline = L.polyline(latLngs, {
            color: trip.color || '#f59e0b',
            weight: 4,
            opacity: 0.95,
            dashArray: '8, 8',
          });

          const tripLabel = document.createElement('span');
          tripLabel.textContent = `📍 ${trip.title} (${trip.totalDistanceKm ?? 'Brak danych'} km)`;
          polyline.bindTooltip(tripLabel, {
            sticky: true,
            className: 'bg-slate-900 text-white text-xs border border-slate-700 px-2 py-1 rounded-lg',
          });

          routesLayerRef.current?.addLayer(polyline);

          trip.routePoints.forEach((pt, idx) => {
            const stepIcon = L.divIcon({
              className: 'step-pin',
              html: `
                <div style="width: 24px; height: 24px; border-radius: 9999px; background: #0f172a; border: 2px solid #f59e0b; color: #f59e0b; font-size: 10px; font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
                  ${idx + 1}
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const stepMarker = L.marker([pt.lat, pt.lng], { icon: stepIcon });
            const pointLabel = document.createElement('span');
            pointLabel.textContent = `${idx + 1}. ${pt.name}`;
            stepMarker.bindTooltip(pointLabel, { direction: 'top' });
            routesLayerRef.current?.addLayer(stepMarker);
          });
        }
      });
    }

    if (bounds.isValid() && visiblePhotos.length > 0 && autoCenterOnPhotos && selectedTripId) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 });
    }
  }, [visiblePhotos, selectedTripId, showAnimatedRoutes, trips, autoCenterOnPhotos]);

  // Wyszukiwanie z animowanym flyTo
  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim() || !mapInstanceRef.current) return;
    const q = mapSearchQuery.toLowerCase().trim();

    const matchedPhoto = photos.find(p => 
      p.location.cityName.toLowerCase().includes(q) || 
      p.location.countryName.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    );

    if (matchedPhoto) {
      setSearchFeedback(null);
      mapInstanceRef.current.flyTo([matchedPhoto.location.lat, matchedPhoto.location.lng], 8, {
        duration: 1.5,
      });
    } else {
      setSearchFeedback(`Nie znaleziono w bibliotece zdjęć z: "${mapSearchQuery}".`);
      setTimeout(() => setSearchFeedback(null), 3500);
    }
  };

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetToWorld = () => {
    mapInstanceRef.current?.flyTo([30.0, 15.0], 3, { duration: 1.2 });
    setActiveCountryFilter('ALL');
  };

  const centerOnPhotos = () => {
    if (!mapInstanceRef.current || visiblePhotos.length === 0) return;
    const bounds = L.latLngBounds(visiblePhotos.map(p => [p.location.lat, p.location.lng]));
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  };

  // Obsługa przeciągania plików nad mapą (Drag & Drop)
  const handleDragOverMap = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverMap(true);
    if (mapContainerRef.current && mapInstanceRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const latLng = mapInstanceRef.current.containerPointToLatLng(L.point(x, y));
      setDragHoverCoords({ lat: latLng.lat, lng: latLng.lng });
    }
  };

  const handleDragLeaveMap = () => {
    setIsDragOverMap(false);
    setDragHoverCoords(null);
  };

  const handleDropOnMap = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverMap(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && mapContainerRef.current && mapInstanceRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const latLng = mapInstanceRef.current.containerPointToLatLng(L.point(x, y));
      const guess = guessNearestLocation(latLng.lat, latLng.lng);

      if (onDropPhotosOnMap) {
        onDropPhotosOnMap(Array.from(e.dataTransfer.files), latLng.lat, latLng.lng);
      } else if (onOpenImport) {
        onOpenImport({
          lat: latLng.lat,
          lng: latLng.lng,
          cityName: guess.cityName,
          countryName: guess.countryName,
          countryCode: guess.countryCode,
        }, 'files');
      }
    }
    setDragHoverCoords(null);
  };

  return (
    <div 
      className="relative w-full h-full min-h-[500px] flex-1 bg-[#080d1a] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl flex flex-col"
      onDragOver={handleDragOverMap}
      onDragLeave={handleDragLeaveMap}
      onDrop={handleDropOnMap}
    >
      {/* Kontener Leaflet na pełną wysokość i szerokość */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full flex-1 z-0" 
        style={{ width: '100%', height: '100%', minHeight: '480px' }} 
      />

      {/* Nakładka wizualna Drag & Drop nad mapą */}
      {isDragOverMap && (
        <div className="absolute inset-0 z-40 bg-amber-500/10 backdrop-blur-[2px] border-4 border-dashed border-amber-400/80 rounded-2xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in">
          <div className="bg-slate-950/90 border border-amber-500/60 p-5 rounded-3xl shadow-2xl text-center space-y-2 max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <div className="text-white font-bold text-sm">
              Upuść zdjęcia tutaj na mapie
            </div>
            <p className="text-slate-300 text-xs font-mono">
              {dragHoverCoords ? formatCoordinates(dragHoverCoords.lat, dragHoverCoords.lng) : 'Współrzędne pod kursorem'}
            </p>
            <p className="text-slate-400 text-[11px]">
              Zdjęcia bez GPS otrzymają automatycznie ten punkt na mapie świata!
            </p>
          </div>
        </div>
      )}

      {/* Pływający pasek wyszukiwania oraz przycisk dodawania w lewym górnym rogu */}
      <div className="absolute top-3 left-3 z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md w-full pr-14 sm:pr-0">
        <form onSubmit={handleMapSearch} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={mapSearchQuery}
            onChange={e => setMapSearchQuery(e.target.value)}
            placeholder="Szukaj na mapie: Rzym, Santorini, Tatry..."
            className="w-full bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xl"
          />
        </form>

        {/* Przycisk DODAJ ZDJĘCIA / KATALOG na mapie */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xl transition-all cursor-pointer whitespace-nowrap"
            title="Dodaj zdjęcia, cały folder lub kolekcję"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Dodaj zdjęcia / katalog</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu rozwijane dodawania zdjęć */}
          {showAddMenu && (
            <div 
              onMouseLeave={() => setShowAddMenu(false)}
              className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-64 bg-[#0c111e]/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1 text-xs text-slate-200 z-50 animate-in fade-in"
            >
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Opcje dodawania do mapy:
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenImport?.(undefined, 'files');
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-white">Wybierz pliki ze zdjęciami</div>
                  <div className="text-[10px] text-slate-400">JPG, PNG, WebP z odczytem EXIF</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenImport?.(undefined, 'folder');
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">Wybierz cały katalog / folder</div>
                  <div className="text-[10px] text-slate-400">Wraz ze strukturą podkatalogów</div>
                </div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setShowAddMenu(false);
                  try {
                    const res = await readImageFromClipboard();
                    if (res) {
                      onDropPhotosOnMap?.([res.file], 54.352, 18.6466);
                      onShowToast?.('Pomyślnie dodano obraz ze schowka systemowego!', 'success');
                    } else {
                      onOpenImport?.(undefined, 'clipboard');
                    }
                  } catch {
                    onOpenImport?.(undefined, 'clipboard');
                  }
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Clipboard className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-semibold text-white">Wklej ze schowka (Ctrl+V)</div>
                  <div className="text-[10px] text-slate-400">Zrzut ekranu lub obrazek</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  onOpenImport?.(undefined, 'packs');
                }}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-white">Gotowe pakiety podróżnicze</div>
                  <div className="text-[10px] text-slate-400">Tatry, Bałtyk, Rzym, Paryż, Dalmacja</div>
                </div>
              </button>

              <div className="p-2 border-t border-slate-800 mt-1 text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-500/10 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Wskazówka:</strong> Kliknij prawym przyciskiem myszy w wybranym miejscu na mapie, aby dodać zdjęcia dokładnie w tym punkcie!
                </span>
              </div>
            </div>
          )}
        </div>

        {searchFeedback && (
          <div className="mt-1.5 px-3 py-1.5 bg-red-950/90 border border-red-500/40 text-red-200 text-xs rounded-xl shadow-lg backdrop-blur-md animate-in fade-in">
            {searchFeedback}
          </div>
        )}
      </div>

      {/* Pływający pasek bezpośredniego wyboru stylu mapy */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 hidden lg:flex items-center gap-1 bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-2xl shadow-2xl">
        {MAP_STYLES.map(style => {
          const Icon = style.icon;
          const isActive = tileProvider === style.id || (style.id === 'voyager' && tileProvider === 'osm');
          return (
            <button
              key={style.id}
              onClick={() => onChangeTileProvider(style.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
              title={`${style.label} (${style.sub})`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{style.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pływające kontrolki mapy po prawej stronie */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-2">
        {/* Grupa Zoom: Plus / Minus */}
        <div className="bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <button
            onClick={zoomIn}
            className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-700/70 transition-colors cursor-pointer"
            title="Przybliż (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Oddal (—)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Warstwy mapy - rozwijane menu */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-9 h-9 rounded-2xl bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-amber-400 flex items-center justify-center shadow-2xl transition-all cursor-pointer"
            title="Wybierz styl mapy"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div
              onMouseLeave={() => setShowLayerMenu(false)}
              className="absolute right-11 top-0 bg-[#0c101c] border border-slate-700 rounded-2xl shadow-2xl p-2 w-52 space-y-1 text-xs text-slate-200 z-50 animate-in fade-in"
            >
              <div className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase tracking-wider">Styl i podkład mapy:</div>
              {MAP_STYLES.map(style => {
                const Icon = style.icon;
                const isActive = tileProvider === style.id || (style.id === 'voyager' && tileProvider === 'osm');
                return (
                  <button
                    key={style.id}
                    onClick={() => {
                      onChangeTileProvider(style.id);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-left transition-colors flex items-center justify-between cursor-pointer ${
                      isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <div>
                        <div>{style.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{style.sub}</div>
                      </div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset do widoku świata */}
        <button
          onClick={resetToWorld}
          className="w-9 h-9 rounded-2xl bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer"
          title="Widok na cały świat"
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* Centrowanie na zdjęciach */}
        <button
          onClick={centerOnPhotos}
          className="w-9 h-9 rounded-2xl bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-emerald-400 flex items-center justify-center shadow-2xl transition-all cursor-pointer"
          title="Wycentruj na Twoich zdjęciach"
        >
          <Locate className="w-4 h-4" />
        </button>

        {/* Pokaz slajdów */}
        <button
          onClick={() => onStartSlideshow(visiblePhotos)}
          className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer font-bold"
          title="Uruchom pokaz slajdów z widocznych zdjęć"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>

      {/* MENU KONTEKSTOWE PRAWEGO PRZYCISKU MYSZY (Right Click Context Menu) */}
      {contextMenu && (
        <div
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          className="absolute z-50 w-72 bg-[#0b101d]/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl p-2 space-y-1 text-xs text-slate-200 animate-in fade-in zoom-in-95 select-none"
        >
          {/* Nagłówek lokalizacji */}
          <div className="p-2 border-b border-slate-800/80 mb-1 bg-slate-950/60 rounded-xl">
            <div className="flex items-center justify-between text-amber-400 font-bold">
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {contextMenu.guess.cityName}
              </span>
              <button
                type="button"
                onClick={() => setContextMenu(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>{formatCoordinates(contextMenu.lat, contextMenu.lng)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const coordStr = `${contextMenu.lat.toFixed(5)}, ${contextMenu.lng.toFixed(5)}`;
                  if (navigator.clipboard) navigator.clipboard.writeText(coordStr).catch(() => {});
                  onShowToast?.(`Skopiowano współrzędne: ${coordStr}`, 'success');
                  setContextMenu(null);
                }}
                className="text-amber-400 hover:text-amber-300 p-0.5 rounded cursor-pointer"
                title="Kopiuj współrzędne"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Opcja 1: Dodaj zdjęcia w tym punkcie */}
          <button
            type="button"
            onClick={() => {
              onOpenImport?.({
                lat: contextMenu.lat,
                lng: contextMenu.lng,
                cityName: contextMenu.guess.cityName,
                countryName: contextMenu.guess.countryName,
                countryCode: contextMenu.guess.countryCode,
              }, 'files');
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-amber-500 hover:text-slate-950 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <Upload className="w-4 h-4 text-amber-400 group-hover:text-slate-950" />
            <div>
              <div className="leading-tight">Dodaj zdjęcia w tym miejscu</div>
              <div className="text-[10px] opacity-75 font-normal">Wybierz pliki ze zdjęciami z komputera</div>
            </div>
          </button>

          {/* Opcja 2: Dodaj cały katalog / folder w tym miejscu */}
          <button
            type="button"
            onClick={() => {
              onOpenImport?.({
                lat: contextMenu.lat,
                lng: contextMenu.lng,
                cityName: contextMenu.guess.cityName,
                countryName: contextMenu.guess.countryName,
                countryCode: contextMenu.guess.countryCode,
              }, 'folder');
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-amber-500 hover:text-slate-950 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <FolderPlus className="w-4 h-4 text-emerald-400 group-hover:text-slate-950" />
            <div>
              <div className="leading-tight">Dodaj cały katalog / folder tutaj</div>
              <div className="text-[10px] opacity-75 font-normal">Zaimportuj wszystkie pliki z podkatalogami</div>
            </div>
          </button>

          {/* Opcja 3: Wklej ze schowka (Ctrl+V) */}
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await readImageFromClipboard();
                if (res) {
                  onDropPhotosOnMap?.([res.file], contextMenu.lat, contextMenu.lng);
                  onShowToast?.('Pomyślnie dodano obraz ze schowka w wybranym punkcie!', 'success');
                } else {
                  onOpenImport?.({
                    lat: contextMenu.lat,
                    lng: contextMenu.lng,
                    cityName: contextMenu.guess.cityName,
                    countryName: contextMenu.guess.countryName,
                    countryCode: contextMenu.guess.countryCode,
                  }, 'clipboard');
                }
              } catch {
                onOpenImport?.({
                  lat: contextMenu.lat,
                  lng: contextMenu.lng,
                  cityName: contextMenu.guess.cityName,
                  countryName: contextMenu.guess.countryName,
                  countryCode: contextMenu.guess.countryCode,
                }, 'clipboard');
              }
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-amber-500 hover:text-slate-950 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <Clipboard className="w-4 h-4 text-indigo-400 group-hover:text-slate-950" />
            <div>
              <div className="leading-tight">Wklej ze schowka (Ctrl+V)</div>
              <div className="text-[10px] opacity-75 font-normal">Zrzut ekranu lub skopiowana grafika</div>
            </div>
          </button>

          {/* Opcja 4: Gotowa paczka podróżnicza */}
          <button
            type="button"
            onClick={() => {
              onOpenImport?.({
                lat: contextMenu.lat,
                lng: contextMenu.lng,
                cityName: contextMenu.guess.cityName,
                countryName: contextMenu.guess.countryName,
                countryCode: contextMenu.guess.countryCode,
              }, 'packs');
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-amber-500 hover:text-slate-950 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <Package className="w-4 h-4 text-cyan-400 group-hover:text-slate-950" />
            <div>
              <div className="leading-tight">Dodaj gotową paczkę podróżniczą</div>
              <div className="text-[10px] opacity-75 font-normal">Tatry, Bałtyk, Rzym, Paryż, Chorwacja</div>
            </div>
          </button>

          {/* Opcja 5: Link URL */}
          <button
            type="button"
            onClick={() => {
              onOpenImport?.({
                lat: contextMenu.lat,
                lng: contextMenu.lng,
                cityName: contextMenu.guess.cityName,
                countryName: contextMenu.guess.countryName,
                countryCode: contextMenu.guess.countryCode,
              }, 'url');
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-amber-500 hover:text-slate-950 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <Link className="w-4 h-4 text-violet-400 group-hover:text-slate-950" />
            <div>
              <div className="leading-tight">Dodaj z linku URL...</div>
              <div className="text-[10px] opacity-75 font-normal">Zdjęcie z sieci lub serwera domowego</div>
            </div>
          </button>

          <div className="border-t border-slate-800/80 my-1 pt-1">
            {/* Opcja 6: Przybliż i wycentruj tutaj */}
            <button
              type="button"
              onClick={() => {
                mapInstanceRef.current?.flyTo([contextMenu.lat, contextMenu.lng], 10, { duration: 1.2 });
                setContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Locate className="w-3.5 h-3.5 text-amber-400" />
              <span>Przybliż i wyśrodkuj na tym punkcie</span>
            </button>
          </div>
        </div>
      )}

      {/* Pływający dolny pasek podsumowania mapy z podpowiedzią prawego przycisku */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-2xl shadow-2xl text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-medium">Widok mapy:</span>
        <span className="font-bold text-white">{visiblePhotos.length} wspomnień</span>
        <span className="text-slate-500 hidden sm:inline">|</span>
        <span className="text-slate-400 truncate max-w-[150px] sm:max-w-none hidden sm:inline">
          {selectedTripId ? trips.find(t => t.id === selectedTripId)?.title : 'Wszystkie wyprawy'}
        </span>
        <span className="text-slate-500 hidden md:inline">|</span>
        <span className="text-amber-400/90 text-[11px] hidden md:inline-flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3" /> Kliknij PPM na mapie, aby dodać zdjęcia lub katalog w danym punkcie
        </span>
      </div>
    </div>
  );
};
