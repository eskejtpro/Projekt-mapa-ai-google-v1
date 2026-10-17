# ROADMAP.md - Plan Rozwoju Aplikacji „Prezent Mapy”

## Aktualny plan Codex
0. Środowisko: E0 w TASKS.md; audyt i automatyzacja, bez przebudowy UI.
1. Fundament Windows: Electron, preload, bezpieczne IPC, okno i natywne dialogi.
2. Biblioteka: SQLite, migracje, pliki, EXIF, miniatury, integralność .prezent.
3. Uzupełnienie ustawień, pokazu, wielomonitorowości i wykrywania TV.
4. Offline zgodne z licencją, pomiary dużych bibliotek i poprawki.
5. Zweryfikowane NSIS/portable i zatwierdzona publikacja.

Etapy opisane poniżej zachowują historię AI Studio, nie dowodzą aktualnego ukończenia. Android pozostaje poza bieżącym wydaniem Windows.

## Etap 1: Fundamenty i Interaktywna Mapa (UKOŃCZONE)
- [x] Inicjalizacja projektu w React 19 + TypeScript + Vite + Tailwind CSS.
- [x] Konfiguracja mapy świata Leaflet z obsługą wielu warstw kafelkowych (CartoDB, Esri, OSM).
- [x] Klastrowanie pinezek ze zdjęciami i licznikami wspomnień.
- [x] Dock boczny (SidebarDock) z nawigacją.

## Etap 2: Wspomnienia, Import i Pokaz Slajdów (UKOŃCZONE)
- [x] Galeria wspomnień z widokami: Siatka, Albumy, Oś Czasu.
- [x] Odczyt metadanych EXIF GPS przy użyciu biblioteki `exifr`.
- [x] Kinowy pokaz slajdów (Ken Burns, PiP mini-mapa, dźwięk ambientu oceanu Web Audio API).
- [x] 12-kategorialny panel ustawień w stylu Untitled UI.
- [x] Eksport i import bazy danych do formatu `.prezent`.

## Etap 3: Zaawansowany Import i Finalna Stabilizacja w AI Studio (UKOŃCZONE - WERSJA 1.3.1)
- [x] Menu kontekstowe pod prawym przyciskiem myszy (PPM) na mapie z dodawaniem zdjęć/folderu w punkcie kliknięcia.
- [x] Pełny Drag & Drop plików na mapę z automatycznym otwarciem centrum importu i zachowaniem współrzędnych.
- [x] 5 trybów importu (pliki, katalog z podfolderami, schowek Ctrl+V, URL, pakiety gotowe).
- [x] Bezpieczeństwo DOM: wyeliminowanie surowego `innerHTML` w popupach mapy na rzecz bezpiecznych węzłów DOM.
- [x] Ochrona przed duplikatami zdjęć w kolejce i bibliotece.
- [x] Zabezpieczenie limitu `localStorage` przed utratą danych z powiadomieniem użytkownika.
- [x] Usunięcie fikcyjnych ścieżek Windows (`localFilePath`).
- [x] Oznaczenie funkcji demonstracyjnych (Menedżer Map Offline, pilot QR).
- [x] Zestaw testów jednostkowych w Vitest (`npm test`).
- [x] Uporządkowanie dokumentacji i usunięcie przestarzałych wpisów Android.

## Etap 4: Przejęcie przez OpenAI Codex – Integracja z Windows (NAJBLIŻSZY CEL)
- [ ] Utworzenie powłoki Electron (`electron`, `electron-builder`) bez naruszania istniejącego UI React.
- [ ] Konfiguracja bezpiecznego IPC (`contextBridge.exposeInMainWorld`).
- [ ] Zastąpienie `localStorage` natywną bazą SQLite (`better-sqlite3`).
- [ ] Bezpośredni odczyt plików graficznych z dysku komputera przez natywne protokoły (`photo://`).
- [ ] Integracja z systemowym oknem wyboru folderu (`dialog.showOpenDialog`).

## Etap 5: Mapy Offline i Pilot TV (ELECTRON)
- [ ] Implementacja lokalnego bufora kafelków w formacie MBTiles / SQLite.
- [ ] Lekki lokalny serwer HTTP/WebSocket w Electronie do obsługi pilota Smart Remote ze smartfona w sieci domowej Wi-Fi.

## Etap 6: Dystrybucja i Wydanie Windows 10/11
- [ ] Przygotowanie instalatora NSIS (`.exe`) i wersji przenośnej (portable).
- [ ] Testy wydajnościowe na Windows 10 i Windows 11.
