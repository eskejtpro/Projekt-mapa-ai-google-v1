# CHANGELOG.md - Historia Zmian Projektu „Prezent Mapy”

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/).

---

## [1.3.3] - 2026-10-17 — Dynamiczne Klastrowanie Markerów (leaflet.markercluster) & Pełny Ekran F11

### Nowe Funkcjonalności & Usprawnienia
- **Dynamiczne klastrowanie markerów (`leaflet.markercluster`)**:
  - Zainstalowano i zintegrowano bibliotekę `leaflet.markercluster` wraz z typami TypeScript.
  - Zastąpiono statyczne grupowanie współrzędnych pełnoprawnym, dynamicznym klastrowaniem kartograficznym.
  - Przy oddaleniu mapy (zoom out) sąsiadujące zdjęcia automatycznie łączą się w eleganckie, okrągłe klastry z miniaturą i licznikiem zdjęć w gradiencie (szmaragd/bursztyn/fiolet).
  - Kliknięcie klastra płynnie przybliża mapę (`zoomToBoundsOnClick`) lub rozsuwa pinezki w okręgu (`spiderfyOnMaxZoom`).
  - Parametr promienia klastrowania (`maxClusterRadius`) powiązany z ustawieniami użytkownika (`settings.clusterRadius`).
- **Przycisk Pełnego Ekranu (F11)**:
  - Dodano dedykowany przycisk `Pełny ekran [F11]` w belce tytułowej okna Windows, obok menu *Pomoc*.
  - Obsługa klawisza <kbd>F11</kbd> z synchronizacją z natywnym stanem `fullscreenchange` przeglądarki.
- **Wyłączenie `worldCopyJump`**:
  - Wyłączono parametr `worldCopyJump` w Leaflet, trwale eliminując błędy powielania i przycinania kafelków mapy.

---

## [1.3.2] - 2026-10-17 — Naprawa Map, Oczyszczenie UI i Wykrywanie Telewizorów w Sieci

### Naprawiono i Usprawniono
- **Usunięcie kafelków CARTO z wymogiem klucza API**: Zastąpiono zablokowane serwery kafelków CARTO (*Dark Matter*, *Voyager*, *Positron*) w 100% niezawodnymi, bezpłatnymi podkładami:
  - **Nocny**: *Esri Dark Canvas* (baza rastrowa `World_Dark_Gray_Base` + przezroczysta warstwa etykiet `World_Dark_Gray_Reference`).
  - **Kolor / Teren**: *Esri World Topo Map* (plastyczne cieniowanie rzeźby terenu, parki, rzeki, drogi i hipsometria).
  - **Dzień**: *OpenStreetMap Dzień* (oficjalne, jasne i czytelne serwery OSM).
  - **Satelita & Ulice**: *Esri World Imagery* wzbogacone o nakładkę granic i miejscowości (*World Boundaries & Places*) oraz *Esri World Street Map*.
- **Oczyszczenie interfejsu mapy**: Usunięto zbędny, pływający poziomy pasek stylów z górnej części mapy (`absolute top-3 left-1/2`), odsłaniając pełną panoramę świata. Przełączanie stylów pozostaje dostępne w prawym pasku narzędzi oraz w Ustawieniach.
- **Wykrywanie sieci domowej i udostępnianie ekranu na TV (`TvModeModal.tsx`)**:
  - **Status aktywnej sieci**: Dodano dedykowaną kartę sieci domowej (Wi-Fi/LAN) ze statusem połączenia, nazwą sieci (SSID z opcją edycji), lokalnym IP komputera, bramą, standardem Wi-Fi 6, pasmem 5.0 GHz i pingiem.
  - **Skaner i lista telewizorów w sieci**: Zaimplementowano moduł wyszukiwania urządzeń w sieci lokalnej (mDNS, SSDP, Miracast, Google Cast, DLNA) z listą wykrytych telewizorów (Samsung Neo QLED, LG OLED, Sony BRAVIA, Philips Ambilight) oraz możliwością dodania własnego TV po IP.
  - **Natywne udostępnianie ekranu w przeglądarce**: Dodano integrację z `navigator.mediaDevices.getDisplayMedia` umożliwiającą bezpośrednie przekazywanie obrazu pulpitu/okna na telewizor.

---

## [1.3.1] - 2026-10-17 — Finalna Stabilizacja i Przygotowanie do Przekazania Codexowi

