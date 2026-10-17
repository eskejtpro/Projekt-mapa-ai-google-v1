# HANDOFF_CODEX.md - Dokument Przekazania Projektu „Prezent Mapy” do OpenAI Codex

> Aktualny handoff sesji: PROGRESS.md / SESSION HANDOFF. Aktualne funkcje: docs/FEATURE_MATRIX.md; testy: TESTING.md. Poniższy dokument to historyczne przekazanie i projekt architektury AI Studio; jego deklaracje 100%, 4K, offline i bezpłatnych kafelków nie są świeżymi dowodami. Nie pobieraj masowo kafelków bez sprawdzenia licencji dostawcy.

**Projekt**: Prezent Mapy  
BackupManager: harmonogram lokalny wdrożony, test przenośnego obrazu i miniatur PASS. Aktualna suma verify: 38 testów. Pozostałe kryteria przejrzyj w zaktualizowanym docs/KNOWN_ISSUES.md; projekt nie ma jeszcze zamkniętego wydania.
Aktualne dowody: 37 testów verify PASS, restart dwóch procesów PASS, smoke CSP/offline/pilot/preferencje oraz odzyskiwanie PASS. Następne otwarte obszary: reszta ustawień/backupy, atomowość reset/czyszczenie, import rzeczywistych EXIF i nowe pakiety; casting TV pozostaje niezaimplementowany. Benchmark wyłącznie syntetyczny opisany w docs/PERFORMANCE.md.
Ustawienia podstawowe podłączone; smoke preferences+offline+remote PASS. Kolejne otwarte obszary: pełny schemat .prezent, pozostałe preferencje, testy importu plików/EXIF, casting fizycznego TV i pakiety aktualnej wersji.
Pilot QR/HTTP działa w teście Electron: pauza i zmiana slajdu PASS. 32 testy + verify PASS; zdjęcia+album importują się atomowo, PiP lokalne. Fizyczny telefon/TV/casting i aktualne pakiety wymagają dalszej pracy. Serwer uruchamia użytkownik w panelu TV, token nie jest zapisywany w raportach.
NSIS: test instalacji/startu offline/deinstalacji PASS w katalogu testowym. Pakiet poprzedza TV discovery; aktualizację/zachowanie danych i portable trzeba sprawdzić oddzielnie. Następny zakres to pilot TV, pełna walidacja/duplikaty i pozostałe kryteria macierzy.
Kontynuacja: offline smoke renderuje 24 lokalne kafelki; dodano tv-discovery.cjs, parser i listę odświeżaną w panelu. Rzeczywisty skan LAN: 0 odpowiedzi, casting i pilot nadal otwarte. Trwający build package:windows uruchomiono przed zmianami TV; jego pakiety wymagają późniejszej przebudowy przed wydaniem.
Nowy stan: kandydat NSIS/portable zbudowany i smoke packaged PASS; wymaga przebudowy po zmianach offline. Czytnik/import MBTiles podłączony, runtime render offline otwarty. Pełna lista pozostałych kryteriów w PROGRESS.md.
Ostatnia iteracja: media-store.cjs, backup-validation.ts, atomowy snapshot Vite; szczegóły i nierozstrzygnięty model TV w PROGRESS.md. Testy 29/29 PASS.
Aktualna iteracja: rozpoczęta implementacja `electron/main.cjs` i `electron/preload.cjs`, polecenie `npm run desktop`; stan testów w PROGRESS.md.
Kontynuacja: `electron/database.cjs` i `src/services/persistence.ts` realizują SQLite oraz migrację. 24 testy i smoke SQLite w Electron PASS. Pliki zdjęć i pełny import .prezent do dokończenia.
**Repozytorium GitHub**: `https://github.com/eskejtpro/Projekt-mapa-ai-google-v1`  
**Wersja przekazania**: 1.3.1 (Desktop Preview & Architecture Frozen)  
**Platforma docelowa**: Windows 10 / Windows 11 Desktop (x64)  
**Autor przekazania**: Senior Software Architect & Staff Engineer (AI Studio)  
**Odbiorca**: OpenAI Codex / Zespół Inżynierski Desktop Windows  

