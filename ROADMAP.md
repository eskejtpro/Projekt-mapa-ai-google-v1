# ROADMAP.md - Plan Rozwoju i Modernizacji Projektu Android

## Faza 1: Audyt Wstępny i Ustalenie Bazy Architektonicznej (Aktualna Faza)
- [x] Inwentaryzacja środowiska wykonawczego i analiza struktury repozytorium.
- [x] Zdefiniowanie ram jakościowych (`AGENTS.md`, `.codex/config.toml`, `DEFINITION_OF_DONE.md`).
- [x] Uruchomienie interaktywnego panelu audytora i doradcy architektonicznego.
- [ ] Utworzenie modułów referencyjnych dla wzorców architektonicznych (Core, Data, Domain, UI).

## Faza 2: Warstwa Danych i Offline-First (Priorytet P0)
- [ ] Implementacja Room Database 2.6+ z obsługą Flow, transakcji i automatycznych migracji schematu.
- [ ] Integracja Jetpack DataStore dla preferencji użytkownika i ustawień synchronizacji.
- [ ] Stworzenie warstwy repozytorium z mechanizmem Single Source of Truth (SSOT).
- [ ] Obsługa błędów sieciowych i buforowanie zapytań offline.

## Faza 3: Warstwa Domenowa i Logika Biznesowa (Priorytet P0)
- [ ] Wydzielenie przypadków użycia (UseCases / Interactors) z jednokierunkowym przepływem danych.
- [ ] Wprowadzenie niezmiennego modelu domenowego oraz mapowania DTO <-> Entity <-> DomainModel.
- [ ] Zarządzanie współbieżnością przy użyciu Kotlin Coroutines i Dispatchers.

## Faza 4: Interfejs Użytkownika - Jetpack Compose & Material 3 (Priorytet P1)
- [ ] Implementacja ekranów w Jetpack Compose z pełną obsługą stanu (State Hoisting).
- [ ] Nawigacja oparta na Navigation Compose z bezpiecznym typowaniem (Type-Safe Routes).
- [ ] Optymalizacja rekompozycji (kontrola `@Stable`, pamiętanie lambd, stabilne identyfikatory list).
- [ ] Wsparcie dla motywu dynamicznego (Material You) oraz trybu ciemnego/jasnego.

## Faza 5: Testy, Profilowanie i Stabilne Wydanie Końcowe (Priorytet P0)
- [ ] Pokrycie testami jednostkowymi (ViewModel, Repository, UseCases) z użyciem Turbine i MockK.
- [ ] Testy integracyjne bazy danych Room.
- [ ] Audyt wydajnościowy (Macrobenchmark, Profiler pamięci, detekcja jank/drop frames).
- [ ] Weryfikacja końcowa Definition of Done i przygotowanie paczki release.
