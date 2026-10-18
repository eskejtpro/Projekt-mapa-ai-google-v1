---
name: video-library
description: Projektuj, implementuj i testuj obsługę filmów w Prezent Mapy (import, miniatury, kodeki, mapa GPS, albumy, pokaz mieszany, Electron, migracje i backup). Używaj przy każdej zmianie dotyczącej plików wideo.
---

# Video library — wspólna biblioteka zdjęć i filmów

## Kiedy używać
Przy projektowaniu i wdrażaniu obsługi filmów w `src/`, `electron/`, schemacie SQLite, odtwarzaczu, imporcie, backupie i prezentacjach. Przed implementacją przeczytaj `AGENTS.md`, `src/types/travel.ts`, `electron/database.cjs`, `electron/media-store.cjs`, `src/components/ImportModal.tsx`, `src/components/SlideshowModal.tsx` i `docs/FEATURE_MATRIX.md`.

## Procedura
1. Zapisz wymagania i kompatybilność wideo jako TODO/PARTIAL, dopóki nie potwierdzą ich testy. Określ obsługiwane kontenery i kodeki na rzeczywistym Electron/Windows; nie utożsamiaj rozszerzenia z kompatybilnością dekodera.
2. Zaprojektuj typowany model `MediaItem` / dyskryminator rodzaju zdjęcie-film bez zrywania dotychczasowych rekordów `TravelPhoto`, identyfikatorów albumów, tras i `.prezent`. Ustal plan migracji, backup i rollback.
3. Import: pliki, wiele plików, foldery i podfoldery, przeciąganie na album lub mapę; wykrywaj błędy uprawnień, duplikaty, uszkodzony plik, przerwane operacje i brak miejsca. Nie usuwaj oryginału.
4. Media wielogigabajtowe: przechowuj na dysku bez Base64; nie zapisuj binariów w JSON/SQLite. Bezpiecznie udostępniaj lokalne media rendererowi przez ograniczony mechanizm Electron, kontrolę ścieżek, rozmiaru i typów MIME. Sprawdź seek i HTTP Range lub równoważną obsługę częściowego odczytu.
5. Miniatura: wygeneruj klatkę lub czytelny placeholder; cache musi być odnawialny. Metadane obejmują czas trwania, kodek, rozdzielczość, datę, rozmiar, ewentualny GPS i status odtwarzalności. Nie wymyślaj GPS ani metadanych.
6. Galeria, mapa, albumy i podróże mają pracować na jednym katalogu zdjęć/filmów. Dodaj ikony i czas filmu, filtry oraz spójne operacje edycji i usuwania bez utraty oryginałów.
7. Odtwarzacz: play/pause, seek, głośność, pełny ekran, obsługa błędów, zwalnianie zasobów. Pokaz mieszany powinien odtwarzać film do końca lub zgodnie z jawnym ustawieniem, a następnie przechodzić do kolejnego elementu. Sprawdź współpracę z pilotem LAN i drugim ekranem.
8. Jeśli format/codec nie działa, pokaż stan `unsupported`; nie deklaruj automatycznej konwersji bez zatwierdzonej implementacji. Narzędzie do konwersji wymaga analizy licencji, bezpieczeństwa, wydajności i kosztu dystrybucji.
9. Testy: import MP4/WebM, wykrywanie nieobsługiwanego kodeka, uszkodzony film, brak GPS, uszkodzony cache, brak pliku, duplikat, bardzo duży plik bez buforowania całego w RAM, seek, reload SQLite, rollback migracji, `.prezent` legacy i test mieszanej prezentacji na Windows.
10. Na koniec `npm run verify` oraz odpowiedni Electron smoke/E2E. Dla funkcji wymagających prawdziwego kodeka/telewizora oznacz `NOT RUN` lub `UNVERIFIED`, jeżeli sprzętu nie ma. Aktualizuj `docs/FEATURE_MATRIX.md`, `TASKS.md`, `TESTING.md` i `PROGRESS.md`.

## Kryteria DONE
Brak atrapy, brak utraty danych, realny plik odtwarzany z dysku, odpowiednie testy PASS i dokumentacja zgodna z działaniem. Format wymieniony w UI jako wspierany dopiero po weryfikacji kodeka na docelowym systemie.
