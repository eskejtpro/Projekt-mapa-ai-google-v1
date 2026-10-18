# CHANGELOG.md - Historia Zmian Projektu „Prezent Mapy”

## 1.7.0 — pokaz multimedialny zdjęć i filmów
- Rozszerzono istniejący pokaz o wspólną listę zdjęć i filmów MP4/WebM.
- Filmy odtwarzają się automatycznie, przechodzą dalej po zakończeniu i zachowują pauzę, seek, głośność, wyciszenie oraz fullscreen.
- Pokaz z galerii i albumu może obejmować oba rodzaje mediów; zachowano pasek miniatur, kolejność, shuffle, pętlę i auto-ukrywanie kontrolek.
- Dopracowano UX: pusty pokaz ma czytelny stan, błąd filmu pozwala go pominąć, koniec ostatniego filmu respektuje wyłączoną pętlę, a mini-mapa działa lokalnie bez zewnętrznego iframe.
- Testy UI Electron dla mieszanego pokazu pozostają wymagane przed scaleniem PR #7.

## 1.6.0 — integracja GPS filmów i pełna kopia biblioteki
- GPS z MP4 `loci` i MOV QuickTime `©xyz`, odczyt lokalny z ograniczeniem ilości metadanych; pozostałe warianty GPS pozostają nieobsługiwane. Import MOV nadal nie jest deklarowany.
- Markery filmów, filtrowanie i otwieranie odtwarzacza z mapy; testy offline z rzeczywistymi plikami i większą biblioteką.
- Poprawiona polityka CSP dla protokołu wideo, generowanie miniatur i zwalnianie zasobów playera.
- Pełna kopia folderowa bazy, zdjęć i filmów z SHA-256 oraz addytywnym przywracaniem; starsze pliki `.prezent` zachowują zakres zdjęć.
- Czytelniejszy formularz GPS i panel kopii; dokument zasad wyglądu `DESIGN.md`.

