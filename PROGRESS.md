# PROGRESS.md - Aktualny Raport Realizacji i Rozbudowy Projektu „Prezent”

Data: 2026-10-17  
Wersja aplikacji: **1.2.0 (Windows 11 Desktop Edition)**  
Status: **ROZBUDOWANY, ZGODNY ZE WZORCAMI WIZUALNYMI I ZWERYFIKOWANY**  

---

## 1. Faktyczny Postęp w Kodzie i Wdrożone Moduły

| Obszar / Wymóg | Status | Szczegóły Wdrożenia |
|---|---|---|
| **Stylistyka wg Obrazu 1 (Settings / Untitled UI)** | UKOŃCZONE | 12 pełnych kategorii ustawień z wyszukiwarką, kartami wizualnymi motywu (System/Dark/Light), suwakami i przełącznikami. |
| **Stylistyka wg Obrazu 2 (All Photos / Windows Photos)** | UKOŃCZONE | Nagłówek All Photos z licznikiem, sekcje z podziałem chronologicznym na miesiące/lata, odznaki EXIF w rogu miniatur i zróżnicowana siatka. |
| **Stylistyka wg Obrazu 3 (Map View & Icon Dock)** | UKOŃCZONE | Ciemny globus świata, okrągłe pinezki klastrów z fioletowo-błękitnymi plakietkami liczb, pływające kontrolki mapy po prawej stronie (+, -, Warstwy, Globus, Celownik GPS, Pokaz slajdów), wąski lewy dock ikon. |
| **Narzędzia użytkownika: Statystyki podróży** | UKOŃCZONE | Paszport podróżnika (`StatsView`), odwiedzone kraje, miasta, łączny dystans km i zakres lat. |
| **Narzędzia użytkownika: Wykrywanie duplikatów** | UKOŃCZONE | Diagnostyka powtarzających się ujęć (`DuplicatesView`) z możliwością usunięcia zbędnych fotografii. |
| **Natywna ramka okna Windows 10/11** | UKOŃCZONE | Pasek tytułowy Windows, rozwijane menu Plik/Widok/Narzędzia/Pomoc, przyciski systemowe (—, 🗖, ✕), pasek stanu na dole okna. |
| **Prezentacja wspomnień (Pokaz slajdów & TV)** | UKOŃCZONE | Kinowy Ken Burns, mini-mapa PiP, szum oceanu Web Audio API, tryb salonowy TV 4K i pilot QR. |
| **Naprawa i optymalizacja wyglądu mapy (Leaflet)** | UKOŃCZONE | Wyeliminowano konflikt z resetem Tailwind CSS (`max-width: none !important`), dodano bezpośredni pasek zmiany wyglądu mapy (Nocny CartoDB, Satelita Esri, Teren/Kolor Voyager OSM, Drogi Esri, Dzień), zabezpieczono serwery kafelków przed blokadami i dodano wieloetapowe odświeżanie rozmiaru. |
| **Menu kontekstowe PPM na mapie świata** | UKOŃCZONE | Kliknięcie prawym przyciskiem myszy w dowolnym miejscu na mapie otwiera menu z opcjami: dodanie zdjęć w punkcie, dodanie całego katalogu, wklejenie ze schowka (Ctrl+V), dodanie gotowej paczki, link URL oraz kopiowanie współrzędnych. |
| **Wielofunkcyjne centrum dodawania zdjęć (ImportModal)** | UKOŃCZONE | 5 zakładek: pliki zdjęć, cały katalog/folder z podkatalogami (`webkitdirectory`), wklejanie ze schowka systemowego (Clipboard API), dodawanie z linku URL oraz gotowe pakiety podróżnicze (Tatry, Bałtyk, Cinque Terre, Paryż, Dalmacja). |
| **Przeciągnij i upuść (Drag & Drop) na mapę** | UKOŃCZONE | Bezpośrednie upuszczenie plików na mapę przypisuje współrzędne geograficzne punktu pod kursorem do fotografii bez GPS w EXIF. |

---

## 2. Dowody Weryfikacji Środowiska
- **Kompilacja aplikacji (`compile_applet`)**: `Build succeeded - the applet is compiled`
- **Analiza statyczna TypeScript (`lint_applet` / `tsc --noEmit`)**: `0 errors, 0 warnings`
- **Podgląd interaktywny w Google AI Studio**: Działa płynnie na żywo.
