# ARCHITECTURE.md - Architektura Aplikacji „Prezent Mapy”

## Stan po inicjalizacji środowiska Codex
Runtime nadal web/Vite/localStorage; brak procesu main/preload, SQLite i NSIS. src/version.ts czyta wersję package.json. scripts/verify.mjs uruchamia kontrole i zapisuje reports/verification.json. Hooki Codex wykonują lekkie kontrole i snapshoty w reports/; skrypty Git wykonują quality gates. Rejestr aktualnych ograniczeń: docs/KNOWN_ISSUES.md. Diagram desktop poniżej przedstawia projekt docelowy, nie istniejącą implementację.

Aplikacja **„Prezent Mapy”** jest zaprojektowana według wzorca **Separacji Odpowiedzialności (SoC)**, **Offline-First** oraz czystego odseparowania warstwy prezentacji (React) od środowiska uruchomieniowego (Browser Preview vs Docelowy Electron dla Windows 10/11).

```
+-----------------------------------------------------------------------------------+
|                        WARSTWA PREZENTACJI (REACT / UI)                           |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |     MapView        |  |     GalleryView      |  |      SlideshowModal       |  |
|  | (Leaflet + Tiles + |  | (Grid / Albums /     |  | (Ken Burns + PiP MiniMap  |  |
|  |  Context Menu PPM) |  |  Timeline + Filters) |  |  + Web Audio Ambient)     |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |    ImportModal     |  |     SettingsView     |  |        TvModeModal        |  |
|  | (5 trybów importu, |  | (12 kategorii stylu  |  |  (Salon 4K + instrukcje   |  |
|  |  D&D, EXIF GPS)    |  |  Untitled UI)        |  |   Miracast / HDMI)        |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |  DuplicatesView    |  |      StatsView       |  |     WindowsTitleBar       |  |
|  | (Detekcja duplikat)|  | (Paszport podróżny)  |  |  (Fluent UI Chrome & Dock)|  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                           WARSTWA USŁUG I DOMENY (SERVICES)                       |
|                                                                                   |
|  • StorageService: Zarządzanie stanem, limity pamięci, eksport/import .prezent    |
|  • GeoService: Odwrotne geokodowanie heurystyczne, formatowanie współrzędnych      |
|  • AudioAmbientEngine: Proceduralna synteza oceanu via Web Audio API (offline)    |
|  • TravelPacks: Pakiety startowe (Tatry, Włochy, Francja, Chorwacja)              |
|  • exifr: Bezpieczna analiza nagłówków EXIF (GPS, data, aparat fotograficzny)     |
+-----------------------------------------------------------------------------------+
                                         │
                ┌────────────────────────┴────────────────────────┐
                ▼                                                 ▼
+--------------------------------+               +----------------------------------+
|    ŚRODOWISKO BROWSER (TERAZ)  |               |  ŚRODOWISKO ELECTRON (DLA CODEX) |
|   (Podgląd w Google AI Studio) |               |      (Docelowy Windows 10/11)    |
|                                |               |                                  |
| • localStorage (z detekcją     |               | • SQLite (better-sqlite3) dla    |
|   przekroczenia limitu ~5MB)   |               |   setek tysięcy zdjęć            |
| • HTML5 File API & Drag&Drop   |               | • Node.js fs / path dla plików   |
| • window.navigator.clipboard   |               | • electron.dialog (wybór folderu)|
| • Fullscreen API               |               | • IPC Bridge (preload.ts) z      |
| • Zrzut .prezent do pobrania   |               |   contextIsolation: true         |
+--------------------------------+               +----------------------------------+
```

---

## 1. Architektura Danych

### Główne Encje (`src/types/travel.ts`):
1. **TravelPhoto**:
   - `id`: string (unikalny identyfikator)
   - `url`, `thumbnailUrl`: string (w podglądzie base64 / URL; w Electronie `file://` lub protokół niestandardowy `photo://`)
   - `title`: string
   - `date`: string (ISO `YYYY-MM-DD`)
   - `location`: `GeoLocation` (`lat`, `lng`, `cityName`, `countryName`, `countryCode`, `placeName`)
   - `albumId`: string (relacja do albumu)
   - `participants`: string[]
   - `tags`: string[]
   - `isFavorite`: boolean
   - `isDemo`: boolean
   - `fileName`, `fileSize`, `cameraInfo`: metadane techniczne
   - `localFilePath`?: string (ścieżka systemowa – wypełniana wyłącznie przez Electron/IPC, zakaz fikcyjnych ścieżek).

