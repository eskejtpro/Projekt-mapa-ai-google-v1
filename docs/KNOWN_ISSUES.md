# Znane problemy

- P0: import .prezent może zgłosić sukces po nieudanym zapisie; brak transakcji i pełnej walidacji struktury (storage.ts).
- P0: nazwa pliku jest kluczem duplikatów, co grozi fałszywymi dopasowaniami. Kolejka dodatkowo porównuje rozmiar zaokrąglony do MB.
- P0: localStorage przechowuje pełne fotografie jako base64 i nie zastępuje biblioteki dyskowej.
- P1: odczyt FileReader nie ma obsługi onerror/onabort i może pozostawić import w oczekiwaniu.
- P1: Nominatim otrzymuje współrzędne; kafelki map i obrazy demo wymagają sieci. Deklaracja pełnego offline/prywatności nie jest obecnie spełniona.
- P1: mapy offline są symulowane timerem. TV nie wyszukuje urządzeń LAN; QR jest prototypem.
- P1: część ustawień nie steruje docelowym systemem Windows. Default windowsPhotosPath wskazuje fikcyjny katalog rodziny.
- P1: brak testów UI, monitora 4K, SQLite, instalatora i Windows 10.
- P2: web bundle przekracza 500 kB; brak wiarygodnego pomiaru RAM/startu i galerii 100–50000 zdjęć.

To rejestr audytu, nie deklaracja naprawy funkcji. Pierwsza iteracja naprawia konfigurację weryfikacji, a funkcje produktowe będą realizowane w kolejnych etapach.
