# Bezpieczeństwo i granice

Zdjęcia i dane biblioteki pozostają lokalnie. Obecny kod wysyła jednak współrzędne do Nominatim i pobiera kafelki oraz obrazy demo. Wymaga to jawnego trybu online; pełnego offline nie potwierdzono.

Electron: contextIsolation=true, nodeIntegration=false, sandbox=true; ograniczony preload, walidacja IPC i ścieżek, CSP i blokada obcych nawigacji. Wdrożenie tych mechanizmów jest kolejnym etapem.

Hooki lokalne nie zastępują sandboxa. PreToolUse ostrzega o wybranych destrukcyjnych komendach, nie analizuje pełnej semantyki powłoki. Kontrola staged jest heurystyczna. Nie przechowujemy promptów ani sekretów w logach.

Pakiety map offline wymagają sprawdzenia licencji i polityki konkretnego dostawcy przed pobieraniem; dokument historyczny nie stanowi zgody na masowe pobieranie.
