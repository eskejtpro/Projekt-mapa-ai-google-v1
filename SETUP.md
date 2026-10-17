# SETUP.md - Instrukcja Uruchomienia i Budowania Aplikacji Prezent

## 1. Wymagania Środowiskowe
- **Node.js**: 24 (CI) lub lokalna zgodna wersja 24–26; sprawdzono 26.8.1.
- **Menedżer pakietów**: npm i package-lock.json są kanoniczne; bun.lock zachowano historycznie.
- **Docelowy system operacyjny**: Windows 10 / Windows 11 (64-bit)

## 2. Uruchomienie Podglądu Deweloperskiego (Vite)
Aby uruchomić interaktywny podgląd aplikacji w przeglądarce:
```bash
npm ci
npm run hooks:install
npm run verify
npm run dev
```
Aplikacja będzie dostępna pod adresem: `http://localhost:3000`.

## 3. Budowanie Wersji Produkcyjnej (Web / Dist)
```bash
npm run build
```
Zbudowane zoptymalizowane pliki produkcyjne znajdą się w katalogu `/dist`.

## 4. Przygotowanie do Uruchomienia jako Aplikacja Windows (Electron)
Poniżej plan przyszłego etapu. Electron nie jest zainstalowany; electron:dev/electron:build nie są jeszcze działającymi poleceniami. Patrz RELEASES.md.
Aplikacja jest zaprojektowana tak, aby rdzeń interfejsu React SPA współpracował z procesem głównym Electrona:
```bash
# Instalacja Electrona (jeśli nie jest zainstalowany)
npm install --save-dev electron electron-builder

# Uruchomienie w oknie Windows
npm run electron:dev

# Zbudowanie instalatora .exe na Windows 10/11
npm run electron:build
```
Konfiguracja okna Windows:
- Rozdzielczość początkowa: 1400x900 px
- Minimalna rozdzielczość: 1024x720 px
- Obsługa akceleracji sprzętowej GPU dla kafelków mapy Leaflet i animacji Ken Burns.
- Uprawnienia dostępu do lokalnego folderu obrazów przez IPC API.
