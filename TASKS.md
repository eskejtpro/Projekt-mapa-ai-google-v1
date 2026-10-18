# TASKS.md - Rejestr Zadań i Implementacji Projektu „Prezent Mapy”

## Rozszerzenie biblioteki / TV / map — 2026-10-17
- REQ-DEL-01/02: IN_REVIEW — zaznaczanie i usuwanie zbiorcze, dwa warianty usuwania albumu, potwierdzenie i atomowy zapis. Test jednostkowy i runtime SQLite PASS.
- REQ-TV-SELECT: IN_PROGRESS — skan na wielu interfejsach, ponowienie, ręczne odświeżanie i radio wyboru. Rzeczywisty skan LAN 0 odpowiedzi; fizyczny TV i casting UNVERIFIED.
- REQ-MAP-LAYERS: IN_REVIEW — OSM dzień/noc (filtr wyłącznie kafelków), Esri Topographic; runtime 24/24/21 kafelków PASS.

## Iteracja środowiska E0 (2026-10-17)
REQ-10 backup: wdrożony BackupManager i katalog kopii w ustawieniach; harmonogram/0=wyłączone/miniatury test PASS. Wielodniowy test na rzeczywistej bibliotece oraz odzyskiwanie po awarii dysku NOT RUN.
REQ-09: rozszerzona walidacja pól/enumów/relacji, regresje i legacy PASS. F10: restart dwóch procesów z odczytem zdjęcia PASS. Bezpieczeństwo: produkcyjne CSP, blokada popup i fałszywej ramki PASS w smoke. Odzyskiwanie uszkodzonego rekordu PASS; fizycznie uszkodzona baza i pełne odtwarzanie otwarte. Pozostałe narzędzia reset/czyszczenie i migracje wymagają kontroli atomowości.
REQ-10: IN_PROGRESS — podłączono podstawowe ustawienia pokazu/EXIF/galerii/autocentrowania; smoke potwierdza ustawienia galerii i pokazu w rendererze. Pozostała część preferencji, hardware acceleration/backup i testy wyglądu nadal otwarte.
REQ-12 pilot: IN_REVIEW — HTTP+QR+IPC i zmiana/pauza pokazu w Electron PASS; telefon fizyczny i casting nadal otwarte. REQ-06: poprawiono kryterium identycznej treści i dodano regresję dla tej samej nazwy/obcego hasha. REQ-04: atomowy import zdjęć+albumu i obsługa błędów FileReader wdrożone; rzeczywiste EXIF/D&D/folder nadal wymagają testów.
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

## Etap filmów — fundament
- VID-FOUNDATION-01: IN_REVIEW — typ `MediaItem`, tabela `media_items`, lokalny import MP4/WebM, deduplikacja SHA-256 i bezpieczny protokół Electron z HTTP Range wdrożone; testy realnych kodeków Electron PASS dla obrazu, postępu i seek; wyjście audio UNVERIFIED.
- VID-FOUNDATION-02: TODO — generowanie miniatur klatek i integracja importu z galerią.
- VID-FOUNDATION-03: TODO — integracja wspólnego katalogu z mapą, albumami i pokazem; zgodnie z zakresem nie zmieniano jeszcze slideshow ani TV.
- VID-GALLERY-01: IN_REVIEW — wspólna galeria pokazuje zdjęcia i filmy, ma filtry wszystkich/zdjęć/filmów, kafelki filmów z ikoną/czasem, miniaturę klatki z fallbackiem, odtwarzacz inline i przypisanie do istniejących albumów.
- VID-GALLERY-02: TODO — pełny Electron UI/E2E, usuwanie filmów z backupem oraz testy dużej biblioteki; mapa, slideshow i TV pozostają poza zakresem.

Postęp zamknięcia tej iteracji = suma wag DONE / 10 (aktualnie 80%). Otwarte 20% to potwierdzenie automatycznych hooków klienta. Całość Windows nie ma zatwierdzonych wag i zamrożonego zakresu; nie podajemy procentu.

Tabela PREZ poniżej zachowuje historyczne statusy AI Studio. Aktualny audyt: docs/FEATURE_MATRIX.md. Dowody bieżącej iteracji: TESTING.md.

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
| PREZ-027 | P0 | Katalogi | Bezpośrednie przeciąganie zdjęć z Eksploratora Windows na katalog (Drag & Drop) | **UKOŃCZONE** | Działa w podglądzie (Vite) |
## PR #6 — Video GPS & Map Integration
- [DONE] VGM-01 — wspólny model lokalizacji filmu, walidacja i migracja SQLite (`location_source`); testy lokalne PASS.
- [DONE] VGM-02 — markery filmów w istniejącym klastrze Leaflet, filtr Wszystkie/Zdjęcia/Filmy i popup z playerem; E2E marker/popup PASS.
- [DONE] VGM-03 — ręczne GPS, relacja album→podróż oraz trwałość po restarcie; testy PASS.
- [DONE] VGM-04 — marker/popup z MBTiles i blokadą HTTP(S), 1512 mediów/klastry/zoom; E2E PASS.
- [DONE] VGM-05 — GPS MP4 loci/MOV ©xyz względem ffprobe, pełna kopia SQLite/photos/videos z SHA-256, restore addytywny i natywne IPC/E2E PASS. Odsłuch pozostaje UNVERIFIED.

## PR #7 — Multimedia Slideshow
- [IN_REVIEW] MSL-01 — wspólny pokaz zdjęć i filmów z galerii, albumu i biblioteki; Electron E2E i CI Windows PASS.
- [IN_REVIEW] MSL-02 — automatyczne odtwarzanie filmu, przejście po `ended`, pauza/wznowienie, seek, głośność, wyciszenie i fullscreen; koniec ostatniego filmu respektuje wyłączoną pętlę, a błąd ma akcję pominięcia.
- [IN_REVIEW] MSL-03 — E2E zdjęcie/film/mixed, pauza/wznowienie, zakończenie filmu i restart PASS; pozostają pusty album, brakujący film i zachowanie ustawień.
- [IN_REVIEW] MSL-04 — CI Windows PR #7 PASS; pozostaje przegląd wydajności dużych albumów.
