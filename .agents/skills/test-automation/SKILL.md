---
name: test-automation
description: Weryfikuj jednostkowe, integracyjne i środowiskowe testy Prezent Mapy oraz audyt ukończenia.
---

# test-automation

Źródła: TESTING.md i docs/FEATURE_MATRIX.md. Uruchom test właściwy dla zmiany, następnie npm run verify. Sprawdź kod wyjścia i reports/verification.json. Nie utożsamiaj testu localStorage w pamięci z trwałością SQLite ani builda web z instalacją Windows. Nowy błąd odtwórz przed naprawą. Przed wydaniem sprawdź npm run release:check; nie obchodź negatywnego wyniku. DONE wymaga dowodu dla każdego kryterium.
