# DEFINITION OF DONE — Prezent Mapy (Windows)

Ten dokument dotyczy **działającej aplikacji Electron dla Windows 10/11**, a nie wyłącznie podglądu React/Vite. Status DONE musi wynikać z kodu, uruchomionych testów i dowodów w `docs/FEATURE_MATRIX.md` / `TESTING.md`.

## 1. Jedna funkcja / poprawka
- [ ] Istnieje identyfikator zadania, opis zachowania i mierzalne kryteria akceptacji; określony jest wpływ na obecne dane i UI.
- [ ] Implementacja działa w docelowym środowisku, nie stanowi mocka, atrap ani demonstracyjnych przełączników; nie psuje zatwierdzonego UI.
- [ ] Obsłużono prawidłową ścieżkę, błędne dane, brak dostępu do dysku, anulowanie, brak zasobów i możliwy restart.
- [ ] Dodano właściwe testy jednostkowe, integracyjne i/lub Electron UI; każdy odtworzony błąd ma test regresyjny, jeśli technicznie wykonalny.
- [ ] `npm run verify` zakończyło się kodem 0; gdy zmiana dotyka trwałości, wykonano test odczytu po zamknięciu/ponownym uruchomieniu.
- [ ] W razie zmian w plikach, SQLite, IPC, mapach offline, LAN lub trybie TV przeprowadzono adekwatny test środowiskowy albo jawnie oznaczono brak możliwości jako UNVERIFIED/BLOCKED.
- [ ] Stan DONE/PARTIAL/BLOCKED oraz dowody aktualizowane są w `TASKS.md`, `PROGRESS.md`, `docs/FEATURE_MATRIX.md` i `TESTING.md`; zmianę zachowania lub wersji odnotowano w `CHANGELOG.md`.

## 2. Dane użytkownika, zgodność i bezpieczeństwo
- [ ] Oryginalne zdjęcia/filmy nie są usuwane ani modyfikowane bez świadomej zgody. Testy operacji destrukcyjnych działają w izolowanym katalogu.
- [ ] Migracja jest poprzedzona kopią zapasową; sprawdzono starsze formaty, integralność, rollback i przywrócenie.
- [ ] `.prezent` prawidłowo przenosi zadeklarowany zakres danych. „Pełny backup” oznacza też odtworzenie oryginalnych mediów, a nie samych ścieżek i metadanych.
- [ ] `contextIsolation`, sandbox, CSP, ograniczony preload, nadawca IPC, kontrola ścieżek, zewnętrznych URL-i i uprawnień nie zostały osłabione.
- [x] Nie wprowadzono nieuzasadnionej telemetrii ani publikowania prywatnych zdjęć, filmów, GPS czy baz; casting udostępnia tylko wybrane medium w prywatnej sieci LAN.
- [ ] Zmiany w kodzie, schemacie i testach nie psują używanej wersji Windows ani podglądu Vite w zakresie deklarowanej kompatybilności.

## 3. Zdjęcia i filmy — wymagania szczególne
- [ ] Filmy są traktowane jako **planowane rozszerzenie** do czasu zaakceptowania zakresu i wykonania implementacji. Nie zaliczaj planu jako funkcji DONE.
- [ ] Duże pliki wideo pozostają na dysku; nie ładuj ich w całości do JSON, SQLite, RAM renderer ani Base64.
- [ ] Każdy deklarowany format/kodek został sprawdzony na właściwym Electron/Windows; brak kompatybilności wyświetla czytelny błąd.
- [ ] Import, miniatury, albumy, GPS, mapa, odtwarzacz, mieszany pokaz, backup, restart i migracja są osobno weryfikowane, gdy wejdą do zatwierdzonego zakresu wydania.
- [ ] Stare fotografie, albumy, podróże i kopie `.prezent` pozostają dostępne po migracji.

## 4. Ukończenie wydania Windows
- [ ] Zakres konkretnej wersji został zatwierdzony i jest zamrożony. Wszystkie obowiązkowe zadania mają status DONE; P0 BLOCKED wyklucza stabilne wydanie.
- [ ] Wykonano czyste `npm ci`, `npm run verify`, odpowiednie testy Electron/E2E, instalacji, deinstalacji, portable, aktualizacji oraz zachowania biblioteki.
- [ ] Zbudowano aktualne instalatory NSIS i portable, sprawdzono pliki, numery wersji, uruchomienie i SHA-256.
- [ ] `npm run release:check` jest zielone na podstawie **realnych dowodów**. Aktualna celowa blokada w tym skrypcie nie może być obchodzona przez sztuczne ustawienie ready=true.
- [ ] Udokumentowano testy na Windows 10/11 oraz monitorze/TV, o ile należą do zakresu. Brak dostępnego sprzętu oznacza UNVERIFIED, nie PASS.
- [ ] CHANGELOG, dokumentacja instalacji, ograniczenia i znane błędy odpowiadają faktycznemu wydaniu; commit/tag/release są spójne.
- [ ] Publikacja do `main` lub GitHub Release następuje po przeglądzie i wymaganym zatwierdzeniu.

## 5. Definicje statusu
- **DONE**: wszystkie wymagane kryteria ukończone i zweryfikowane.
- **PARTIAL**: implementacja istnieje, ale nie spełnia pełnego zakresu.
- **DEMO**: działanie pozorowane lub wyłącznie prezentacyjne.
- **UNVERIFIED**: kod może działać, lecz wymagany test nie został wykonany.
- **BLOCKED**: jawna przeszkoda uniemożliwia ukończenie.
- **TODO**: brak implementacji.
- **REGRESSION**: istniejące działanie pogorszyło się.

Nie zastępuj dowodów testowych procentem postępu, kompilacją web ani opinią agenta.
