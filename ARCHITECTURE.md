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

`electron/main.cjs` otwiera lokalny build Vite z izolacją kontekstu i sandboxem; `electron/preload.cjs` wystawia wyłącznie trzy akcje okna. Main sprawdza nadawcę, ramkę oraz argument akcji. Renderer nie otrzymuje Node.js. SQLite i obsługa plików pozostają do implementacji. `npm run desktop` buduje i uruchamia aplikację.
