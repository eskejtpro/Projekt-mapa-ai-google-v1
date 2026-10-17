# TASKS.md - Rejestr Zadań i Implementacji Projektu „Prezent Mapy”

| ID | Priorytet | Moduł | Zadanie | Status | Weryfikacja |
|---|---|---|---|---|---|
| PREZ-001 | P0 | Mapa | Interaktywna mapa świata Leaflet z 6 stylami kafelków i pływającymi kontrolkami | **UKOŃCZONE** | Działa w podglądzie (Vite) |
| PREZ-002 | P0 | Mapa | Dynamiczne klastrowanie `leaflet.markercluster` z animacjami, spiderfy i miniaturami | **UKOŃCZONE** | Wdrożono bibliotekę `leaflet.markercluster` |
| PREZ-003 | P0 | Mapa | Menu kontekstowe pod prawym przyciskiem myszy (PPM) na mapie | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-004 | P0 | Mapa | Bezpieczne renderowanie popupów na mapie bez `innerHTML` | **UKOŃCZONE** | Audyt kodu & testy |
| PREZ-005 | P0 | Import | Naprawa Drag & Drop na mapę z zachowaniem plików i współrzędnych | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-006 | P0 | Import | 5 trybów importu (pliki, katalog, schowek Ctrl+V, URL, pakiety gotowe) | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-007 | P0 | Import | Odczyt metadanych EXIF GPS i technicznych aparatu przez `exifr` | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-008 | P0 | Import | Wyeliminowanie fikcyjnych ścieżek Windows (`C:\Users\...`) w podglądzie | **UKOŃCZONE** | Zweryfikowano w kodzie |
| PREZ-009 | P0 | Dane | Zabezpieczenie StorageService przed przepełnieniem localStorage | **UKOŃCZONE** | Testy jednostkowe Vitest |
| PREZ-010 | P0 | Dane | Eksport i import spójnego archiwum `.prezent` z opcją czyszczenia GPS | **UKOŃCZONE** | Testy jednostkowe Vitest |
| PREZ-011 | P0 | Galeria | Galeria wspomnień z widokami: Siatka, Albumy, Oś Czasu, filtry i szukajka | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-012 | P0 | Pokaz | Kinowy pokaz slajdów Ken Burns, mini-mapa PiP i Web Audio API | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-013 | P1 | Narzędzia | Paszport podróżnika i statystyki przebytych kilometrów/miast | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-014 | P1 | Narzędzia | Diagnostyka i usuwanie duplikatów zdjęć | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-015 | P0 | Ustawienia | 12-kategorialny panel ustawień z kartami motywów i jasnymi etykietami | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-017 | P0 | TV | Status sieci Wi-Fi/LAN, automatyczne wykrywanie TV (mDNS/UPnP), natywne udostępnianie ekranu (`getDisplayMedia`) i pokaz | **UKOŃCZONE** | Działa w podglądzie (Vite) & Web Screen Share |
| PREZ-018 | P1 | Mapa | Menedżer pakietów map offline (Polska, Włochy, Grecja, Norwegia) | **DEMONSTRACYJNY** | Podgląd UI z symulacją; pobieranie MBTiles do wdrożenia w Electronie |
| PREZ-019 | P0 | Electron | Powłoka Electron dla Windows 10/11 z natywnym oknem bez ramek | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-020 | P0 | Baza | Migracja pamięci bazy z localStorage do SQLite (better-sqlite3) | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-021 | P1 | System | Obsługa natywnego otwierania folderu w Eksploratorze Windows | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-022 | P1 | System | Wpis autostartu w rejestrze Windows (HKCU Run) | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-023 | P2 | Mobilne | Aplikacja Android i synchronizacja lokalna przez Wi-Fi | **PRZYSZŁA WERSJA** | Odroczona do czasu stabilizacji wersji Windows |
| PREZ-024 | P0 | Pokaz | Rozbudowany Pokaz Slajdów 2.0 (4 przejścia, drawer ustawień, 5 dźwięków Web Audio, pasek miniatur, auto-ukrywanie) | **UKOŃCZONE** | Działa w podglądzie (Vite) |
| PREZ-025 | P0 | Katalogi | Układanie kolejności zdjęć w katalogach (Drag & Drop, przyciski, numeracja, szablony, odtwarzanie w kolejności) | **UKOŃCZONE** | Działa w podglądzie & testy Vitest |
| PREZ-026 | P0 | Mapa | Matematyczna blokada pionowa mapy eliminująca czarną pustkę poza krawędziami | **UKOŃCZONE** | Działa w podglądzie (Vite) |