---

## 1. Opis Całego Programu

„Prezent Mapy” to elegancka, zorientowana na prywatność aplikacja dla systemów Windows 10/11, stworzona do prezentowania rodzinnych wspomnień, fotografii i wakacyjnych podróży na interaktywnej mapie świata.

Głównym założeniem programu jest zasada **Offline-First**:
- Żadne zdjęcia użytkownika, współrzędne geograficzne ani prywatne notatki nie są wysyłane do chmury.
- Zdjęcia przechowywane są lokalnie na dysku twardym użytkownika.
- Aplikacja łączy w sobie cechy interaktywnego atlasu geograficznego, menedżera galerii zdjęć, paszportu statystyk podróżniczych oraz kinowego odtwarzacza wspomnień dostosowanego do ekranów komputerowych i telewizorów 4K w salonie.

---

## 2. Architektura i Technologie

Projekt wykorzystuje nowoczesny, lekki i stabilny stos technologiczny z wyraźną separacją warstwy prezentacji od środowiska wykonawczego:

- **Warstwa Prezentacji (UI)**: React 19, TypeScript, Tailwind CSS 4, Lucide React Icons.
- **Silnik Mapowy**: Leaflet 1.9 z customowymi klastrami DIV i 6 warstwami kafelkowymi (CartoDB Dark Matter, Positron, Esri World Imagery, Esri World Street Map, OpenStreetMap Voyager, OSM Standard).
- **Odczyt Metadanych**: `exifr` (automatyczne wyciąganie EXIF GPS, daty wykonania, parametrów ekspozycji i aparatu).
- **Silnik Dźwięku**: Web Audio API (proceduralna synteza uspokajającego szumu fal morskich, 100% offline, brak zewnętrznych plików audio).
- **Zarządzanie Stanem**: Czysta architektura komponentowa z centralnym serwisem `StorageService`, reaktywnymi hookami i immutability.
- **Trwałość Danych (obecna)**: `localStorage` z zabezpieczeniem przepełnienia pamięci i zrzutem do pliku archiwalnego `.prezent` (JSON).
- **Docelowy Runtime Windows**: Electron (z włączoną izolacją kontekstu i bezpiecznym mostkiem IPC) + SQLite (`better-sqlite3`).

---

## 3. Struktura Najważniejszych Plików

