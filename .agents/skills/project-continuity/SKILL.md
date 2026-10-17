---
name: project-continuity
description: Zasady ciągłości projektu, przekazywania kodu i zachowania architektury dla OpenAI Codex i inżynierów.
---

# Skill: Project Continuity dla Aplikacji „Prezent”

## Kluczowe Zasady Pracy z Projektem
1. **Nigdy nie niszcz działających funkcji**: Zmiany wprowadzaj inkrementalnie.
2. **Zachowuj interaktywny podgląd**: Każda zmiana musi kompilować się w Vite (`npm run build`, `npx tsc --noEmit`).
3. **Prywatność i Offline-First**: Żadnych zewnętrznych backendów ani chmur bez zgody użytkownika. Dane zapisywane są lokalnie.
4. **Zgodność ze schematem .prezent**: Zachowaj strukturę obiektów `TravelPhoto`, `TravelAlbum`, `TravelTrip` i `GeoLocation`.
5. **Dokumentacja**: Po każdej zmianie zaktualizuj `PROGRESS.md` oraz `CHANGELOG.md`.
