# Wydania

1.3.1 to potwierdzony w changelogu i StorageService numer podglądu przekazania, nie ukończone wydanie Windows. package.json jest od teraz źródłem wersji; src/version.ts udostępnia ją aplikacji i eksportowi.

Nie istnieje zweryfikowany instalator ani portable. npm run release:check zwraca niezerowy kod do czasu wdrożenia desktopu i wymaganych testów. Workflow windows-release.yml uruchamia sprawdzenie ręcznie i nie publikuje GitHub Release.

Po wdrożeniu packaging: build → test instalacji i odinstalowania → test danych i przywracania → SHA-256 artefaktów → changelog i commit → tag → zatwierdzona publikacja. Nigdy nie dodawaj prywatnych fotografii i instalatorów do historii kodu.
