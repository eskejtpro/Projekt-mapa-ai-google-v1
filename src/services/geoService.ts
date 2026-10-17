// Usługa geolokalizacji, odwrotnego geokodowania i obsługi współrzędnych
export interface GeoGuess {
  cityName: string;
  countryName: string;
  countryCode: string;
}

// Popularne lokalizacje do błyskawicznego wyboru w modalu i menu kontekstowym
export const POPULAR_LOCATIONS = [
  { cityName: 'Gdańsk / Trójmiasto', countryName: 'Polska', countryCode: 'PL', lat: 54.3520, lng: 18.6466 },
  { cityName: 'Zakopane / Tatry', countryName: 'Polska', countryCode: 'PL', lat: 49.2992, lng: 19.9496 },
  { cityName: 'Kraków', countryName: 'Polska', countryCode: 'PL', lat: 50.0647, lng: 19.9450 },
  { cityName: 'Warszawa', countryName: 'Polska', countryCode: 'PL', lat: 52.2297, lng: 21.0122 },
  { cityName: 'Wrocław', countryName: 'Polska', countryCode: 'PL', lat: 51.1079, lng: 17.0385 },
  { cityName: 'Mikołajki / Mazury', countryName: 'Polska', countryCode: 'PL', lat: 53.8020, lng: 21.5746 },
  { cityName: 'Rzym', countryName: 'Włochy', countryCode: 'IT', lat: 41.8902, lng: 12.4922 },
  { cityName: 'Wenecja', countryName: 'Włochy', countryCode: 'IT', lat: 45.4408, lng: 12.3155 },
  { cityName: 'Florencja', countryName: 'Włochy', countryCode: 'IT', lat: 43.7696, lng: 11.2558 },
  { cityName: 'Santorini', countryName: 'Grecja', countryCode: 'GR', lat: 36.3932, lng: 25.4615 },
  { cityName: 'Ateny', countryName: 'Grecja', countryCode: 'GR', lat: 37.9838, lng: 23.7275 },
  { cityName: 'Dubrownik', countryName: 'Chorwacja', countryCode: 'HR', lat: 42.6507, lng: 18.0944 },
  { cityName: 'Split', countryName: 'Chorwacja', countryCode: 'HR', lat: 43.5081, lng: 16.4402 },
  { cityName: 'Paryż', countryName: 'Francja', countryCode: 'FR', lat: 48.8566, lng: 2.3522 },
  { cityName: 'Nicea / Lazurowe Wybrzeże', countryName: 'Francja', countryCode: 'FR', lat: 43.7102, lng: 7.2620 },
  { cityName: 'Barcelona', countryName: 'Hiszpania', countryCode: 'ES', lat: 41.3879, lng: 2.1699 },
  { cityName: 'Madryt', countryName: 'Hiszpania', countryCode: 'ES', lat: 40.4168, lng: -3.7038 },
  { cityName: 'Tokio', countryName: 'Japonia', countryCode: 'JP', lat: 35.6762, lng: 139.6503 },
  { cityName: 'Kioto', countryName: 'Japonia', countryCode: 'JP', lat: 35.0116, lng: 135.7681 },
  { cityName: 'Geiranger / Fiordy', countryName: 'Norwegia', countryCode: 'NO', lat: 62.1008, lng: 7.2059 },
  { cityName: 'Oslo', countryName: 'Norwegia', countryCode: 'NO', lat: 59.9139, lng: 10.7522 },
  { cityName: 'Alpy / Zermatt', countryName: 'Szwajcaria', countryCode: 'CH', lat: 45.9765, lng: 7.7491 },
  { cityName: 'Wiedeń', countryName: 'Austria', countryCode: 'AT', lat: 48.2082, lng: 16.3738 },
  { cityName: 'Praga', countryName: 'Czechy', countryCode: 'CZ', lat: 50.0755, lng: 14.4378 },
  { cityName: 'Nowy Jork', countryName: 'USA', countryCode: 'US', lat: 40.7128, lng: -74.0060 },
];

// Formatowanie współrzędnych do czytelnej postaci DMS lub dziesiętnej
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

