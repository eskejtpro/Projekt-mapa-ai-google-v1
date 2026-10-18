# Końcowy audyt jakości — PR #10

Data: 2026-10-18. Zakres: DoD funkcji i przygotowania Windows, bez deklaracji gotowego wydania. Baza: `f55c972e6c98b2bf5dc14850b809b135239e971d` (main po PR #8/#9).

## Integracja i dowody bazowe

- PR #8 scalony po przeglądzie DLNA i poprawkach `3c896a1`; oba Windows quality gate PASS (runs `39117507037`, `39117509807`).
- PR #9 zaktualizowano przez merge main, zachowując oba handoffy w jedynym konflikcie `PROGRESS.md`. Oba CI commita `f60a8c0` PASS (runs `39117720983`, `39117725048`); PR scalony, lokalny main zaktualizowany fast-forward.
- Wydanie pozostaje zablokowane przez `npm run release:check` (exit 1, ready=false). Jest to osobny wynik od zielonego verify i możliwości integracji kodu.

## Usterki i poprawki

| ID | Priorytet | Problem / dowód | Rozwiązanie / regresja |
|---|---|---|---|
| QA10-01 | P0 | Pierwszy start offline nie przełączał warstwy po odczycie ustawień; nowy E2E FAIL (timeout 5000 ms) | Zależność `offlineMode` w efekcie Leaflet; E2E startu bez nawigacji i benchmark tilesLoaded=true |
| QA10-02 | P1 | Tytuł `A & <B>` uszkadzał zagnieżdżony XML SOAP; nowy test DIDL FAIL | Dwie warstwy kodowania XML i deklaracja klasy photo/video; test PASS |
| QA10-03 | P1 | Galeria ignorowała zapisaną opcję wyłączenia lazy-load | Loading zależy od ustawienia; E2E po reload i restarcie sprawdza eager |
| QA10-04 | P0 | Efekt timera zdjęcia nie zależał od indeksu medium i mógł pozostać aktywny na filmie | Cleanup przy zmianie indeksu/listy; CI z rzeczywistym filmem spowolnionym ponad interwał zdjęcia |
| QA10-05 | P1 | Brak negatywnych scenariuszy zabezpieczeń serwera DLNA | Dodano odrzucanie obcego IP, publicznego/mylnego adresu opisu, pliku poza roots i brakującego pliku |
| QA10-06 | P2 | Główne wpisy lockfile miały 1.7.0 przy package.json 1.8.0 | Kandydat 1.8.1 spójny w obu plikach, bez zmiany wersji zależności |

## Pokrycie według DoD

| Obszar | Dowód / zakres | Ograniczenie |
|---|---|---|
| Zdjęcia / filmy | Vitest, import MP4/WebM, duplikaty/uszkodzone kontenery, SQLite, protokół Range | Pełny import JPEG EXIF/D&D/schowka nadal nie ma kompletnego E2E |
| Galeria / albumy | Electron UI importu, filtra, playera, relacji albumu i restartu | Realna wielogigabajtowa biblioteka i RAM renderera UNVERIFIED |
| GPS / offline | Parser loci/©xyz, MBTiles TMS/XYZ, marker/popup oraz start offline | Inne tagi GPS i MOV jako format importu nie są deklarowane; pakiety regionalne poza zakresem |
| Pokaz multimedialny | UI mixed/pauza/klawiatura, real ended/seek/kodeki w Windows CI; nowa regresja timera | 4K, drugi monitor, odsłuch i pełna trwałość wszystkich opcji pokazu UNVERIFIED |
| DLNA | Test HTTP/SOAP z lokalnym symulatorem; SSRF, token, IP, Range, Stop, disconnect | Fizyczny TV UNVERIFIED; nie potwierdzono kompatybilności konkretnego modelu. Wykrycie/komenda nie dowodzą dekodowania |
| SQLite / backup | Testy transakcji, starego .prezent, pełnych plików zdjęć/filmów, hash/restore i restartu; scenariusze 64 MiB | Awaria zasilania i fizyczne uszkodzenie SQLite UNVERIFIED; automatyczny .prezent nie obejmuje filmów |
| Ustawienia | Eager/lazy po restarcie, walidacja, harmonogram kopii | Autostart zainstalowanej wersji, motywy/język/akceleracja i wszystkie opcje pokazu wymagają osobnej macierzy |
| IPC / Electron | Izolacja, sandbox, CSP, nadawca IPC, ścieżki; smoke restartu i odmowa fałszywego nadawcy | Nie jest to niezależny pełny pentest |
| Windows | Build renderer/main oraz restart dwóch procesów; raport pakowania osobno | Aktualizacja/deinstalacja tej wersji na prawdziwej bibliotece, Windows 11 i test sprzętowy nadal otwarte |

## Kryteria dalszego etapu #11

Priorytetem jest zamknięcie macierzy ustawień/pokazu i rzeczywistych importów zdjęć, a następnie test aktualnego NSIS/portable, aktualizacji i zachowania biblioteki. Dla DLNA pozostają test sprzętowy, negocjacja formatów i pauza zegara zdjęć w sekwencji TV. Brakujące dowody nie otrzymują statusu DONE.

Szczegółowe wyniki bieżącego verify/E2E/restart/CI: `TESTING.md`, `PROGRESS.md` i raporty `reports/` jako artefakty lokalne/CI. `docs/FEATURE_MATRIX.md` zachowuje status PARTIAL, gdy całe kryterium funkcji nadal nie jest spełnione.
