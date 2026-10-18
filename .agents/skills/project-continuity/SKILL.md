---
name: project-continuity
description: Zasady ciągłości projektu, przekazywania kodu i zachowania architektury dla OpenAI Codex i inżynierów.
---

# Skill: Project Continuity dla Aplikacji „Prezent Mapy”

## Odtworzenie sesji
Odczytaj PROGRESS.md / SESSION HANDOFF, TASKS.md i docs/FEATURE_MATRIX.md. Sprawdź branch, HEAD, remote i niezapisane zmiany. Historyczne opisy AI Studio nie są aktualnymi dowodami runtime. Po iteracji zapisz wyniki i jeden następny krok. Przed nowym czatem przygotuj handoff, nie kopiuj pełnej rozmowy. Nie sugeruj nowego czatu tylko na podstawie liczby wiadomości.

## Kluczowe Zasady Pracy z Projektem dla Inżynierów i OpenAI Codex

1. **Zachowanie działającego interfejsu (Zero Regresji)**:
   - Nigdy nie usuwaj ani nie przebudowuj bez wyraźnej potrzeby istniejącego, działającego interfejsu użytkownika w React (`MapView`, `GalleryView`, `ImportModal`, `SlideshowModal`, `SettingsView`).
   - Wszystkie zmiany muszą zachowywać możliwość uruchomienia i kompilacji w Vite (`npm run build`, `npm run lint`, `npm test`).

2. **Strategia Offline-First & Prywatność**:
   - Wszystkie dane użytkownika, zdjęcia, albumy i notatki muszą pozostać lokalnie na komputerze (Windows 10/11).
   - Nie wprowadzaj zewnętrznych usług chmurowych, telemetrii ani zewnętrznych baz danych.

3. **Separacja Renderer (React) vs Main Process (Electron)**:
   - Kod interfejsu użytkownika w `src/` powinien pozostać czysty i niezależny od bezpośrednich wywołań Node.js (`fs`, `child_process`).
   - Cała komunikacja z systemem Windows (rejestr, Eksplorator, baza SQLite, okna wyboru plików) musi odbywać się przez bezpieczny mostek IPC (`window.electronAPI`) z włączoną izolacją kontekstu (`contextIsolation: true`).

4. **Trwałość danych i schemat `.prezent`**:
   - Zachowaj pełną zgodność ze strukturą danych zdefiniowaną w `src/types/travel.ts`.
   - Format `.prezent` jest oficjalnym formatem kopii zapasowej i wymiany danych.

5. **Rygor Weryfikacji i Dokumentacji**:
   - Każda zmiana kodu musi być zweryfikowana poleceniami `npm run build`, `npm run lint` oraz `npm test`.
   - Po każdej iteracji zaktualizuj `PROGRESS.md`, `TASKS.md`, `CHANGELOG.md` oraz `HANDOFF_CODEX.md`.
