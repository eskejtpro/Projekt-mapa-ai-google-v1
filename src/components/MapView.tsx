import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TravelPhoto, TravelTrip, MapTileProvider } from '../types/travel';
import { 
  Layers, 
  Navigation, 
  Compass, 
  Play, 
  MapPin, 
  Plus, 
  Minus, 
  Maximize2, 
  Locate, 
  Search,
  Globe,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface MapViewProps {
  photos: TravelPhoto[];
  trips: TravelTrip[];
  selectedTripId: string | null;
  onSelectPhoto: (photo: TravelPhoto) => void;
  onStartSlideshow: (filteredPhotos?: TravelPhoto[]) => void;
  tileProvider: MapTileProvider;
  onChangeTileProvider: (provider: MapTileProvider) => void;
  showAnimatedRoutes?: boolean;
}

const TILE_SERVERS: Record<MapTileProvider, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 18,
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
};

export const MapView: React.FC<MapViewProps> = ({
  photos,
  trips,
  selectedTripId,
  onSelectPhoto,
  onStartSlideshow,
  tileProvider,
  onChangeTileProvider,
  showAnimatedRoutes = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [activeCountryFilter, setActiveCountryFilter] = useState<string>('ALL');

  // Inicjalizacja instancji Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [34.0, 15.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
    });

    const initialConfig = TILE_SERVERS[tileProvider];
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const markersLayer = L.layerGroup().addTo(map);
    const routesLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    routesLayerRef.current = routesLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Zmiana warstwy kafelków
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = TILE_SERVERS[tileProvider];
    tileLayerRef.current.setUrl(config.url);
  }, [tileProvider]);

  // Filtrowanie zdjęć
  const visiblePhotos = photos.filter(photo => {
    if (selectedTripId) {
      if (selectedTripId === 'trip-italy-2024' && photo.location.countryCode !== 'IT') return false;
      if (selectedTripId === 'trip-greece-2023' && photo.location.countryCode !== 'GR') return false;
      if (selectedTripId === 'trip-poland-tatry' && photo.location.countryCode !== 'PL') return false;
      if (selectedTripId === 'trip-japan-spring' && photo.location.countryCode !== 'JP') return false;
      if (selectedTripId === 'trip-norway-fjords' && photo.location.countryCode !== 'NO') return false;
    }
    if (activeCountryFilter !== 'ALL' && photo.location.countryCode !== activeCountryFilter) {
      return false;
    }
    return true;
  });

  // Renderowanie pinezek i tras (wzorowane na załączonym Zrzucie 3)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    // Grupowanie geograficzne według punktów
    const locationGroups: Record<string, TravelPhoto[]> = {};
    visiblePhotos.forEach(p => {
      const key = `${p.location.lat.toFixed(2)}_${p.location.lng.toFixed(2)}`;
      if (!locationGroups[key]) locationGroups[key] = [];
      locationGroups[key].push(p);
    });

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    // Dodawanie okrągłych pinezek klastrów jak na Obrazie 3 (z fioletowo-niebieskim badge)
    Object.values(locationGroups).forEach(group => {
      const rep = group[0];
      const count = group.length;
      bounds.extend([rep.location.lat, rep.location.lng]);

      // Plakietka z liczbą zdjęć (dokładnie jak w załączonym zrzucie 3: np. 40, 8, 4)
      const badgeColor = count > 20 ? 'bg-purple-600' : count > 5 ? 'bg-indigo-600' : 'bg-cyan-600';

      const iconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-300 hover:scale-125 hover:z-50">
          <div class="w-13 h-13 rounded-full overflow-hidden border-2 border-white/80 shadow-[0_0_20px_rgba(168,85,247,0.5)] bg-slate-950 flex items-center justify-center relative">
            <img src="${rep.thumbnailUrl || rep.url}" alt="${rep.title}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
          ${count > 1 ? `
            <div class="absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-[11px] font-black rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center border border-white/60 shadow-lg font-mono">
              ${count}
            </div>
          ` : ''}
          <div class="w-2.5 h-2.5 rounded-full bg-white shadow-md mx-auto -mt-1 border border-slate-900"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-cluster-pin',
        html: iconHtml,
        iconSize: [52, 60],
        iconAnchor: [26, 56],
        popupAnchor: [0, -50],
      });

      const marker = L.marker([rep.location.lat, rep.location.lng], { icon: customIcon });

      // Popup
      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-3 text-slate-100 max-w-xs';
      popupHtml.innerHTML = `
        <div class="rounded-xl overflow-hidden mb-2 relative shadow-lg">
          <img src="${rep.url}" alt="${rep.title}" class="w-full h-36 object-cover" />
          <div class="absolute top-2 right-2 bg-slate-950/85 backdrop-blur text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
            ${rep.location.cityName}, ${rep.location.countryName}
          </div>
        </div>
        <h4 class="font-bold text-sm text-white leading-tight mb-1">${rep.title}</h4>
        <p class="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">${rep.notes}</p>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>📅 ${rep.date}</span>
          <span>👥 ${rep.participants.slice(0, 2).join(', ')}</span>
        </div>
      `;

      const btn = document.createElement('button');
      btn.className = 'w-full mt-3 py-1.5 px-3 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-md cursor-pointer';
      btn.innerHTML = `<span>Otwórz wspomnienie</span>`;
      btn.onclick = () => onSelectPhoto(rep);

      popupHtml.appendChild(btn);
      marker.bindPopup(popupHtml, { minWidth: 260, maxWidth: 300 });
      markersLayerRef.current?.addLayer(marker);
    });

    // Rysowanie tras
    if (showAnimatedRoutes) {
      trips.forEach(trip => {
        if (selectedTripId && trip.id !== selectedTripId) return;
        if (trip.routePoints && trip.routePoints.length > 1) {
          const latLngs = trip.routePoints.map(pt => [pt.lat, pt.lng] as [number, number]);

          const polyline = L.polyline(latLngs, {
            color: trip.color || '#f59e0b',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '8, 8',
          });

          polyline.bindTooltip(`📍 ${trip.title} (~${trip.totalDistanceKm || 500} km)`, {
            sticky: true,
            className: 'bg-slate-900 text-white text-xs border border-slate-700 px-2 py-1 rounded-lg',
          });

          routesLayerRef.current?.addLayer(polyline);

          trip.routePoints.forEach((pt, idx) => {
            const stepIcon = L.divIcon({
              className: 'step-pin',
              html: `
                <div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-400 text-[10px] font-black flex items-center justify-center shadow-lg">
                  ${idx + 1}
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const stepMarker = L.marker([pt.lat, pt.lng], { icon: stepIcon });
            stepMarker.bindTooltip(`${idx + 1}. ${pt.name}`, { direction: 'top' });
            routesLayerRef.current?.addLayer(stepMarker);
          });
        }
      });
    }

    if (bounds.isValid() && visiblePhotos.length > 0 && selectedTripId) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 });
    }
  }, [visiblePhotos, selectedTripId, showAnimatedRoutes, trips]);

  // Wyszukiwanie na mapie (Animowane flyTo)
  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim() || !mapInstanceRef.current) return;
    const q = mapSearchQuery.toLowerCase();

    const matchedPhoto = photos.find(p => 
      p.location.cityName.toLowerCase().includes(q) || 
      p.location.countryName.toLowerCase().includes(q)
    );

    if (matchedPhoto) {
      mapInstanceRef.current.flyTo([matchedPhoto.location.lat, matchedPhoto.location.lng], 8, {
        duration: 1.5,
      });
    } else {
      alert(`Nie znaleziono w bazie zdjęć z miejsca: "${mapSearchQuery}".`);
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

  return (
    <div className="relative w-full h-full min-h-[520px] flex-1 bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      {/* Kontener Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Pływający pasek wyszukiwania w lewym górnym rogu (jak na Obrazie 3) */}
      <div className="absolute top-4 left-4 z-10 max-w-sm w-full">
        <form onSubmit={handleMapSearch} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={mapSearchQuery}
            onChange={e => setMapSearchQuery(e.target.value)}
            placeholder="Szukaj na mapie: Rzym, Santorini, Zakopane..."
            className="w-full bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xl"
          />
        </form>
      </div>

      {/* Pływające kontrolki mapy po prawej stronie (dokładnie jak w Zrzucie 3) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-2">
        {/* Grupa Zoom: Plus / Minus */}
        <div className="bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <button
            onClick={zoomIn}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 border-b border-slate-700/70 transition-colors cursor-pointer"
            title="Przybliż (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Oddal (—)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Warstwy mapy */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-10 h-10 rounded-2xl bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-amber-400 flex items-center justify-center shadow-2xl transition-all cursor-pointer"
            title="Zmień styl mapy"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div
              onMouseLeave={() => setShowLayerMenu(false)}
              className="absolute right-12 top-0 bg-[#0c101c] border border-slate-700 rounded-2xl shadow-2xl p-2 w-44 space-y-1 text-xs text-slate-200 z-50 animate-in fade-in"
            >
              <button
                onClick={() => { onChangeTileProvider('dark'); setShowLayerMenu(false); }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                  tileProvider === 'dark' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800'
                }`}
              >
                CartoDB Noc (Dark)
              </button>
              <button
                onClick={() => { onChangeTileProvider('satellite'); setShowLayerMenu(false); }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                  tileProvider === 'satellite' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800'
                }`}
              >
                Esri Satelita
              </button>
              <button
                onClick={() => { onChangeTileProvider('light'); setShowLayerMenu(false); }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                  tileProvider === 'light' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800'
                }`}
              >
                CartoDB Dzień (Light)
              </button>
              <button
                onClick={() => { onChangeTileProvider('osm'); setShowLayerMenu(false); }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                  tileProvider === 'osm' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800'
                }`}
              >
                OpenStreetMap
              </button>
            </div>
          )}
        </div>

        {/* Reset do kuli ziemskiej */}
        <button
          onClick={resetToWorld}
          className="w-10 h-10 rounded-2xl bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer"
          title="Widok na cały świat"
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* Centrowanie na zdjęciach */}
        <button
          onClick={centerOnPhotos}
          className="w-10 h-10 rounded-2xl bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-emerald-400 flex items-center justify-center shadow-2xl transition-all cursor-pointer"
          title="Wycentruj na Twoich zdjęciach"
        >
          <Locate className="w-4 h-4" />
        </button>

        {/* Pokaz slajdów */}
        <button
          onClick={() => onStartSlideshow(visiblePhotos)}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 cursor-pointer font-bold"
          title="Uruchom pokaz slajdów z widocznych zdjęć"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>

      {/* Pływający dolny pasek podsumowania mapy */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-[#0c101c]/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-2xl text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-medium">Widok mapy:</span>
        <span className="font-bold text-white">{visiblePhotos.length} wspomnień</span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">{selectedTripId ? trips.find(t => t.id === selectedTripId)?.title : 'Wszystkie wyprawy'}</span>
      </div>
    </div>
  );
};