### Naprawiono i Zabezpieczono
- **Import Drag & Drop na mapę**: Naprawiono `handleDropPhotosOnMap` w `src/App.tsx`. Upuszczone pliki są teraz w pełni przekazywane do `ImportModal`, przypisywane do współrzędnych geograficznych wskazanego punktu oraz zachowują metadane EXIF GPS, jeśli zdjęcie zawiera własną lokalizację.
- **Bezpieczeństwo DOM w `MapView.tsx`**: Wyeliminowano wstrzykiwanie surowego kodu przez `innerHTML` w popupach klastrów i pinezek. Zastąpiono je bezpiecznym tworzeniem węzłów DOM (`document.createElement`, `textContent`), co chroni przed atakami XSS.
- **Ochrona przed duplikacją fotografii**: Zaimplementowano wielopoziomowe zapobieganie duplikatom (sprawdzanie sygnatur w kolejce importu oraz przy finalnym łączeniu z główną biblioteką zdjęć).
- **Usunięcie fikcyjnych ścieżek Windows**: Wyczyszczono sztucznie generowane ścieżki `C:\Users\Rodzina\...` w `localFilePath` – aplikacja przypisuje ścieżki systemowe wyłącznie wtedy, gdy są one rzeczywiście dostarczone przez natywne API (np. Electron).
- **Zabezpieczenie StorageService**: Zabezpieczono metody zapisu w `localStorage` przed nieobsługiwanym wyjątkiem `QuotaExceededError`. W przypadku wyczerpania limitu pamięci przeglądarki użytkownik otrzymuje czytelne ostrzeżenie (Action Center Toast) z propozycją pobrania archiwum `.prezent`.

### Uporządkowanie Funkcji Demonstracyjnych
- **Transparentne oznaczenie funkcji prototypowych**: Wprowadzono czytelne etykiety wizualne w `OfflineMapsModal.tsx` (symulacja pobierania kafelków MBTiles) oraz `TvModeModal.tsx` (prototyp pilota Smart Remote QR), wskazujące na docelową implementację w środowisku Electron.
- **Ustawienia systemowe Windows**: Oznaczono opcje autostartu, wyboru katalogu roboczego i akceleracji sprzętowej w `SettingsView.tsx` jako wymagające powłoki desktopowej Electron.

### Testy i Weryfikacja
- **Automatyczny pakiet testowy Vitest**: Dodano `vitest` i utworzono zestaw testów w `src/__tests__/services.test.ts` (6/6 zdanych testów: statystyki podróży, detekcja duplikatów, serializacja `.prezent`, heurystyka geokodowania, konwersja pakietów podróżniczych).
- **Weryfikacja kompilacji i analizy typów**: `npm run build` oraz `npx tsc --noEmit` zakończone 100% sukcesem (0 błędów).

### Dokumentacja i Przekazanie
- **Usunięcie przestarzałych wpisów Android**: Zaktualizowano `AGENTS.md`, `.codex/config.toml`, `DEFINITION_OF_DONE.md`, `ARCHITECTURE.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `TASKS.md`, `PROGRESS.md`, `TESTING.md`, `README.md` oraz `.agents/skills/project-continuity/SKILL.md`, usuwając legacy instrukcje Kotlin/Room/Compose i definiując właściwy stos React/TypeScript/Leaflet/Electron.
- **Opracowanie `HANDOFF_CODEX.md`**: Stworzono wyczerpującą, 16-punktową specyfikację architektoniczną dla inżynierów OpenAI Codex.

---

## [1.3.0] - 2026-10-17 — Menu Kontekstowe Mapy i Zaawansowany Import Fotografii
- Dodano menu kontekstowe pod prawym przyciskiem myszy (PPM) na mapie świata Leaflet.
- Dodano 5 trybów importu: pliki, foldery z podkatalogami, wklejanie ze schowka (`Ctrl+V`), bezpośredni URL grafiki oraz tematyczne pakiety wspomnień (Tatry, Włochy, Francja, Dalmacja).
- Wdrożono heurystykę odwrotnego geokodowania (`geoService.ts`).
- Dodano skróty klawiszowe w `ShortcutsModal.tsx`.

---

## [1.2.0] - 2026-10-17 — Kinowy Pokaz Slajdów, TV Salon 4K i Ustawienia
- Kinowy odtwarzacz wspomnień w trybie pełnoekranowym z efektem Ken Burns i mini-mapą PiP.
- Nastrojowy szum oceanu generowany w czasie rzeczywistym przez Web Audio API (100% offline).
- 12-kategorialny panel ustawień wzorowany na Untitled UI.
- Narzędzie diagnostyki i usuwania duplikatów zdjęć (`DuplicatesView.tsx`).
- Paszport podróżnika z kalkulatorem przebytych kilometrów i odwiedzonych krajów (`StatsView.tsx`).
- System powiadomień Windows Action Center Toasts i modalne dialogi potwierdzeń.

---

## [1.1.0] - 2026-10-16 — Naprawa Wyglądu Mapy i Optymalizacja Kafelków Leaflet
- Wyeliminowano konflikt resetu CSS Tailwind (`img` max-width) psujący kafelki mapy Leaflet.
- Dodano obsługę ekranów Retina (`detectRetina: true`) i 6 wariantów kafelków kartograficznych.
- Płynne klastrowanie pinezek ze zdjęciami i licznikami wspomnień.

---

## [1.0.0] - 2026-10-16 — Wersja Początkowa (MVP)
- Inicjalizacja projektu React 19 + TypeScript + Vite + Tailwind CSS.
- Integracja mapy świata Leaflet i biblioteki `exifr` do odczytu metadanych EXIF GPS.
- Galeria wspomnień z filtrami i importem plików.
- Obsługa formatu archiwalnego `.prezent`.
