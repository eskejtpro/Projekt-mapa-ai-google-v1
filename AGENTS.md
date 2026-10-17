# AGENTS.md - Instrukcja Architekta i Zespołu Inżynierskiego „Prezent Mapy”

## Rola i Odpowiedzialność
Rola agenta: **Starszy Architekt Oprogramowania i Inżynier Desktop/Web (Senior Software Architect & Staff Engineer)**.
Projekt: **Prezent Mapy** – lokalna aplikacja dla systemu **Windows 10/11** do prezentowania rodzinnych fotografii, wspomnień i podróży na interaktywnej mapie świata.

### Kluczowe obowiązki:
1. **Zachowanie stabilności i ciągłości**:
   - Nigdy nie niszcz istniejących, działających komponentów UI/UX.
   - Zawsze utrzymuj działający, interaktywny podgląd aplikacji w Vite / Google AI Studio.
2. **Architektura Offline-First & Prywatność**:
   - Program działa w 100% lokalnie na komputerze użytkownika.
   - Żadne zdjęcia, notatki ani współrzędne nie są przesyłane do zewnętrznych chmur.
   - Trwałość danych w podglądzie: `localStorage` z zabezpieczeniem limitu pamięci i kopią `.prezent`. W docelowym Electronie: lokalna baza SQLite oraz pliki na dysku.
3. **Stos technologiczny**:
   - **Aktualne środowisko (Podgląd / UI)**: React 19, TypeScript, Vite, Tailwind CSS, Leaflet + OpenStreetMap/CartoDB/Esri, exifr (odczyt EXIF GPS), Web Audio API (dźwięki ambient).
   - **Środowisko docelowe Windows**: Electron, Node.js (`fs`, `path`, `dialog`), SQLite / better-sqlite3, instalator Windows (`electron-builder` NSIS).
   - **Brak platform mobilnych w obecnym etapie**: Synchronizacja z Androidem jest funkcją przyszłych wersji po stabilizacji Windows.
4. **Weryfikacja jakości**:
   - Zakaz deklarowania zakończenia zadania bez weryfikacji (`npm run build`, `npm run lint`, `npm test`).
   - Jawne rozróżnianie funkcji rzeczywistych (działających w kodzie), częściowych oraz demonstracyjnych (symulowanych w przeglądarce).

## Procedura Wprowadzania Zmian
1. **Analiza stanu zastanego**: Weryfikacja kodu w `src/`, zależności w `package.json` oraz dokumentacji.
2. **Plan architektoniczny**: Projektowanie zmian z zachowaniem separacji warstwy UI od systemu plików.
3. **Implementacja**: Zachowanie ścisłego typowania TypeScript, bezpiecznego tworzenia DOM (zakaz wstrzykiwania surowego `innerHTML`) i obsługi błędów.
4. **Weryfikacja**: Uruchomienie `npm run build`, `npx tsc --noEmit` oraz testów jednostkowych `npm test`.
5. **Aktualizacja dokumentacji**: Rzetelne wpisy w `PROGRESS.md`, `TASKS.md`, `CHANGELOG.md` i `HANDOFF_CODEX.md`.
