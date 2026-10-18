# Baseline techniczny

Środowisko: Windows 10 Pro 19045 x64, Node 26.8.1. Lokalny build Vite po inicjalizacji: 1686 modułów, 680 ms raportowane przez Vite (ciepły przebieg). JS 681.67 kB / gzip 195.79 kB, CSS 91.29 kB / gzip 17.92 kB. Ostrzeżenie chunk >500 kB pozostaje otwarte; nie podnoszono limitu, żeby je ukryć.

Vite dev zgłosił gotowość w 8467 ms przy pierwszym uruchomieniu. Pojedynczy GET strony: HTTP 200, 2064 ms w PowerShell. To pomiary narzędzi web, nie czasu startu aplikacji desktop ani płynności mapy.

RAM/CPU renderera, import i galerie dla 100/1000/10000/50000 zdjęć: NOT RUN. Powtarzalny benchmark wymaga syntetycznych plików, implementacji docelowej biblioteki i dostępnego runtime UI. Wartości i limity akceptacji zostaną ustalone dla tego etapu, bez ekstrapolowania obecnych wyników.

## Pomiar syntetycznej biblioteki SQLite — 2026-10-17

`npm run benchmark:library`, Windows 10 19045. Dane: metadane i identyczny PNG 1×1, jeden współdzielony plik. Przed cache operacji 10 000 rekordów: zapis 7460 ms, odczyt 12026 ms, próbka RSS procesu 188 MB. Po cache operacji: zapis 562 ms, odczyt 115 ms, próbka RSS 129 MB. Dla 1000 rekordów po zmianie: 61 ms / 10 ms / 67 MB. To pojedyncze przebiegi, nie szczyt RSS ani wynik dla różnych pełnowymiarowych zdjęć lub renderera. Raport reports/library-benchmark.json wskazuje commit, brudne drzewo i hashe źródeł pomiaru.

## PR #9 — pomiar Electron BEFORE/AFTER — 2026-10-18

Pomiar wykonano na Windows 10.0.19045, Node 26.8.1, Electron 44.9.0, na tym samym profilu testowym i tym samym skrypcie `scripts/performance-e2e.mjs`. Wartości są pojedynczymi przebiegami i nie zastępują profilu produkcyjnej biblioteki.

| Metryka | BEFORE `origin/main` | AFTER `feature/performance-optimization` | Status |
|---|---:|---:|---|
| Start Electron do pierwszego okna | 3568 ms | 3580 ms | bez istotnej regresji |
| Widoczny kontener mapy Leaflet | 433 ms | 408 ms | poprawa ~6%, wymaga kolejnych próbek |
| Otwarcie galerii | 167 ms | 167 ms | bez zmiany |
| Odczyt 4 kluczy SQLite przez IPC | 4,82 ms | 4,94 ms | bez istotnej zmiany |
| RSS procesu Electron | 94 MB | 91 MB | poprawa 3 MB |
| 1513 mediów, klastry i zoom | 1199 ms | 1170 ms | brak regresji, różnica w granicy szumu |

Kafelki w krótkim benchmarku UI nie zostały uznane za PASS (`tilesLoaded=false`), ponieważ testowy profil nie otrzymał gotowego kafelka w czasie próby; osobny E2E offline potwierdził renderowanie i interakcję mapy. SQLite i media-store nie zostały zmienione, więc benchmark biblioteki pozostał kontrolą regresji: 10000 rekordów po zmianach 818 ms zapisu / 90 ms odczytu / 129 MB RSS.

Końcowy powtórzony przebieg AFTER wyniósł: start 3415 ms, kontener mapy 436 ms, galeria 161 ms, SQLite 3,74 ms i RSS 91 MB. Rozrzut względem pierwszego AFTER potwierdza, że pomiary startu/mapy należy traktować jako orientacyjne; wniosek PR9 to brak regresji oraz ograniczenie zbędnych przeliczeń, nie gwarantowana poprawa procentowa na każdej maszynie.
