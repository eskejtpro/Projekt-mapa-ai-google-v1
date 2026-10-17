# PROGRESS.md - Rzeczywisty Stan Postępów Projektu „Prezent Mapy”

Data aktualizacji: **2026-10-17**  
Wersja bieżąca: **1.4.1 (Drag & Drop z Eksploratora Windows na Katalogi)**  
Stan ogólny: **Kompletny, stabilny i sprawdzony prototyp gotowy do przejęcia przez OpenAI Codex**

---

## Tabela Postępu Modułów

| Moduł | Stan Realizacji | Szczegóły implementacji i weryfikacji |
|---|---|---|
| **Drag & Drop z Windows na Katalogi** | **UKOŃCZONE** | Bezpośrednie upuszczanie plików z Eksploratora Windows na karty albumów oraz na baner aktywnego katalogu w Galerii z wizualnym feedbackiem i natychmiastowym przypisaniem. |
| **Interaktywna mapa świata (Leaflet)** | **UKOŃCZONE** | 6 warstw kafelkowych (Esri Topo, Esri Dark Canvas, OSM Dzień, Esri Satellite, Ulice), dynamiczne klastrowanie `leaflet.markercluster` ze spiderfy i animacją, animowane trasy podróży. |
| **Blokada pionowa mapy (`enforceVerticalBounds`)** | **UKOŃCZONE** | Rygorystyczna matematyczna blokada krawędzi kafelków (±85.0511°). Eliminacja czarnej pustki nad i pod mapą. Nieskończone przewijanie w poziomie. |
| **Rozbudowany Kinowy Pokaz Slajdów 2.0** | **UKOŃCZONE** | 4 przejścia (Ken Burns, crossfade, slide push, zoom & fade), wysuwany panel ustawień (Drawer), suwaki tempa (2-30s), pętla, kolejność odtwarzania, pasek miniatur (Filmstrip), 3 tryby napisów (w tym czyste kino) oraz auto-ukrywanie kontrolek po 3.5s bezruchu. |
| **Układanie zdjęć w katalogach (Custom Order)** | **UKOŃCZONE** | Pełny moduł `CatalogOrganizerModal` z Drag & Drop (uchwyt `GripVertical`), przyciskami góra/dół/początek/koniec, numeracją slajdów (`#1`, `#2`...), szybkimi szablonami (data, alfabet, geografia) i natychmiastowym odtworzeniem pokazu w ułożonej kolejności. |
| **Offline Web Audio Ambient Soundscapes** | **UKOŃCZONE** | 5 nastrojowych pejzaży dźwiękowych syntezowanych proceduralnie w 100% offline (ocean, wiatr i las, trzaskające ognisko, cykady, ambient pad) z płynną regulacją głośności. |
| **Klastrowanie `leaflet.markercluster`** | **UKOŃCZONE** | Dynamiczne łączenie zdjęć w klastry przy oddaleniu, rozsuwanie pinezek w okręgu, miniatury z licznikami, brak zapychania mapy. |
| **Menu kontekstowe mapy (PPM)** | **UKOŃCZONE** | Kliknięcie prawym przyciskiem myszy otwiera menu z opcją dodania zdjęć, całego katalogu lub wklejenia ze schowka ze współrzędnymi punktu. |
| **Import Drag & Drop na mapę** | **UKOŃCZONE** | Przeciągnięcie plików na mapę przekazuje pliki do `ImportModal`, przypisuje współrzędne geograficzne punktu upuszczenia i chroni przed duplikacją. |
| **Centrum importu fotografii** | **UKOŃCZONE** | 5 trybów: pliki, foldery/podfoldery, wklejanie ze schowka (`Ctrl+V`), bezpośredni URL grafiki oraz 4 gotowe pakiety podróżnicze. |
| **Odczyt metadanych EXIF** | **UKOŃCZONE** | Biblioteka `exifr` wyciąga koordynaty GPS, datę wykonania i aparat. Bezpieczny fallback przy braku danych EXIF. |
| **Bezpieczeństwo DOM** | **UKOŃCZONE** | Usunięto podatności `innerHTML` w `MapView.tsx`. Popupy renderowane przez bezpieczne tworzenie węzłów DOM i `textContent`. |
| **Trwałość danych i ochrona pamięci** | **UKOŃCZONE** | Metody `StorageService` zwracają status zapisu boolean, chronią przed błędem przepełnienia `localStorage` i informują użytkownika. `customPhotoOrder` trwale zapisywany w albumach. |
| **Galeria i Oś Czasu (Timeline)** | **UKOŃCZONE** | Widok siatki z numeracją własnej kolejności slajdów, widok albumów, chronologiczna oś czasu rok po roku, filtry krajów, lat i ulubionych. |
| **Panel Ustawień (12 kategorii)** | **UKOŃCZONE** | Motywy ciemny/jasny/systemowy, konfiguracja mapy, klastrowania, sortowania. Oznaczenie opcji integrujących się z Windows. |
| **Paszport i Diagnostyka duplikatów** | **UKOŃCZONE** | Statystyki podróżnicze (kraje, miasta, km) oraz widok wykrywania i usuwania powtórzonych ujęć. |
| **Kopia zapasowa .prezent** | **UKOŃCZONE** | Eksport i import bazy w JSON z opcją anonimizacji współrzędnych GPS. Zweryfikowane testami automatycznymi. |
| **Menedżer Map Offline** | **DEMONSTRACYJNY** | Działający interfejs UI z symulacją postępu pobierania. Rzeczywisty zapis bazy MBTiles do wdrożenia w Electronie. |
| **Tryb TV i Udostępnianie Ekranu** | **UKOŃCZONE** | Pełna diagnostyka i status aktywnej sieci Wi-Fi/LAN, automatyczne wykrywanie telewizorów (Samsung, LG, Sony, Philips), natywne udostępnianie ekranu w przeglądarce (`getDisplayMedia`), obsługa Miracast i pokaz slajdów. Pilot QR oznaczony jako prototyp UI. |
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
   - Liczba testów: **7/7 ZDANYCH (100% zielonych)**.
   - Zweryfikowano: `StorageService.getTravelStats`, `StorageService.findDuplicates`, spójność eksportu/importu `.prezent`, heurystykę geokodowania `guessNearestLocation`, konwersję pakietów `travelPacks`, oraz trwałość i sortowanie `customPhotoOrder` w albumach.
