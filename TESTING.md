# TESTING.md - Procedury Testowe i Raport Weryfikacji

## PR #8 — native DLNA casting

- Test `tests/tv-casting.test.cjs`: symulator urządzenia, opis XML, SOAP, ograniczony plik, MIME, HTTP Range, odrzucenie ścieżki i zamknięcie serwera.
- Fizyczny telewizor i faktyczne potwierdzenie dekodowania obrazu/dźwięku: **UNVERIFIED** — brak odbiornika w środowisku sesji.
- Obsługiwany protokół: DLNA/UPnP AVTransport. Google Cast, Miracast i AirPlay nie są deklarowane.

## PR #7 — multimedia slideshow

- `npm test`: **PASS**, 22/22.
- `npm run typecheck`: **PASS**.
- `npm run build`: **PASS**.
- `npm run test:e2e:electron`: **PASS** — izolowany Electron sprawdza pokaz zawierający zdjęcie i film, pauzę/wznowienie, zakończenie filmu, mapę, backup/restore i restart.
- `npm run test:database`: **PASS**, 21/21. Scenariusze backupu SQLite/plików są uruchamiane w odrębnych procesach Node, aby nie współdzielić uchwytów `node:sqlite`; zachowano wszystkie przypadki, w tym dwa pliki 64 MiB.
- Pełne `npm run verify`: **PASS**. Przed scaleniem nadal wymagana jest niezależna kontrola CI Windows.
- GitHub Actions Quality dla `4b7f6b5`: **PASS** — Windows quality gate, E2E Electron, rzeczywiste MP4/WebM, GPS, offline mapa, backup/restart i audyt zależności.

## Automatyzacja Codex — nowa iteracja (2026-10-18)

- Dodano `scripts/automation-check.mjs` do `npm run verify` (tryb quick i full); sprawdza strukturę konfiguracji, skilli, hooków i CI.
- Dodano `tests/automation.test.mjs`: kontrola pozytywna oraz dwa przypadki negatywne (brak plików/skryptów i niepoprawny JSON hooków). Skrypt `test:tooling` uruchamia oba pliki testowe.
- Workflow Quality: concurrency, timeout 30 minut, raporty z retencją 14 dni. Zachowano audyt zależności.
- Status tej iteracji: lokalne kontrole końcowe **PASS**; wynik GitHub Actions dla nowego SHA zostanie zapisany po pushu.
- Testy automatycznych zdarzeń hooków Codex: **UNVERIFIED**. Test uruchomienia skryptu z przykładowym JSON nie potwierdza zaufania ani uruchomienia przez klienta.
- Windows 10/11 instalator, portable, realny TV i testy danych użytkownika: **NOT RUN** w tej iteracji. `release:check` pozostaje blokadą.

## Korekta launchera Windows — 2026-10-18

- Zastąpiono przekazywanie Unicode z `git rev-parse --show-toplevel` launcherem Node wykrywającym katalog projektu od `cwd`; PowerShell przekazuje wyłącznie względną ścieżkę z `--show-cdup`.
- `node --test tests/tooling.test.mjs`: **PASS**, 11/11, w tym regresja ścieżki `A:\Prezent na rocznicę` uruchamiana z `src`.
- `npm run test:tooling`: **PASS**, 14/14.
- `npm run verify`: **PASS**; raport: `reports/verification.json`.

## Galeria wideo — test Electron/Playwright

- `npm run test:e2e:electron`: **PASS** — izolowany profil Windows, import syntetycznego kontenera WebM przez UI, filtr filmów, karta placeholdera, otwarcie/zamknięcie playera, przypisanie do albumu i trwałość po restarcie.
- Test E2E nie potwierdza dekodowania H.264/VP8/VP9 ani dźwięku; rzeczywiste pliki/kodeki i odsłuch: **UNVERIFIED**.
- Starszy `.prezent`/harmonogram obejmuje zdjęcia, albumy, trasy i ustawienia. Pełne kopie SQLite/zdjęć/filmów z SHA-256 i przywracaniem są dostępne osobno w ustawieniach; opis w `docs/VIDEO_GPS_AND_BACKUP.md`.

## PR #6 — GPS filmów i mapa