```
/app/applet/
├── .codex/
│   └── config.toml                  # Konfiguracja środowiska i komend dla Codexa
├── .agents/skills/project-continuity/
│   └── SKILL.md                     # Instrukcja ciągłości architektury
├── src/
│   ├── components/
│   │   ├── MapView.tsx              # Mapa świata Leaflet, klastry, trasy, menu PPM
│   │   ├── GalleryView.tsx          # Galeria: Siatka, Albumy, Oś Czasu (Timeline)
│   │   ├── ImportModal.tsx          # Centrum importu: pliki, foldery, schowek, URL, pakiety
│   │   ├── SlideshowModal.tsx       # Kinowy odtwarzacz Ken Burns, PiP mini-mapa, audio
│   │   ├── SettingsView.tsx         # 12-kategorialny panel ustawień (styl Untitled UI)
│   │   ├── SidebarDock.tsx          # Wąski boczny dock nawigacyjny (styl Mica)
│   │   ├── WindowsTitleBar.tsx      # Pasek tytułowy Windows 11 z kontrolkami okna
│   │   ├── StatsView.tsx            # Paszport podróżnika, zliczanie km, krajów i miast
│   │   ├── DuplicatesView.tsx       # Narzędzie wykrywania i usuwania duplikatów
│   │   ├── TvModeModal.tsx          # Przygotowanie prezentacji na telewizorze 4K
│   │   ├── OfflineMapsModal.tsx     # Menedżer pakietów map regionalnych (prototyp)
│   │   ├── PhotoDetailModal.tsx     # Okno szczegółów i edycji metadanych zdjęcia
│   │   ├── ShortcutsModal.tsx       # Ściągawka skrótów klawiaturowych i myszy
│   │   └── AboutModal.tsx           # Informacje o programie i licencji
│   ├── services/
│   │   ├── storage.ts               # StorageService: obsługa bazy, limity, eksport .prezent
│   │   ├── geoService.ts            # Odwrotne geokodowanie, baza miast, obsługa schowka
│   │   └── audioAmbient.ts          # Proceduralna synteza audio (Web Audio API)
│   ├── data/
│   │   ├── demoMemories.ts          # Początkowe dane demonstracyjne
│   │   └── travelPacks.ts           # Gotowe pakiety (Tatry, Włochy, Francja, Dalmacja)
│   ├── types/
│   │   └── travel.ts                # Główne interfejsy TypeScript (Photo, Album, Trip, Settings)
│   ├── __tests__/
│   │   └── services.test.ts         # Pakiet testów jednostkowych w Vitest (100% zielone)
│   ├── App.tsx                      # Główny stan aplikacji i orkiestracja widoków
│   ├── main.tsx                     # Punkt wejścia React
│   └── index.css                    # Import Tailwind CSS i definicje klastrów
├── index.html                       # Entry point HTML (język pl, metadane)
├── package.json                     # Zależności i skrypty (dev, build, lint, test)
├── tsconfig.json                    # Konfiguracja kompilatora TypeScript
├── vite.config.ts                   # Konfiguracja bundlera Vite
├── AGENTS.md                        # Wytyczne roli inżynierskiej dla projektu
├── ARCHITECTURE.md                  # Szczegółowa specyfikacja architektoniczna
├── DEFINITION_OF_DONE.md            # Kryteria jakości i ukończenia zadań
├── REQUIREMENTS.md                  # Rejestr wymagań funkcjonalnych i stanów
├── ROADMAP.md                       # Harmonogram i etapy wdrożenia
├── TASKS.md                         # Tabela zadań i ich statusów
├── PROGRESS.md                      # Rzetelne sprawozdanie z postępów
├── TESTING.md                       # Procedury testowe i logi weryfikacji
└── CHANGELOG.md                     # Historia zmian
```

---

## 4. Lista Rzeczywiście Działających Funkcji

Poniższe moduły są w 100% funkcjonalne w kodzie i zweryfikowane w interaktywnym podglądzie:
1. **Interaktywna mapa świata Leaflet**: obsługa powiększania, przesuwania, 6 warstw kafelkowych, rysowanie animowanych tras podróży z dystansem w km.
2. **Klastry pinezek**: automatyczne grupowanie fotografii według współrzędnych z miniaturami i licznikami.
3. **Bezpieczne popupy na mapie**: renderowanie tytułów, lokalizacji, dat i opisów za pomocą bezpiecznych węzłów DOM (brak podatności XSS).
4. **Menu kontekstowe pod prawym przyciskiem myszy (PPM)**: kliknięcie w dowolny punkt mapy pobiera współrzędne geograficzne i pozwala otworzyć import przypisany do tej lokalizacji lub wycentrować widok.
5. **Drag & Drop na mapę**: upuszczenie plików na mapę otwiera centrum importu z zachowaniem plików, współrzędnych i metadanych EXIF.
6. **Centrum importu fotografii**:
   - Wybór plików z dysku.
   - Wybór całego katalogu z podfolderami.
   - Wklejanie ze schowka systemowego (`Ctrl + V`).
   - Import z adresu URL z podglądem na żywo.
   - Pakiety gotowych fotografii podróżniczych (Tatry, Włochy, Francja, Chorwacja).
   - Ochrona przed duplikacją plików w kolejce oraz w głównej bibliotece.
