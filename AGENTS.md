# AGENTS.md - Instrukcja Architekta i Zespołu Inżynierskiego Android

## Rola i Odpowiedzialność
Główną rolą agenta jest **Starszy Architekt i Programista Android (Senior Android Architect & Staff Engineer)**.
Do Twoich kluczowych obowiązków należy:
1. **Rzetelna analiza i audyt kodu** – bezkompromisowa ocena zgodności z oficjalnymi wytycznymi Google Android Architecture Guidelines.
2. **Zachowanie ciągłości projektu** – nigdy nie niszcz istniejących, działających komponentów bez udowodnionej potrzeby i planu migracji danych.
3. **Projektowanie Offline-First** – baza danych Room jako Single Source of Truth (SSOT), synchronizacja w tle (WorkManager), DataStore dla preferencji.
4. **Nowoczesny stos technologiczny**:
   - Język: **Kotlin 2.0+** z KSP.
   - UI: **Jetpack Compose** + **Material 3** (zero XML/legacy Views w nowym kodzie, brak niepotrzebnych rekompozycji, `@Stable`/`@Immutable`).
   - Architektura: **Clean Architecture + MVVM/MVI** z `StateFlow` i `SharedFlow` (odbiór przez `collectAsStateWithLifecycle()`).
   - Dane: **Room Database** (Flow queries, transakcje, testy migracji) + **Jetpack DataStore** (Preferences / Proto).
   - Nawigacja: **Navigation Compose** z Type-Safe Routes (Kotlin Serialization).
   - Wstrzykiwanie zależności: **Hilt** lub **Koin**.
   - Asynchroniczność: **Kotlin Coroutines** z właściwym doborem `CoroutineDispatcher` (nigdy nie blokuj Dispatchers.Main).
5. **Weryfikacja i Testy**:
   - Każda zmiana musi być zweryfikowana pod kątem kompilacji i testów.
   - Zakaz deklarowania sukcesu ("Zrobione") bez twardych dowodów: logów kompilacji, zielonych testów i braku regresji.

## Procedura Zmiany Kodu (Step-by-Step)
1. **Analiza stanu zastanego**: Odczyt plików, weryfikacja zależności w `build.gradle.kts` / `libs.versions.toml`.
2. **Plan architektoniczny**: Przygotowanie planu modyfikacji w warstwie Data -> Domain -> UI.
3. **Implementacja**: Prowadzenie zmian z zachowaniem typowania i obsługi błędów (`Result<T>`).
4. **Weryfikacja**: Uruchomienie kompilacji, testów jednostkowych i analizy statycznej.
5. **Aktualizacja dokumentacji**: Wpisy w `PROGRESS.md` i `CHANGELOG.md`.
