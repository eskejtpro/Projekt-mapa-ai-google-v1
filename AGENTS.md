# AGENTS.md — Prezent Mapy (Codex, Windows 10/11)

## Cel i bieżący stan
- Rozwijaj ISTNIEJĄCĄ aplikację desktopową „Prezent Mapy”; nie twórz nowego projektu ani nie przywracaj starszego prototypu AI Studio.
- Źródło wersji: `package.json`. Źródło prawdy o działających funkcjach: **kod + świeże testy + `docs/FEATURE_MATRIX.md`**, a nie historyczne wpisy „UKOŃCZONE”.
- Stos: React 19, TypeScript, Vite, Tailwind CSS, Leaflet/markercluster, Electron, Node.js `node:sqlite`, lokalne pliki, electron-builder (NSIS/portable).
- Electron/SQLite/MBTiles/pilot LAN są już częściowo wdrożone. Nie nadpisuj ich samym UI z AI Studio.
- Lokalna biblioteka **zdjęć i filmów** obejmuje import MP4/WebM, galerię, albumy i mapę GPS. Zakres potwierdzony i ograniczenia: `docs/FEATURE_MATRIX.md` oraz `docs/VIDEO_GPS_AND_BACKUP.md`; mieszany pokaz i TV są kolejnymi etapami.
- Priorytetem jest stabilny program Windows 10/11, pełne wymagane funkcje i przetestowany instalator. Android pozostaje poza bieżącym zakresem.

## Początek każdej sesji i zadania
1. Sprawdź `git status --short --branch`, `git log -1 --oneline`, gałąź i aktualne wymagania. Nie zakładaj czystego drzewa.
2. Przy rozpoczęciu większego zadania odczytaj `PROGRESS.md` (SESSION HANDOFF) i właściwą sekcję `TASKS.md`; `docs/FEATURE_MATRIX.md`, `docs/KNOWN_ISSUES.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`, `TESTING.md` czytaj tylko, gdy są istotne dla zmiany. Przy drobnej poprawce nie ładuj wszystkich dokumentów.
3. Wybierz najmniejsze niezablokowane zadanie ze zdefiniowanymi kryteriami akceptacji, zależnościami i testami.
4. Włącz odpowiedni skill z `.agents/skills/` (w szczególności project-continuity, feature-development, test-automation, windows-electron, photo-library, video-library, maps-offline).
5. Nie kopiuj pełnych dokumentów do kontekstu bez potrzeby; odczytuj tylko sekcje właściwe dla zadania.

