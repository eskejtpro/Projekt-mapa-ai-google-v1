---
name: windows-electron
description: Buduj integrację Electron/IPC i wydania Windows Prezent Mapy; używaj przy implementacji desktop lub packaging.
---

# windows-electron

Najpierw sprawdź docs/FEATURE_MATRIX.md i aktualny package.json. Proces main obsługuje system plików i SQLite. Renderer nie otrzymuje fs ani dowolnego invoke. Wymagaj contextIsolation, nodeIntegration false, sandbox, walidacji nadawcy i argumentów IPC oraz blokady nieznanych nawigacji. Zachowaj UI i fallback Vite. Testuj okno, preload, błędne IPC i ścieżki, następnie instalator/portable na Windows. Dokumentuj niewykonane testy multi-monitor/Windows 10. Packaging i publikacja to osobne etapy.
