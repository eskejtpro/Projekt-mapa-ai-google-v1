# TESTING.md - Procedury Testowe i Raport Weryfikacji

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