- `npm run test:desktop-restart`: **PASS**.
- `npm run test:database`: **PASS**, 12/12, w tym migracja `location_source`, walidacja ręcznego GPS oraz usuwanie lokalizacji.
- `npm run test:e2e:electron`: **PASS** dla galerii, playera, albumu, restartu oraz markera filmu/popupa mapy; test działa na izolowanym profilu.
- GPS z MP4 `loci` i MOV QuickTime `©xyz`: **PASS** na rzeczywistych plikach FFmpeg z porównaniem ffprobe, obu półkulach i trwałości MP4 po ponownym otwarciu SQLite. Pozostałe warianty GPS są nieobsługiwane; MOV nie jest deklarowanym formatem importu.
- Pełna kopia folderowa: testy SHA-256, dodawanie do nowego profilu, relacje album/GPS i testy uszkodzeń/ścieżek; natywne IPC backup/restore w Electron E2E **PASS**.
- Mapa offline: lokalne MBTiles przy blokadzie HTTP(S), widoczny marker i otwarcie filmu **PASS**. Większy zbiór: 1512 mediów syntetycznych, klastry i zoom **PASS**; nie jest to dowód 60 FPS dla biblioteki 4K.
- Prawdziwe pliki: H.264/AAC, VP8/Opus i VP9/Opus w `npm run test:video-playback-real`; odrębny raport `reports/video-playback-real.json`. Automatyczna ocena głośników pozostaje **UNVERIFIED**; procedura odsłuchu w `docs/VIDEO_GPS_AND_BACKUP.md`.


## Codex — świeża weryfikacja 2026-10-17
Baseline źródeł: 1be0136 + zmiany gałęzi work/windows-desktop-foundation. System wykonania: Windows 10 Pro 10.0.19045 x64, Node 26.8.1, npm 11.19.0; CI skonfigurowane na Node 24/windows-latest (wynik zdalny osobno).

| Kontrola | Wynik | Dowód i ograniczenia |
|---|---|---|
| Instalacja początkowa | FAIL → PASS | npm install początkowo ERESOLVE: esbuild 0.25 kontra Vite 8; po dopasowaniu do 0.28 instalacja 204 pakietów |
| npm run verify | PASS | project:check, lint, typecheck, test, test:tooling, build; raport reports/verification.json |
| Vitest | PASS | 9/9: 6 istniejących + 3 integracyjne round-trip/anonimizacja/wersja; localStorage jest zastępczym magazynem w pamięci, nie SQLite ani przeglądarką |
| npm run test:integration | PASS | 3/3; test starej wersji wykazał FAIL przed poprawką, po poprawce weryfikowany ponownie |
| Node tooling | PASS | 10/10: siedem zdarzeń, ostrzeżenie force-push, bramka release, Windows launcher z podkatalogu |
| npm audit --omit=dev --audit-level=high | PASS | 0 podatności raportowanych przez npm; nie oznacza pełnego audytu bezpieczeństwa aplikacji |
| Walidator skill-creator | PASS | 6/6 katalogów poprawnych; odkrycie nowo dodanych skilli w następnej sesji UNVERIFIED |
| Podgląd HTTP | PASS | Vite 127.0.0.1:3000, GET / → 200; to nie dowód renderowania UI |
| release:check | BLOCKED | Oczekiwany exit 1 i ready=false, brak Electron/instalatora; test tooling potwierdza blokadę |
| Hooki automatyczne Codex | UNVERIFIED | Skrypty i launcher PASS; logi manual-test nie stanowią dowodu zdarzenia klienta; wymagany przegląd /hooks |
| GitHub Actions | PASS | Quality run 39005537274, commit 57b1587, Windows runner/Node 24: npm ci, verify, audit oraz upload raportu zakończone sukcesem w 46 s |
| UI, screenshots, E2E | BLOCKED | Wbudowana przeglądarka: Browser is not available: iab; nie wykonano zrzutów ani oceny wizualnej |
| Electron / SQLite / EXE / dodatkowy ekran | NOT RUN | Funkcje jeszcze niezaimplementowane |
| Pokrycie kodu | NOT RUN | Nie mierzono; nie podajemy procentu |

W trakcie tworzenia środowiska Vitest błędnie zebrał plik node:test; odtworzono FAIL i ograniczono npm test do src/__tests__. Oddzielne test:tooling uruchamia Node test runner. Końcowy pakiet przechodzi.

Czyste npm ci w izolowanym katalogu tymczasowym: PASS, 204 pakiety. npm 11 zgłosiło niezatwierdzone skrypty instalacyjne trzech zależności; nie zmieniano polityki globalnej. Build i testy sprawdzono z aktualną lokalną instalacją.