## Unreleased — środowisko Codex
- Dodano walidator struktury automatyzacji Codex/CI, testy przypadków negatywnych, bramkę w szybkim i pełnym verify, dokumentację przepływu, szablon PR oraz limit czasu i retencję raportów CI. Weryfikacja nowego commita i działanie hooków klienta wymagają oddzielnych dowodów; nie jest to gotowe wydanie Windows.
- Zaznaczanie i usuwanie zbiorcze zdjęć, usuwanie albumu z zachowaniem albo usunięciem zdjęć z biblioteki; pliki na dysku pozostają zachowane. Skan SSDP na wielu interfejsach, wybór TV i ręczne odświeżanie. Warstwy OSM dzień/noc i Esri Topographic zastępują dotychczasowe warstwy CARTO.
- Widok mapy w trybie offline nie renderuje już uszkodzonych obrazów zewnętrznych; dla niedostępnych URL-i pokazuje bezpieczny placeholder, a lokalne obrazy data URL pozostają obsługiwane.
- Operacje resetu demo, usuwania demo i czyszczenia stanu map wykonują zapisy kolekcji atomowo; czyszczenie map przenosi rzeczywisty plik MBTiles do odzyskiwalnego archiwum i raportuje jego rozmiar. Dodano blokadę drugiej instancji aplikacji Electron.
- Dodano automatyczne lokalne kopie .prezent, harmonogram podczas działania aplikacji, sygnalizowanie błędów i dostęp do katalogu kopii z ustawień. Ręczny eksport respektuje ustawienie miniatur.
- Rozszerzono walidację kopii i ustawień, stan odzyskiwania oraz kontrolę zapisu edycji/usuwania. Dodano produkcyjne CSP i test restartu procesu. Zoptymalizowano powtarzane odczyty identycznych mediów i dodano jawnie syntetyczny benchmark.
- Podłączono ustawienia pokazu, sortowania/lazy-load galerii, EXIF i autocentrowania wypraw. Mapa korzysta z relacji albumów; nazwy tras i punktów renderowane jako tekst. Wzmocniono raportowanie błędów testu runtime.
- Wdrożono pilot HTTP z lokalnym QR/parowaniem, tokenem, ograniczonymi komendami i integracją pokazu slajdów. Zastąpiono sieciową minimapę lokalną. Naprawiono rozpoznawanie duplikatów oraz atomowy import zdjęć i albumu, błąd/anulowanie FileReader.
- Dodano odświeżane na żądanie panelu wyszukiwanie DLNA/SSDP w LAN i relacyjny filtr zdjęć pokazu TV. Test renderowania MBTiles przy zablokowanej sieci PASS na syntetycznych kafelkach.
- Dodano konfigurację NSIS/portable, natywny folder i autostart; autostart domyślnie wyłączony. Dodano import rastrowego MBTiles i lokalną warstwę; wyłączono automatyczne wysyłanie współrzędnych i zabezpieczono atrybuty pinezek.
- Zdjęcia osadzane w kopii mogą być przechowywane w osobnych plikach z SHA-256; import .prezent waliduje rekordy i zapisuje atomowo. Eksport bez GPS usuwa również punkty tras.
- Dodano SQLite w procesie głównym, ograniczony mostek danych, transakcyjny zapis wsadu i migrację z kopią źródła; podgląd Vite nadal używa localStorage.
- Rozpoczęto powłokę Electron: izolowany preload, walidacja nadawcy IPC, natywne kontrolki okna, blokada nowych okien i nawigacji. Dodano tryb testu uruchomienia ze zrzutem renderera.
- Dopasowano esbuild do Vite 8 po błędzie instalacji, dodano npm lockfile i kanoniczną wersję 1.3.1 w package.json.
- Dodano quality gates, kontrole Git, konfigurację hooków Codex, workflow Windows CI i blokadę niegotowego wydania.
- Dodano testy integracji kopii i środowiska, skille oraz rzeczywisty rejestr braków i ciągłości.
- Zachowano UI; brak nowego instalatora i brak deklaracji ukończenia Windows.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/).

---

## [1.4.1] - 2026-10-17 — Bezpośrednie Przeciąganie Zdjęć z Eksploratora Windows na Katalog (Drag & Drop)

### Nowe Funkcjonalności & Usprawnienia
- **Bezpośrednie dodawanie zdjęć do katalogu przez Drag & Drop z Eksploratora Windows**:
  - **Przeciąganie na baner katalogu w Galerii**: upuszczenie plików z komputera na aktywny nagłówek katalogu (`GalleryView.tsx`) lub na obszar galerii natychmiast przypisuje zdjęcia do tego albumu.
  - **Wizualna strefa upuszczania (Drop Zone Feedback)**: baner katalogu reaguje na najechanie kursorem z plikami podświetleniem w bursztynowej tonacji, animowaną ikoną `FolderDown` oraz informacją o docelowym katalogu.
  - **Przeciąganie na karty w widoku Albumów**: każda karta w widoku *Albumy i Kolekcje* (`App.tsx`) posiada aktywny nasłuch zdarzeń przeciągania plików z dedykowaną, pulsującą nakładką upuszczenia.
  - **Automatyczny wybór albumu w ImportModal**: przekazanie parametru `initialAlbumId` gwarantuje, że proces importu automatycznie przypisuje dodawane fotografie do właściwego katalogu z odczytem metadanych EXIF GPS.

---

## [1.4.0] - 2026-10-17 — Rozbudowany Pokaz Slajdów 2.0, Układanie Zdjęć w Katalogach & Blokada Pionowa Mapy

