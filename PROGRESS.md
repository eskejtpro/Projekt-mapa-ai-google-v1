# PROGRESS.md - Rzeczywisty Stan Postępów Projektu „Prezent Mapy”

## SESSION HANDOFF — Codex 2026-10-17
- Wynik iteracji b5f09d6: pełne verify PASS (21 Vitest + 10 tooling + 9 backend). Nowy `release-current/win-unpacked` smoke PASS z packaged=true, bulkDeletionPersisted=true, albumDeletedPhotosPreserved=true. NSIS i portable w release-current zbudowane PASS. Standardowe pakowanie do release napotkało EPERM od otwartego programu; dodano package:windows:isolated. Wersja 1.3.1; pozostały nieśledzony plik użytkownika. Fizyczny TV/casting nadal otwarte.
- Nowa iteracja: zaznaczanie wielu zdjęć i usuwanie z potwierdzeniem; usuwanie albumu z zachowaniem zdjęć albo wraz ze zdjęciami, atomowo. Runtime potwierdził SQLite po obu operacjach. OSM dzień/noc i Esri Topographic renderują kafelki (24/24/21). SSDP skanuje aktywne IPv4 i ponawia zapytanie; panel pozwala wybrać odbiornik i odświeżyć skan. LAN: 0 urządzeń, casting niezaimplementowany. Poprawiono kolejność wyboru profilu smoke względem blokady instancji. Computer Use capture ponownie timeout; testy renderera wykonane w izolowanym profilu. Pełne verify: 21 Vitest + 10 tooling + 9 backend, build/typecheck PASS przed ostatnią drobną zmianą UI; powtórka w toku.
- Test bezpośredniego runtime Electron ujawnił zepsute obrazki markerów przy blokadzie sieci offline. MapView poprawiono: zewnętrzne URL-e są zastępowane placeholderem, lokalne data URL pozostają widoczne. Typecheck, build i smoke offline PASS; zrzut `reports/desktop-smoke.png` potwierdza poprawę wizualną.
- Ostatnia iteracja: naprawiono atomowość resetu/usuwania demo i czyszczenia stanu map; usunięto fikcyjne 145 MB, a Electron zwraca rzeczywisty rozmiar przeniesionego MBTiles. Dodano blokadę drugiej instancji. Typecheck, 19 testów Vitest, 10 tooling, 9 testów backendowych i build PASS. Zmiany są jeszcze lokalne; następny krok to pełna weryfikacja i commit.
- Aktualne pakiety z commita 9c4f45b: NSIS 131809666 B, SHA-256 `93E7D26DF57B5FAAC0BF48D4EDF7194D30F25A3408E2AC3EEA4386A35BFF0AF3`; portable 131579680 B, SHA-256 `B523E459C3CF9F7914DC1D5D3EF78265263FBC2D65860E4E102328E53A083C33`. Smoke `win-unpacked` PASS (`packaged=true`, CSP, SQLite, izolacja, 24 kafelki offline). NSIS: instalacja PASS, smoke zainstalowanej aplikacji PASS, deinstalacja PASS; test wykonany w izolowanym katalogu `release/installation-smoke-current`, bez danych użytkownika.
- Portable: uruchomienie aktualnego `release/Prezent-Mapy-Portable-1.3.1-x64.exe --smoke-test --offline-smoke-test` PASS; `packaged=true`, CSP/SQLite/izolacja IPC i 24 lokalne kafelki potwierdzone.
- Kopie automatyczne: BackupManager zapisuje atomowe pliki .prezent w userData/backups, sprawdza harmonogram po starcie i co 6 h podczas działania. Respektuje 0=wyłączone i includeThumbnailsInBackup, zgłasza błąd do UI. Test harmonogramu/przenośnego obrazu/miniatur PASS. Ustawienia→Kopie zapasowe ma otwieranie katalogu i opis zakresu. Ręczny eksport również respektuje miniatury. Aktualna kontrola: 19 Vitest + 10 tooling + 9 baza/mapy/TV/backup PASS; dalsze otwarte kryteria w docs/KNOWN_ISSUES.md.
- Walidacja .prezent rozszerzona: poprawne daty, opcjonalne EXIF/pola, enumy i zakresy ustawień oraz odwołania zdjęcie→album→podróż; legacy Prezent wspierane. 19 Vitest + 10 tooling + 8 baza/mapy/TV/remote PASS. Test dwóch procesów Electron PASS: syntetyczne zdjęcie i opis przetrwały nowy proces, reports/desktop-restart.json.
- CSP produkcyjne wdrożone; zbędny zewnętrzny CSS Leaflet usunięty. Smoke offline+remote+preferences PASS z productionCsp/invalidFrameRejected/popupDenied=true. Uszkodzony rekord uruchamia stan odzyskiwania i pozostaje nienadpisany — smoke recovery PASS. Edycja/ulubione/usuwanie stosują zapis przed zmianą UI; nieudana edycja zostawia formularz otwarty.
- Wydajność: cache per operacja MediaStore eliminuje powtarzanie odczytu identycznego pliku. 10 000 metadanych + identyczny PNG 1×1: przed odczyt 12026 ms, po 93–115 ms w dwóch przebiegach; próbka RSS 129 MB po zmianie, nie peak. To nie pomiar rzeczywistych zdjęć/galerii/FPS. Szczegóły docs/PERFORMANCE.md.
- Ustawienia: podłączono czas pokazu, Ken Burns, ambient, PiP, przejścia fade/slide/zoom; sortowanie i lazy/eager galerii; przełącznik odczytu EXIF oraz autocentrowania przy wyborze wyprawy. Mapa filtruje po album.tripId, a etykiety tras/punktów używają textContent. Smoke offline+remote+preferences PASS: 24 kafelki, galleryPreferencesApplied=true, slideshowPreferencesApplied=true, pauza i zmiana slajdu. Pierwszy test wybrał nagłówek galerii; selektor zawężono do pokazu, ponowny wynik PASS. Raport smoke zapisuje RUNNING/FAIL przed testem, więc błąd nie pozostawia starego PASS. Reszta ustawień i pełna macierz pozostają otwarte.
- Aktualna iteracja: realny pilot HTTP uruchamiany na żądanie, lokalny QR i losowy token, 4 dozwolone polecenia, kontrola Host/Origin/adresu LAN, limit żądań i wyłączenie/wygasanie po 2 h. Test HTTP odrzuca obcy token/origin/polecenie. Zintegrowany smoke Electron (offline+remote) PASS: 24 lokalne kafelki, pilot zatrzymał pokaz i zmienił slajd. Telefon fizyczny/casting TV nadal NOT RUN. Serwer lokalny HTTP nieszyfrowany — używać wyłącznie w zaufanej sieci.
- Naprawy biblioteki: import oblicza SHA-256 plików, kolejka nie odrzuca plików tylko przez nazwę/zaokrąglony rozmiar; potwierdzone duplikaty biblioteki wymagają identycznych osadzonych obrazów (hash z obcej kopii nie jest dowodem). Zdjęcia+album zapisują się atomowo; nieudany import nie zamyka modala ani nie pokazuje sukcesu. FileReader obsługuje błąd/anulowanie. Usunięto iframe PiP wysyłający koordynaty; minimapa korzysta wyłącznie z MBTiles, bez pakietu pokazuje współrzędne.
- verify: 14 Vitest + 10 tooling + 8 baza/mapy/TV/remote PASS, build/typecheck PASS. Pakiety Windows nadal sprzed najnowszych funkcji i wymagają przebudowy po stabilizacji. Otwarte: zgodność TV/casting, pełny schemat/relacje kopii, macierz ustawień, wydajność dużych bibliotek i instalator aktualnego HEAD.
- NSIS smoke: instalacja do release/installation-smoke exit 0, zainstalowany program smoke offline exit 0 (packaged=true, SQLite/izolacja/24 lokalne kafelki PASS), odinstalowanie exit 0 i brak pliku programu. Instalatory zachowane. Test nie obejmuje aktualizacji poprzedniej instalacji ani zachowania biblioteki przy odinstalowaniu, bo smoke używa osobnego profilu. Kandydat pakietu poprzedza dodanie TV discovery; przed wydaniem przebudować aktualny HEAD. Aktualne verify PASS: 14 Vitest + 10 tooling + 7 baza/mapy/TV.
- Najnowszy dowód offline: smoke Electron z syntetycznym rastrem MBTiles i blokadą HTTP(S) załadował 24 lokalne kafelki; PASS. Test nie dowodzi dostępności rzeczywistych regionalnych pakietów ani ich licencji.
- TV: wdrożono SSDP MediaRenderer discovery i odświeżanie co 15 s tylko w otwartym panelu; parser PASS, rzeczywisty skan zakończony bez błędu i 0 odpowiedzi. Model TV nadal nieustalony; przesyłanie obrazu i Smart Remote otwarte. Filtr podróży TV korzysta z relacji album.tripId zamiast ID demo.
- Kolejna iteracja: otwieranie rzeczywistego folderu i autostart przez Electron; domyślny autostart wyłączony. Zbudowano kandydat NSIS (131482855 bajtów) i portable (131252861), smoke win-unpacked PASS, packaged=true. Pakiety powstały przed ostatnimi zmianami offline i wymagają przebudowy. Pierwszy build EPERM przy rename; konfiguracja electronDist używa zainstalowanego runtime i build przeszedł. Test instalacji/deinstalacji NOT RUN, podpis wydawcy UNVERIFIED.
- Mapy: usunięto symulowany timer, dodano import własnego rastrowego MBTiles, odczyt lokalny przez protokół prezent-tiles, przełączanie warstwy i blokadę HTTP(S) w trybie offline. Test odczytu TMS/XYZ, brak kafelka i błędny zakres PASS; test renderu offline w Electron nadal NOT RUN. Odłączenie mapy zachowuje plik .removed; zamiana mapy zachowuje .backup. Brak automatycznego pobierania regionów; źródła i licencje pakietów do ustalenia.
- Prywatność: mapa nie wysyła automatycznie współrzędnych do Nominatim; atrybuty pinezki są escapowane. Pełny audyt bezpieczeństwa i duża biblioteka nadal otwarte. Aktualna kontrola: 14 Vitest + 10 tooling + 6 baza/pliki/mapy; pełne verify przed ostatnimi drobnymi zmianami UI PASS.
- Najnowsza iteracja: zdjęcia data:image PNG/JPEG/GIF/WebP zapisują się w userData/photos pod SHA-256; odczyt weryfikuje hash i odtwarza data URL dla UI/eksportu. Import .prezent waliduje rekordy przed atomowym zapisem (SQLite batch / jeden snapshot localStorage). Testy: 14 Vitest + 10 tooling + 5 baza/pliki PASS; build PASS. Otwarte: zdjęcia źródłowe wskazane URL wymagają sieci, wydajność dużych zbiorów, pełne walidowanie enumów ustawień i relacji, pełny test restartu procesu, mapy offline/TV/instalator. Model TV zapytany asynchronicznie.
- Cel: środowisko istniejącej aplikacji przed implementacją Windows; zachowanie UI.
- Wersja: 1.3.1 Desktop Preview; źródło wersji package.json.
- Etap: 0, środowisko i audyt; PARTIAL.
- Branch: work/windows-desktop-foundation; baseline commit 1be0136.
- Aktualne zadanie: ukończenie Windows; powłoka Electron i początkowa integracja SQLite wdrożone. SQLite przechowuje pięć kolekcji JSON w userData/library.sqlite. Migracja zachowuje kopię starej pamięci, zapis wsadu jest transakcyjny. Następny zakres: pliki zdjęć, pełna walidacja .prezent, mapy offline, TV i instalator.
- Ostatni zakończony krok: commit środowiska 57b1587 wysłany na origin/work/windows-desktop-foundation; zdalny Quality run 39005537274 PASS. Następnie commit dokumentacji a4ff5ac wysłany z `[skip ci]`.
- Zweryfikowane rezultaty: npm run verify PASS: 12 testów aplikacji/migracji, 10 tooling, 2 SQLite, typecheck i build. Smoke Electron 44.9.0 PASS: renderer odczytuje SQLite, nieznany klucz odrzucony, window.require niedostępne; reports/desktop-smoke.json. Test SQLite na pliku potwierdził ponowny odczyt po zamknięciu bazy oraz rollback. Pełny audyt interakcji i nadawców IPC pozostaje otwarty.
- Zmiany bieżącej iteracji: skrypty jakości, CI, hooki Git/Codex, skille, rejestr funkcji, testy integracyjne/tooling.
- Plik użytkownika moje instrukcje do projektu.txt pozostaje osobny, nieśledzony.
- Wyniki: 9/9 testów Vitest, 10/10 tooling, build/typecheck, czyste npm ci i npm audit PASS; pokrycie niezmierzone. E0 zamknięte w 80% wag, pozostał dowód hooków klienta.
- Problemy i blokery: docs/KNOWN_ISSUES.md; brak przeglądarki iab i screenshotu; brak dowodu automatycznego uruchomienia hooków. W CLI użyj /hooks do przeglądu zaufania i sprawdź nowe runtime logs po wznowieniu.
- Katalog próby instalacji pozostał w TEMP/prezent-mapy-install-45bb5908c39e4420817df920dc14de3a; jego usunięcie zablokowała automatyczna kontrola, bez szczegółowego powodu. Nie ponawiano kasowania.
- Backup: A:\Prezent Mapy backups\2026-10-17-initialization\google-ai-studio.bundle (bundle verify PASS) i kopia pliku użytkownika.
- Następny krok: bezpieczna powłoka Electron i podpięcie kontrolek okna. Kryteria: okno Windows, izolowany preload, odrzucone nieprawidłowe IPC, zachowany podgląd Vite i npm run verify. Numer kolejnej wersji rozwojowej ustalić przy implementacji.
- Przy utracie kontekstu: zaktualizuj ten handoff, stan Git i dowody, zaproponuj nowy czat i polecenie odczytu PROGRESS/TASKS/FEATURE_MATRIX.

