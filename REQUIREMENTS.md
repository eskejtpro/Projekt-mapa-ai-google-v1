# REQUIREMENTS.md - Wymagania Funkcjonalne i Niefunkcjonalne

## Zatwierdzony zakres PR #6 — 1.6.0

- REQ-VGM-01: film z poprawnym GPS ma rzeczywisty marker w istniejącym klastrze Leaflet, popup i otwarcie playera; test Electron również przy blokadzie HTTP(S).
- REQ-VGM-02: poprawne tagi MP4 loci i QuickTime ©xyz są odczytywane lokalnie z walidacją zakresów; inne warianty nie są deklarowane jako obsługiwane. Ręczna edycja nie fabrykuje punktu dla pustych pól i zachowuje dane po restarcie.
- REQ-VGM-03: pełna kopia folderowa obejmuje bazę, zdjęcia i filmy; SHA-256/rozmiary, konflikty, brak plików oraz niebezpieczne ścieżki są sprawdzane przed udanym przywróceniem. Istniejące dane i oryginalne pliki nie są nadpisywane.
- REQ-VGM-04: testy rzeczywistego MP4 H.264/AAC i WebM VP8/Opus, VP9/Opus potwierdzają klatki, postęp, pauzę, seek, miniaturę i restart w produkcyjnym Electronie; odsłuch może pozostać jawnie UNVERIFIED z procedurą ręczną.
- REQ-VGM-05: UI zachowuje ciemny motyw i bursztynowe akcenty; pola GPS mają widoczne etykiety, klawiaturę, błąd i stan zapisu. Szczegóły: DESIGN.md.

Zakres, kryteria testów i ograniczenia formatów: docs/VIDEO_GPS_AND_BACKUP.md. Slideshow i TV należą do oddzielnych PR.

Aktualne statusy i kryteria weryfikacji: docs/FEATURE_MATRIX.md. Poniższa kolumna Stan realizacji jest historyczną deklaracją AI Studio.

- REQ-ENV (P0): środowisko umożliwia npm ci, verify, testy hooków, kontrolę Git i CI. Kryterium: świeże wyniki lokalne oraz rzeczywiste uruchomienie CI i hooków klienta.
- REQ-TV-LAN (P1): program wyszukuje dostępne telewizory w sieci w czasie używania funkcji TV (wymaganie z pliku użytkownika). Kryterium: wykrycie rzeczywistego kompatybilnego TV, odświeżanie i obsługa rozłączenia. Protokół i model TV: WYMAGA_UZUPELNIENIA przed implementacją tej funkcji.

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
# Rozszerzenie zatwierdzone 2026-10-17 — biblioteka, TV i mapy

- REQ-DEL-01: zaznaczanie wielu zdjęć, wszystkich widocznych i odznaczanie; usuwanie po potwierdzeniu, z trwałym zapisem i obsługą błędu.
- REQ-DEL-02: usuwanie albumu ze zdjęciami albo zachowanie zdjęć bez przypisania. Zapis atomowy; pliki źródłowe i kopie plików na dysku pozostają zachowane.
- REQ-TV-SELECT: skan aktywnych interfejsów IPv4, ponawianie SSDP, ręczne odświeżanie i wybór wykrytego odbiornika. Fizyczna zgodność i casting wymagają osobnej weryfikacji.
- REQ-MAP-LAYERS: działające warstwy Nocny, Dzień i Kolor/Teren; komunikat przy błędzie kafelków i zachowany lokalny MBTiles.