Dowód zdalny: https://github.com/eskejtpro/Projekt-mapa-ai-google-v1/actions/runs/39005537274 . Rzeczywiste hooki pre-commit i pre-push uruchomiły odpowiednio szybkie i pełne bramki. Codex features list potwierdza hooks stable true; brak dowodu zdarzeń klienta dla nowych skryptów nadal oznacza UNVERIFIED. CI ostrzegło o actions/*@v4 używających Node 20 i wymuszonym runtime Node 24; workflow przeszedł, aktualizacja actions pozostaje zadaniem utrzymaniowym.

Poniżej zachowany historyczny raport AI Studio. Dawne checklisty UI nie są świeżym dowodem Codexa:

## 1. Testy Automatyczne (Vitest)
Polecenie: `npm test` (`vitest run`)  
Środowisko: Node.js + Vitest 5  
Status: **6/6 ZDANYCH (100% SUKCES)**

### Wyniki pakietu testowego `src/__tests__/services.test.ts`:
- [x] `StorageService > oblicza rzetelne statystyki podróży (getTravelStats)`: Prawidłowe zliczanie unikalnych krajów, miast, łącznego dystansu i roczników wypraw.
- [x] `StorageService > poprawnie wykrywa duplikaty zdjęć (findDuplicates)`: Wykrywanie powtórzonych fotografii na podstawie identycznej nazwy pliku lub zbliżonych koordynatów GPS i daty.
- [x] `StorageService > eksportuje i importuje kopię zapasową .prezent z zachowaniem spójności struktury`: Prawidłowa serializacja do JSON i walidacja struktury przy imporcie.
- [x] `geoService > dopasowuje najbliższą znaną lokalizację na podstawie współrzędnych geograficznych`: Prawidłowe rozpoznawanie miast w Polsce i Europie.
- [x] `geoService > prawidłowo formatuje współrzędne w formacie N/S E/W`: Formatowanie koordynatów do czytelnej postaci tekstowej.
- [x] `travelPacks > posiada predefiniowane pakiety podróżnicze i poprawnie konwertuje je na zdjęcia i album`: Prawidłowa konwersja gotowych pakietów wspomnień.

---

## 2. Analiza Statyczna i Budowanie Pakietu
- **Analiza statyczna typów TypeScript**: `npm run lint` (`tsc --noEmit`) -> **0 błędów**.
- **Kompilacja produkcyjna Vite**: `npm run build` -> **SUKCES** (utworzono zoptymalizowany bundle `dist/index.html` oraz assety JS/CSS).

---

## 3. Scenariusze Testów Funkcjonalnych Interfejsu

### A. Interaktywna Mapa Świata (Leaflet)
- [x] Poprawne ładowanie wszystkich 6 warstw kafelkowych (CartoDB Dark Matter, Positron, Esri Satellite, Street Map, OSM).
- [x] Wyświetlanie klastrów pinezek i rozbijanie klastrów przy zbliżaniu widoku.
- [x] Bezpieczne renderowanie popupów na mapie (brak wstrzykiwania surowego `innerHTML`, bezpieczne węzły DOM).
- [x] Menu kontekstowe pod prawym przyciskiem myszy (PPM) na mapie z przechwytywaniem współrzędnych klikniętego punktu.

### B. Centrum Importu i Drag & Drop
- [x] Przeciągnięcie plików graficznych na mapę -> automatyczne otwarcie `ImportModal` z przekazaną listą plików i współrzędnymi punktu upuszczenia.
- [x] Odczyt metadanych EXIF GPS przy użyciu biblioteki `exifr` (zachowanie współrzędnych aparatu).
- [x] Fallback na współrzędne punktu mapy dla fotografii bez własnego GPS.
- [x] Wklejanie fotografii ze schowka systemowego klawiszem `Ctrl + V`.
- [x] Dodawanie grafik z adresu URL z podglądem na żywo i walidacją.
- [x] Jednoklikowy import tematycznych pakietów wspomnień (Tatry, Włochy, Lazurowe Wybrzeże, Dalmacja).
- [x] Skuteczne zapobieganie duplikatom plików w kolejce importu i bibliotece głównej.
- [x] Usunięcie fikcyjnych ścieżek dyskowych `C:\Users\...` – przypisywanie wyłącznie rzeczywistych ścieżek, jeśli są udostępnione przez środowisko.

### C. Trwałość Danych i Pamięć Lokalna
- [x] Obsługa limitu `localStorage` (~5MB) z czytelnym komunikatem ostrzegawczym (Windows Action Center Toast) w razie przekroczenia limitu.
- [x] Generowanie i pobieranie pliku kopii `.prezent`.
- [x] Pomyślne przywrócenie bazy z pliku `.prezent`.

