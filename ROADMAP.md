# ROADMAP.md - Mapa Rozwoju Aplikacji „Prezent”

## Etap 1: Fundamenty i Interaktywny Podgląd (UKOŃCZONE)
- [x] Podgląd aplikacji działający bezpośrednio w Google AI Studio.
- [x] Zintegrowana mapa świata Leaflet z obsługą kafelków Dark, Satellite, Light i OSM.
- [x] Niestandardowe pinezki fotograficzne i trasy podróży.

## Etap 2: Nowoczesny Design System Desktop (UKOŃCZONE – Wersja 1.2.0)
- [x] Implementacja bocznego docka ikon (SidebarDock) wzorowanego na załączonym Obrazie 3.
- [x] Galeria Wszystkie Zdjęcia w stylu Windows Photos z sekcjami chronologicznymi i odznakami (Obraz 2).
- [x] 12-kategorialny panel ustawień personalizacji w stylu Untitled UI (Obraz 1).
- [x] Wykrywacz duplikatów i paszport statystyk podróżnika.
- [x] Natywne okno Windows 10/11 z belką tytułową, menu systemowym i paskiem stanu.

## Etap 3: Import, Pokaz Slajdów i Tryb Salon TV (UKOŃCZONE)
- [x] Import pojedynczych zdjęć i folderów z automatycznym odczytem EXIF GPS.
- [x] Pełnoekranowy pokaz slajdów z efektem Ken Burns, Picture-in-Picture mini-mapą i dźwiękiem fal oceanu.
- [x] Tryb TV Salon 4K z instrukcją połączeń Miracast/HDMI i pilotem QR.
- [x] Menedżer map offline do podróży samolotem.

## Etap 4: Pakowanie do Electrona na Windows 10/11 (Przygotowane do przejęcia przez Codex)
- [ ] Utworzenie plików `electron/main.ts` i `electron/preload.ts`.
- [ ] Obsługa systemowego okna dialogowego wyboru folderu przez `dialog.showOpenDialog`.
- [ ] Konfiguracja instalatora NSIS x64 (`.exe`) w `electron-builder.json`.

## Etap 5: Aplikacja Mobilna Android (Przyszłe Rozszerzenie)
- [ ] Dedykowana aplikacja Android w Jetpack Compose mapująca strukturę `.prezent` na encje Room Database.
- [ ] Bezpośrednia synchronizacja P2P przez domową sieć Wi-Fi bez chmury.
