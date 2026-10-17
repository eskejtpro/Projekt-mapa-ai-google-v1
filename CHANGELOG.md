# CHANGELOG.md - Dziennik Zmian Projektu „Prezent”

Wszystkie znaczące zmiany w tym projekcie są rejestrowane w tym dokumencie.
Format oparty na [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
