# Rejestr funkcji — audyt Codex 2026-10-17

Stan odniesienia: 1be0136. PARTIAL oznacza kod bez pełnego dowodu docelowego runtime. Historyczne UKOŃCZONE w dokumentach AI Studio nie są potwierdzeniem Windows.

| ID / wymaganie | Funkcja / pliki | Status | Brak / ryzyko / zależności | Test i kryterium ukończenia | Priorytet |
|---|---|---|---|---|---|
| F01 / REQ-01,02 | Mapa, klastry, PPM; MapView, App | PARTIAL | Warstwy wymagają sieci, brak testów UI | Zoom, PPM, pinezki i warstwy w runtime | P0 |
| F02 / REQ-03,04,05 | Import, EXIF; ImportModal | PARTIAL | Base64 w pamięci; brak pełnego testu rzeczywistych plików JPEG i folderu/schowka | Obsługa błędu/anulowania FileReader oraz walidacja importu PASS; JPEG z GPS/bez GPS, D&D, folder i schowek nadal otwarte | P0 |
| F03 / REQ-06 | Duplikaty; storage, ImportModal | PARTIAL | Grupowanie po identycznej treści, SHA-256 importu; zewnętrzne URL nie są potwierdzonym duplikatem | Regresja tej samej nazwy/obcego hasha PASS; usuwanie UI otwarte | P0 |
| F04 / REQ-07 | Galeria, albumy, timeline; GalleryView | PARTIAL | Brak testu interakcji i dużej biblioteki | Filtrowanie, edycja i ponowny odczyt | P0 |
| F05 / REQ-08 | Pokaz, audio; SlideshowModal, audioAmbient | PARTIAL | Brak testu 4K i drugiego monitora; PiP wymaga lokalnego MBTiles | Ustawienia pokazu, pauza i zmiana slajdu w smoke PASS; klawiatura, fullscreen, 4K i drugi monitor otwarte | P1 |
| F06 / REQ-09 | .prezent; storage | PARTIAL | Atomowy zapis, walidacja pól, relacji i ustawień wdrożone; pełny UI round-trip rzeczywistych zdjęć otwarty | Round-trip/quota/rollback, daty, enumy, relacje i legacy PASS | P0 |
| F07 / REQ-10 | Ustawienia; SettingsView, App | PARTIAL | Folder/autostart podłączone; test zainstalowanego autostartu i pozostałe preferencje otwarte | Macierz każdej preferencji → efekt → trwałość | P0 |
| F08 / REQ-11 | Mapy offline; OfflineMapsModal | PARTIAL | Import własnego MBTiles; brak licencjonowanych pakietów regionalnych | Czytnik TMS/XYZ PASS; render Electron przy zablokowanej sieci PASS (24 kafelki syntetyczne); źródła pakietów otwarte | P1 |
| F09 / REQ-12 | TV, QR; TvModeModal | PARTIAL | DLNA discovery, filtr oraz pilot HTTP/QR wdrożone; smoke steruje pokazem; telefon/TV/casting otwarte | Wykrycie fizycznego TV, kontrola połączenia i pokaz | P1 |
| F10 / REQ-13 | Electron, IPC, SQLite | PARTIAL | Pełny audyt bezpieczeństwa i testy dużych bibliotek otwarte | Smoke, blokada obcego IPC, CSP, restart procesu i ponowne otwarcie bazy PASS | P0 |
| F11 / REQ-13 | NSIS i portable | PARTIAL | Brak testu aktualizacji istniejącej biblioteki, portable i Windows 11 | Aktualne pakiety, smoke packaged, instalacja/start/deinstalacja Windows 10 PASS; aktualizacja danych, portable i Windows 11 otwarte | P0 |
| F12 / REQ-14 | Android | TODO | Odroczone poza Windows | Osobny przyszły zakres | P2 |
| F13 | Statystyki; storage, StatsView | PARTIAL | Testy logiki istnieją; brak UI runtime | Statystyki na znanej bibliotece | P1 |
| F14 | Kontrola jakości / scripts / CI | PARTIAL | Workflow nie obejmuje testów fizycznego TV, instalatora ani Windows 11 | Lokalny project-check, typecheck, 19 Vitest, 10 tooling, 9 backend i build PASS; GitHub Quality run `39012642423` dla commita `20c5567` PASS | P0 |
| F15 | Fundament biblioteki filmów | IN_PROGRESS | Model MediaItem, lokalny import MP4/WebM, SQLite metadata-only, bezpieczny protokół z HTTP Range i bazowy odtwarzacz są wdrożone; miniatura klatki i integracja z galerią pozostają otwarte | Import/duplikat/uszkodzony kontener/restart SQLite PASS; Electron Windows: H.264/AAC, VP8/Opus, VP9/Opus, dekodowanie obrazu, postęp i seek PASS; wyjście audio UNVERIFIED; UI importu i galeria pozostają otwarte | P0 |
| F16 | Wspólna galeria zdjęć i filmów | IN_REVIEW | Import z galerii, filtrowanie, kafelki, placeholder/miniatura runtime, inline player i przypisywanie albumów wdrożone; E2E Electron na izolowanym profilu PASS | Odsłuch głośników UNVERIFIED; trwałość i testy dużej biblioteki potwierdzone w PR #6 | P0 |
| F17 | Filmy na mapie GPS | IN_REVIEW | Wspólny klaster, filtr, popup/player, ręczny GPS, album→podróż, migracja; GPS MP4 loci/MOV ©xyz i marker offline Electron PASS; pełna kopia folderowa/restore wdrożona | Aktualne testy/CI i ograniczenia: TESTING.md, docs/VIDEO_GPS_AND_BACKUP.md; pozostałe tagi GPS nieobsługiwane, wyjście audio UNVERIFIED | P0 |

Nie podajemy procentu Windows: zamrożony zakres wydania i wagi funkcji nie zostały jeszcze zatwierdzone. Do postępu liczą się wyłącznie DONE; DEMO i PARTIAL nie zastępują kryteriów.
