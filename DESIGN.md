---
name: Prezent Mapy
description: Lokalna galeria wspomnień z mapą — Windows Electron
colors:
  primary: "#f59e0b"
  canvas: "#070b14"
  surface: "#0f172a"
  field: "#020617"
  border: "#475569"
  text: "#f1f5f9"
  secondary-text: "#cbd5e1"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontSize: "12px"
    fontWeight: 500
rounded:
  field: "8px"
  card: "16px"
spacing:
  compact: "8px"
  normal: "12px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.field}"
    rounded: "{rounded.field}"
    height: "44px"
---

# Design System: Prezent Mapy

## Overview

**Creative North Star: "Rodzinny atlas wspomnień"**

Spokojna, ciemna aplikacja do oglądania własnych zdjęć i filmów. Mapa i media pozostają najważniejsze; edycja pojawia się na żądanie. Dokument opisuje istniejący kod i zasady dopracowania PR #6, również jako kontekst dla Stitch.

**Key Characteristics:**
- Ciemne powierzchnie, bursztynowe akcje, czytelne etykiety.
- Zachowany lewy dock, mapa Leaflet, albumy i galeria.
- Lokalne media bez zależności wizualnych od internetu.

## Colors

Bursztyn wskazuje główne działanie i zaznaczenie. Neutralne powierzchnie oddzielają formularze od mediów. Czerwony oznacza błąd; kolor nigdy nie jest jedynym komunikatem.

## Typography

Zachowaj lokalny stos pisma Windows z implementacji. Etykiety pól (12 px) są widoczne także po wpisaniu wartości; tekst pól i opisów (14 px) ma spokojną interlinię. Nie pobieraj fontów z sieci.

## Layout

Galeria korzysta z istniejącej siatki responsywnej. Formularz lokalizacji mieści się w karcie filmu i rozwija na żądanie; szerokość i długość to dwa jawnie podpisane pola. Główne działania mają cel 44 px. Przy małej szerokości przyciski zawijają się bez poziomego przewijania.

## Elevation & Depth

Hierarchię budują tony powierzchni i subtelne obramowania. Nie dodawaj poświat do nowych kontrolek GPS. Istniejące style pozostałych modułów zachowują swój wygląd.

## Shapes

Pola i przyciski mają łagodne narożniki; karty większy promień. Nie otaczaj każdej etykiety osobną kartą.

## Components

**The Visible Label Rule.** Etykieta pozostaje nad polem. Błąd pojawia się pod parą współrzędnych jako komunikat `alert`.

Przycisk zapisu pokazuje stan pracy i blokuje ponowny zapis. Usunięcie lokalizacji jest akcją wtórną. Każda akcja ma widoczny fokus klawiatury. Brak GPS jest stanem informacyjnym, nigdy współrzędnymi (0,0).

**The Media First Rule.** Formularz GPS domyślnie jest zwinięty. Po wyświetleniu filmu zasoby odtwarzacza są zwalniane przy zamknięciu. Szanuj ograniczenie ruchu; zmiany stanów używają krótkich przejść i nie wymagają ciągłych animacji.

## Do's and Don'ts

- Do zachowuj zatwierdzony ciemny motyw i bursztynowe akcenty.
- Do testuj klawiaturę, błędy, pustą lokalizację i widok przy minimalnym rozmiarze okna Windows.
- Don't deklaruj obsługi formatu, kopii ani GPS bez testu.
- Don't dodawaj fikcyjnych miejsc, zewnętrznych placeholderów ani dekoracyjnych liczników.
