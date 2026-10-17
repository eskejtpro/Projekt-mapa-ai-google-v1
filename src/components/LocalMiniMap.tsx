import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
export function LocalMiniMap({ lat, lng }: { lat: number; lng: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    void window.electronAPI?.systemInfo().then(info => { if (active) setAvailable(info.offlineMapAvailable); }).catch(() => { if (active) setAvailable(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!available || !container.current) return;
    const map = L.map(container.current, { center: [lat, lng], zoom: 5, zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false });
    L.tileLayer('prezent-tiles://local/{z}/{x}/{y}', { maxZoom: 22 }).addTo(map);
    L.circleMarker([lat, lng], { radius: 5, color: '#f59e0b' }).addTo(map);
    return () => { map.remove(); };
  }, [available, lat, lng]);
  return available ? <div ref={container} className="w-full h-full" aria-label="Lokalna minimapa" /> : <div className="w-full h-full flex items-center justify-center text-center text-xs text-slate-300 p-3">{lat.toFixed(4)}, {lng.toFixed(4)}<br />Wczytaj MBTiles, aby zobaczyć mapę.</div>;
}
