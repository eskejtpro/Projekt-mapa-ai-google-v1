# GPS filmów i pełne kopie — 1.6.0

## Zakres GPS

Importer MP4 odczytuje pozycję `loci` z kontenera oraz QuickTime `©xyz` (ISO-6709). Parser przegląda wyłącznie atomy `moov/udta`, limituje ich liczbę i rozmiar metadanych, domyka plik w `finally`. Filmy WebM bez GPS pozostają bez lokalizacji. Brak informacji nigdy nie oznacza punktu (0,0).

Test rzeczywistych plików generowanych FFmpeg potwierdza MP4 `loci` dla Warszawy oraz MOV `©xyz` dla Sydney, porównuje wynik z `ffprobe` i sprawdza trwałość GPS po ponownym otwarciu SQLite. **MOV jest próbką parsera metadanych, nie deklaracją obsługi importu/odtwarzania MOV.** Inne warianty, np. `mdta/com.apple.quicktime.location.ISO6709`, GPMF i ścieżki telemetryczne pozostają nieobsługiwane.

W galerii rozwiń „Dodaj lokalizację” / „Lokalizacja na mapie”. Wprowadź oba pola i wybierz „Zapisz GPS”. Puste pola, liczby niefinitywne i wartości poza zakresem są odrzucane. Zmiana współrzędnych czyści stare nazwy miasta i kraju. „Usuń GPS” usuwa tylko metadane aplikacji; oryginalny plik nie jest modyfikowany.

## Pełna kopia biblioteki

Windows: **Ustawienia → Kopie zapasowe → Zapisz pełną kopię**. Wybierz folder na innym dysku. Powstaje nowy katalog zawierający `library.sqlite`, `photos/`, `videos/` i `manifest.json` z SHA-256 oraz rozmiarem każdego pliku. Przenoś cały folder razem. Filmy są kopiowane strumieniowo; żaden film nie jest osadzany jako Base64 ani w SQLite.

**Przywróć pełną kopię** wymaga wybrania tego katalogu i potwierdzenia w oknie Windows. Przed przywracaniem zapisywana jest pełna kopia aktualnej biblioteki w `userData/backups/before-restore-*`. Przywracanie dodaje rekordy; istniejące dane i ustawienia są zachowywane. Konflikt identyfikatora z inną treścią, brak pliku, niezgodny hash lub niebezpieczna ścieżka zatrzymują operację. Konflikt należy rozwiązać na kopii danych; aplikacja nie nadpisuje go automatycznie.

Starszy eksport i harmonogram `.prezent` nadal obejmują zdjęcia, albumy, trasy i ustawienia. **Nie zawierają filmów.** Do filmów służy pełna kopia folderowa. Pełna kopia lokalnych plików nie pobiera zdjęć reprezentowanych wyłącznie przez zewnętrzny URL i nie zawiera pakietu MBTiles.

## Testy i narzędzia

Testy verify/Electron/GPS używają `.test-tools/tmp` w projekcie zamiast systemowego TEMP na C:. Jest to ustawienie wyłącznie procesu testowego i jego dzieci, bez zmiany globalnych ustawień Windows. Podczas pracy wykryto ENOSPC na C:; dalsze duże próby i instalację zależności wykonuje się na dysku projektu.

- `npm run verify` obejmuje regresję zdjęć, SQLite, kopie i zabezpieczenia protokołu.
- `npm run test:e2e:electron` używa izolowanego katalogu tymczasowego i syntetycznego kontenera do testów błędów/UI.
- `npm run test:video-gps-real` generuje rzeczywiste MP4/MOV; wymaga katalogu portable w `PREZENT_FFMPEG_DIR`.
- `npm run test:video-playback-real` generuje H.264/AAC, VP8/Opus i VP9/Opus, potwierdza kodeki ffprobe, a następnie uruchamia każdy w produkcyjnym UI Electron. Sprawdza klatki, czas, pauzę, seek, miniaturę, marker/popup offline, backup/restore, restart oraz 1512 mediów syntetycznych na mapie.
- `scripts/setup-video-test-tools.ps1` pobiera FFmpeg 9.0.2 z [Gyan](https://www.gyan.dev/ffmpeg/builds/), dostawcy wskazanego na [stronie FFmpeg](https://ffmpeg.org/download.html). Przed rozpakowaniem porównuje przypięty SHA-256 `60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba`. Binaria i próbki są wyłącznie narzędziami testowymi, poza Git i instalatorem.

Odtwarzanie jest testowane z wyciszeniem, więc odsłuch głośników jest **UNVERIFIED**. Ręcznie: otwórz każdą próbkę, wyłącz wyciszenie, ustaw głośność i sprawdź słyszalny ton, pauzę, wznowienie i seek. Nie twierdzimy, że test syntetyczny dowodzi płynności dowolnej biblioteki 4K albo sprawdza pliki 20 GB.

## Reguły wyglądu

`DESIGN.md` i `.impeccable/design.json` dokumentują istniejący motyw oraz nowe formularze. Zmiany PR #6 zachowują układ galerii, dock i mapę; formularz GPS rozwija się na żądanie, ma trwałe etykiety, fokus klawiatury i jawny błąd. Pokaz mieszany i TV pozostają kolejnymi etapami.
