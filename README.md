# Prezent – Rodzinne Wspomnienia i Podróże na Mapie Świata

Aplikacja **„Prezent”** to nowoczesny program przeznaczony na systemy **Windows 10/11** (oparty na Electron + React + TypeScript + Leaflet), służący do prezentowania rodzinnych zdjęć, wspomnień i wakacyjnych podróży na interaktywnej mapie świata.

Aplikacja działa w 100% lokalnie i prywatnie (offline-first), bez konieczności tworzenia konta w chmurze ani wysyłania prywatnych fotografii na zewnętrzne serwery.

---

## Główne Możliwości Programu

1. **Interaktywna Mapa Świata**:
   - Centralny element aplikacji prezentujący odwiedzone zakątki globu.
   - Niestandardowe pinezki ze zdjęciami, liczniki wspomnień i popupy z notatkami rodzinnymi.
   - Wizualizacja wieloetapowych tras podróży (linie tras, łączny dystans, punkty przystankowe).
   - 4 tryby mapy: Ciemna (Nocna elegancja), Jasna (Minimalistyczna), Satelitarna (Zdjęcia z lotu ptaka), Standardowa OpenStreetMap.

2. **Galeria Rodzinna & Albumy**:
   - Grupowanie zdjęć w albumy podróżnicze i chronologiczną Oś Czasu (Timeline wypraw rok po roku).
   - Filtrowanie po kraju, roku, albumie, ulubionych oraz natychmiastowe wyszukiwanie.
   - Wyraźne oznaczenie demonstracyjnych wspomnień od Twoich prywatnych zdjęć.

3. **Import z Komputera & Odczyt EXIF GPS**:
   - Wybór pojedynczych fotografii lub całych folderów z dysku komputera.
   - Automatyczny odczyt geolokalizacji z metadanych EXIF aparatu/smartfona (szerokość i długość geograficzna, data, model aparatu).
   - Awaryjne przypisanie lokalizacji dla fotografii bez koordynatów GPS.

4. **Kinowy Pokaz Slajdów (Slideshow)**:
   - Tryb pełnoekranowy (Full Window / Fullscreen API).
   - Efekt powolnego przybliżenia i panoramy *Ken Burns*.
   - Picture-in-Picture Mini-Mapa w dolnym rogu z animowaną lokalizacją zdjęcia.
   - Nastrojowy ambient dźwiękowy oceanu w tle generowany przez Web Audio API (100% offline).
   - Pełna obsługa klawiaturą (Strzałki, Spacja, Esc).

5. **Prezentacja na Telewizorze (Tryb TV / Salon 4K)**:
   - Przystosowany do oglądania z kanapy w salonie (duża typografia, kontrast).
   - Instrukcja połączenia bezprzewodowego (Miracast Win+K), kabla HDMI i Google Cast.
   - Sterowanie pilotem TV lub smartfonem przez Smart Remote QR.

6. **Mapy Offline (Tryb Podróżny)**:
   - Menedżer pakietów map regionalnych (Polska, Włochy, Grecja, Japonia, Norwegia) zapisywanych w lokalnym cache.
   - Przełącznik symulacji trybu samolotowego.

7. **Dostęp do Plików Windows & Prywatność**:
   - Oryginalne zdjęcia i struktura folderów zachowana w `C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\`.
   - Błyskawiczny dostęp do plików w Eksploratorze Windows.

8. **Synchronizacja Android & Kopia Zapasowa .prezent**:
   - Eksport całej bazy do pojedynczego, bezpiecznego pliku `.prezent`.
   - Architektura bazy zgodna 1:1 ze schematem SQLite / Android Room Database na potrzeby przyszłej aplikacji mobilnej Jetpack Compose.
