# TASKS.md - Rejestr Zadań i Implementacji Projektu „Prezent Mapy”

## Iteracja środowiska E0 (2026-10-17)
F11: instalacja/start/deinstalacja NSIS w wydzielonym katalogu PASS. Pozostają: przebudowa po TV discovery, test portable, aktualizacja i zachowanie biblioteki oraz podpis wydawcy.
REQ-TV-LAN: IN_PROGRESS — wyszukiwanie DLNA/SSDP w otwartym panelu wdrożone, test parsera PASS, skan LAN 0 odpowiedzi; test fizycznego TV/casting/pilot pozostają otwarte. PREZ-018: smoke lokalnego renderu MBTiles przy blokadzie HTTP(S) PASS (24 kafelki syntetyczne); prawdziwe regionalne pakiety i test importu dialogiem otwarte.
PREZ-018: IN_PROGRESS — import rastrowego MBTiles, lokalny czytnik i warstwa Leaflet; test renderowania bez sieci otwarty. PREZ-021/022: IN_PROGRESS — podłączono folder/autostart; autostart wymaga testu zainstalowanej wersji. F11: IN_PROGRESS — NSIS/portable zbudowane, spakowany program startuje; instalacja/deinstalacja i przebudowa po offline do wykonania.
PREZ-020: dodano pliki obrazów pod SHA-256 i odczyt z kontrolą integralności; test powtórnego otwarcia PASS. PREZ-010: walidacja rekordów .prezent, atomowy zapis i błąd quota PASS; pełne relacje i ograniczenia ustawień pozostają IN_PROGRESS.
Aktywna implementacja: PREZ-019 / REQ-13 — dodano proces main, izolowany preload oraz sterowanie oknem. Status IN_PROGRESS: test uruchomienia Electron i odrzucania nieprawidłowego IPC wymagany przed DONE.
PREZ-020 / REQ-13 — IN_PROGRESS: SQLite podłączone do StorageService; test plikowy trwałości/rollback oraz migracji PASS. Przechowywanie obrazów w osobnych plikach i pełny test restartu całej aplikacji pozostają otwarte.

| ID | Waga | Priorytet | Wymaganie | Warunek zakończenia | Status |
|---|---|---|---|---|---|
| E0-01 | 2 | P0 | REQ-ENV | Backup historii i pliku użytkownika, branch, bundle verify | DONE |
| E0-02 | 3 | P0 | REQ-ENV | Powtarzalna instalacja, typecheck, testy, build | DONE |
| E0-03 | 2 | P0 | REQ-ENV | Kontrole Git i wykonanie GitHub Actions | DONE |
| E0-04 | 2 | P0 | REQ-ENV | Testy skryptów hooków oraz dowód uruchomienia przez klienta | IN_REVIEW |
| E0-05 | 1 | P0 | REQ-ENV | Dokumenty, walidacja skilli, rejestr braków i handoff | DONE |

Postęp zamknięcia tej iteracji = suma wag DONE / 10 (aktualnie 80%). Otwarte 20% to potwierdzenie automatycznych hooków klienta. Całość Windows nie ma zatwierdzonych wag i zamrożonego zakresu; nie podajemy procentu.

Tabela PREZ poniżej zachowuje historyczne statusy AI Studio. Aktualny audyt: docs/FEATURE_MATRIX.md. Dowody bieżącej iteracji: TESTING.md.

| ID | Priorytet | Moduł | Zadanie | Status | Weryfikacja |
|---|---|---|---|---|---|
| PREZ-001 | P0 | Mapa | Interaktywna mapa świata Leaflet z 6 stylami kafelków i pływającymi kontrolkami | **UKOŃCZONE** | Działa w podglądzie (Vite) |
| PREZ-002 | P0 | Mapa | Klastry pinezek z miniaturami zdjęć i licznikami wspomnień | **UKOŃCZONE** | Działa w podglądzie |
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
| PREZ-016 | P1 | UI/UX | Windows 11 Action Center Toasts, dialogi potwierdzeń, okno skrótów | **UKOŃCZONE** | Działa w podglądzie |
| PREZ-017 | P1 | TV | Tryb TV Salon 4K ze sterowaniem QR Smart Remote | **CZĘŚCIOWE / DEMO** | Pokaz TV działa; pilot QR to prototyp do implementacji w Electronie |
| PREZ-018 | P1 | Mapa | Menedżer pakietów map offline (Polska, Włochy, Grecja, Norwegia) | **DEMONSTRACYJNY** | Podgląd UI z symulacją; pobieranie MBTiles do wdrożenia w Electronie |
| PREZ-019 | P0 | Electron | Powłoka Electron dla Windows 10/11 z natywnym oknem bez ramek | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-020 | P0 | Baza | Migracja pamięci bazy z localStorage do SQLite (better-sqlite3) | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-021 | P1 | System | Obsługa natywnego otwierania folderu w Eksploratorze Windows | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-022 | P1 | System | Wpis autostartu w rejestrze Windows (HKCU Run) | **DO WDROŻENIA (CODEX)**| Zadanie dla OpenAI Codex |
| PREZ-023 | P2 | Mobilne | Aplikacja Android i synchronizacja lokalna przez Wi-Fi | **PRZYSZŁA WERSJA** | Odroczona do czasu stabilizacji wersji Windows |