// Błyskawiczne lokalne odgadywanie najbliższej lokalizacji (działa 100% offline)
export function guessNearestLocation(lat: number, lng: number): GeoGuess {
  let closest = POPULAR_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of POPULAR_LOCATIONS) {
    const dLat = loc.lat - lat;
    const dLng = loc.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  // Jeśli punkt znajduje się w odległości mniejszej niż ok. 1.5 stopnia (~150 km) od znanego miasta
  if (minDistance < 1.5) {
    return {
      cityName: closest.cityName,
      countryName: closest.countryName,
      countryCode: closest.countryCode,
    };
  }

  // Wstępne przypisanie kraju na podstawie bounding boxów kontynentalnych
  if (lat >= 49.0 && lat <= 54.9 && lng >= 14.1 && lng <= 24.1) {
    return { cityName: 'Polska (Wybrany punkt)', countryName: 'Polska', countryCode: 'PL' };
  }
  if (lat >= 36.6 && lat <= 47.1 && lng >= 6.6 && lng <= 18.5) {
    return { cityName: 'Włochy (Wybrany punkt)', countryName: 'Włochy', countryCode: 'IT' };
  }
  if (lat >= 34.8 && lat <= 41.8 && lng >= 19.3 && lng <= 28.3) {
    return { cityName: 'Grecja (Wybrany punkt)', countryName: 'Grecja', countryCode: 'GR' };
  }
  if (lat >= 42.4 && lat <= 46.5 && lng >= 13.5 && lng <= 19.4) {
    return { cityName: 'Chorwacja (Wybrany punkt)', countryName: 'Chorwacja', countryCode: 'HR' };
  }
  if (lat >= 41.3 && lat <= 51.1 && lng >= -5.1 && lng <= 9.6) {
    return { cityName: 'Francja (Wybrany punkt)', countryName: 'Francja', countryCode: 'FR' };
  }
  if (lat >= 36.0 && lat <= 43.8 && lng >= -9.3 && lng <= 3.3) {
    return { cityName: 'Hiszpania (Wybrany punkt)', countryName: 'Hiszpania', countryCode: 'ES' };
  }
  if (lat >= 57.9 && lat <= 71.2 && lng >= 4.5 && lng <= 31.1) {
    return { cityName: 'Norwegia (Wybrany punkt)', countryName: 'Norwegia', countryCode: 'NO' };
  }
  if (lat >= 30.0 && lat <= 45.5 && lng >= 128.0 && lng <= 146.0) {
    return { cityName: 'Japonia (Wybrany punkt)', countryName: 'Japonia', countryCode: 'JP' };
  }

  return {
    cityName: `Współrzędne: ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
    countryName: 'Świat',
    countryCode: 'XX',
  };
}

// Asynchroniczne odpytanie OSM Nominatim z timeoutem i cichym fallbackiem
export async function reverseGeocodeOnline(lat: number, lng: number): Promise<GeoGuess> {
  const offlineGuess = guessNearestLocation(lat, lng);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=pl`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || offlineGuess.cityName;
      const countryName = addr.country || offlineGuess.countryName;
      const countryCode = (addr.country_code || offlineGuess.countryCode || 'XX').toUpperCase();

      return {
        cityName,
        countryName,
        countryCode,
      };
    }
  } catch {
    // W razie braku sieci lub zablokowanego CORS zwracamy lokalne odgadnięcie
  }

  return offlineGuess;
}

// Odczyt obrazka ze schowka systemowego (Clipboard API)
export async function readImageFromClipboard(): Promise<{ file: File; dataUrl: string } | null> {
  if (!navigator.clipboard || !navigator.clipboard.read) {
    throw new Error('Twoja przeglądarka lub system nie zezwala na bezpośredni odczyt schowka. Użyj skrótu Ctrl+V.');
  }

  const items = await navigator.clipboard.read();
  for (const item of items) {
    for (const type of item.types) {
      if (type.startsWith('image/')) {
        const blob = await item.getType(type);
        const file = new File([blob], `schowek_${Date.now()}.${type.split('/')[1] || 'png'}`, { type });
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        return { file, dataUrl };
      }
    }
  }

  return null;
}
