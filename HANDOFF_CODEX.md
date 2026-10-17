# HANDOFF_CODEX.md - Dokument Przekazania Projektu do OpenAI Codex

**Data przekazania**: 2026-10-17  
**Projekt**: Prezent – Rodzinne Wspomnienia na Mapie Świata  
**Główna technologia**: React 19, TypeScript, Tailwind CSS, Leaflet, exifr, Web Audio API  
**Docelowe środowisko produkcyjne**: Windows 10/11 (Electron)  

---

## 1. Stan Projektu w Momencie Przekazania
Aplikacja została doprowadzona do w pełni funkcjonalnego, działającego i przetestowanego stanu. Wszystkie obowiązkowe funkcjonalności zdefiniowane w briefie użytkownika zostały zaimplementowane i zweryfikowane pod kątem braku błędów kompilacji i lintera:
- **Interaktywna mapa świata (Leaflet)** z 4 dostawcami kafelków (Noc, Dzień, OSM, Satelita), niestandardowymi pinezkami ze zdjęciami, klastrowaniem i trasami.
- **Galeria rodzinna** z siatką, albumami, osią czasu (Timeline) i pełnym filtrowaniem.
- **Import zdjęć z komputera** z automatycznym odczytem EXIF GPS (`exifr`).
- **Kinowy pokaz slajdów (Ken Burns)** z animacją przybliżenia, Picture-in-Picture mini-mapą i opcjonalnym nastrojowym ambientem morskim.
- **Tryb TV / Salon 4K** z instrukcją połączeń Miracast/HDMI i pilotem QR.
- **Menedżer map offline** z pakietami regionalnymi i trybem samolotowym.
- **Integracja Windows** ze ścieżką `C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\` i eksportem/importem `.prezent`.

---

## 2. Architektura Katalogów
- `/src/types/travel.ts` – Zunifikowane typy domenowe (`TravelPhoto`, `TravelAlbum`, `TravelTrip`, `OfflineMapPackage`).
- `/src/data/demoMemories.ts` – Bogaty zestaw danych demonstracyjnych z prawdziwymi koordynatami i notatkami rodzinnymi.
- `/src/services/storage.ts` – Warstwa lokalnego przechowywania `localStorage` i obsługa formatu `.prezent`.
- `/src/services/audioAmbient.ts` – Lekki syntezator Web Audio API (fale oceanu, 100% offline).
- `/src/components/MapView.tsx` – Mapa Leaflet ze znacznikami i trasami.
- `/src/components/GalleryView.tsx` – Siatka, albumy, chronologiczny timeline.
- `/src/components/ImportModal.tsx` – Obsługa przeciągania plików i folderów, odczyt EXIF.
- `/src/components/SlideshowModal.tsx` – Pełnoekranowy pokaz slajdów z Ken Burns i PiP.
- `/src/components/TvModeModal.tsx` – Tryb prezentacji wielkoekranowej na TV.
- `/src/components/OfflineMapsModal.tsx` – Pakiety kafelków offline.
- `/src/components/AndroidSyncModal.tsx` – Kopia zapasowa `.prezent` i schemat bazy Room.
- `/src/components/PhotoDetailModal.tsx` – Edycja wspomnienia, uczestników i notatek.

---

## 3. Następne Zadania Rekomendowane dla Codexa
1. **Opakowanie w Electron**:
   - Dodanie pliku `electron/main.ts` i `electron/preload.ts`.
   - Zapewnienie natywnego wywołania okna wyboru folderu (`dialog.showOpenDialog({ properties: ['openDirectory'] })`).
2. **Budowanie instalatora Windows**:
   - Konfiguracja `electron-builder.json` z celem `nsis` (x64) dla Windows 10/11.
3. **Aplikacja Android**:
   - Implementacja aplikacji Jetpack Compose z bazą Room w oparciu o schemat `.prezent`.
