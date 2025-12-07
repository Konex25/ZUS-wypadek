# ZANT - ZUS Accident Notification Tool

<div align="center">

![ZANT Logo](https://img.shields.io/badge/ZANT-ZUS%20Accident%20Tool-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green?style=for-the-badge&logo=openai)

**Inteligentny system AI wspierający zgłoszenia wypadków przy pracy i analizę dokumentacji dla Zakładu Ubezpieczeń Społecznych**

[Funkcjonalności](#-funkcjonalności) • [Instalacja](#-instalacja) • [Dokumentacja](#-dokumentacja) • [API](#-api) • [Bezpieczeństwo](#-bezpieczeństwo)

</div>

---

## 📋 Spis treści

- [O projekcie](#-o-projekcie)
- [Funkcjonalności](#-funkcjonalności)
- [Technologie](#-technologie)
- [Wymagania systemowe](#-wymagania-systemowe)
- [Instalacja](#-instalacja)
- [Konfiguracja](#-konfiguracja)
- [Struktura projektu](#-struktura-projektu)
- [Uruchomienie](#-uruchomienie)
- [API](#-api)
- [Moduły](#-moduły)
- [Bezpieczeństwo](#-bezpieczeństwo)
- [Rozwój](#-rozwój)
- [Kontrybutorzy](#-kontrybutorzy)
- [Licencja](#-licencja)

---

## 🎯 O projekcie

**ZANT (ZUS Accident Notification Tool)** to zaawansowany system informatyczny stworzony na potrzeby konkursu **HackNation 2025**, który wspiera proces zgłaszania wypadków przy pracy oraz analizę dokumentacji dla Zakładu Ubezpieczeń Społecznych.

System składa się z dwóch głównych modułów:
- **Wirtualny Asystent** - pomaga obywatelom w zgłoszeniu wypadku przy pracy
- **Moduł Analizy** - wspiera pracowników ZUS w podejmowaniu decyzji administracyjnych

### Problem, który rozwiązujemy

ZUS obsługuje rocznie **miliony spraw**, w tym tysiące zgłoszeń wypadków przy pracy. Każde zgłoszenie wymaga:
- Kompletnej dokumentacji zgodnej z wymaganiami prawnymi
- Analizy okoliczności wypadku pod kątem definicji prawnej
- Sporządzenia karty wypadku w ciągu 14 dni
- Weryfikacji wszystkich elementów definicji wypadku przy pracy

ZANT automatyzuje i wspiera te procesy, redukując czas obsługi i minimalizując błędy.

---

## ✨ Funkcjonalności

### 🤖 Wirtualny Asystent dla Obywateli

- **Interaktywny formularz wieloetapowy** - prowadzi użytkownika krok po kroku
- **Weryfikacja kompletności danych** - automatyczne wykrywanie brakujących informacji
- **Inteligentne sugestie** - AI analizuje treść i proponuje uzupełnienia
- **Ekstrakcja danych z PDF** - automatyczne wyciąganie informacji z dokumentów
- **Automatyczne wypełnianie** - uzupełnianie pustych pól testowymi danymi
- **Walidacja w czasie rzeczywistym** - sprawdzanie poprawności danych podczas wprowadzania
- **Generowanie dokumentów** - automatyczne tworzenie zawiadomień i wyjaśnień w PDF
- **Integracja z CEIDG** - pobieranie danych firmy na podstawie NIP/REGON
- **Przyjazny interfejs** - unikanie specjalistycznego języka, sugestie zamiast blokad

### 📊 Moduł Analizy dla Pracowników ZUS

- **Analiza dokumentów PDF** - automatyczna ekstrakcja danych z zeskanowanych dokumentów
- **Rekomendacja decyzji** - AI proponuje uznanie lub nieuznanie zdarzenia za wypadek
- **Weryfikacja elementów definicji** - sprawdzanie:
  - Nagłości zdarzenia
  - Przyczyny zewnętrznej
  - Urazu
  - Związku z wykonywaną działalnością
- **Wykrywanie rozbieżności** - porównywanie danych między dokumentami
- **Generowanie projektu karty wypadku** - automatyczne przygotowanie dokumentacji
- **Weryfikacja ubezpieczenia** - sprawdzanie okresu ubezpieczenia wypadkowego
- **Analiza prawnej kwalifikacji** - szczegółowa ocena zgodności z definicją

### 🔧 Funkcjonalności techniczne

- **Ekstrakcja danych z PDF** przy użyciu OpenAI GPT
- **Walidacja i weryfikacja** wyekstrahowanych danych
- **Automatyczne uzupełnianie** pustych pól testowymi danymi
- **Wieloetapowy wizard** z walidacją na każdym kroku
- **Bezpieczeństwo danych** - zgodność z RODO
- **Responsywny design** - działanie na wszystkich urządzeniach

---

## 🛠️ Technologie

### Frontend
- **[Next.js 16.0.7](https://nextjs.org/)** - Framework React z App Router
- **[React 19.2.1](https://react.dev/)** - Biblioteka UI
- **[TypeScript 5.5.4](https://www.typescriptlang.org/)** - Typowanie statyczne
- **[Tailwind CSS 3.4.7](https://tailwindcss.com/)** - Framework CSS
- **[Radix UI](https://www.radix-ui.com/)** - Komponenty dostępnościowe
- **[React Hook Form 7.68.0](https://react-hook-form.com/)** - Zarządzanie formularzami
- **[Zod 4.1.13](https://zod.dev/)** - Walidacja schematów

### Backend & AI
- **[OpenAI API 6.10.0](https://openai.com/)** - Analiza dokumentów i ekstrakcja danych
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Endpointy API
- **[Drizzle ORM 0.45.0](https://orm.drizzle.team/)** - ORM dla bazy danych
- **[PostgreSQL](https://www.postgresql.org/)** - Baza danych (via Vercel Postgres)

### Narzędzia
- **[PDF-lib 1.17.1](https://pdf-lib.js.org/)** - Generowanie i manipulacja PDF
- **[PDF.js 5.4.449](https://mozilla.github.io/pdf.js/)** - Parsowanie PDF
- **[jsPDF 3.0.4](https://github.com/parallax/jsPDF)** - Generowanie PDF
- **[Axios 1.13.2](https://axios-http.com/)** - Klient HTTP
- **[date-fns 4.1.0](https://date-fns.org/)** - Manipulacja datami

### DevOps
- **[Vercel](https://vercel.com/)** - Hosting i deployment
- **[Vercel Analytics](https://vercel.com/analytics)** - Analiza wydajności
- **[ESLint](https://eslint.org/)** - Linting kodu

---

## 💻 Wymagania systemowe

- **Node.js** 18.0 lub nowszy
- **npm** 9.0 lub nowszy (lub **yarn** / **pnpm**)
- **PostgreSQL** (lub dostęp do Vercel Postgres)
- **Konto OpenAI** z kluczem API (dla funkcji AI)

---

## 🚀 Instalacja

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/Konex25/ZUS-wypadek.git
cd ZUS-wypadek
```

### 2. Instalacja zależności

```bash
npm install
```

### 3. Konfiguracja zmiennych środowiskowych

Utwórz plik `.env.local` w głównym katalogu projektu:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zus_wypadek"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Access (opcjonalnie)
ADMIN_PASSWORD="your-admin-password"
```

### 4. Konfiguracja bazy danych

```bash
# Uruchom migracje
npm run db:migrate

# Lub użyj push (dla development)
npm run db:push
```

### 5. Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Konfiguracja

### Zmienne środowiskowe

| Zmienna | Opis | Wymagane |
|---------|------|----------|
| `DATABASE_URL` | Connection string do PostgreSQL | ✅ |
| `OPENAI_API_KEY` | Klucz API OpenAI | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL aplikacji | ❌ |
| `ADMIN_PASSWORD` | Hasło do panelu admina | ❌ |

### Konfiguracja OpenAI

System wykorzystuje OpenAI API do:
- Ekstrakcji danych z dokumentów PDF
- Analizy treści zgłoszeń
- Generowania rekomendacji decyzyjnych

Upewnij się, że masz aktywny klucz API z odpowiednimi limitami.

---

## 📁 Struktura projektu

```
ZUS-wypadek/
├── app/                          # Next.js App Router
│   ├── admin/                    # Panel administracyjny
│   │   ├── analysis/             # Analiza dokumentów
│   │   ├── case/                 # Zarządzanie sprawami
│   │   └── cases/                # Lista spraw
│   ├── api/                      # API Routes
│   │   ├── documents/            # Endpointy dokumentów
│   │   ├── cases/                # Endpointy spraw
│   │   ├── karta-wypadku/        # Generowanie karty wypadku
│   │   └── pdf/                  # Operacje na PDF
│   ├── asystent/                 # Wirtualny asystent
│   │   ├── ewyp/                 # Zgłoszenie wypadku
│   │   └── wyjasnienia/          # Wyjaśnienia poszkodowanego
│   ├── karta-wypadku/            # Formularz karty wypadku
│   └── zus/                      # Moduł ZUS
├── components/                   # Komponenty React
│   ├── admin/                    # Komponenty panelu admina
│   ├── asystent/                 # Komponenty asystenta
│   │   └── steps/                # Kroki formularza
│   ├── karta-wypadku/            # Komponenty karty wypadku
│   └── ui/                       # Komponenty UI
├── lib/                          # Biblioteki i utilities
│   ├── analyser/                 # Analiza dokumentów
│   ├── database/                 # Operacje na bazie danych
│   ├── karta-wypadku/            # Generowanie karty wypadku
│   ├── pdf/                      # Operacje na PDF
│   ├── validation/                # Walidacja schematów
│   └── utils/                    # Funkcje pomocnicze
├── types/                        # Definicje TypeScript
├── hooks/                        # React Hooks
├── db/                           # Schemat bazy danych
├── drizzle/                      # Migracje bazy danych
├── public/                       # Pliki statyczne
│   └── templates/                # Szablony PDF
└── cases/                        # Przykładowe przypadki testowe
```

---

## 🏃 Uruchomienie

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Baza danych

```bash
# Migracje
npm run db:migrate

# Push schematu (development)
npm run db:push

# Prisma Studio (GUI)
npm run db:studio
```

---

## 🔌 API

### Dokumenty

#### `POST /api/documents`
Przesyłanie dokumentów do analizy

```typescript
{
  files: File[],
  nip?: string
}
```

#### `POST /api/documents/analise-for-case`
Analiza dokumentów dla konkretnej sprawy

### Sprawy

#### `GET /api/cases`
Pobieranie listy spraw

#### `POST /api/cases`
Tworzenie nowej sprawy

#### `GET /api/cases/[id]`
Pobieranie szczegółów sprawy

#### `POST /api/cases/[id]/decision`
Zapisywanie decyzji w sprawie

### Karta wypadku

#### `POST /api/karta-wypadku/generate`
Generowanie karty wypadku

#### `POST /api/karta-wypadku/generate-pdf`
Generowanie PDF karty wypadku

### CEIDG

#### `GET /api/ceidg?nip=...&regon=...`
Pobieranie danych firmy z CEIDG

---

## 🎯 Moduły

### 1. Wirtualny Asystent (`/asystent`)

Moduł dla obywateli zgłaszających wypadek przy pracy.

**Ścieżki:**
- `/asystent/ewyp` - Zgłoszenie wypadku (EWYP)
- `/asystent/wyjasnienia` - Wyjaśnienia poszkodowanego

**Funkcjonalności:**
- Wieloetapowy formularz z walidacją
- Automatyczne wypełnianie danych
- Generowanie dokumentów PDF
- Integracja z CEIDG

### 2. Moduł Analizy (`/admin/analysis`)

Moduł dla pracowników ZUS do analizy dokumentacji.

**Ścieżki:**
- `/admin/analysis` - Weryfikacja i edycja danych
- `/admin/analysis/verification` - Weryfikacja ubezpieczenia
- `/admin/analysis/legal-qualification` - Kwalifikacja prawna
- `/admin/analysis/opinion` - Opinia w sprawie
- `/admin/analysis/summary` - Podsumowanie sprawy

**Funkcjonalności:**
- Ekstrakcja danych z PDF
- Analiza AI dokumentacji
- Generowanie rekomendacji
- Tworzenie projektu karty wypadku

### 3. Zarządzanie Sprawami (`/admin/cases`)

Panel do zarządzania sprawami wypadków.

**Funkcjonalności:**
- Lista wszystkich spraw
- Szczegóły sprawy
- Status sprawy
- Historia decyzji

---

## 🔒 Bezpieczeństwo

### RODO i Ochrona Danych

Aplikacja została zaprojektowana z uwzględnieniem wymagań RODO:

- ✅ **Minimalizacja danych** - przechowywanie tylko niezbędnych informacji
- ✅ **Szyfrowanie** - dane wrażliwe są szyfrowane
- ✅ **Dostęp** - kontrola dostępu do danych osobowych
- ✅ **Audyt** - logowanie operacji na danych
- ✅ **Anonimizacja** - możliwość anonimizacji danych testowych

### Bezpieczeństwo API

- Weryfikacja autoryzacji dla endpointów admina
- Walidacja danych wejściowych
- Ochrona przed SQL injection (ORM)
- Rate limiting (zalecane w produkcji)

### Rekomendacje produkcyjne

- Użyj HTTPS wszędzie
- Skonfiguruj CORS odpowiednio
- Dodaj rate limiting
- Włącz monitoring i logowanie
- Regularne aktualizacje zależności

---

## 🧪 Testowanie

### Przykładowe przypadki

W katalogu `cases/` znajdują się przykładowe przypadki testowe (case1.md - case15.md).

### Testowanie funkcjonalności

1. **Wirtualny Asystent:**
   - Przejdź do `/asystent/ewyp`
   - Wypełnij formularz lub użyj przycisku "Uzupełnij przykładowymi danymi"
   - Sprawdź walidację na każdym kroku

2. **Moduł Analizy:**
   - Przejdź do `/admin/case`
   - Prześlij dokumenty PDF
   - Sprawdź ekstrakcję danych
   - Zweryfikuj rekomendacje AI

---

## 🚧 Rozwój

### Roadmap

- [ ] Integracja z systemem PUE/eZUS
- [ ] Rozszerzona analiza dokumentów medycznych
- [ ] Dashboard z analityką
- [ ] Notyfikacje email/SMS
- [ ] Wersja mobilna (React Native)
- [ ] Integracja z systemami BHP

### Kontrybutowanie

1. Fork projektu
2. Utwórz branch dla funkcjonalności (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

### Code Style

- Używamy ESLint z konfiguracją Next.js
- TypeScript strict mode
- Prettier dla formatowania (zalecane)

---

## 📊 Statystyki projektu

- **Języki:** TypeScript (95%), JavaScript (5%)
- **Framework:** Next.js 16
- **Baza danych:** PostgreSQL
- **AI:** OpenAI GPT-4 / QWEN
- **Komponenty:** 50+
- **API Endpoints:** 20+

---

## 📄 Licencja

Projekt stworzony na potrzeby konkursu **HackNation 2025** organizowanego przez ZUS.

Wszystkie prawa zastrzeżone.

---

## 📞 Kontakt

- **GitHub:** [@Konex25](https://github.com/Konex25)
- **Repository:** [ZUS-wypadek](https://github.com/Konex25/ZUS-wypadek)

---

## 🙏 Podziękowania

- ZUS za udostępnienie materiałów i wsparcie merytoryczne
- OpenAI za narzędzia AI
- Społeczność Next.js za świetną dokumentację
- Wszystkim kontrybutorom open source

---

<div align="center">

**Zrobione z ❤️ dla ZUS i obywateli**

⭐ Jeśli projekt Ci się podoba, zostaw gwiazdkę!

</div>
