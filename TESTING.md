# TESTING.md - Procedury Testowe i Raport Weryfikacji

## 1. Testy Automatyczne (Vitest)
Polecenie: `npm test` (`vitest run`)  
Środowisko: Node.js + Vitest 5  
Status: **6/6 ZDANYCH (100% SUKCES)**

### Wyniki pakietu testowego `src/__tests__/services.test.ts`:
- [x] `StorageService > oblicza rzetelne statystyki podróży (getTravelStats)`: Prawidłowe zliczanie unikalnych krajów, miast, łącznego dystansu i roczników wypraw.
- [x] `StorageService > poprawnie wykrywa duplikaty zdjęć (findDuplicates)`: Wykrywanie powtórzonych fotografii na podstawie identycznej nazwy pliku lub zbliżonych koordynatów GPS i daty.
- [x] `StorageService > eksportuje i importuje kopię zapasową .prezent z zachowaniem spójności struktury`: Prawidłowa serializacja do JSON i walidacja struktury przy imporcie.
- [x] `geoService > dopasowuje najbliższą znaną lokalizację na podstawie współrzędnych geograficznych`: Prawidłowe rozpoznawanie miast w Polsce i Europie.
- [x] `geoService > prawidłowo formatuje współrzędne w formacie N/S E/W`: Formatowanie koordynatów do czytelnej postaci tekstowej.
- [x] `travelPacks > posiada predefiniowane pakiety podróżnicze i poprawnie konwertuje je na zdjęcia i album`: Prawidłowa konwersja gotowych pakietów wspomnień.

---

## 2. Analiza Statyczna i Budowanie Pakietu
- **Analiza statyczna typów TypeScript**: `npm run lint` (`tsc --noEmit`) -> **0 błędów**.
- **Kompilacja produkcyjna Vite**: `npm run build` -> **SUKCES** (utworzono zoptymalizowany bundle `dist/index.html` oraz assety JS/CSS).

---

## 3. Scenariusze Testów Funkcjonalnych Interfejsu

### A. Interaktywna Mapa Świata (Leaflet)
- [x] Poprawne ładowanie wszystkich 6 warstw kafelkowych (CartoDB Dark Matter, Positron, Esri Satellite, Street Map, OSM).
- [x] Wyświetlanie klastrów pinezek i rozbijanie klastrów przy zbliżaniu widoku.
- [x] Bezpieczne renderowanie popupów na mapie (brak wstrzykiwania surowego `innerHTML`, bezpieczne węzły DOM).
- [x] Menu kontekstowe pod prawym przyciskiem myszy (PPM) na mapie z przechwytywaniem współrzędnych klikniętego punktu.

### B. Centrum Importu i Drag & Drop
- [x] Przeciągnięcie plików graficznych na mapę -> automatyczne otwarcie `ImportModal` z przekazaną listą plików i współrzędnymi punktu upuszczenia.
- [x] Odczyt metadanych EXIF GPS przy użyciu biblioteki `exifr` (zachowanie współrzędnych aparatu).
- [x] Fallback na współrzędne punktu mapy dla fotografii bez własnego GPS.
- [x] Wklejanie fotografii ze schowka systemowego klawiszem `Ctrl + V`.
- [x] Dodawanie grafik z adresu URL z podglądem na żywo i walidacją.
- [x] Jednoklikowy import tematycznych pakietów wspomnień (Tatry, Włochy, Lazurowe Wybrzeże, Dalmacja).
- [x] Skuteczne zapobieganie duplikatom plików w kolejce importu i bibliotece głównej.
- [x] Usunięcie fikcyjnych ścieżek dyskowych `C:\Users\...` – przypisywanie wyłącznie rzeczywistych ścieżek, jeśli są udostępnione przez środowisko.

### C. Trwałość Danych i Pamięć Lokalna
- [x] Obsługa limitu `localStorage` (~5MB) z czytelnym komunikatem ostrzegawczym (Windows Action Center Toast) w razie przekroczenia limitu.
- [x] Generowanie i pobieranie pliku kopii `.prezent`.
- [x] Pomyślne przywrócenie bazy z pliku `.prezent`.

### D. Kinowy Pokaz Slajdów i Prezentacja TV
- [x] Odtwarzanie slajdów w trybie pełnoekranowym z efektem Ken Burns.
- [x] Działanie mini-mapy Picture-in-Picture w rogu odtwarzacza.
- [x] Nastrojowy szum oceanu generowany przez Web Audio API (100% offline).
- [x] Obsługa klawiatury (Spacja = pauza/start, Strzałki = poprzednie/następne, F11 = pełny ekran, Esc = wyjście).
- [x] Prezentacja TV 4K: dostosowanie kontrastu i typografii.

### E. Oznaczenie Funkcji Demonstracyjnych
- [x] Menedżer Map Offline oznaczony jako demonstracyjny z informacją o planowanym buforze MBTiles w Electronie.
- [x] Pilot zdalnego sterowania QR Smart Remote oznaczony jako prototyp UI wymagający lokalnego serwera WebSocket w Electronie.
