# ROADMAP.md - Mapa Rozwoju Aplikacji „Prezent”

## Etap 1: Fundamenty, Interaktywny Podgląd i Mapa Świata (UKOŃCZONE)
- [x] Interaktywny podgląd działający w Google AI Studio.
- [x] Interaktywna mapa świata (Leaflet) z kafelkami Dark Matter, Positron, OSM i Satellite.
- [x] Niestandardowe pinezki ze zdjęciami, klastrowanie i popupy wspomnień.
- [x] Wieloetapowe trasy podróży z dystansem i kolejnością punktów.
- [x] Wzorcowy zestaw demonstracyjny wspomnień rodzinnych (Włochy, Grecja, Polska/Tatry, Japonia, Norwegia).

## Etap 2: Galeria, Albumy i Import z EXIF (UKOŃCZONE)
- [x] Galeria z widokiem siatki, albumów i chronologicznej osi czasu (Timeline).
- [x] Wyszukiwarka i filtry (kraj, rok, ulubione, uczestnicy, tagi).
- [x] Import zdjęć pojedynczych oraz całych folderów z dysku komputera.
- [x] Odczytywanie współrzędnych GPS i daty za pomocą biblioteki `exifr`.
- [x] Awaryjne geokodowanie i ręczne przypisywanie lokalizacji dla zdjęć bez EXIF.

## Etap 3: Kinowy Pokaz Slajdów & Prezentacja na TV (UKOŃCZONE)
- [x] Pokaz slajdów na pełnym ekranie z płynnym efektem powolnego zoomu *Ken Burns*.
- [x] Mini-mapa Picture-in-Picture w rogu slajdu wskazująca lokalizację zdjęcia.
- [x] Generator nastrojowego tła dźwiękowego (ocean/natura) przez Web Audio API bez pobierania mp3.
- [x] Tryb TV z wyrazistą typografią 4K, instrukcją Miracast/HDMI i pilotem Smart Remote.

## Etap 4: Mapy Offline, Trwałość i Pliki Windows (UKOŃCZONE)
- [x] Menedżer pobierania pakietów map regionalnych do pamięci podręcznej.
- [x] Symulator trybu offline (tryb samolotowy).
- [x] Integracja ze ścieżkami Eksploratora Windows (`C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\`).
- [x] Eksport i import bazy wspomnień w formacie `.prezent`.

## Etap 5: Pakowanie Electron & Natywna Aplikacja Windows (Następny Etap)
- [ ] Utworzenie pliku głównego `main.js` Electrona z integracją natywnego menu Windows i paska zadań.
- [ ] Most IPC dla bezpośredniego odczytu dysków twardych i zewnętrznych pendrive'ów.
- [ ] Konfiguracja instalatora NSIS dla Windows 10/11 x64.

## Etap 6: Aplikacja Towarzysząca Android (Przyszłe Wydanie)
- [ ] Aplikacja Android w Jetpack Compose z bazą Room mapującą schemat `.prezent`.
- [ ] Automatyczna synchronizacja P2P przez domową sieć Wi-Fi bez chmury.
