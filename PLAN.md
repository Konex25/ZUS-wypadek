# Plan działania - ZANT (ZUS Accident Notification Tool)

## Faza 1: Setup i infrastruktura (Dzień 1-2)

### 1.1 Środowisko deweloperskie
- [x] Inicjalizacja projektu Next.js 14+ z TypeScript
- [ ] Konfiguracja Tailwind CSS dla UI
- [ ] Setup ESLint i Prettier
- [ ] Struktura folderów projektu
- [ ] Konfiguracja zmiennych środowiskowych

### 1.2 Architektura aplikacji
- [ ] Routing: `/` (strona główna), `/asystent` (moduł obywatela), `/zus` (moduł pracownika)
- [ ] Layout i komponenty wspólne (header, footer, nawigacja)
- [ ] System komponentów UI (przyciski, formularze, karty)

## Faza 2: Moduł 1 - Wirtualny Asystent (Dzień 3-5)

### 2.1 Interfejs użytkownika
- [ ] Formularz zgłoszenia wypadku (kroki/wizard)
- [ ] Pola: dane osobowe, opis zdarzenia, okoliczności, przyczyny
- [ ] Walidacja w czasie rzeczywistym
- [ ] Przyjazne komunikaty błędów

### 2.2 Logika asystenta
- [ ] Integracja z AI (OpenAI/Anthropic) do analizy zgłoszeń
- [ ] Wykrywanie brakujących elementów wymaganych przez wzór ZUS
- [ ] Generowanie sugestii uzupełnień
- [ ] Pomoc w opisie okoliczności i przyczyn
- [ ] Eksport zgłoszenia do formatu gotowego do przesłania

### 2.3 Walidacja i sugestie
- [ ] Lista wymaganych pól zgodnie ze wzorem ZUS
- [ ] Analiza kompletności zgłoszenia
- [ ] Sugestie poprawy jakości opisu

## Faza 3: Moduł 2 - Model Wspierający Decyzję (Dzień 6-9)

### 3.1 Upload i przetwarzanie PDF
- [ ] Komponent uploadu plików PDF
- [ ] Ekstrakcja tekstu z PDF (pdf-parse lub pdfjs-dist)
- [ ] Obsługa wielu plików jednocześnie
- [ ] Weryfikacja formatu i rozmiaru plików

### 3.2 Analiza dokumentów
- [ ] Integracja z AI do analizy treści PDF
- [ ] Ekstrakcja kluczowych danych:
  - Dane osobowe poszkodowanego
  - Opis zdarzenia
  - Okoliczności wypadku
  - Przyczyny
  - Dane medyczne
  - Świadkowie
- [ ] Strukturyzacja danych z dokumentów

### 3.3 Generowanie rekomendacji
- [ ] Model decyzyjny (AI + reguły biznesowe)
- [ ] Rekomendacja: UZNAĆ / NIE UZNAĆ wypadku
- [ ] Uzasadnienie decyzji
- [ ] Wskaźnik pewności rekomendacji

### 3.4 Generowanie karty wypadku
- [ ] Szablon karty wypadku zgodny z wymaganiami ZUS
- [ ] Automatyczne wypełnienie na podstawie analizy
- [ ] Eksport do PDF
- [ ] Możliwość edycji przed eksportem

## Faza 4: Integracja i ulepszenia (Dzień 10-12)

### 4.1 UX/UI
- [ ] Responsywność (mobile, tablet, desktop)
- [ ] Animacje i przejścia
- [ ] Loading states
- [ ] Obsługa błędów
- [ ] Dostępność (a11y)

### 4.2 Bezpieczeństwo i RODO
- [ ] Szyfrowanie danych wrażliwych
- [ ] Brak przechowywania danych osobowych (lub z anonimizacją)
- [ ] Informacje o przetwarzaniu danych
- [ ] HTTPS w produkcji

### 4.3 Testowanie
- [ ] Testy z przykładowymi zgłoszeniami
- [ ] Testy z dokumentami PDF
- [ ] Walidacja jakości rekomendacji
- [ ] Testy użyteczności

## Faza 5: Dokumentacja i prezentacja (Dzień 13-14)

### 5.1 Dokumentacja
- [ ] README z instrukcją uruchomienia
- [ ] Dokumentacja API
- [ ] Opis architektury
- [ ] Przewodnik użytkownika

### 5.2 Prezentacja
- [ ] Przygotowanie demo
- [ ] Nagranie filmu demonstracyjnego
- [ ] Prezentacja PDF
- [ ] Deploy aplikacji (Vercel/Netlify)

## Stack technologiczny

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** - styling
- **shadcn/ui** lub **Radix UI** - komponenty
- **React Hook Form** - formularze
- **Zod** - walidacja

### Backend/AI
- **Next.js API Routes** - endpointy
- **OpenAI API** lub **Anthropic Claude** - analiza dokumentów
- **pdf-parse** lub **pdfjs-dist** - ekstrakcja tekstu z PDF
- **jsPDF** lub **Puppeteer** - generowanie PDF

### Deployment
- **Vercel** (preferowane dla Next.js)
- **Environment variables** dla kluczy API

## Struktura projektu

```
zus-wypadek/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (strona główna)
│   ├── asystent/
│   │   └── page.tsx
│   └── zus/
│       └── page.tsx
├── components/
│   ├── ui/ (komponenty podstawowe)
│   ├── asystent/ (komponenty asystenta)
│   └── zus/ (komponenty modułu ZUS)
├── lib/
│   ├── ai/ (integracja z AI)
│   ├── pdf/ (przetwarzanie PDF)
│   ├── validation/ (walidacja)
│   └── utils/
├── types/
│   └── index.ts (definicje TypeScript)
├── public/
└── package.json
```

## Priorytety

1. **Wysokie**: Podstawowa funkcjonalność obu modułów
2. **Średnie**: Jakość UI/UX, walidacja
3. **Niskie**: Zaawansowane animacje, dodatkowe funkcje

## Ryzyka i ograniczenia

- **Koszty API AI** - monitorowanie użycia
- **Jakość ekstrakcji z PDF** - testowanie z różnymi formatami
- **RODO** - minimalizacja przechowywania danych
- **Czas** - skupienie na MVP, potem ulepszenia