### D. Kinowy Pokaz Slajdów i Prezentacja TV
- [x] Odtwarzanie slajdów w trybie pełnoekranowym z efektem Ken Burns.
- [x] Działanie mini-mapy Picture-in-Picture w rogu odtwarzacza.
- [x] Nastrojowy szum oceanu generowany przez Web Audio API (100% offline).
- [x] Obsługa klawiatury (Spacja = pauza/start, Strzałki = poprzednie/następne, F11 = pełny ekran, Esc = wyjście).
- [x] Prezentacja TV 4K: dostosowanie kontrastu i typografii.

### E. Oznaczenie Funkcji Demonstracyjnych
- [x] Menedżer Map Offline oznaczony jako demonstracyjny z informacją o planowanym buforze MBTiles w Electronie.
- [x] Pilot zdalnego sterowania QR Smart Remote oznaczony jako prototyp UI wymagający lokalnego serwera WebSocket w Electronie.
# Iteracja powłoki Windows — 2026-10-17
- BackupManager test PASS: tworzenie przenośnej kopii, zachowanie oryginalnego osadzonego obrazu, pomijanie miniatur, brak kopii przed terminem, kolejna po terminie i wyłączenie harmonogramu. Aktualne verify: 19 Vitest + 10 tooling + 9 testów backendu. Nie wykonano rzeczywistego wielodniowego testu harmonogramu.
- verify: 19 Vitest + 10 tooling + 8 baza/mapy/TV/remote PASS. Nowe przypadki walidują kalendarz, pola opcjonalne, relacje, enumy, granice i legacy. `npm run test:desktop-restart` PASS — dwa procesy, ten sam izolowany profil, syntetyczne zdjęcie i opis odtworzone.
- Smoke produkcyjnego CSP z offline/pilot/preferencjami PASS; niewłaściwa ramka IPC i popup odrzucone. Smoke recovery PASS — uszkodzony rekord zachowany i ostrzeżenie w rendererze. To nie test fizycznego uszkodzenia SQLite ani odzyskania całej biblioteki.
- Smoke `--offline-smoke-test --remote-smoke-test --preferences-smoke-test` PASS: 24 lokalne kafelki, zmiana/pauza pokazu HTTP, sortowanie galerii i eager zdjęć, 12 s/slajd, wyłączone Ken Burns/ambient/PiP. Test przejść animacji i fizycznych plików EXIF NOT RUN. Błąd selektora nagłówka wykryty i naprawiony; raport teraz zapisuje bieżący FAIL.
- Pilot: test serwera HTTP PASS (obcy token/origin/komenda odrzucone). Smoke Electron z offline+remote PASS: QR w panelu, HTTP → IPC → pauza i zmiana slajdu, 24 lokalne kafelki. Fizyczny telefon i rzeczywisty TV NOT RUN. verify PASS: 14 Vitest + 10 tooling + 8 baza/mapy/TV/pilot. Regresja duplikatów: nazwa i deklarowany hash bez identycznej treści nie grupują różnych obrazów.
- NSIS instalacja do release/installation-smoke PASS (exit 0); smoke zainstalowanego exe z --offline-smoke-test PASS (24 kafelki, SQLite, izolacja, packaged=true); deinstalacja PASS (exit 0, plik programu nie istnieje). Profil testowy izolowany; aktualizacja/zachowanie wcześniejszych danych NOT RUN. Pakiet jest sprzed TV discovery, dlatego nie jest kandydatem aktualnego HEAD.
- Offline runtime: Electron smoke z `--smoke-test --offline-smoke-test` PASS, 24 lokalne kafelki syntetycznego MBTiles przy blokadzie HTTP(S). TV parser SSDP PASS; rzeczywisty skan LAN zakończony bez błędu, 0 odpowiedzi. Fizyczny TV i pilot NOT RUN.
- Pakowanie: NSIS i portable PASS z electronDist; smoke win-unpacked PASS, packaged=true. Test instalacji/deinstalacji NOT RUN. Test MBTiles TMS/XYZ na syntetycznej bazie PASS; render mapy bez sieci NOT RUN. Pakiety poprzedzają ostatnie zmiany offline, wymagają przebudowy.
- Aktualizacja media/backup: 14 Vitest, 10 tooling i 5 baza/pliki PASS; build PASS. Przypadki: deduplikacja plików po SHA-256, odtworzenie obrazu po ponownym otwarciu SQLite, uszkodzenie pliku, niebezpieczna ścieżka, błędne współrzędne/ID, brak miejsca bez utraty poprzednich danych.