2. **TravelAlbum**:
   - `id`, `name`, `description`, `coverUrl`, `year`, `country`, `startDate`, `endDate`, `isDemo`.

3. **TravelTrip**:
   - `id`, `title`, `description`, `year`, `countryCode`, `routePoints`, `totalDistanceKm`, `color`.

4. **AppSettings**:
   - 12 kategorii preferencji personalizacji, mapy, importu i prezentacji.

---

## 2. Bezpieczeństwo i Zasady Kodowania

1. **Brak wstrzykiwania kodu HTML**: Wszelkie elementy dynamiczne (np. popupy na mapie w `MapView.tsx`) są tworzone za pomocą `document.createElement`, a dane tekstowe przypisywane przez `textContent`. Eliminuje to podatności XSS przy nazwach plików i opisach wspomnień.
2. **Obsługa limitu pamięci przeglądarki**: `StorageService.savePhotos()` i metody pokrewne zwracają status `boolean`. Przy wystąpieniu `QuotaExceededError` aplikacja nie ulega awarii, a użytkownik otrzymuje czytelne powiadomienie z propozycją pobrania kopii `.prezent`.
3. **Izolacja IPC w Electronie**: W kolejnym etapie OpenAI Codex zaimplementuje `preload.ts` z `contextIsolation: true` i `nodeIntegration: false`, udostępniając bezpieczne API `window.electronAPI`.
# Aktualizacja powłoki Windows — 2026-10-17
- RemoteControl: lokalny HTTP na losowym porcie, token 256-bit w fragmencie QR, polecenia POST z bearer, kontrola Host/Origin i prywatnego adresu, limit 10/s, brak endpointu zdjęć. Main przekazuje tylko 4 komendy przez IPC do aktywnego pokazu. Sesja uruchamiana przyciskiem, wygasa po 2 h; zamknięcie okna zamyka serwer. Lokalna minimapa pokazu nie wysyła współrzędnych do sieci.
- TV discovery: ograniczony IPC uruchamia UDP M-SEARCH MediaRenderer w LAN; wynik obejmuje odpowiedzi SSDP z prywatnych IPv4. Renderer odświeża listę co 15 s wyłącznie w otwartym panelu. Brak pobierania XML urządzenia i brak automatycznego przesyłania zdjęć. Casting/remote wymagają kolejnego etapu.
- OfflineMap odczytuje raster MBTiles readOnly i przelicza XYZ na TMS. Natywny dialog wybiera plik, kopia trafia do userData/offline.mbtiles; lokalny protokół obsługuje wyłącznie numeryczne współrzędne. Tryb offline blokuje HTTP(S) sesji Electron. Jeden aktywny pakiet; poprzednie kopie są zachowane. Build NSIS i portable trafia do release, bez publikacji.
- MediaStore zamienia osadzone obrazy na referencje SHA-256 w SQLite i zapisuje pliki w userData/photos. Odczyt weryfikuje hash i odtwarza data URL; kopie JSON pozostają przenośne dla obrazów osadzonych. Referencje HTTPS pozostają sieciowe. Nie usuwamy plików po rollbacku, aby nie ryzykować utraty współdzielonych zdjęć; sprzątanie osieroconych plików jest otwarte.
- Import .prezent używa jednego batch SQLite; Vite zapisuje jeden atomowy snapshot kolekcji w localStorage. Walidacja rekordów poprzedza zapis. Duże obrazy nadal są odtwarzane w pamięci renderera; pomiary pozostają otwarte.

Warstwa persistence wybiera SQLite w Electron i localStorage w Vite. Baza `userData/library.sqlite` używa wbudowanego `node:sqlite`, WAL i FULL; pięć dozwolonych kluczy przechowuje kolekcje JSON. Preload wystawia ograniczone get/set/batch; IPC jest synchroniczne dla zgodności istniejącego StorageService, co wymaga dalszych pomiarów przy dużych zbiorach. batch stosuje BEGIN/COMMIT/ROLLBACK. Migracja najpierw zapisuje kopię w starej pamięci i nie usuwa źródła. Brak dowolnego SQL i ścieżek w rendererze.

`electron/main.cjs` otwiera lokalny build Vite z izolacją kontekstu i sandboxem; `electron/preload.cjs` wystawia wyłącznie trzy akcje okna. Main sprawdza nadawcę, ramkę oraz argument akcji. Renderer nie otrzymuje Node.js. SQLite i obsługa plików pozostają do implementacji. `npm run desktop` buduje i uruchamia aplikację.
