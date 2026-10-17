# DECISIONS.md - Rejestr Decyzji Architektonicznych (ADR)

## ADR-005: Przejęcie Codex, 2026-10-17
Pracujemy w A:\Prezent na rocznicę i eskejtpro/Projekt-mapa-ai-google-v1; zachowujemy zatwierdzony UI. Pierwsza iteracja obejmuje środowisko i audyt, nie cały produkt. package.json jest źródłem wersji 1.3.1 podglądu, potwierdzonej historycznym changelogiem i kodem; nie oznacza stable Windows. npm/package-lock.json są kanoniczne. Dopasowano esbuild do wymagań Vite po odtworzonym ERESOLVE. Projektowa konfiguracja Codexa zawiera wyłącznie obsługiwane ustawienie hooks; metadane pozostają w dokumentach.

Korekta ADR-001 poniżej: Leaflet nie gwarantuje bezpłatności, prywatności ani uprawnienia do offline wszystkich dostawców kafelków. Obecna mapa wymaga sieci.

## ADR-001: Wybór Leaflet zamiast ciężkich silników komercyjnych (Google Maps / Mapbox)
- **Kontekst**: Aplikacja wymaga działania lokalnego na komputerze Windows bez wymuszonej konieczności podawania kart kredytowych, kluczy API chmury czy stałego połączenia z internetem.
- **Decyzja**: Wykorzystanie biblioteki Leaflet z otwartymi kafelkami OpenStreetMap, CartoDB oraz Esri Satellite.
- **Konsekwencje**: Brak kosztów, 100% prywatności, pełna obsługa map offline.

## ADR-002: Wykorzystanie `exifr` do automatycznej geolokalizacji
- **Kontekst**: Użytkownik importuje setki zdjęć z wakacji. Ręczne wpisywanie współrzędnych byłoby uciążliwe.
- **Decyzja**: Zastosowanie wydajnego parsera `exifr`, który natywnie w przeglądarce odczytuje tagi GPS (Latitude, Longitude), datę `DateTimeOriginal` oraz parametry aparatu.
- **Konsekwencje**: Zdjęcia automatycznie „lądują” na mapie w odpowiednim mieście i kraju.

## ADR-003: Synteza tła dźwiękowego przez Web Audio API
- **Kontekst**: Pokaz slajdów wymaga nastrojowej oprawy audio, ale dołączanie ciężkich plików MP3 zwiększyłoby rozmiar aplikacji i niosło ryzyka praw autorskich.
- **Decyzja**: Wdrożenie proceduralnego generatora szumu różowego i fal oceanu przy użyciu węzłów `BiquadFilterNode` i `GainNode` w Web Audio API.
- **Konsekwencje**: 0 bajtów zewnętrznych assetów audio, natychmiastowy start, relaksujący nastrój w pokazie slajdów.

## ADR-004: Uniwersalny format wymiany `.prezent`
- **Kontekst**: Potrzeba przenoszenia bazy na inny komputer oraz przyszła synchronizacja ze smartfonem Android.
- **Decyzja**: Opracowanie znormalizowanego formatu `.prezent` (JSON), mapowalnego 1:1 na tabele bazy danych SQLite / Room.
