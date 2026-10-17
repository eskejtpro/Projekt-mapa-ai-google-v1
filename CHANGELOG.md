# CHANGELOG.md - Dziennik Zmian i Decyzji Architektonicznych (ADR)

Wszystkie znaczące zmiany w tym projekcie są rejestrowane w tym dokumencie.
Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-10-17
### Dodano
- **Inicjalizacja dokumentacji architektonicznej**:
  - `AGENTS.md`: reguły pracy dla inżynierów i agentów, standardy jakościowe Android.
  - `.codex/config.toml`: bramki jakościowe, progi pokrycia testami, zakaz blokowania wątku głównego.
  - `DEFINITION_OF_DONE.md`: rygorystyczna definicja ukończenia zadań z kryteriami weryfikacji.
  - `ROADMAP.md`: fazy rozwoju od audytu wstępnego do stabilnego wydania końcowego.
  - `TASKS.md`: podział zadań na priorytety P0/P1/P2 ze statusem realizacji.
  - `PROGRESS.md`: bieżąca diagnoza stanu kodu i stopnia ukończenia.
- **Audyt stanu zerowego**:
  - Przeprowadzono inspekcję środowiska uruchomieniowego i zidentyfikowano brak podłączonego repozytorium GitHub.
  - Zabezpieczono środowisko pod kątem dalszego rozwoju i weryfikacji kompilacji.
- **Panel Architekta Android (Studio Audytu & Doradztwa)**:
  - Narzędzie analityczne analizujące fragmenty kodu Kotlin/Jetpack Compose/Room/MVVM.
  - Weryfikator zgodności z Google Modern Android Architecture Guidelines.
