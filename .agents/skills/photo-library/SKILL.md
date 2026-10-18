---
name: photo-library
description: Rozwijaj lokalną bibliotekę, EXIF, miniatury, kopie .prezent i migracje SQLite w Prezent Mapy.
---

# photo-library

Odczytaj src/types/travel.ts, StorageService i docs/KNOWN_ISSUES.md. Nie zmieniaj oryginalnych fotografii. Import i migracja muszą walidować cały wsad przed zapisem, zachować relacje i wycofać niepełny zapis. Kopia bezpieczeństwa przed migracją jest obowiązkowa. Testuj round-trip, brak pliku, uszkodzony JSON, przekroczenie pamięci i zgodność starszego formatu. Do testów używaj danych syntetycznych. Mierz import i RAM dla uzasadnionych rozmiarów biblioteki; nie zgaduj wyników.
