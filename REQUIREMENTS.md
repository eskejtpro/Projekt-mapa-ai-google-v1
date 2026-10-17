# REQUIREMENTS.md - Wymagania Funkcjonalne i Niefunkcjonalne

## Wymagania Funkcjonalne (FR)
- [x] **FR-01: Interaktywna mapa świata** – obsługa mapy Leaflet z zoomem, przesuwaniem, klastrowaniem i zmianą warstw (Dark, Light, OSM, Satelita).
- [x] **FR-02: Niestandardowe pinezki ze zdjęciami** – znaczniki na mapie zawierają miniatury zdjęć oraz liczbę wspomnień w danym mieście.
- [x] **FR-03: Trasy podróży** – wizualizacja połączeń etapowych między miastami z podsumowaniem kilometrów.
- [x] **FR-04: Galeria i Albumy** – widok siatki, widok albumów oraz chronologiczna Oś Czasu (Timeline).
- [x] **FR-05: Wyszukiwarka i zaawansowane filtry** – wyszukiwanie po tytule, mieście, kraju, notatkach, uczestnikach, tagach oraz filtr roku i ulubionych.
- [x] **FR-06: Import zdjęć z EXIF GPS** – automatyczne wyciąganie współrzędnych geograficznych i daty z plików fotograficznych aparatu.
- [x] **FR-07: Import całych folderów** – możliwość przeciągnięcia lub wskazania katalogu ze zdjęciami.
- [x] **FR-08: Kinowy pokaz slajdów (Slideshow)** – płynny efekt Ken Burns, pełny ekran, Picture-in-Picture mini-mapa, nastrojowy ambient audio.
- [x] **FR-09: Tryb TV / Salon 4K** – interfejs wielkoekranowy z instrukcją Miracast/HDMI oraz pilotem QR.
- [x] **FR-10: Mapy offline** – menedżer pakietów regionalnych do użytku w podróży bez internetu.
- [x] **FR-11: Kopia zapasowa .prezent** – eksport i import całej bazy do pojedynczego pliku archiwalnego.
- [x] **FR-12: Zarządzanie danymi demo** – wyraźne oznaczenie danych demonstracyjnych oraz możliwość ich usunięcia jednym kliknięciem.

## Wymagania Niefunkcjonalne (NFR)
- [x] **NFR-01: Prywatność (Offline-first)** – brak zewnętrznych serwerów bazy danych; trwałość w localStorage / IndexedDB.
- [x] **NFR-02: Wydajność renderowania** – płynne animacje 60 FPS, leniwe ładowanie miniatur (`loading="lazy"`), optymalizacja kafelków.
- [x] **NFR-03: Dostępność podglądu w przeglądarce** – pełna interaktywność w Google AI Studio bez wymogu środowiska natywnego Windows w sandboxie.
- [x] **NFR-04: Gotowość do migracji Electron** – czyste oddzielenie logiki UI od interfejsu systemu plików Windows.