7. **Odczyt metadanych EXIF GPS**: wyciąganie szerokości/długości geograficznej, daty wykonania oraz modelu aparatu przez `exifr`.
8. **Galeria i Oś Czasu (Timeline)**: widok siatki kafelków, widok kart albumów oraz chronologiczna oś czasu podzielona na lata i wyprawy.
9. **Kinowy pokaz slajdów (Ken Burns)**: tryb pełnoekranowy, płynne zbliżanie kadru, mini-mapa PiP ze wskazaniem bieżącego zdjęcia, ambientowy szum oceanu (Web Audio API), pełna obsługa klawiaturą (Spacja, Strzałki, F11, Esc).
10. **Paszport podróżnika i detekcja duplikatów**: kalkulator statystyk przebytych kilometrów i odwiedzonych miast/krajów oraz narzędzie czyszczenia powtórzonych ujęć.
11. **Eksport i import `.prezent`**: pełna serializacja/deserializacja bazy do formatu JSON z opcją anonimizacji współrzędnych GPS.
12. **Zabezpieczenie limitu pamięci**: `StorageService` wyłapuje błędy `localStorage` i wyświetla powiadomienie Windows Toast.

---

## 5. Lista Funkcji Demonstracyjnych / Prototypowych

Te funkcje posiadają gotowy, dopracowany interfejs UI w podglądzie przeglądarkowym, lecz ich pełne działanie wymaga środowiska Electron:
1. **Menedżer Map Offline (`OfflineMapsModal.tsx`)**: interfejs wyboru regionów i pasek postępu pobierania działają jako symulacja. Pełny zapis kafelków w plikach MBTiles wymaga wdrożenia w Electronie.
2. **Pilot Smart Remote QR (`TvModeModal.tsx`)**: interfejs z kodem QR jest prototypem. Bezprzewodowe sterowanie ze smartfona w sieci domowej wymaga uruchomienia lokalnego serwera WebSocket w Electronie.
3. **Autostart z Windows (`SettingsView.tsx`)**: przełącznik w ustawieniach zapisuje preferencję, ale rzeczywisty wpis w rejestrze `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` zostanie dodany w Electronie.
4. **Otwieranie folderu w Eksploratorze Windows**: przycisk kopiuje ścieżkę do schowka, a w Electronie wywoła `shell.showItemInFolder()`.

---

## 6. Wszystkie Znane Ograniczenia i Kwestie do Uwzględnienia

1. **Limit pamięci `localStorage` w przeglądarce**: Standardowy limit przeglądarki wynosi ok. 5MB. Przy dodaniu kilkudziesięciu zdjęć w base64 limit ten zostaje osiągnięty. W przeglądarce użytkownik otrzymuje ostrzeżenie, natomiast docelowym rozwiązaniem problemu jest SQLite w Electronie.
2. **Brak dostępu do natywnego systemu plików w Web Preview**: Przeglądarka z powodów bezpieczeństwa nie udostępnia pełnych ścieżek bezwzględnych (`C:\...`) przy standardowym `<input type="file">`. Właściwość `localFilePath` pozostaje `undefined` do momentu uruchomienia w powłoce Electron.
3. **Dźwięk ambient w pokazie slajdów**: Przeglądarki wymagają uprzedniej interakcji użytkownika (kliknięcia), aby Web Audio API mogło wygenerować dźwięk (AudioContext autoplay policy).

---

## 7. Brakujące Integracje Windows (Zadania dla Codexa)

1. **Powłoka Electron**: Konfiguracja procesu głównego (`electron/main.ts`) z bezramkowym oknem (`frame: false, titleBarStyle: 'hidden'`).
2. **Integracja z paskiem tytułowym**: Podpięcie istniejącego komponentu `WindowsTitleBar.tsx` pod natywne IPC okna: `minimize`, `maximize`/`unmaximize`, `close`.
3. **Natywne okna dialogowe**: Podpięcie `dialog.showOpenDialog` pod przyciski wyboru folderów i importu.
4. **Otwieranie Eksploratora Windows**: Podpięcie `shell.openPath()` oraz `shell.showItemInFolder()`.
5. **Autostart Windows**: Wykorzystanie biblioteki `auto-launch` lub natywnego rejestru Windows.

