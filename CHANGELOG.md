# CHANGELOG.md - Dziennik Zmian Projektu „Prezent”

Wszystkie znaczące zmiany w tym projekcie są rejestrowane w tym dokumencie.
Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-10-17
### Dodano
- **Natywna Ramka Okna Windows 10/11**:
  - Klasyczny pasek tytułowy Windows z ikoną programu, nazwą oraz przyciskami: Minimalizuj (`—`), Maksymalizuj / Przywróć (`🗖` / `🗗`), Zamknij (`✕` z czerwonym podświetleniem).
  - Pasek menu Windows z opcjami: *Plik*, *Widok*, *Narzędzia*, *Pomoc*.
  - Klasyczny pasek stanu Windows (Status Bar) na dole okna z informacją o katalogu `C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\` i stanie programu.
  - Okno dialogowe właściwości programu *„O programie Prezent (Windows 11 Desktop Edition)”*.
- **Interaktywna Mapa Świata**:
  - Obsługa kafelków CartoDB Dark Matter, Positron, OpenStreetMap i Esri World Imagery (Satelita).
  - Niestandardowe pinezki fotograficzne z miniaturami zdjęć i licznikami w danej lokalizacji.
  - Rysowanie wieloetapowych tras wypraw z dystansem i numerowanymi etapami.
  - Szybka nawigacja do odwiedzonych krajów i miast.
- **Galeria i Albumy Rodzinne**:
  - Trzy tryby przeglądania: Siatka zdjęć, Karty albumów oraz Chronologiczna Oś Czasu (Timeline).
  - Wyszukiwarka pełnotekstowa oraz filtry: kraj, rok, ulubione, uczestnicy, tagi.
  - Wyraźne oznaczenie demonstracyjnych wspomnień vs prywatne fotografie użytkownika.
- **Import Zdjęć z Komputera & EXIF GPS**:
  - Wybór pojedynczych plików oraz całych folderów (Drag & Drop / directory picker).
  - Integracja biblioteki `exifr` do automatycznego odczytu geolokalizacji GPS, daty wykonania i aparatu.
  - Ręczne geokodowanie awaryjne dla fotografii ze starszych aparatów.
- **Kinowy Pokaz Slajdów (Slideshow)**:
  - Efekt powolnego przybliżenia i panoramy *Ken Burns*.
  - Picture-in-Picture mini-mapa z dynamicznym wskazaniem miejsca wykonania fotografii.
  - Generator nastrojowego tła audio (szum oceanu) przez natywne Web Audio API (100% offline).
  - Pełne sterowanie klawiaturą (Strzałki, Spacja, Esc) i wybór interwału czasu.
- **Prezentacja na Telewizorze (Tryb TV / Salon 4K)**:
  - Widok wielkoekranowy z instrukcją połączeń Miracast (Win+K), HDMI i Google Cast.
  - Kod QR Smart Remote do sterowania ze smartfona.
- **Menedżer Map Offline**:
  - Pobieranie pakietów kafelków regionalnych do pamięci lokalnej (Polska, Włochy, Grecja, Japonia, Norwegia).
  - Symulacja trybu samolotowego (brak sieci).
- **Zarządzanie Plikami Windows & Prywatność**:
  - Ścieżka systemowa `C:\Users\Rodzina\Obrazy\Prezent-Wspomnienia\`.
  - Możliwość usunięcia danych demo jednym kliknięciem lub ich przywrócenia.
  - Eksport i import spójnego pliku kopii zapasowej `.prezent`.
- **Kompletna Dokumentacja Projektu**:
  - `AGENTS.md`, `README.md`, `SETUP.md`, `GOALS.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `TASKS.md`, `DEFINITION_OF_DONE.md`, `ARCHITECTURE.md`, `PROGRESS.md`, `DECISIONS.md`, `TESTING.md`, `CHANGELOG.md`, `.codex/config.toml`, `.agents/skills/project-continuity/SKILL.md` oraz `HANDOFF_CODEX.md`.
