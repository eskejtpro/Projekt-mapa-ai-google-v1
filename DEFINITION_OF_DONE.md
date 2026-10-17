# DEFINITION OF DONE (DoD) - Standard Jakości Architekta Android

Każde zadanie i zmiana w projekcie uznana za **UKOŃCZONĄ** musi spełniać poniższe kryteria:

## 1. Architektura i Kod
- [ ] Zgodność z Google Modern Android Architecture:
  - Warstwa UI (Compose) nie wykonuje bezpośrednich zapytań do bazy ani sieci.
  - Komunikacja przez ViewModel i jednokierunkowy przepływ danych (UDF).
  - Stan UI reprezentowany przez niezmienne klasy danych (immutability / `@Stable` / `@Immutable`).
  - Zastosowanie `collectAsStateWithLifecycle()` w Compose zamiast zwykłego `collectAsState()`.
- [ ] Brak blokowania wątku głównego (Main/UI Thread):
  - Wszystkie operacje wejścia/wyjścia (I/O, Room, sieć) zabezpieczone przez `withContext(Dispatchers.IO)`.
- [ ] Strategia Offline-First:
  - Baza Room jako Single Source of Truth (SSOT).
  - UI obserwuje `Flow<List<T>>` z DAO, a operacje synchronizacji aktualizują lokalny cache.

## 2. Jakość UI & UX (Jetpack Compose & Material 3)
- [ ] Wykorzystanie komponentów Material 3 (`ColorScheme`, `Typography`, `Shapes`).
- [ ] Obsługa wszystkich stanów ekranu: `Loading`, `Success`, `Empty`, `Error` z możliwością ponowienia akcji (Retry).
- [ ] Prawidłowe zarządzanie pamięcią i recomposition optimization (pamiętanie lambd, stabilne klucze `key` w `LazyColumn`).
- [ ] Pełna obsługa zmian konfiguracji (obrót ekranu, tryb ciemny/jasny, dynamiczny motyw Material You).

## 3. Bezpieczeństwo i Przechowywanie Danych
- [ ] Poufne dane przechowywane za pomocą `EncryptedSharedPreferences` lub zaszyfrowanego DataStore.
- [ ] Migracje bazy Room pokryte testami (`MigrationTestHelper`).
- [ ] Wyłączenie logowania wrażliwych tokenów w produkcyjnych buildach.

## 4. Testy i Walidacja
- [ ] Testy jednostkowe ViewModeli z użyciem `StandardTestDispatcher` i `Turbine` dla Flow.
- [ ] Testy DAO bazy Room w pamięci (`inMemoryDatabaseBuilder`).
- [ ] Sukces budowania projektu bez ostrzeżeń krytycznych.
- [ ] Brak ostrzeżeń w Android Lint i Detekt.

## 5. Dokumentacja
- [ ] Wpisy zaktualizowane w `PROGRESS.md` i `CHANGELOG.md`.
- [ ] Zmiany opatrzone czytelnym komentarzem architektonicznym.