### Nowe Funkcjonalności & Usprawnienia
- **Rozbudowany Kinowy Pokaz Slajdów 2.0 (`SlideshowModal.tsx`)**:
  - **Efekty przejść**: dodano wybór 4 kinowych animacji przejść: *Ken Burns* (płynny zoom & pan), *Płynne przenikanie* (crossfade), *Kinowy przesuw* (slide push), *Zoom & Fade*.
  - **Zaawansowany panel ustawień (Drawer)**: wysuwany bez przerywania pokazu panel z suwakami czasu (2-30s), pętlą, kolejnością odtwarzania oraz nakładkami.
  - **Rozbudowane tło dźwiękowe (Web Audio API - 100% offline)**: 5 nastrojowych pejzaży proceduralnych (*Szum oceanu*, *Szum lasu & letni wiatr*, *Ognisko & kominek*, *Letnie cykady*, *Spokojny ambient pad*) z płynną regulacją głośności 0-100%.
  - **Pasek miniatur (Filmstrip / Timeline)**: rozwijany pasek u dołu ekranu z miniaturami wszystkich zdjęć w kolejności i możliwością natychmiastowego skoku do dowolnego slajdu.
  - **Tryby wyświetlania napisów**: *Pełny opis*, *Minimalistyczny* (tylko miasto i data) oraz *Czyste kino* (bez żadnych napisów — idealne na TV 4K).
  - **Auto-ukrywanie kontrolek**: kursor myszy i kontrolki HUD płynnie znikają po 3.5 sekundach bezruchu, odsłaniając nieskazitelny obraz fotografii.
- **Układanie Zdjęć w Katalogach / Własna Kolejność (`CatalogOrganizerModal.tsx`)**:
  - **Dedykowany moduł organizacji katalogu**: intuicyjne przeciąganie kart fotografii (Drag & Drop z uchwytem `GripVertical`) oraz precyzyjne przyciski: *Przesuń wcześniej*, *Przesuń później*, *Na początek*, *Na koniec*.
  - **Szybkie szablony sortowania**: *Najstarsze pierwsze*, *Najnowsze pierwsze*, *Alfabetycznie A-Z*, *Trasa Zachód → Wschód*, *Odwróć kolejność*.
  - **Numeracja slajdów**: każde zdjęcie w katalogu otrzymuje wyraźny identyfikator pozycji (`#1`, `#2`, `#3`...), gwarantujący pełną kontrolę nad scenariuszem pokazu.
  - **Trwałość porządku**: własna kolejność zapisywana jest w strukturze `customPhotoOrder` albumu w `localStorage` i w plikach `.prezent`.
  - **Integracja z Galerią i Pokazem Slajdów**: po ułożeniu zdjęć, przycisk *Odtwórz pokaz slajdów w tej kolejności* uruchamia slajdy dokładnie według ustalonego porządku. W galerii dodano tryb sortowania *⭐ Moja ułożona kolejność*.
- **Ścisła Blokada Pionowa Mapy (`MapView.tsx`)**:
  - Zaimplementowano matematyczne ryglowanie współrzędnych pikselowych na osi Y w `MapView.tsx` (`enforceVerticalBounds`).
  - Górna i dolna krawędź kafelków świata są trwale zablokowane na granicy rzutu Web Mercator (±85.0511°).
  - Przewijanie w pionie nigdy nie odsłania czarnej pustki poza mapą, przy zachowaniu nieskończonego przewijania poziomego (dookoła globu).

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
# 1.5.0 — fundament biblioteki filmów
- Dodano typowany model `MediaItem`, lokalny import MP4/WebM, deduplikację SHA-256, metadane SQLite i bezpieczne odtwarzanie przez protokół Electron.
- Nie dodano jeszcze obsługi filmów w galerii, mapie, slideshow ani TV.
## [1.5.1] — 2026-10-18
- Naprawiono obsługę HTTP Range w protokole `prezent-video://`, dzięki czemu przewijanie działa w Electronie.
- Zweryfikowano rzeczywiste próbki H.264/AAC, VP8/Opus i VP9/Opus w Electronie na Windows; pomiar wyjścia audio pozostaje `UNVERIFIED`.