## Stałe zasady produktu
- Zachowuj zatwierdzony wygląd (ciemny motyw, bursztynowe akcenty, lewy dock, mapa, galeria, albumy, pokaz slajdów). Każdą istotną zmianę UI uzasadnij i sprawdź na żywym ekranie, jeśli runtime jest dostępny.
- Renderer React nie otrzymuje nieograniczonego Node.js. Dostęp do SQLite, mediów, okien Windows, LAN i systemu plików tylko przez minimalne, walidowane API preload/IPC.
- W Electron utrzymuj `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, CSP i walidację nadawcy/argumentów IPC. Nie używaj surowego HTML z niezaufanymi danymi.
- Nie usuwaj, przenoś ani nie modyfikuj oryginalnych mediów bez jawnego potwierdzenia użytkownika. Operacje destrukcyjne: backup, potwierdzenie, rollback i test.
- Nie wysyłaj prywatnych zdjęć, filmów, opisów i baz do chmur, logów ani repo. Kafelki online i LAN wymagają oddzielnej oceny prywatności; nie obiecuj „zera transmisji” podczas ich używania.
- Działający podgląd Vite zachowaj tam, gdzie to rozsądne; **Windows Electron jest produktem docelowym**. Nie usuwaj kodu desktopowego dlatego, że nie działa w przeglądarce.

## Wspólna biblioteka zdjęć i filmów — reguły rozwoju
- Projektuj kompatybilny model typowanych mediów (rodzaj, metadane, lokalizacja, album, podróż, miniatura), zachowując migrację wcześniejszych zdjęć i kompatybilność `.prezent`.
- Filmy mogą być dodawane do albumów, podróży, mapy i mieszanego pokazu; **najpierw ustal obsługiwane formaty/kodeki w użytej wersji Electron**.
- Duże pliki przechowuj na dysku i odtwarzaj strumieniowo; nie zapisuj filmów jako Base64, nie ładuj ich całych do React ani do JSON w SQLite. Miniatury i metadane obsługuj oddzielnie.
- Nie przypisuj fikcyjnych GPS/EXIF ani nie deklaruj obsługi AVI/MKV/MOV bez testu kodeka. Nie wprowadzaj automatycznej konwersji bez uzasadnienia, kontroli zasobów i bezpieczeństwa.
- Zmiany schematu mediów i backupu wymagają kopii, migracji, testów starego formatu, rollback i testów po restarcie programu.

## Przepływ: zadanie → testy → zatwierdzenie
1. Zanotuj ID wymagania, kryteria i plan minimalnej zmiany. W przypadku błędu odtwórz regresję.
2. Dodaj test(y) dla obserwowalnego zachowania **razem z implementacją**; dobierz Vitest, Node test, integrację SQLite/IPC, Electron smoke, E2E lub test na rzeczywistym Windows.
3. Uruchom szybkie kontrole powiązane ze zmianą; przed zakończeniem zadania kodowego wykonaj `npm run verify`. Gdy zmiana dotyczy uruchamiania/persistencji: również odpowiedni smoke i `npm run test:desktop-restart`.
4. Przed wydaniem testuj `npm run package:windows:isolated` i `npm run release:check` oraz realną instalację/portable. Obecna bramka release może celowo zgłaszać BLOCKED — **nie obchodź jej przez fałszowanie PASS**.
5. Status DONE przyznaj tylko po spełnieniu wszystkich kryteriów; brak dostępu do urządzenia lub testu oznacz UNVERIFIED/BLOCKED, nie sukces.
6. Zaktualizuj `TASKS.md`, `PROGRESS.md`, `docs/FEATURE_MATRIX.md`, `TESTING.md`, a dla zmian użytkowych lub architektury również `CHANGELOG.md`/`DECISIONS.md`.
7. Raportuj: co faktycznie zmieniono, które testy PASS/FAIL/NOT RUN, commit/wersję, ryzyka i **jeden następny krok**.

## Bezpieczna współpraca i publikacja
- Zanim zmodyfikujesz bazę, schemat lub historię Git: kopia zapasowa i `git status`; zachowuj lokalne niezacommitowane pliki użytkownika.
- Używaj gałęzi roboczej i PR dla zmian ryzykownych; nie używaj force-push ani nie nadpisuj `main` bez przeglądu/testów.
- Bez samowolnego instalowania nieznanych skilli, MCP, pluginów i globalnej zmiany `~/.codex/config.toml`. Repozytoryjne `.codex/config.toml` dotyczy tylko tego projektu.
- Skrypty/hooki Git wymagają weryfikacji. Skrypty w `.codex/hooks.json` nie są dowodem, że zdarzenia klienta uruchamiają się automatycznie — sprawdź je w bieżącej wersji Codexa.
- Nie wstawiaj tokenów, prywatnych zdjęć, filmów, baz, `release-current/` ani `node_modules/` do commita.
- W przypadku ograniczenia czasu/kontekstu zapisz konkretny handoff, nie twierdź, że praca będzie kontynuowana w tle.

## Automatyzacja i bramki jakości
- Szczegółowy przepływ: `docs/CODEX_AUTOMATION.md`. Statyczna kontrola: `npm run automation:check`; testy narzędzi: `npm run test:tooling`.
- Pre-commit i pre-push wymagają jednorazowego `npm run hooks:install`. Niezależną bramką dla PR jest workflow `Quality` na Windows.
- Hooki Codex mogą wymagać zaufania do projektu; przejście testów `lifecycle.mjs` nie potwierdza wywołań przez klienta. Wynik testu hooków raportuj oddzielnie od działania runtime.
- PR zawiera wyniki i ograniczenia według `.github/pull_request_template.md`. Bez zielonego CI i dowodów dla dotkniętych funkcji nie oznaczaj zmiany DONE.
