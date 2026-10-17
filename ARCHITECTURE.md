# ARCHITECTURE.md - Architektura Aplikacji „Prezent”

Aplikacja **„Prezent”** została zaprojektowana zgodnie z zasadami **Offline-First**, **Modular Component Design** oraz separacji warstwy interfejsu użytkownika od środowiska uruchomieniowego (Browser vs Electron).

```
+-------------------------------------------------------------------------+
|                              WARSTWA UI                                 |
|                                                                         |
|  +-------------------+  +--------------------+  +--------------------+  |
|  |     MapView       |  |    GalleryView     |  |   SlideshowModal   |  |
|  | (Leaflet + Tiles) |  | (Grid / Timeline)  |  | (Ken Burns + PiP)  |  |
|  +-------------------+  +--------------------+  +--------------------+  |
|                                                                         |
|  +-------------------+  +--------------------+  +--------------------+  |
|  |    ImportModal    |  |     TvModeModal    |  | OfflineMapsManager |  |
|  |  (EXIF GPS / D&D) |  |   (Salon 4K / QR)  |  |  (Pakiety Cache)   |  |
|  +-------------------+  +--------------------+  +--------------------+  |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                         WARSTWA LOGIKI I USŁUG                          |
|                                                                         |
|  • StorageService (Zarządzanie stanem, eksport/import .prezent)         |
|  • AudioAmbientEngine (Synteza fal i natury przez Web Audio API)         |
|  • ExifParserService (Biblioteka exifr dla współrzędnych i aparatów)    |
|  • OfflineMapCacheService (Zarządzanie kafelkami regionalnymi)          |
+-------------------------------------------------------------------------+
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
+---------------------------+               +-----------------------------+
|    ŚRODOWISKO BROWSER     |               |    ŚRODOWISKO ELECTRON      |
|   (Podgląd AI Studio)     |               |    (Windows 10/11 .exe)     |
| • localStorage / IDB      |               | • fs / path / OS dialogs    |
| • File API (Drag & Drop)  |               | • Bezpośredni dostęp do     |
| • Fullscreen API          |               |   Eksploratora Windows      |
+---------------------------+               +-----------------------------+
```

## Kontrakt Danych `.prezent` (Kompatybilność z Android Room)
Plik `.prezent` stanowi ustrukturyzowany zrzut bazy w JSON:
- `photos`: tablica encji fotografii z kluczem głównym `id`, relacją `albumId`, współrzędnymi `lat`/`lng` i metadanymi.
- `albums`: tablica encji albumów.
- `trips`: tablica encji podróży z punktami `routePoints`.
- `settings`: preferencje widoku i motywu.

Dzięki temu aplikacja na system Android będzie mogła dokonać deserializacji do obiektów `@Entity` biblioteki Room w jednej transakcji bazy danych.
