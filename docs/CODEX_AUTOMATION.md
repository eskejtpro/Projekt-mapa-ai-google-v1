# Automatyzacja Codex i kontroli jakości

## Źródła prawdy
- `AGENTS.md`: zasady pracy; `.agents/skills/*/SKILL.md`: instrukcje uruchamiane kontekstowo.
- `package.json`: polecenia; `scripts/verify.mjs`: bramka szybkiej i pełnej weryfikacji.
- `docs/FEATURE_MATRIX.md`, `TESTING.md`, `DEFINITION_OF_DONE.md`: zakres, dowody i kryteria DONE.
- `reports/`: lokalne artefakty testów, ignorowane przez Git; CI przechowuje raporty przez 14 dni.

## Przepływ pracy
1. Zaktualizuj gałąź roboczą bez nadpisywania zmian użytkownika; nie pracuj bezpośrednio na main.
2. Ustal ID zadania, kryteria i wpływ na prywatne dane oraz kompatybilność.
3. Dodaj test regresyjny/behawioralny dla zmienianej funkcji; odpowiedni test SQLite, IPC, restartu Electron lub Windows, gdy dotyczy.
4. Uruchom `npm run verify` (lokalnie); pre-commit używa `npm run verify -- --quick`, pre-push pełnego verify.
5. Otwórz PR. CI Windows uruchamia `npm ci`, `npm run verify` i audyt zależności produkcyjnych; dowód z konkretnego commita wymagany przed scaleniem.
6. Wydanie: osobno przetestuj NSIS, portable, aktualizację, przywracanie kopii, Windows 10/11 i ewentualnie fizyczny TV. `release:check` nadal celowo blokuje niezweryfikowane wydanie.

## Polecenia
- `npm run automation:check` — sprawdza strukturę konfiguracji Codex, skilli, Git hooks i CI. Jest to **walidacja statyczna**, nie uruchomienie hooków przez Codex.
- `npm run test:tooling` — testy hooków i walidatora, w tym przypadki błędne.
- `npm run verify -- --quick` — szybka bramka przed commitem.
- `npm run verify` — pełne testy i build.
- `npm run hooks:install` — aktywuje lokalne Git hooks; Git sam nie instaluje ich przy klonowaniu.

## Ważne ograniczenia
- Hooki Codex w `.codex/hooks.json` wymagają zaufania do repo i zgodnej wersji klienta. Manualne testy `lifecycle.mjs` **nie są** dowodem automatycznego wywołania przez klienta.
- Workflow CI jest bramką jakości kodu, nie testem fizycznej instalacji Windows 10/11, prawdziwych zdjęć, LAN ani TV.
- Nie uruchamiaj automatycznego merge, tagowania, publikowania instalatora lub migracji danych użytkownika bez oddzielnych kryteriów i zatwierdzenia.
- Nie zapisuj promptów, zdjęć, filmów, tokenów, GPS ani baz w raportach; artefakty CI mogą zawierać metadane testów, dlatego korzystaj z danych syntetycznych.
- Nie instaluj zewnętrznych MCP i skilli automatycznie. Korzystaj z oficjalnej dokumentacji i minimalnego zestawu skryptów.

## Dokumentacja referencyjna
- https://developers.openai.com/docs/hooks
- https://developers.openai.com/blog/skills-agents-sdk
- https://docs.github.com/en/actions
