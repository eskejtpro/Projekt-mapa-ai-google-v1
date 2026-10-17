# Rejestr funkcji — audyt Codex 2026-10-17

Stan odniesienia: 1be0136. PARTIAL oznacza kod bez pełnego dowodu docelowego runtime. Historyczne UKOŃCZONE w dokumentach AI Studio nie są potwierdzeniem Windows.

| ID / wymaganie | Funkcja / pliki | Status | Brak / ryzyko / zależności | Test i kryterium ukończenia | Priorytet |
|---|---|---|---|---|---|
| F01 / REQ-01,02 | Mapa, klastry, PPM; MapView, App | PARTIAL | Warstwy wymagają sieci, brak testów UI | Zoom, PPM, pinezki i warstwy w runtime | P0 |
| F02 / REQ-03,04,05 | Import, EXIF; ImportModal | PARTIAL | Base64 w pamięci; FileReader bez onerror; brak rzeczywistych plików testowych | JPEG z GPS/bez GPS/uszkodzony, D&D, folder, schowek | P0 |
| F03 / REQ-06 | Duplikaty; storage, ImportModal | PARTIAL | Nazwa pliku nie dowodzi tożsamości treści | Różne pliki o tej samej nazwie nie mogą zostać usunięte jako identyczne | P0 |
| F04 / REQ-07 | Galeria, albumy, timeline; GalleryView | PARTIAL | Brak testu interakcji i dużej biblioteki | Filtrowanie, edycja i ponowny odczyt | P0 |
| F05 / REQ-08 | Pokaz, audio; SlideshowModal, audioAmbient | PARTIAL | PiP mapy online, brak testu 4K i monitora | Klawiatura, pauza, fullscreen, drugi monitor | P1 |
| F06 / REQ-09 | .prezent; storage | PARTIAL | Atomowy zapis i walidacja rekordów wdrożone; relacje i pełne ograniczenia ustawień otwarte | Round-trip/quota/rollback PASS; pełny schemat otwarty | P0 |
| F07 / REQ-10 | Ustawienia; SettingsView, App | PARTIAL | Folder/autostart podłączone; test zainstalowanego autostartu i pozostałe preferencje otwarte | Macierz każdej preferencji → efekt → trwałość | P0 |
| F08 / REQ-11 | Mapy offline; OfflineMapsModal | PARTIAL | Import własnego MBTiles, czytnik i lokalna warstwa wdrożone; render offline i źródła pakietów otwarte | Czytnik TMS/XYZ PASS; render przy odłączonej sieci NOT RUN | P1 |
| F09 / REQ-12 | TV, QR; TvModeModal | DEMO | Brak discovery TV i pilota sieciowego; filtr hardcoded do demo | Wykrycie TV w LAN, kontrola połączenia i pokaz | P1 |
| F10 / REQ-13 | Electron, IPC, SQLite | PARTIAL | Main/preload/SQLite/pliki wdrożone; pełny audyt IPC i restart procesu otwarte | Smoke i ponowne otwarcie bazy PASS | P0 |
| F11 / REQ-13 | NSIS i portable | PARTIAL | Kandydaty zbudowane, smoke packaged PASS; przebudowa po offline oraz instalacja/deinstalacja otwarte | Instalacja, start, deinstalacja, zachowanie danych | P0 |
| F12 / REQ-14 | Android | TODO | Odroczone poza Windows | Osobny przyszły zakres | P2 |
| F13 | Statystyki; storage, StatsView | PARTIAL | Testy logiki istnieją; brak UI runtime | Statystyki na znanej bibliotece | P1 |
| F14 | Kontrola jakości / scripts / CI | PARTIAL | Lokalne testy to nie dowód GitHub Actions | npm ci + verify oraz zielony workflow po push | P0 |

Nie podajemy procentu Windows: zamrożony zakres wydania i wagi funkcji nie zostały jeszcze zatwierdzone. Do postępu liczą się wyłącznie DONE; DEMO i PARTIAL nie zastępują kryteriów.
