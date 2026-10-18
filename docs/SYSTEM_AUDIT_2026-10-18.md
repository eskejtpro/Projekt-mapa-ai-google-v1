# Audyt systemowy PR #10 — kandydat 1.8.1, cel Windows 2.0

Aktualna macierz audytu zastępuje historyczne deklaracje ukończenia. Baza: main `f55c972e6c98b2bf5dc14850b809b135239e971d`. Testy wykonano na Windows 10 Pro 19045, na izolowanych profilach. **Decyzja: NOT READY do wydania 2.0 / etapu wydania #11.** Zielone testy kodu nie zamykają brakujących kryteriów produktu.

## Macierz funkcji

DONE oznacza wyłącznie wskazany, sprawdzony zakres, nie certyfikację wszystkich plików i urządzeń.

| Funkcja | Status | Dowód i granica |
|---|---|---|
| Import zdjęć | PARTIAL | Realny UI: JPEG, EXIF GPS, folder, odrzucenie uszkodzonego obrazu, limit 64 MiB i walidacja GPS. Schowek/przeciąganie oraz wszystkie warianty PNG/WebP/GIF nie mają pełnego E2E |
| Import MP4/WebM | PARTIAL | Walidacja kontenerów, duplikaty i import równoległy; kodeki wymagają realnego przebiegu Windows, nie samego canPlayType |
| Galeria, filtrowanie, wyszukiwanie | DONE | E2E galerii, filtrów i wyszukiwania zdjęć; zakres wyszukiwania metadanych filmów ograniczony |
| Albumy i kolejność | DONE | Relacje SQLite, restart; realny błąd IPC zapisu nie daje fałszywego sukcesu |
| Podróże | PARTIAL | Filtr oparty na album.tripId zamiast nazw demo; brak pełnego CRUD podróży |
| Mapa online | UNVERIFIED | Kontener i markery testowane; brak dowodu wszystkich zewnętrznych dostawców i kluczy |
| Mapa offline | PARTIAL | Syntetyczny MBTiles i blokada HTTP; nie dostarczono zweryfikowanych pakietów regionalnych |
| GPS zdjęć i edycja | DONE | Rzeczywisty EXIF testowego JPEG, granice współrzędnych, zachowanie opisu w edytorze |
| GPS filmów | PARTIAL | Obsługiwane określone tagi MP4; brak deklaracji uniwersalnego MOV/AVI/MKV |
| Miniatury zdjęć | PARTIAL | Podgląd działa; źródłowe obrazy nie są pełnym systemem małych miniatur dyskowych |
| Miniatury filmów | PARTIAL | Klatka lub stan zastępczy; cache dyskowy i pełna trwałość metadanych wymagają dalszej pracy |
| Odtwarzacz | PARTIAL | E2E play/pause/seek/dekodowania; odsłuch fizyczny UNVERIFIED |
| Pokaz zdjęć i filmów | PARTIAL | Regresja timerów, ustawienia interwału/PiP/dźwięku/Ken Burns, prawdziwy fullscreen; nie wszystkie opcje są trwale zapisywane |
| DLNA/UPnP AV | PARTIAL | Symulator HTTP/SOAP, Range, anulowanie, błędy urządzenia; fizyczny TV UNVERIFIED |
| Pilot telefoniczny i QR | DONE | Celowo usunięte w #8, nie są deklarowaną funkcją bieżącej wersji |
| Ustawienia | PARTIAL | Część działa, część kontrolek nie wpływa na silnik — patrz niżej |
| Język EN / akcent / automatyczny skan / kompresja miniatur | BROKEN | Kontrolki istnieją, ale deklarowane efekty nie są wdrożone; wymagają osobnej naprawy, nie mają statusu DONE |
| SQLite i restart | DONE | Izolowane profile, transakcje i odczyt w nowym procesie; nie jest to test awarii zasilania |
| Usuwanie mediów | PARTIAL | Oryginały użytkownika zachowywane; brak kompletnego UI usuwania filmów i przywracania |
| Eksport .prezent | PARTIAL | Starszy format zdjęć; nie wolno reklamować go jako pełnej kopii filmów |
| Pełny backup/restore | PARTIAL | Testy plików, hash, metadanych i restartu; przerwanie zasilania UNVERIFIED |
| IPC i protokoły mediów | DONE | W zakresie testów walidacji nadawcy, identyfikatorów, traversal, Range i izolacji |
| Interfejs | PARTIAL | 9 ekranów, 12 kategorii ustawień, dialogi, puste stany, klawiatura; brak pełnego audytu dostępności/4K |
| Wydanie Windows | PARTIAL | Budowanie i smoke raportowane osobno; instalacja/upgrade/deinstalacja i Windows 11 niepotwierdzone |

## Potwierdzone naprawy i regresje