Poniższa tabela i wyniki to historyczne deklaracje AI Studio. Aktualne statusy funkcji są wyłącznie w docs/FEATURE_MATRIX.md; dawne UKOŃCZONE nie oznacza weryfikacji Windows.

Data aktualizacji: **2026-10-17**  
Wersja bieżąca: **1.3.1 (Desktop Preview / Handover to Codex)**  
Stan ogólny: **Stabilny prototyp gotowy do przejęcia przez OpenAI Codex**

---

## Tabela Postępu Modułów

| Moduł | Stan Realizacji | Szczegóły implementacji i weryfikacji |
|---|---|---|
| **Interaktywna mapa świata (Leaflet)** | **UKOŃCZONE** | 6 warstw kafelkowych, klastry pinezek z miniaturami, wyeliminowane konflikty z resetem CSS Tailwind, animowane trasy podróży. |
| **Menu kontekstowe mapy (PPM)** | **UKOŃCZONE** | Kliknięcie prawym przyciskiem myszy otwiera menu z opcją dodania zdjęć, całego katalogu lub wklejenia ze schowka ze współrzędnymi punktu. |
| **Import Drag & Drop na mapę** | **UKOŃCZONE** | Przeciągnięcie plików na mapę przekazuje pliki do `ImportModal`, przypisuje współrzędne geograficzne punktu upuszczenia i chroni przed duplikacją. |
| **Centrum importu fotografii** | **UKOŃCZONE** | 5 trybów: pliki, foldery/podfoldery, wklejanie ze schowka (`Ctrl+V`), bezpośredni URL grafiki oraz 4 gotowe pakiety podróżnicze. |
| **Odczyt metadanych EXIF** | **UKOŃCZONE** | Biblioteka `exifr` wyciąga koordynaty GPS, datę wykonania i aparat. Bezpieczny fallback przy braku danych EXIF. |
| **Bezpieczeństwo DOM** | **UKOŃCZONE** | Usunięto podatności `innerHTML` w `MapView.tsx`. Popupy renderowane przez bezpieczne tworzenie węzłów DOM i `textContent`. |
| **Trwałość danych i ochrona pamięci** | **UKOŃCZONE** | Metody `StorageService` zwracają status zapisu boolean, chronią przed błędem przepełnienia `localStorage` i informują użytkownika. |
| **Galeria i Oś Czasu (Timeline)** | **UKOŃCZONE** | Widok siatki, widok albumów, chronologiczna oś czasu rok po roku, filtry krajów, lat i ulubionych. |
| **Kinowy pokaz slajdów (Ken Burns)** | **UKOŃCZONE** | Płynny zoom/pan Ken Burns, mini-mapa PiP z lokalizacją, ambientowy szum oceanu Web Audio API, pełna obsługa klawiatury. |
| **Panel Ustawień (12 kategorii)** | **UKOŃCZONE** | Motywy ciemny/jasny/systemowy, konfiguracja mapy, klastrowania, sortowania. Oznaczenie opcji integrujących się z Windows. |
| **Paszport i Diagnostyka duplikatów** | **UKOŃCZONE** | Statystyki podróżnicze (kraje, miasta, km) oraz widok wykrywania i usuwania powtórzonych ujęć. |
| **Kopia zapasowa .prezent** | **UKOŃCZONE** | Eksport i import bazy w JSON z opcją anonimizacji współrzędnych GPS. Zweryfikowane testami automatycznymi. |
| **Menedżer Map Offline** | **DEMONSTRACYJNY** | Działający interfejs UI z symulacją postępu pobierania. Rzeczywisty zapis bazy MBTiles do wdrożenia w Electronie. |
| **Tryb TV i Smart Remote QR** | **CZĘŚCIOWY / DEMO** | Tryb prezentacji TV 4K działa; zdalne sterowanie smartfonem przez QR to prototyp wymagający serwera WebSocket w Electronie. |
| **Powłoka Electron dla Windows** | **DO WDROŻENIA (CODEX)**| Zadanie kolejnego etapu: packaging `.exe`, baza SQLite (`better-sqlite3`), integracja z Eksploratorem Windows. |
| **Aplikacja Android** | **PRZYSZŁA WERSJA** | Odroczona do czasu ustabilizowania aplikacji desktopowej Windows 10/11. |

---

## Wyniki Ostatnich Testów Weryfikacyjnych

1. **Analiza statyczna typów (`npm run lint` / `npx tsc --noEmit`)**:
   - Status: **0 błędów**.
2. **Kompilacja produkcyjna (`npm run build`)**:
   - Status: **SUKCES** (utworzono zoptymalizowany pakiet `dist/`).
3. **Testy jednostkowe (`npm test` / `vitest run`)**:
   - Plik: `src/__tests__/services.test.ts`
   - Liczba testów: **6/6 ZDANYCH (100% zielonych)**.
   - Zweryfikowano: `StorageService.getTravelStats`, `StorageService.findDuplicates`, spójność eksportu/importu `.prezent`, heurystykę geokodowania `guessNearestLocation` i konwersję pakietów `travelPacks`.
