# Znane problemy

- P1: pozostałe operacje wielokolekcyjne wymagają przeglądu atomowości. Reset demo, usuwanie demo, czyszczenie map, import zdjęć+albumu i .prezent zapisują już stan kontrolowanie; pojedyncze edycje/usuwanie uwzględniają błąd zapisu.
- P0: backup/restore nie obejmuje jeszcze katalogu `videos` ani tabeli `media_items`; filmy pozostają lokalne i nie są deklarowane jako obsługiwane przez `.prezent`.
- P1: stan odzyskiwania po błędzie odczytu jest wdrożony i testowany na uszkodzonym rekordzie. Pozostaje pełna procedura odtwarzania po uszkodzeniu fizycznego SQLite lub braku wielu plików zdjęć.
- P1: Windows zapisuje SQLite i pliki zdjęć, lecz obrazy są nadal odtwarzane jako base64 w pamięci UI. Podgląd Vite nadal ma limit localStorage.
- P1: brak pełnych testów importu JPEG z GPS/bez GPS/uszkodzonych obrazów, schowka i przeciągania folderów. FileReader ma już obsługę błędu i anulowania.
- P1: kafelki online i obrazy demo wymagają sieci. W trybie offline zewnętrzne obrazy są oznaczane placeholderem, a lokalne data URL działają. Automatyczne wysyłanie koordynatów z mapy/PiP usunięte; tryb offline blokuje HTTP(S). Import MBTiles działa; źródła/licencje rzeczywistych pakietów regionalnych nieustalone.
- P1: DLNA discovery oraz pilot QR/HTTP działają w testach; brak fizycznego TV i telefonu do potwierdzenia kompatybilności. Casting niezaimplementowany. Pilot HTTP wyłącznie do zaufanej sieci LAN.
- P1: pozostałe ustawienia wymagają macierzy efektów, zwłaszcza język, motywy i akceleracja. Folder/autostart i harmonogram backupów podłączone; autostart zainstalowanej aplikacji i wielodniowa eksploatacja kopii nieprzetestowane. Kopie pozostają na tym samym dysku i nie zastępują kopii zewnętrznej.
- P1: instalacja/start/deinstalacja NSIS oraz smoke aktualnego portable przetestowane na Windows 10; aktualizacja istniejącej biblioteki, 4K/drugi monitor i Windows 11 pozostają otwarte. Pakiety odpowiadają commitowi 9c4f45b; dokumentacja macierzy jest aktualizowana osobno.
- P2: wymagane dalsze pomiary rzeczywistych zdjęć, wydajności galerii/mapy i szczytowej pamięci. Pomiar syntetycznych metadanych nie dowodzi 60 FPS ani kosztu pełnowymiarowych obrazów.

Aktualne dowody: TESTING.md i reports/. Stan funkcji: docs/FEATURE_MATRIX.md. Historia wcześniejszych usterek pozostaje w Git.
