# HANDOFF_CODEX.md - Przekazanie Rozbudowanego Projektu do OpenAI Codex

**Data aktualizacji**: 2026-10-17  
**Wersja**: 1.2.0 (Windows 11 Desktop Edition)  
**Status**: W pełni przetestowany, zgodny ze wskazanym stylem wizualnym, gotowy do budowy instalatora Windows.

---

## 1. Zaimplementowany Design System i Moduły
Projekt został rozbudowany w oparciu o trzy kluczowe wzorce interfejsu przesłane przez użytkownika:
1. **Pionowy Dock Ikon & Luksusowa Mapa Świata (Obraz 3)**:
   - Plik: `/src/components/SidebarDock.tsx`
   - Plik: `/src/components/MapView.tsx`
   - Wąski dock z lewej strony z efektem przezroczystości Mica/Acrylic.
   - Pływające kontrolki mapy po prawej stronie (`+`, `-`, warstwy, globus, GPS, pokaz slajdów).
   - Zaokrąglone klastry zdjęć z fioletowymi i błękitnymi licznikami.
2. **Galeria Wszystkie Zdjęcia (Obraz 2 - Windows Photos)**:
   - Plik: `/src/components/GalleryView.tsx`
   - Sekcje chronologiczne dat (miesiące/lata), odznaki EXIF GPS w rogu miniatur, zróżnicowane kafelki.
3. **12-kategorialny Panel Ustawień (Obraz 1 - Untitled UI)**:
   - Plik: `/src/components/SettingsView.tsx`
   - Kategorie: *Ogólne, Wygląd i personalizacja, Mapa i geolokalizacja, Galeria i zdjęcia, Import oraz foldery, Pokaz slajdów, Telewizor i prezentacja, Pamięć i dane lokalne, Kopie zapasowe, Wydajność, Prywatność, Informacje o aplikacji*.
   - Wizualne karty motywu (System / Dark / Light), suwaki, przełączniki trwale zapisywane w `localStorage`.
4. **Narzędzia analityczne i porządkowe**:
   - `/src/components/StatsView.tsx` (Paszport podróżnika, dystans km, odwiedzone kraje i miasta).
   - `/src/components/DuplicatesView.tsx` (Wykrywanie i usuwanie powtarzających się fotografii).

---

## 2. Kolejne Zadania dla Codexa przy Przejęciu z GitHuba
1. **Opakowanie Electron**:
   - Stworzenie `electron/main.ts` z oknem `BrowserWindow({ frame: false, titleBarStyle: 'hidden' })` wykorzystującym gotowy `WindowsTitleBar`.
   - Zapewnienie natywnego dialogu wyboru folderu (`dialog.showOpenDialog`).
2. **Kompilacja instalatora**:
   - Konfiguracja `electron-builder` pod cel `nsis` (Windows 10/11 x64 installer).
3. **Android**:
   - Wykorzystanie schematu bazy z `/src/types/travel.ts` i generatora kopii zapasowej `.prezent` w aplikacji Jetpack Compose.
