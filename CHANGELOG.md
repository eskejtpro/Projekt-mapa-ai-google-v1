# CHANGELOG.md - Dziennik Zmian Projektu „Prezent”

Wszystkie znaczące zmiany w tym projekcie są rejestrowane w tym dokumencie.
Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.3.0] - 2026-10-17
### Dodano i Udoskonalono
- **Menu kontekstowe prawego przycisku myszy (PPM) na mapie świata**:
  - Kliknięcie prawym przyciskiem myszy w dowolnym miejscu na mapie wyświetla eleganckie, nowoczesne menu kontekstowe z dokładnymi współrzędnymi geograficznymi i automatycznie odgadywaną najbliższą nazwą miejscowości/kraju.
  - Opcje menu kontekstowego:
    1. *Dodaj zdjęcia w tym miejscu* – natychmiastowe otwarcie wyboru plików ze wstępnie przypisanym punktem geograficznym.
    2. *Dodaj cały katalog / folder tutaj* – otwarcie selektora folderu (`webkitdirectory`) z automatycznym przypisaniem współrzędnych dla fotografii bez GPS w EXIF.
    3. *Wklej ze schowka (Ctrl+V)* – bezpośredni odczyt obrazu ze schowka systemowego i zapis w wyznaczonym punkcie na mapie.
    4. *Dodaj gotową paczkę podróżniczą* – wybór tematycznych kolekcji zdjęć.
    5. *Dodaj z linku URL* – dodanie grafiki z internetu lub lokalnego dysku sieciowego/NAS.
    6. *Kopiuj współrzędne* – skopiowanie współrzędnych DMS/dziesiętnych do schowka z powiadomieniem.
    7. *Przybliż i wyśrodkuj tutaj* – płynny najazd kamery na wskazane współrzędne.
- **Wielofunkcyjne Centrum Dodawania Zdjęć (`ImportModal`)**:
  - Wprowadzono 5 dedykowanych trybów importu w czytelnych zakładkach: *Pliki zdjęć*, *Cały katalog / folder* (wraz z podkatalogami), *Wklej ze schowka (Ctrl+V)*, *Link URL* oraz *Pakiety podróżnicze*.
  - Dodano gotowe paczki podróżnicze: *Tatry i Zakopane*, *Bursztynowy Bałtyk – Hel i Trójmiasto*, *Cinque Terre we Włoszech*, *Romantyczny Paryż* oraz *Słoneczna Dalmacja w Chorwacji*.
  - Szybki wybór popularnych lokalizacji (Gdańsk, Zakopane, Kraków, Warszawa, Rzym, Wenecja, Santorini, Paryż, Dubrownik itp.) za pomocą 1 kliknięcia w pigułkę.
- **Przeciągnij i upuść (Drag & Drop) na mapę**:
  - Przeciągnięcie plików z Eksploratora Windows i upuszczenie ich na mapę aktywuje celownik z podglądem współrzędnych i przypisuje je do importowanych fotografii.
- **Przycisk szybkiego dodawania na mapie**:
  - Pływający przycisk *„➕ Dodaj zdjęcia / katalog”* w lewym górnym rogu mapy z rozwijanym menu operacji i wskazówką o użyciu prawego przycisku myszy.

## [1.2.4] - 2026-10-17
### Dodano i Udoskonalono
- **System powiadomień i potwierdzeń Windows 11**:
  - Całkowicie wyeliminowano wywołania `window.alert()` i `window.confirm()` na rzecz estetycznych powiadomień Toast w stylu Windows 11 Action Center oraz natywnych okien modalnych potwierdzeń z akcjami anulowania i zatwierdzenia.
  - Dodano dedykowane okno **Skrótów Klawiszowych** (`ShortcutsModal`) dostępne z menu Pomoc w pasku tytułowym okna Windows.
  - Zaktualizowano wyszukiwarkę na mapie, wprowadzając elegancki komunikat braku wyników w interfejsie.
  - Zsynchronizowano nazwę aplikacji w `metadata.json` do oficjalnej: **„Prezent Mapy”**.

