# CHANGELOG.md - Historia Zmian Projektu „Prezent Mapy”

## Unreleased — środowisko Codex
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
