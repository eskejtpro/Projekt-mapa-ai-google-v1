# Prezent Mapy – Rodzinne Wspomnienia i Podróże na Mapie Świata

**Prezent Mapy** to nowoczesna, lokalna aplikacja zaprojektowana dla systemu **Windows 10/11**, służąca do prezentowania rodzinnych zdjęć, wspomnień i podróży na interaktywnej mapie świata.

Aplikacja jest obecnie podglądem web; celem jest lokalna wersja Windows. Kafelki map, obrazy demo i geokodowanie korzystają z sieci. Aktualne statusy i ograniczenia: `docs/FEATURE_MATRIX.md` i `docs/KNOWN_ISSUES.md`.

Repozytorium GitHub: `https://github.com/eskejtpro/Projekt-mapa-ai-google-v1`

---

## 🚀 Architektura i Środowisko
- **Aktualny stan (Web Preview)**: React 19, TypeScript, Vite, Tailwind CSS 4 oraz Leaflet 1.9; zakres runtime Windows pozostaje niezweryfikowany.
- **Odczyt metadanych**: Biblioteka `exifr` do automatycznego wyciągania współrzędnych GPS, daty wykonania i modelu aparatu.
- **Efekty dźwiękowe**: Synteza nastrojowego szumu oceanu przez Web Audio API (bez zewnętrznych plików mp3).
- **Następny etap (OpenAI Codex)**: Opakowanie gotowego interfejsu w powłokę **Electron** dla Windows 10/11, migracja bazy z localStorage do SQLite (`better-sqlite3`), obsługa natywnego Eksploratora Windows i pakowanie instalatora NSIS.

---

## 🌟 Główne Funkcje

### 1. Interaktywna Mapa Świata
- Podkłady mapowe: CartoDB Dark Matter, Positron, Esri World Imagery (satelita), Esri World Street Map, OpenStreetMap Voyager i Standard.
- Klastrowanie pinezek z miniaturami zdjęć i licznikami wspomnień.
- Bezpieczne popupy DOM (zabezpieczenie przed atakami XSS).
- Wieloetapowe trasy podróży z dystansem w kilometrach.
- **Menu kontekstowe prawego przycisku myszy (PPM)**: kliknij w dowolny punkt mapy, aby wycentrować widok lub dodać zdjęcia/katalog przypisane do tych współrzędnych.

### 2. Centrum Importu Fotografii (5 Trybów)
- **Wybór plików**: Pojedyncze lub wielokrotne zdjęcia z dysku z podglądem i paskiem postępu.
- **Całe katalogi**: Import folderów wraz z podkatalogami.
- **Drag & Drop na mapę**: Przeciągnij zdjęcia bezpośrednio na mapę świata – współrzędne punktu upuszczenia zostaną automatycznie przypisane fotografiom bez własnego GPS.
- **Wklejanie ze schowka systemowego**: Klawisz `Ctrl + V` lub dedykowany przycisk w oknie importu.
- **Zdjęcia z internetu (URL)**: Podgląd na żywo i pobranie grafiki do biblioteki.
- **Gotowe pakiety podróżnicze**: Błyskawiczny import tematycznych kolekcji wspomnień (Tatry, Włochy, Lazurowe Wybrzeże, Dalmacja).
- **Zabezpieczenie przed duplikatami**: Automatyczne wykrywanie i pomijanie powtórzonych ujęć.

### 3. Galeria i Albumy
- Przełączanie widoków: Siatka kafelków, Albumy wypraw oraz Oś Czasu (Timeline rok po roku).
- Filtrowanie po kraju, roku, albumie, ulubionych oraz natychmiastowa wyszukiwarka.
- Diagnostyka i usuwanie duplikatów.
- Paszport Podróżnika ze statystykami (liczba odwiedzonych krajów, miast, łączny dystans wypraw).

### 4. Kinowy Pokaz Slajdów & Prezentacja TV
- Płynny efekt powolnego zbliżenia kadru (*Ken Burns*).
- Mini-mapa Picture-in-Picture w rogu ekranu wskazująca lokalizację aktualnego zdjęcia.
- Szum oceanu w tle (Web Audio API).
- Pełna obsługa z klawiatury (Spacja = pauza/start, Strzałki = nawigacja, F11 = pełny ekran, Esc = wyjście).
- Przygotowanie do salonu 4K i dużych telewizorów (duża typografia, tryb kinowy).

### 5. Bezpieczeństwo i Kopia Zapasowa `.prezent`
- Eksport całej bazy (zdjęcia, albumy, trasy, ustawienia) do pojedynczego pliku `.prezent`.
- Możliwość wymazania współrzędnych GPS przed udostępnieniem pliku rodzinie.
- Import archiwum JSON; pełna walidacja i atomowość zapisu wymagają poprawy.

---

## 🛠️ Uruchomienie i Rozwój

```bash
# Instalacja zależności
npm ci

# Uruchomienie deweloperskie (port 3000)
npm run dev

# Kompilacja produkcyjna
npm run build

# Analiza statyczna typów
npm run lint

# Testy jednostkowe
npm test
```

Dokładne wytyczne architektoniczne i instrukcja przekazania projektu do OpenAI Codex znajdują się w pliku `HANDOFF_CODEX.md`.
