# TESTING.md - Procedury Testowe i Scenariusze Weryfikacji

## 1. Weryfikacja Kompilacji i Składni
- Kompilator TypeScript: `npx tsc --noEmit` -> Wynik: **0 błędów**.
- Budowanie pakietu produkcyjnego: `npm run build` -> Wynik: **Sukces**.

## 2. Testy Funkcjonalne Interfejsu (Manualne & Playwright)
- [x] **Test Mapy Świata**:
  - Prawidłowe załadowanie kafelków CartoDB Dark, Positron, OSM i Esri Satellite.
  - Wyświetlanie niestandardowych pinezek ze zdjęciami i licznikami w Rzymie, Florencji, Wenecji, Santorini, Zakopanem, Kioto, Bergen.
  - Rysowanie linii tras podróży z dystansem.
  - Kliknięcie w znacznik: prawidłowe otwarcie popupu ze zdjęciem i notatką.
- [x] **Test Galerii i Albumów**:
  - Filtrowanie po kraju, roku i ulubionych.
  - Wyszukiwanie fraz w notatkach i uczestnikach.
  - Przełączanie widoków: Siatka / Albumy / Oś Czasu.
- [x] **Test Importu i EXIF**:
  - Przeciągnięcie zdjęcia z metadanymi GPS -> poprawne odczytanie koordynatów i przypisanie do nowego albumu.
  - Fallback dla zdjęć bez EXIF.
- [x] **Test Pokazu Slajdów**:
  - Przejście do trybu pełnoekranowego.
  - Animacja Ken Burns, zmiana interwału (4s, 6s, 8s, 12s).
  - Picture-in-Picture mini-mapa wskazująca lokalizację.
  - Działanie klawiszy Strzałek, Spacji i Escape.
- [x] **Test Trybu TV**:
  - Czytelność typografii i elementów nawigacji z odległości.
  - Wybór trasy do prezentacji.
- [x] **Test Map Offline**:
  - Pomyślna symulacja pobrania pakietu kafelków do lokalnej bazy danych.
  - Przełączenie trybu samolotowego.
- [x] **Test Kopii Zapasowej .prezent**:
  - Generowanie pliku pobierania `.prezent`.
  - Pomyślne zaimportowanie i zdeserializowanie bazy.
