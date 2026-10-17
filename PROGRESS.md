# PROGRESS.md - Rzeczywisty Stan Postępów Projektu „Prezent Mapy”

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
