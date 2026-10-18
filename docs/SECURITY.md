# Bezpieczeństwo i granice

Zdjęcia i dane biblioteki pozostają lokalnie. Usunięto automatyczne zapytania Nominatim z menu mapy. Zwykły podkład oraz obrazy demo nadal wymagają sieci; tryb offline blokuje HTTP(S) sesji Electron i używa lokalnego MBTiles. Test syntetycznego pakietu potwierdził lokalny render, nie dostępność rzeczywistych map regionalnych.

Electron: contextIsolation=true, nodeIntegration=false, sandbox=true; ograniczony preload, walidacja IPC i ścieżek oraz blokada obcych nawigacji są wdrożone. Produkcyjne CSP blokuje obce skrypty, ramki i obiekty; smoke potwierdza obecność polityki, odrzucenie niewłaściwej ramki IPC i nowego okna. Nie jest to pełny audyt penetracyjny. Pliki zdjęć są adresowane hashem; odczyt sprawdza integralność. TV discovery wysyła lokalny UDP M-SEARCH tylko podczas korzystania z panelu TV i nie przesyła zdjęć.

Hooki lokalne nie zastępują sandboxa. PreToolUse ostrzega o wybranych destrukcyjnych komendach, nie analizuje pełnej semantyki powłoki. Kontrola staged jest heurystyczna. Nie przechowujemy promptów ani sekretów w logach.

Pakiety map offline wymagają sprawdzenia licencji i polityki konkretnego dostawcy przed pobieraniem; dokument historyczny nie stanowi zgody na masowe pobieranie.