## [1.2.3] - 2026-10-17
### Naprawiono i Udoskonalono
- **Wygląd i renderowanie mapy (Leaflet)**:
  - Naprawiono konflikt między resetem obrazków Tailwind CSS (`img { max-width: 100%; height: auto; }`) a kafelkami Leaflet (`.leaflet-tile`), dodając reguły `max-width: none !important; max-height: none !important;` oraz absolutne pozycjonowanie paneli kafli, eliminując szpary, zniekształcenia i rozjeżdżanie się mapy.
  - Wprowadzono bezpośredni pasek szybkiego wyboru wyglądu mapy (**Nocny Dark Matter**, **Satelita Esri**, **Kolor / Teren Voyager OSM**, **Ulice Esri**, **Dzień Positron**) umieszczony na górze mapy z natychmiastowym przełączaniem w 1 kliknięcie.
  - Zastąpiono blokowany serwer kafelków OSM stabilnym podkładem OpenStreetMap Carto Voyager z obsługą kafelków wysokiej rozdzielczości `{r}` (Retina).
  - Dodano wieloetapowe odświeżanie rozmiaru kontenera (`invalidateSize()`) po załadowaniu oraz obsługę zmian rozmiaru okna i przełączania zakładek.
  - Dostosowano kontener mapy do pełnej wysokości okna roboczego bez zbędnych zewnętrznych pasków przewijania.
  - Dodano zabezpieczenie przed błędami ładowania miniatur zdjęć w pinezkach (`onerror fallback`).

## [1.2.2] - 2026-10-17
### Naprawiono
- Wyeliminowano błąd React `Cannot update a component (App) while rendering a different component (OfflineMapsModal)` poprzez zabezpieczenie timera pobierania pakietów map i odseparowanie aktualizacji stanu rodzica od funkcyjnego reducera postępu.
- Oficjalna nazwa programu została zaktualizowana na: **„Prezent Mapy”** (w belce okna Windows 10/11, menu, oknie właściwości, docku bocznym, eksporcie bazy oraz w znacznikach strony).

## [1.2.0] - 2026-10-17
### Dodano
- **Design System z załączonych zrzutów ekranu**:
  - **Obraz 1 (Settings / Untitled UI)**: 12-kategorialny panel ustawień (*Ogólne, Wygląd i personalizacja, Mapa i geolokalizacja, Galeria i zdjęcia, Import oraz foldery, Pokaz slajdów, Telewizor i prezentacja, Pamięć i dane lokalne, Kopie zapasowe, Wydajność, Prywatność, Informacje o aplikacji*) z wizualnymi kartami wyboru motywu, suwakami i przełącznikami trwale wpływającymi na działanie aplikacji.
  - **Obraz 2 (All Photos / Windows Photos)**: Nowa galeria ze strukturą nagłówka z licznikiem, sekcjami chronologicznymi podzielonymi na miesiące i lata, odznakami EXIF w rogu zdjęć i zróżnicowanymi proporcjami kafelków.
  - **Obraz 3 (Map View & Icon Dock)**: Ciemny globus świata z zaokrąglonymi klastrami z fioletowo-błękitnymi plakietkami liczb (`40`, `8`, `4`, `6`, `29`), pływającymi kontrolkami po prawej stronie (`+`, `—`, `Warstwy`, `Globus`, `Celownik GPS`, `Pokaz slajdów`) oraz wąskim dockiem ikon po lewej stronie z efektem przezroczystości Mica.
- **Narzędzia użytkownika**:
  - `StatsView`: Paszport podróżnika z wykresem odwiedzonych państw, miast, łącznym dystansem km i zakresem lat.
  - `DuplicatesView`: Inteligentny skaner wykrywający powtarzające się ujęcia i serie zdjęć z opcją ich usunięcia.
  - Wyszukiwarka na mapie z animowanym przejściem `flyTo`.
  - Czyszczenie pamięci podręcznej kafelków mapy offline.

## [1.0.0] - 2026-10-17
### Dodano
- Pierwsza stabilna wersja aplikacji „Prezent” z mapą Leaflet, galerią, importem EXIF GPS, pokazem slajdów Ken Burns, trybem TV, ramką okna Windows 10/11 i architekturą pod Androida.