---

## 8. Plan Wdrożenia Electron

Kroki wdrożeniowe dla OpenAI Codex:
1. Zainstalować `electron`, `electron-builder` i `@types/node` w `devDependencies`.
2. Dodać katalog `electron/` w katalogu głównym:
   - `electron/main.ts`: Utworzenie `BrowserWindow`, konfiguracja protokołu `photo://` dla lokalnych plików, obsługa zdarzeń okna i IPC.
   - `electron/preload.ts`: Wystawienie bezpiecznego `contextBridge.exposeInMainWorld('electronAPI', { ... })`.
3. Skonfigurować skrypt w `package.json`:
   - `"electron:dev": "concurrently \"vite\" \"electron .\""`
   - `"electron:build": "vite build && electron-builder"`
4. Zachować kompatybilność hybrydową: `window.electronAPI ? window.electronAPI.doSomething() : fallbackWeb()`, aby kod nadal działał w przeglądarce.

---

## 9. Plan Migracji Danych do SQLite

1. Zainstalować `better-sqlite3` w procesie głównym Electrona (nie w rendererze React!).
2. Utworzyć bazę danych w `%APPDATA%/PrezentMapy/prezent.db`.
3. Schemat tabel:
   - `photos` (id TEXT PRIMARY KEY, url TEXT, title TEXT, date TEXT, lat REAL, lng REAL, city TEXT, country TEXT, album_id TEXT, notes TEXT, is_favorite INTEGER, camera_info TEXT, local_path TEXT)
   - `albums` (id TEXT PRIMARY KEY, name TEXT, description TEXT, cover_url TEXT, year INTEGER, country TEXT)
   - `trips` (id TEXT PRIMARY KEY, title TEXT, year INTEGER, route_points TEXT, distance_km REAL, color TEXT)
   - `settings` (key TEXT PRIMARY KEY, value TEXT)
4. Udostępnić w `preload.ts` metody:
   - `window.electronAPI.getPhotos()`
   - `window.electronAPI.savePhoto(photo)`
   - `window.electronAPI.deletePhoto(id)`
5. W `src/services/storage.ts` podmienić implementację na wywołania `window.electronAPI` z zachowaniem fallbacku na `localStorage` w trybie web.

---

## 10. Plan Obsługi Lokalnych Folderów i Fotografii

1. Przy imporcie katalogu w Electronie, proces główny skanuje rekurencyjnie pliki `.jpg`, `.jpeg`, `.png`, `.webp`.
2. Oryginalne pliki pozostają w lokalizacji wybranej przez użytkownika (np. `C:\Users\Nazwa\Obrazy\Prezent-Wspomnienia`).
3. Miniatury (`thumbnailUrl`) generowane są w tle w folderze `%APPDATA%/PrezentMapy/thumbnails/` (np. przez `sharp`), co zapewnia błyskawiczne przewijanie galerii nawet przy 100 000 zdjęć.
4. Pełnowymiarowe fotografie serwowane są za pomocą bezpiecznego protokołu `photo://path/to/image.jpg`.

---

## 11. Plan Map Offline

1. Pobieranie kafelków w wybranym zoomie (np. zoom 0–14 dla Polski, Włoch itp.) do pliku bazy SQLite w formacie **MBTiles**.
2. W procesie głównym Electrona zaimplementować prosty handler protokołu kafelków `mbtiles://` lub lokalny serwer Express/Node serwujący kafelki z pliku `.mbtiles`.
3. W `MapView.tsx` warstwa kafelków w trybie offline wskazuje na `mbtiles://{z}/{x}/{y}.png`.

---

## 12. Plan Prezentacji na Telewizorze (Salon 4K)

