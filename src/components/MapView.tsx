import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TravelPhoto, TravelTrip, MapTileProvider } from '../types/travel';
import { Layers, Navigation, Compass, Eye, Play, Sparkles, MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapViewProps {
  photos: TravelPhoto[];
  trips: TravelTrip[];
  selectedTripId: string | null;
  onSelectPhoto: (photo: TravelPhoto) => void;
  onStartSlideshow: (filteredPhotos?: TravelPhoto[]) => void;
  tileProvider: MapTileProvider;
  onChangeTileProvider: (provider: MapTileProvider) => void;
}

const TILE_SERVERS: Record<MapTileProvider, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
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
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [activeLocationFilter, setActiveLocationFilter] = useState<string>('ALL');

  // Inicjalizacja instancji Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [38.0, 18.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
    });

    // Płytki mapy
    const initialConfig = TILE_SERVERS[tileProvider];
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Warstwy na znaczniki i trasy
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

  // Aktualizacja dostawcy kafelków (Dark, Light, OSM, Satelita)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const config = TILE_SERVERS[tileProvider];
    tileLayerRef.current.setUrl(config.url);
  }, [tileProvider]);

  // Filtrowanie zdjęć na podstawie aktywnej trasy lub kraju
  const visiblePhotos = photos.filter(photo => {
    if (selectedTripId) {
      const trip = trips.find(t => t.id === selectedTripId);
      if (trip) {
        // Sprawdź czy zdjęcie należy do albumu powiązanego z trasą lub pasuje do podróży
        if (selectedTripId === 'trip-italy-2024' && photo.location.countryCode !== 'IT') return false;
        if (selectedTripId === 'trip-greece-2023' && photo.location.countryCode !== 'GR') return false;
        if (selectedTripId === 'trip-poland-tatry' && photo.location.countryCode !== 'PL') return false;
        if (selectedTripId === 'trip-japan-spring' && photo.location.countryCode !== 'JP') return false;
        if (selectedTripId === 'trip-norway-fjords' && photo.location.countryCode !== 'NO') return false;
      }
    }
    if (activeLocationFilter !== 'ALL' && photo.location.countryCode !== activeLocationFilter) {
      return false;
    }
    return true;
  });

  // Renderowanie markerów i tras
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !routesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    // 1. Grupowanie zdjęć według bliskości lokalizacji (miasto / punkt GPS)
    const locationGroups: Record<string, TravelPhoto[]> = {};
    visiblePhotos.forEach(p => {
      const key = `${p.location.lat.toFixed(2)}_${p.location.lng.toFixed(2)}`;
      if (!locationGroups[key]) locationGroups[key] = [];
      locationGroups[key].push(p);
    });

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    // 2. Dodawanie unikalnych, luksusowych znaczników zdjęć
    Object.values(locationGroups).forEach(group => {
      const rep = group[0];
      const count = group.length;
      bounds.extend([rep.location.lat, rep.location.lng]);

      // Niestandardowy znacznik ze zdjęciem w środku
      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-900 transition-all duration-300 group-hover:scale-125 group-hover:border-emerald-400 group-hover:z-50">
            <img src="${rep.thumbnailUrl || rep.url}" alt="${rep.title}" class="w-full h-full object-cover" />
          </div>
          ${count > 1 ? `
            <div class="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900 shadow">
              ${count}
            </div>
          ` : ''}
          <div class="w-2 h-2 bg-amber-400 rounded-full mx-auto mt-1 shadow-md group-hover:bg-emerald-400"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-photo-pin',
        html: iconHtml,
        iconSize: [48, 56],
        iconAnchor: [24, 52],
        popupAnchor: [0, -48],
      });

      const marker = L.marker([rep.location.lat, rep.location.lng], { icon: customIcon });

      // Popup ze wspomnieniem
      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-3 text-slate-100 max-w-xs';
      popupHtml.innerHTML = `
        <div class="rounded-xl overflow-hidden mb-2.5 relative shadow-md">
          <img src="${rep.url}" alt="${rep.title}" class="w-full h-36 object-cover" />
          <div class="absolute top-2 right-2 bg-slate-950/80 backdrop-blur text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
            ${rep.location.cityName}, ${rep.location.countryName}
          </div>
        </div>
        <h4 class="font-bold text-sm text-white leading-tight mb-1">${rep.title}</h4>
        <p class="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">${rep.notes}</p>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>📅 ${rep.date}</span>
          <span>👥 ${rep.participants.slice(0, 2).join(', ')}${rep.participants.length > 2 ? '...' : ''}</span>
        </div>
      `;

      // Przycisk "Otwórz zdjęcie"
      const actionBtn = document.createElement('button');
      actionBtn.className = 'w-full mt-3 py-1.5 px-3 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition-all cursor-pointer shadow-md';
      actionBtn.innerHTML = `<span>Otwórz wspomnienie</span>`;
      actionBtn.onclick = () => onSelectPhoto(rep);

      popupHtml.appendChild(actionBtn);
      marker.bindPopup(popupHtml, { minWidth: 260, maxWidth: 300 });
      markersLayerRef.current?.addLayer(marker);
    });

    // 3. Rysowanie tras podróży
    if (showRoutes) {
      trips.forEach(trip => {
        if (selectedTripId && trip.id !== selectedTripId) return;
        if (trip.routePoints && trip.routePoints.length > 1) {
          const latLngs = trip.routePoints.map(pt => [pt.lat, pt.lng] as [number, number]);

          // Linia trasy
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

          // Punkty etapów trasy
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

    // Dopasuj widok, jeśli są punkty
    if (bounds.isValid() && visiblePhotos.length > 0 && selectedTripId) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
    }
  }, [visiblePhotos, selectedTripId, showRoutes, trips]);

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetWorldView = () => {
    mapInstanceRef.current?.setView([32.0, 15.0], 3);
    setActiveLocationFilter('ALL');
  };

  const countries = Array.from(new Set(photos.map(p => ({
    code: p.location.countryCode,
    name: p.location.countryName,
  }))));

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      {/* Kontener Mapy Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Pływający pasek górny: Podsumowanie & Filtry */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Lewy panel info o mapie */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Atlas Wspomnień Świata</span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {visiblePhotos.length} zdjęć w widoku
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedTripId ? `Podróż: ${trips.find(t => t.id === selectedTripId)?.title}` : 'Prezentacja wszystkich rodzinnych podróży'}
            </p>
          </div>
        </div>

        {/* Prawy panel: Szybkie akcje (Pokaz slajdów, Warstwa, Reset) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-1.5 rounded-2xl shadow-xl">
          {/* Przycisk Pokazu Slajdów */}
          <button
            onClick={() => onStartSlideshow(visiblePhotos)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            title="Rozpocznij kinowy pokaz slajdów z widocznych zdjęć"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Pokaz slajdów</span>
          </button>

          {/* Przełącznik tras */}
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              showRoutes
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Pokaż lub ukryj linie tras podróży"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trasy</span>
          </button>

          {/* Wybór warstwy mapy */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => onChangeTileProvider('dark')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                tileProvider === 'dark' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Noc
            </button>
            <button
              onClick={() => onChangeTileProvider('satellite')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                tileProvider === 'satellite' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satelita
            </button>
            <button
              onClick={() => onChangeTileProvider('osm')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                tileProvider === 'osm' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard
            </button>
          </div>
        </div>
      </div>

      {/* Pływające kontrolki nawigacji (Prawy dolny róg) */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <button
            onClick={zoomIn}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800 cursor-pointer"
            title="Przybliż"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Oddal"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={resetWorldView}
          className="p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl shadow-2xl transition-all cursor-pointer"
          title="Widok na cały glob ziemski"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Szybki pasek wyboru kraju (Lewy dolny róg) */}
      <div className="absolute bottom-6 left-6 z-10 max-w-md hidden md:flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 p-2 rounded-2xl shadow-xl">
        <span className="text-[11px] text-slate-400 font-semibold px-2 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-400" /> Skocz do:
        </span>
        <button
          onClick={() => {
            setActiveLocationFilter('ALL');
            resetWorldView();
          }}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
            activeLocationFilter === 'ALL'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Wszystkie kraje
        </button>
        {countries.map(c => (
          <button
            key={c.code}
            onClick={() => {
              setActiveLocationFilter(c.code);
              const p = photos.find(ph => ph.location.countryCode === c.code);
              if (p && mapInstanceRef.current) {
                mapInstanceRef.current.setView([p.location.lat, p.location.lng], 6);
              }
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
              activeLocationFilter === c.code
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};
