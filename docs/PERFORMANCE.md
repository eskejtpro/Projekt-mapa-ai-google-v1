# Baseline techniczny

Środowisko: Windows 10 Pro 19045 x64, Node 26.8.1. Lokalny build Vite po inicjalizacji: 1686 modułów, 680 ms raportowane przez Vite (ciepły przebieg). JS 681.67 kB / gzip 195.79 kB, CSS 91.29 kB / gzip 17.92 kB. Ostrzeżenie chunk >500 kB pozostaje otwarte; nie podnoszono limitu, żeby je ukryć.

Vite dev zgłosił gotowość w 8467 ms przy pierwszym uruchomieniu. Pojedynczy GET strony: HTTP 200, 2064 ms w PowerShell. To pomiary narzędzi web, nie czasu startu aplikacji desktop ani płynności mapy.

RAM/CPU renderera, import i galerie dla 100/1000/10000/50000 zdjęć: NOT RUN. Powtarzalny benchmark wymaga syntetycznych plików, implementacji docelowej biblioteki i dostępnego runtime UI. Wartości i limity akceptacji zostaną ustalone dla tego etapu, bez ekstrapolowania obecnych wyników.

## Pomiar syntetycznej biblioteki SQLite — 2026-10-17

`npm run benchmark:library`, Windows 10 19045. Dane: metadane i identyczny PNG 1×1, jeden współdzielony plik. Przed cache operacji 10 000 rekordów: zapis 7460 ms, odczyt 12026 ms, próbka RSS procesu 188 MB. Po cache operacji: zapis 562 ms, odczyt 115 ms, próbka RSS 129 MB. Dla 1000 rekordów po zmianie: 61 ms / 10 ms / 67 MB. To pojedyncze przebiegi, nie szczyt RSS ani wynik dla różnych pełnowymiarowych zdjęć lub renderera. Raport reports/library-benchmark.json wskazuje commit, brudne drzewo i hashe źródeł pomiaru.
