# REQUIREMENTS.md - Wymagania Funkcjonalne i Niefunkcjonalne

## Wymagania Funkcjonalne

| ID | Wymaganie | Stan realizacji | Uwagi architektoniczne |
|---|---|---|---|
| REQ-01 | Interaktywna mapa świata (Leaflet) z klastrami i 6 podkładami kafelkowymi | **UKOŃCZONE** | Działa w pełni w podglądzie (CartoDB, Esri, OSM) |
| REQ-02 | Menu kontekstowe pod prawym przyciskiem myszy (PPM) na mapie | **UKOŃCZONE** | Pozwala dodać zdjęcia, cały folder lub wkleić ze schowka w punkcie kliknięcia |
| REQ-03 | Import Drag & Drop bezpośrednio na mapę | **UKOŃCZONE** | Przekazuje pliki do okna importu i przypisuje współrzędne upuszczenia |
| REQ-04 | 5 trybów importu (pliki, folder, schowek Ctrl+V, URL, pakiety startowe) | **UKOŃCZONE** | Obsługa przez HTML5 File API, Clipboard API i pakiety tematyczne |
| REQ-05 | Odczyt metadanych EXIF GPS, daty i aparatu przez `exifr` | **UKOŃCZONE** | Automatyczne wyciąganie koordynatów lub fallback na punkt mapy |
| REQ-06 | Ochrona przed duplikatami fotografii | **UKOŃCZONE** | Sprawdzanie sygnatur w kolejce importu i bibliotece głównej |
| REQ-07 | Galeria z widokiem siatki, albumów i chronologicznej osi czasu | **UKOŃCZONE** | Filtrowanie po kraju, roku, albumie, wyszukiwanie fraz |
| REQ-08 | Kinowy pokaz slajdów (Ken Burns, PiP mini-mapa, audio ambient) | **UKOŃCZONE** | Skróty Spacja, Strzałki, F11, Esc, Web Audio API |
| REQ-09 | Eksport i import pliku kopii zapasowej `.prezent` | **UKOŃCZONE** | Zrzut JSON ze strukturą bazy, obsługa wymazywania GPS |
| REQ-10 | Panel ustawień (12 kategorii stylu Untitled UI) | **UKOŃCZONE** | Personalizacja motywu, kafelków, sortowania i prezentacji |
| REQ-11 | Menedżer map offline (pakiety regionalne) | **DEMONSTRACYJNY** | Podgląd UI z symulacją; zapis MBTiles zaplanowany w Electronie |
| REQ-12 | Tryb TV Salon 4K ze sterowaniem QR Smart Remote | **CZĘŚCIOWY / DEMO** | Tryb kinowy działa; pilot QR wymaga serwera WebSocket w Electron |
| REQ-13 | Natywna powłoka Windows 10/11 (Electron .exe, SQLite) | **DO WDROŻENIA (CODEX)**| Kolejny etap prac realizowany przez OpenAI Codex |
| REQ-14 | Synchronizacja z aplikacją Android | **PRZYSZŁA WERSJA** | Odroczona do czasu stabilizacji aplikacji desktopowej |

---

## Wymagania Niefunkcjonalne

1. **Prywatność i bezpieczeństwo**:
   - Zero telemetrii, zero zewnętrznych serwerów przetwarzających zdjęcia.
   - Brak podatności XSS (węzły DOM tworzone bezpiecznie).
2. **Wydajność**:
   - Płynne 60 FPS podczas przesuwania i przybliżania mapy świata.
   - Płynne animacje przejścia w pokazie slajdów bez zacięć pamięci.
3. **Stabilność**:
   - Bezpieczny fallback przy przekroczeniu limitu `localStorage`.
   - Brak awarii przy uszkodzonym lub brakującym EXIF w importowanych plikach.