Kontynuacja SQLite: verify PASS (12 Vitest + 10 tooling + 2 SQLite). Testy bazy obejmują zamknięcie i ponowne otwarcie pliku, odrzucanie nieznanych kluczy/uszkodzonego JSON i rollback wsadu. Testy migracji obejmują kopię, pierwszeństwo istniejącej bazy i błąd przed zapisem. Smoke Electron potwierdza sqliteReadable i invalidKeyRejected. Pełny restart procesu z tą samą biblioteką i testy dużych zbiorów pozostają NOT RUN.

- `npm run verify`: PASS (9 testów aplikacji, 10 tooling, typecheck/build).
- Electron 44.9.0 `--smoke-test`: PASS, raport `reports/desktop-smoke.json`; dostępny izolowany mostek, brak `window.require`.
- Screenshot: `reports/desktop-smoke.png`. Kontrola wyglądu, interakcji okna, złego nadawcy IPC i instalatora pozostaje UNVERIFIED.
# Aktualny dowód pakowania Windows — 2026-10-17

- Commit: `9c4f45b`.
- `npm run package:windows`: PASS; NSIS i portable utworzone.
- `win-unpacked --smoke-test --offline-smoke-test`: PASS; `packaged=true`, SQLite, CSP, izolacja IPC i 24 lokalne kafelki.
- NSIS w izolowanym katalogu: instalacja PASS, smoke zainstalowanego programu PASS, deinstalacja PASS; brak pliku programu po odinstalowaniu.
- Portable: uruchomienie `Prezent-Mapy-Portable-1.3.1-x64.exe --smoke-test --offline-smoke-test` PASS; raport smoke zawiera `packaged=true` i 24 lokalne kafelki.
- SHA-256: NSIS `93E7D26DF57B5FAAC0BF48D4EDF7194D30F25A3408E2AC3EEA4386A35BFF0AF3`; portable `B523E459C3CF9F7914DC1D5D3EF78265263FBC2D65860E4E102328E53A083C33`.

# Weryfikacja rozszerzenia biblioteki / TV / map 2026-10-17

- 21 Vitest (w tym dwie regresje usuwania albumu), 10 tooling i 9 backend: PASS.
- Electron `--smoke-test --offline-smoke-test --library-actions-smoke-test`: PASS, `bulkDeletionPersisted=true`, `albumDeletedPhotosPreserved=true`. Wyłącznie izolowany profil testowy.
- Electron `--smoke-test --map-layers-smoke-test`: PASS, Nocny 24 / Dzień 24 / Kolor-Teren 21 kafelków o szerokości minimum 256; zrzut `reports/desktop-smoke.png` obejrzany.
- Skan SSDP LAN: 0 urządzeń, brak błędu. Fizyczny TV i przesyłanie pokazu UNVERIFIED.
- Computer Use: okno wykryte, przechwycenie `FrameArrived timed out`; testy klikane pluginem NOT RUN.
- Pakowanie do `release-current`: NSIS i portable PASS. Nowy win-unpacked w izolowanym profilu: `packaged=true`, `bulkDeletionPersisted=true`, `albumDeletedPhotosPreserved=true`, 24 kafelki MBTiles. Fizyczna instalacja tej iteracji NOT RUN; poprzedni instalator przetestowano osobno.
# Fundament biblioteki filmów — Etap 1

- `tests/video-library.test.cjs` sprawdza import MP4/WebM, sygnaturę kontenera, duplikat SHA-256, brak Base64, ponowne otwarcie SQLite i odrzucenie nieznanego identyfikatora.
- Import zapisuje plik w lokalnym katalogu `videos/`, a SQLite przechowuje wyłącznie metadane i ścieżkę względną.
- Odtwarzanie używa bezpiecznego protokołu `prezent-video://local/<id>` oraz natywnego elementu `<video>`; protokół obsługuje odpowiedzi HTTP Range dla przewijania.
- Rzeczywisty smoke Electron na Windows z próbkami H.264/AAC, VP8/Opus i VP9/Opus potwierdził metadane obrazu, dekodowanie, postęp czasu i seek. Raport lokalny: `.test-tools/electron-video-smoke.cjs` (narzędzia i próbki są poza repozytorium).
- Wyjście dźwięku z głośników nie jest wiarygodnie mierzalne w bezgłowym smoke teście: `UNVERIFIED`; wymagany jest ręczny test głośności na Windows.
