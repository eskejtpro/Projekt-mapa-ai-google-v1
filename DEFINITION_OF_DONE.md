# DEFINITION OF DONE (DoD) - Standard Jakości Projektu „Prezent Mapy”

Każda zmiana w projekcie uznana za **UKOŃCZONĄ** musi spełniać poniższe kryteria:

## 1. Architektura i Kod TypeScript
- [ ] Czyste typowanie TypeScript bez jawnego `any` w kluczowych strukturach danych.
- [ ] Prawidłowa obsługa błędów asynchronicznych (odczyt plików, EXIF, zapis localStorage / backup).
- [ ] Separacja warstwy UI React od środowiska uruchomieniowego: kod interfejsu działa w przeglądarce (Vite) oraz jest w 100% przygotowany na osadzenie w powłoce Electron dla Windows 10/11.
- [ ] Bezpieczeństwo DOM: bezwzględny zakaz wstrzykiwania niezaufanych danych użytkownika przez `innerHTML` (użycie `document.createElement`, `textContent` i bezpiecznych właściwości).

## 2. Jakość UI & UX (Tailwind CSS, Leaflet)
- [ ] Płynne działanie mapy świata Leaflet na wszystkich obsługiwanych podkładach kafelkowych.
- [ ] Brak konfliktów stylów Tailwind z kafelkami Leaflet (`img` w kontenerze mapy).
- [ ] Responsywność okien modalnych, docka bocznego i widoków (Mapa, Galeria, Albumy, Statystyki, Duplikaty, Ustawienia).
- [ ] Działanie skrótów klawiaturowych (Spacja, Strzałki, F11, Esc, PPM na mapie).
- [ ] Działanie powiadomień Windows Toast i modalnych okien dialogowych zamiast `alert()` i `confirm()`.

## 3. Integralność i Trwałość Danych
- [ ] Brak fikcyjnych ścieżek Windows (np. sztucznych `C:\Users\...`) przypisywanych w środowisku webowym.
- [ ] Obsługa ograniczenia limitu pamięci przeglądarki (`localStorage` ~5MB) z ostrzeżeniem dla użytkownika i zachowaniem danych sesji.
- [ ] Poprawność importu i eksportu formatu archiwalnego `.prezent`.
- [ ] Zachowanie współrzędnych EXIF GPS ze zdjęć, z fallbackiem na wskazany punkt na mapie.
- [ ] Skuteczne zapobieganie powstawaniu duplikatów fotografii w bibliotece.

## 4. Weryfikacja Jakości i Testy
- [ ] Pomyślna kompilacja produkcyjna: `npm run build` bez błędów.
- [ ] Brak błędów w analizie statycznej typów: `npm run lint` (`tsc --noEmit`).
- [ ] Zielone testy jednostkowe: `npm test` (`vitest run`).
- [ ] Potwierdzenie działania interaktywnego podglądu w przeglądarce.

## 5. Dokumentacja i Transparentność
- [ ] Uczciwe oznaczanie statusu funkcji: rozróżnienie funkcji działających (UKOŃCZONE), częściowych (CZĘŚCIOWE) i demonstracyjnych/prototypowych (DEMONSTRACYJNE).
- [ ] Aktualizacja `PROGRESS.md`, `TASKS.md`, `CHANGELOG.md` oraz `HANDOFF_CODEX.md`.