1. Pokaz slajdów w `SlideshowModal.tsx` jest już w 100% zoptymalizowany pod pełny ekran i wysoką rozdzielczość 4K.
2. Zdalne sterowanie (Smart Remote):
   - W procesie głównym Electrona uruchomić lekki serwer HTTP i WebSocket na losowym wolnym porcie lokalnym (np. 8989).
   - Generować dynamiczny kod QR prowadzący do `http://<IP_KOMPUTERA>:8989/remote`.
   - Serwer serwuje minimalistyczną stronę mobilną z przyciskami Poprzednie / Następne / Pauza / Info.
   - Po naciśnięciu przycisku na telefonie, serwer przesyła zdarzenie przez WebSocket do Electrona, który emuluje naciśnięcie klawisza lub wywołuje metodę w React.

---

## 13. Wymagania Bezpieczeństwa

1. **Context Isolation**: W Electronie zawsze `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
2. **CSP (Content Security Policy)**: Ścisła polityka zezwalająca wyłącznie na lokalne assety i zaufane domeny kafelków mapy (CartoDB, Esri, OSM).
3. **Brak XSS**: Kontynuacja wprowadzonej w wersji 1.3.1 zasady bezpiecznego tworzenia węzłów DOM bez `innerHTML`.
4. **Prywatność EXIF**: Zachowanie opcji wymazywania koordynatów GPS przy eksporcie archiwum dla znajomych (`stripGpsOnExport`).

---

## 14. Zalecane Testy

Przed każdym wydaniem instalatora Windows należy przeprowadzić:
1. `npm test` – uruchomienie testów jednostkowych Vitest (zgodność logiki biznesowej, statystyk, duplikatów i formatu `.prezent`).
2. `npm run lint` – weryfikacja statyczna typów TypeScript (`tsc --noEmit`).
3. `npm run build` – test czystego budowania pakietu produkcyjnego.
4. Testy integracyjne Electrona:
   - Sprawdzenie minimalizacji, maksymalizacji i zamykania okna przez `WindowsTitleBar`.
   - Test przeciągnięcia 500 zdjęć z pulpitu Windows na mapę.
   - Test działania aplikacji bez aktywnego połączenia internetowego (tryb offline).

---

## 15. Instrukcja Budowania Aplikacji

### Środowisko Web (Vite):
```bash
npm install
npm run dev      # Uruchomienie na porcie 3000
npm run build    # Budowa paczki produkcyjnej w /dist
npm test         # Uruchomienie 6 testów jednostkowych Vitest
npm run lint     # Weryfikacja typów TypeScript
```

### Docelowe Budowanie w Electronie (po dodaniu konfiguracji przez Codexa):
```bash
npm run electron:dev     # Uruchomienie deweloperskie z oknem Electron
npm run electron:build   # Generowanie instalatora Windows NSIS (.exe) w folderze /release
```

---

## 16. Kolejność Następnych Etapów dla OpenAI Codex

1. **Krok 1 (Baza i powłoka)**: Zainstalować Electrona, dodać `electron/main.ts` i `electron/preload.ts`, podłączyć kontrolki `WindowsTitleBar.tsx` pod zdarzenia okna.
2. **Krok 2 (SQLite)**: Dodać `better-sqlite3` w procesie głównym, zaimplementować mostek IPC i podłączyć `StorageService` do SQLite.
3. **Krok 3 (System plików)**: Wdrożyć natywne okno wyboru folderu (`dialog.showOpenDialog`) oraz protokół `photo://` dla lokalnych grafik.
4. **Krok 4 (Mapy offline & Smart Remote)**: Wdrożyć obsługę plików MBTiles oraz lekki serwer WebSocket dla pilota na smartfonie.
5. **Krok 5 (Packaging)**: Skonfigurować `electron-builder` i wygenerować instalator Windows 10/11 (`Prezent-Mapy-Setup-1.3.1.exe`).

**ZASADA NACZELNA**: Wszystkie powyższe kroki należy realizować bez niszczenia i bez przebudowywania istniejącego, ustabilizowanego interfejsu React!