- Uszkodzony obraz był przyjmowany do kolejki: dodano rzeczywiste dekodowanie przed importem i widoczny błąd. Zamknięcie anuluje generację kolejki; wynik starego zadania nie trafia do nowego importu.
- Nieprawidłowy GPS importu nie zapisuje danych; EXIF nie dostaje fikcyjnego kraju z lokalizacji zastępczej.
- Edytor zdjęcia inicjalizuje dane po zmianie wybranego zdjęcia, zamiast nadpisywać je pustym stanem.
- Organizer albumu miał pętlę renderów i fałszywe potwierdzenie zapisu: stabilna memoizacja, prawidłowa kolejność hooków, wynik zapisu sprawdzany przed sukcesem. E2E wstrzykuje błąd prawdziwego handlera IPC tylko w profilu testowym.
- Fullscreen był blokowany przez ogólną odmowę uprawnień. Dopuszczono wyłącznie fullscreen głównej ramki własnego okna; pozostałe uprawnienia pozostają odrzucane.
- Filtr podróży korzysta z rzeczywistej relacji albumów, nie sztywnych nazw/krajów demo. Dwa testy jednostkowe.
- DLNA interpretuje SOAP Fault także przy HTTP 200. Stop/disconnect anulują żądania i unieważniają tokeny natychmiast, również podczas samodzielnego Play.
- Puste listy nie uruchamiają całej biblioteki; dodano stany pustych podróży i osi czasu. Pokaz odczytuje interwał, PiP, ambient i Ken Burns z ustawień.

## Bezpieczeństwo

Izolacja kontekstu, sandbox i wyłączony Node renderera pozostają zachowane. CSP jest wstrzykiwane przez Vite do **produkcyjnego dist**, nie oceniano wyłącznie źródłowego index.html. IPC przechodzi przez ograniczony preload i walidację nadawcy. Serwer DLNA udostępnia wybrane medium, nie katalog biblioteki; testy obejmują token, IP, metody HTTP, Range, pliki poza roots, obce/publiczne adresy opisu i błędy SOAP. Nie otwierano publicznych portów ani nie wysyłano mediów do chmury. npm audit produkcyjnych zależności: 0 podatności podczas audytu. To nie niezależny pentest ani dowód odporności na wszystkie wyścigi symlink/TOCTOU.

Pełne `npm audit --audit-level=high` zwróciło exit 0, ale zgłosiło **8 zależności o umiarkowanym poziomie ryzyka** w deweloperskim łańcuchu electron-builder → @electron/get → global-agent → roarr → sprintf-js (GHSA-hp3w-g68c-fv3c, DoS przez formatowanie). Nie są to 0 podatności całego drzewa. Automatyczna propozycja npm wymaga breaking downgrade electron-builder; nie uruchamiano `audit fix --force`. Pozostaje osobna, testowana aktualizacja narzędzi pakowania; nie wykazano ekspozycji tego formatera na importowane media w aplikacji.

## Braki blokujące pełne wydanie

| Priorytet | Brak | Wymagany dowód / następna praca |
|---|---|---|
| P1 | Kontrolki ustawień bez implementacji | Język EN, kolor akcentu, skanowanie folderu, kompresja miniatur, hardware acceleration, limit markerów oraz część TV nie mają pełnego powiązania; nie oznaczać DONE |
| P1 | Niepełna trwałość ustawień pokazu | Przejścia, pętla/shuffle/głośność i ustawienia wewnętrzne wymagają jednoznacznej synchronizacji i testu restartu |
| P1 | Kompatybilność TV | Fizyczny test, negocjacja formatów i pauza zegara zdjęć w pokazie DLNA pozostają otwarte |
| P1 | Wydanie Windows | Instalacja, aktualizacja, deinstalacja z zachowaniem biblioteki oraz Windows 11; pakowanie nie zastępuje tych testów |
| P1 | Ochrona danych w awarii | Kontrolowane przerwanie backupu/importu i weryfikacja odzyskania; nie testować na danych użytkownika |
| P2 | Dostępność i obciążenie | Fokus, klawiatura w polach tekstowych, duże obrazy, 4K i długotrwały RAM wymagają szerszego pokrycia |

Sortowanie „lokalizacja”, jednostki odległości, pełny jasny/systemowy motyw i mapowanie rodzaju przejść wymagają osobnej poprawki zgodności ustawień. Nie przebudowywano interfejsu ani modelu danych, aby ukryć te braki.

## Dowody i procedura ręczna

Nowy `npm run test:e2e:system`: czysty profil → uszkodzony import → JPEG/folder/EXIF → album → edycja → wyszukiwanie → błąd zapisu → ekrany/ustawienia → fullscreen → restart → pusty album. Lokalny przebieg PASS (13,4 s). Raport i zrzuty: `reports/system-audit.json`, `reports/system-audit/` (artefakty, nie prywatna biblioteka). Test dodano do Windows Quality obok istniejących E2E kodeków, GPS, backupu i dużej biblioteki.

Odsłuch: na izolowanym profilu zaimportować próbkę z dźwiękiem, uruchomić, potwierdzić słyszalny sygnał, mute/unmute, głośność i ciszę po zamknięciu. TV: zgodny odbiornik w tej samej sieci, zdjęcie → film → mixed → pause/stop/disconnect → utrata sieci; samo przyjęcie komendy nie jest PASS odtwarzania. Oba zakresy pozostają UNVERIFIED bez sprzętu/odsłuchu.

Ostateczne polecenia i wyniki kontroli są zapisywane w TESTING.md po zakończeniu przebiegów. Nie scalać PR #10 automatycznie. Wersja pozostaje 1.8.1, a nie fikcyjne wydanie 2.0.

Końcowe lokalne kontrole: verify, galeria, realne trzy kodeki, metadane GPS, pakowanie oraz restart spakowanego Electron PASS. Pierwszy E2E galerii przekroczył 5 s na kafelku początkowym; następny i cztery realne przebiegi przeszły. Dodano diagnostykę, nie przypisano niepotwierdzonej przyczyny ani nie podniesiono limitu. Niestabilność startu mapy pozostaje obserwacją do kontroli w CI.
